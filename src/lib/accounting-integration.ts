/**
 * Accounting Integration - adapters & sync helpers
 * - Provides adapters for external accounting providers (Qoyod, Daftra)
 * - Idempotent push of journal entries/invoices
 * - Mapping helpers from internal Vouchers/Promissory Notes -> accounting entries
 *
 * Keep this file lightweight and provider-agnostic. Implement concrete provider logic
 * using the adapter interfaces below.
 */

import fetch from 'node-fetch';
import { BankVoucher } from './bank-vouchers-system';
import { PromissoryNote } from './promissory-notes-system';

// -------------------------
// Types
// -------------------------
export type AccountingProviderType = 'qoyod' | 'daftra';

export interface AccountingConfig {
  provider: AccountingProviderType;
  baseUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  tenantId?: string; // if needed
  defaultAccountMap?: Record<string, string>;
}

export interface JournalLine {
  accountCode: string; // chart of account code or id
  debit: number;
  credit: number;
  description?: string;
  taxCode?: string;
}

export interface JournalEntry {
  date: string; // ISO
  reference: string; // internal id e.g. BNK-2025-000001
  description?: string;
  lines: JournalLine[];
  externalRef?: string; // provider id after push
}

export interface AccountingAdapter {
  authenticate(): Promise<void>;
  pushJournal(entry: JournalEntry): Promise<{ success: boolean; id?: string; error?: any }>;
  pushInvoice?(payload: any): Promise<{ success: boolean; id?: string; error?: any }>;
  getInvoiceStatus?(id: string): Promise<any>;
}

