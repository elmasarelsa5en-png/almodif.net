/**
 * نظام التكامل المحاسبي - Accounting Integration System
 * - محولات للأنظمة المحاسبية الخارجية (قيود، دفترة، زوهو)
 * - دفع القيود والفواتير بشكل آمن (Idempotent)
 * - تحويل السندات والكمبيالات إلى قيود محاسبية
 * 
 * Providers:
 * - Qoyod (قيود): Saudi cloud accounting system
 * - Daftra (دفترة): Multi-region cloud accounting
 * - Zoho Books: International accounting platform
 */

import { BankVoucher } from './bank-vouchers-system';
import { PromissoryNote } from './promissory-notes-system';
import { 
  AccountingConfig, 
  addToSyncQueue, 
  addSyncLog,
  updateAccountingConfig 
} from './accounting-config';

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
// Example adapter: Qoyod (قيود) - Real Implementation
// API Documentation: https://qoyod.com/api-docs
// -------------------------
export class QoyodAdapter implements AccountingAdapter {
  config: AccountingConfig;
  token?: string;

  constructor(config: AccountingConfig) {
    this.config = config;
  }

  async authenticate() {
    // Qoyod uses API Key authentication
    if (this.config.apiKey) {
      this.token = this.config.apiKey;
      return;
    }

    throw new Error('QoyodAdapter: API Key مطلوب للمصادقة');
  }

  /**
   * دفع قيد محاسبي إلى قيود
   * Qoyod API endpoint: POST /accounting/entries
   */
  async pushJournal(entry: JournalEntry) {
    if (!this.token) await this.authenticate();

    const idempotencyKey = makeIdempotencyKey('journal', entry.reference);

    return retry(async () => {
      // تحويل القيد إلى صيغة Qoyod
      const qoyodEntry = {
        entry_number: entry.reference,
        date: entry.date.split('T')[0], // YYYY-MM-DD
        description: entry.description || '',
        journal_type: 'general', // general, sales, purchases
        items: entry.lines.map(line => ({
          account_id: line.accountCode,
          description: line.description || entry.description || '',
          debit: line.debit || 0,
          credit: line.credit || 0,
          tax_code: line.taxCode || null
        })),
        reference: entry.externalRef || entry.reference,
        auto_number: false
      };

      const res = await fetch(`${this.config.baseUrl}/accounting/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(qoyodEntry)
      });

      const json = await res.json();
      
      if (!res.ok) {
        console.error('Qoyod API Error:', json);
        return { 
          success: false, 
          error: json.message || json.error || 'خطأ في الاتصال بقيود'
        };
      }

      return { 
        success: true, 
        id: json.data?.id || json.id 
      };
    }, 3, 1000);
  }

  /**
   * دفع فاتورة إلى قيود
   * Qoyod API endpoint: POST /invoices
   */
  async pushInvoice(payload: any) {
    if (!this.token) await this.authenticate();

    const idempotencyKey = makeIdempotencyKey('invoice', payload.reference);

    return retry(async () => {
      const res = await fetch(`${this.config.baseUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      
      if (!res.ok) {
        return { success: false, error: json.message || json.error };
      }

      return { success: true, id: json.data?.id || json.id };
    }, 3, 1000);
  }

  /**
   * الحصول على حالة الفاتورة
   */
  async getInvoiceStatus(id: string) {
    if (!this.token) await this.authenticate();

    const res = await fetch(`${this.config.baseUrl}/invoices/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('فشل الحصول على حالة الفاتورة');
    }

    return await res.json();
  }
}

// -------------------------
// Example adapter: Daftra (دفترة) - Real Implementation
// API Documentation: https://api.daftra.com/v2/docs
// -------------------------
export class DaftraAdapter implements AccountingAdapter {
  config: AccountingConfig;
  token?: string;

  constructor(config: AccountingConfig) {
    this.config = config;
  }

  async authenticate() {
    // Daftra uses API Key authentication
    if (this.config.apiKey) {
      this.token = this.config.apiKey;
      return;
    }

    throw new Error('DaftraAdapter: API Key مطلوب للمصادقة');
  }

  /**
   * دفع قيد محاسبي إلى دفترة
   * Daftra API endpoint: POST /journal_entries
   */
  async pushJournal(entry: JournalEntry) {
    if (!this.token) await this.authenticate();

    const idempotencyKey = makeIdempotencyKey('journal', entry.reference);

    return retry(async () => {
      // تحويل القيد إلى صيغة Daftra
      const daftraEntry = {
        reference_number: entry.reference,
        date: entry.date.split('T')[0], // YYYY-MM-DD
        notes: entry.description || '',
        items: entry.lines.map(line => ({
          account_id: line.accountCode,
          description: line.description || entry.description || '',
          debit: line.debit || 0,
          credit: line.credit || 0,
          tax_id: line.taxCode || null
        })),
        status: 'posted' // draft, posted
      };

      const res = await fetch(`${this.config.baseUrl}/api/v2/journal_entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(daftraEntry)
      });

      const json = await res.json();
      
      if (!res.ok) {
        console.error('Daftra API Error:', json);
        return { 
          success: false, 
          error: json.message || json.error || 'خطأ في الاتصال بدفترة'
        };
      }

      return { 
        success: true, 
        id: json.data?.id || json.id 
      };
    }, 3, 1000);
  }

  /**
   * دفع فاتورة إلى دفترة
   * Daftra API endpoint: POST /invoices
   */
  async pushInvoice(payload: any) {
    if (!this.token) await this.authenticate();

    const idempotencyKey = makeIdempotencyKey('invoice', payload.reference);

    return retry(async () => {
      const res = await fetch(`${this.config.baseUrl}/api/v2/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      
      if (!res.ok) {
        return { success: false, error: json.message || json.error };
      }

      return { success: true, id: json.data?.id || json.id };
    }, 3, 1000);
  }

  /**
   * الحصول على حالة الفاتورة
   */
  async getInvoiceStatus(id: string) {
    if (!this.token) await this.authenticate();

    const res = await fetch(`${this.config.baseUrl}/api/v2/invoices/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('فشل الحصول على حالة الفاتورة');
    }

    return await res.json();
  }

  /**
   * سحب دليل الحسابات من دفترة
   */
  async fetchChartOfAccounts() {
    if (!this.token) await this.authenticate();

    const res = await fetch(`${this.config.baseUrl}/api/v2/accounts`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('فشل سحب دليل الحسابات');
    }

    const json = await res.json();
    return json.data || json;
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