// -------------------------
// Utilities: retries, idempotency keys
// -------------------------
async function retry<T>(fn: () => Promise<T>, attempts = 3, backoffMs = 500): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise(res => setTimeout(res, backoffMs * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

function makeIdempotencyKey(prefix: string, internalId: string) {
  return `${prefix}:${internalId}`;
}

// -------------------------
// Mapping helpers
// -------------------------

/**
 * Map a BankVoucher to a JournalEntry shape. This mapping should be adapted per account chart.
 * Keep logic generic: deposit => credit to payer, debit to bank account, etc.
 */
export function mapBankVoucherToJournal(v: BankVoucher, accountMap: Record<string, string> = {}): JournalEntry {
  const reference = v.voucherNumber || v.id || `voucher-${Date.now()}`;
  const bankAccount = accountMap[v.accountNumber] || accountMap['default_bank'] || 'BANK-DEFAULT';

  // For simplicity: deposits increase bank (debit bank), credit counterparty revenue/receivable
  const amount = v.amountInSAR ?? v.amount;
  const lines: JournalLine[] = [];

  if (v.type === 'deposit' || v.type === 'interest') {
    lines.push({ accountCode: bankAccount, debit: amount, credit: 0, description: v.description });
    // counterparty
    const counter = accountMap[v.category] || accountMap['customer_payment'] || 'AR-DEFAULT';
    lines.push({ accountCode: counter, debit: 0, credit: amount, description: v.description });
  } else if (v.type === 'withdrawal' || v.type === 'fee') {
    // withdrawal: credit bank, debit expense/cost
    lines.push({ accountCode: bankAccount, debit: 0, credit: amount, description: v.description });
    const counter = accountMap[v.category] || accountMap['bank_charges'] || 'EXP-DEFAULT';
    lines.push({ accountCode: counter, debit: amount, credit: 0, description: v.description });
  } else if (v.type === 'transfer') {
    // transfer: two bank accounts - use relatedVoucherId as target
    const targetAccount = v.relatedVoucherId || accountMap['default_bank_target'] || 'BANK-OTHER';
    lines.push({ accountCode: bankAccount, debit: 0, credit: amount, description: `Transfer out: ${v.description}` });
    lines.push({ accountCode: targetAccount, debit: amount, credit: 0, description: `Transfer in: ${v.description}` });
  } else {
    // fallback
    lines.push({ accountCode: bankAccount, debit: amount, credit: 0, description: v.description });
    lines.push({ accountCode: accountMap['other'] || 'OTHER', debit: 0, credit: amount, description: v.description });
  }

  return {
    date: (v.transactionDate instanceof Date) ? v.transactionDate.toISOString() : new Date().toISOString(),
    reference,
    description: v.description || `${v.voucherNumber} ${v.reference || ''}`,
    lines
  };
}

export function mapPromissoryNoteToJournal(note: PromissoryNote, accountMap: Record<string, string> = {}): JournalEntry {
  const reference = note.noteNumber || note.id || `note-${Date.now()}`;
  const amount = note.amountInSAR ?? note.amount;
  const bankAccount = accountMap['default_bank'] || 'BANK-DEFAULT';

  const lines: JournalLine[] = [];

  if (note.type === 'receivable') {
    // create receivable: debit receivable, credit revenue/bank when paid
    lines.push({ accountCode: accountMap['receivable'] || 'AR-DEFAULT', debit: amount, credit: 0, description: note.notes });
    lines.push({ accountCode: accountMap['promissory_revenue'] || 'REV-DEFAULT', debit: 0, credit: amount, description: note.notes });
  } else {
    // payable: debit expense, credit payable
    lines.push({ accountCode: accountMap['expense'] || 'EXP-DEFAULT', debit: amount, credit: 0, description: note.notes });
    lines.push({ accountCode: accountMap['payable'] || 'AP-DEFAULT', debit: 0, credit: amount, description: note.notes });
  }

  return {
    date: (note.dueDate instanceof Date) ? note.dueDate.toISOString() : new Date().toISOString(),
    reference,
    description: note.description || note.notes || reference,
    lines
  };
}

// -------------------------
// Example adapter: Qoyod (skeleton)
// -------------------------
export class QoyodAdapter implements AccountingAdapter {
  config: AccountingConfig;
  token?: string;

  constructor(config: AccountingConfig) {
    this.config = config;
  }

  async authenticate() {
    // Qoyod API auth flow (skeleton)
    if (this.config.apiKey) {
      this.token = this.config.apiKey;
      return;
    }

    // example OAuth / token request - provider-specific implementation required
    // throw if not implemented
    throw new Error('QoyodAdapter.authenticate not implemented - provide apiKey or implement auth flow.');
  }

  async pushJournal(entry: JournalEntry) {
    if (!this.token) await this.authenticate();

    const idempotencyKey = makeIdempotencyKey('journal', entry.reference);

    return retry(async () => {
      const res = await fetch(`${this.config.baseUrl}/api/v1/journals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          date: entry.date,
          description: entry.description,
          reference: entry.reference,
          lines: entry.lines
        })
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json };
      }

      return { success: true, id: json.id };
    }, 3, 500);
  }
}

// -------------------------
// Example adapter: Daftra (skeleton)
// -------------------------
export class DaftraAdapter implements AccountingAdapter {
  config: AccountingConfig;
  token?: string;

  constructor(config: AccountingConfig) {
    this.config = config;
  }

  async authenticate() {
    if (this.config.apiKey) {
      this.token = this.config.apiKey;
      return;
    }
    throw new Error('DaftraAdapter.authenticate not implemented - provide apiKey or implement auth flow.');
  }

  async pushJournal(entry: JournalEntry) {
    if (!this.token) await this.authenticate();

    const idempotencyKey = makeIdempotencyKey('journal', entry.reference);
    return retry(async () => {
      const res = await fetch(`${this.config.baseUrl}/journals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(entry)
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json };
      }
      return { success: true, id: json.id };
    }, 3, 500);
  }
}

// -------------------------
// Generic sync service
// -------------------------
export async function pushBankVoucherToAccounting(voucher: BankVoucher, adapter: AccountingAdapter, accountMap: Record<string, string> = {}) {
  const journal = mapBankVoucherToJournal(voucher, accountMap);
  const res = await adapter.pushJournal(journal);
  return res;
}

export async function pushPromissoryNoteToAccounting(note: PromissoryNote, adapter: AccountingAdapter, accountMap: Record<string, string> = {}) {
  const journal = mapPromissoryNoteToJournal(note, accountMap);
  const res = await adapter.pushJournal(journal);
  return res;
}

// -------------------------
// Webhook handler (express-style) - simple skeleton
// -------------------------
export function accountingWebhookHandler(req: any, res: any) {
  // Validate signature, parse event, mark mapping by externalRef
  const event = req.body;
  // Example: event.type === 'invoice.paid' -> find local voucher/promissory and mark paid
  res.status(200).json({ ok: true });
}

// -------------------------
// Exports
// -------------------------
export default {
  QoyodAdapter,
  DaftraAdapter,
  pushBankVoucherToAccounting,
  pushPromissoryNoteToAccounting,
  accountingWebhookHandler
};
