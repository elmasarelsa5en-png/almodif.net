/**
 * ZATCA E-Invoicing (Fatoora) Service
 * نظام الفوترة الإلكترونية المتوافق مع هيئة الزكاة والضريبة والجمارك
 * 
 * المرحلة الأولى: إصدار فواتير إلكترونية مع QR Code
 * المرحلة الثانية: الربط المباشر مع منصة فاتورة
 */

import { db } from './firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

// معلومات البائع (الفندق)
export interface SellerInfo {
  nameAr: string;
  nameEn: string;
  vatNumber: string; // 15 رقم
  commercialRegistration: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

// معلومات المشتري (النزيل)
export interface BuyerInfo {
  name: string;
  vatNumber?: string; // اختياري للأفراد
  nationalId?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// عنصر في الفاتورة
export interface InvoiceLineItem {
  id: string;
  description: string; // وصف الخدمة
  quantity: number;
  unitPrice: number; // السعر قبل الضريبة
  discount?: number; // خصم (اختياري)
  taxRate: number; // نسبة الضريبة (عادة 15%)
  taxAmount: number; // قيمة الضريبة
  totalAmount: number; // المجموع شامل الضريبة
}

// الفاتورة الإلكترونية
export interface ZatcaInvoice {
  invoiceNumber: string; // رقم تسلسلي فريد
  invoiceDate: string; // ISO format
  invoiceType: 'simplified' | 'standard'; // مبسطة أو ضريبية
  seller: SellerInfo;
  buyer?: BuyerInfo; // اختياري للفواتير المبسطة
  lineItems: InvoiceLineItem[];
  subtotal: number; // المجموع قبل الضريبة
  totalTax: number; // إجمالي الضريبة
  totalDiscount: number; // إجمالي الخصم
  grandTotal: number; // المجموع النهائي
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  notes?: string;
  qrCode?: string; // QR Code بصيغة Base64
  xmlContent?: string; // محتوى XML للفاتورة
  zatcaStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
  zatcaUuid?: string; // UUID من ZATCA
  createdAt: string;
}

/**
 * حساب الضريبة والمجاميع
 */
export function calculateInvoiceTotals(
  lineItems: Omit<InvoiceLineItem, 'taxAmount' | 'totalAmount'>[],
  taxRate: number = 15
): {
  items: InvoiceLineItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
} {
  const items: InvoiceLineItem[] = lineItems.map(item => {
    const discountAmount = item.discount || 0;
    const priceAfterDiscount = (item.unitPrice * item.quantity) - discountAmount;
    const taxAmount = (priceAfterDiscount * taxRate) / 100;
    const totalAmount = priceAfterDiscount + taxAmount;

    return {
      ...item,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  });

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity) - (item.discount || 0), 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const grandTotal = subtotal + totalTax;

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2))
  };
}

/**
 * توليد رقم فاتورة تسلسلي
 */
export async function generateInvoiceNumber(): Promise<string> {
  try {
    const counterDoc = doc(db, 'counters', 'invoice_counter');
    const counterSnap = await getDoc(counterDoc);

    let nextNumber = 1;
    if (counterSnap.exists()) {
      nextNumber = (counterSnap.data().current || 0) + 1;
      await updateDoc(counterDoc, { current: nextNumber });
    } else {
      await addDoc(collection(db, 'counters'), {
        id: 'invoice_counter',
        current: 1
      });
    }

    // تنسيق: INV-2024-00001
    const year = new Date().getFullYear();
    const paddedNumber = nextNumber.toString().padStart(5, '0');
    return `INV-${year}-${paddedNumber}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback
    return `INV-${Date.now()}`;
  }
}

/**
 * توليد QR Code متوافق مع معايير ZATCA
 * Base64 TLV (Tag-Length-Value) Format
 */
export function generateZatcaQRCode(invoice: ZatcaInvoice): string {
  try {
    // ZATCA QR Code Format (TLV)
    // Tag 1: Seller Name
    // Tag 2: VAT Number
    // Tag 3: Invoice Date
    // Tag 4: Invoice Total (with VAT)
    // Tag 5: VAT Amount

    const fields = [
      { tag: 1, value: invoice.seller.nameAr },
      { tag: 2, value: invoice.seller.vatNumber },
      { tag: 3, value: invoice.invoiceDate },
      { tag: 4, value: invoice.grandTotal.toFixed(2) },
      { tag: 5, value: invoice.totalTax.toFixed(2) }
    ];

    // Convert to TLV format
    let tlvString = '';
    fields.forEach(field => {
      const tagHex = field.tag.toString(16).padStart(2, '0');
      const valueUtf8 = new TextEncoder().encode(field.value);
      const lengthHex = valueUtf8.length.toString(16).padStart(2, '0');
      const valueHex = Array.from(valueUtf8)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      tlvString += tagHex + lengthHex + valueHex;
    });

    // Convert to Base64
    const bytes = tlvString.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || [];
    const base64 = btoa(String.fromCharCode(...bytes));
    
    return base64;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

/**
 * توليد محتوى XML للفاتورة (UBL 2.1 Format)
 * مطلوب للمرحلة الثانية من ZATCA
 */
export function generateInvoiceXML(invoice: ZatcaInvoice): string {
  const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${invoice.invoiceDate.split('T')[0]}</cbc:IssueDate>
  <cbc:IssueTime>${invoice.invoiceDate.split('T')[1]?.split('.')[0] || '00:00:00'}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>${invoice.invoiceType === 'simplified' ? '0200000' : '0100000'}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  
  <!-- Seller Information -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoice.seller.commercialRegistration}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.seller.vatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoice.seller.nameAr}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      <cac:PostalAddress>
        <cbc:StreetName>${invoice.seller.address}</cbc:StreetName>
        <cbc:CityName>${invoice.seller.city}</cbc:CityName>
        <cbc:PostalZone>${invoice.seller.postalCode}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <!-- Buyer Information (if available) -->
  ${invoice.buyer ? `
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoice.buyer.name}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  ` : ''}
  
  <!-- Line Items -->
  ${invoice.lineItems.map((item, index) => `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">${(item.unitPrice * item.quantity).toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${item.description}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SAR">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="SAR">${item.taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="SAR">${(item.unitPrice * item.quantity).toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="SAR">${item.taxAmount.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${item.taxRate}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
  </cac:InvoiceLine>
  `).join('')}
  
  <!-- Tax Total -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${invoice.totalTax.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${invoice.totalTax.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <!-- Legal Monetary Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${invoice.grandTotal.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="SAR">${invoice.totalDiscount.toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="SAR">${invoice.grandTotal.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
</Invoice>`;

  return xmlTemplate;
}

/**
 * إنشاء فاتورة جديدة
 */
export async function createInvoice(
  seller: SellerInfo,
  lineItems: Omit<InvoiceLineItem, 'taxAmount' | 'totalAmount'>[],
  options: {
    buyer?: BuyerInfo;
    invoiceType?: 'simplified' | 'standard';
    paymentMethod?: 'cash' | 'card' | 'transfer' | 'other';
    notes?: string;
  } = {}
): Promise<ZatcaInvoice> {
  try {
    // حساب المجاميع
    const totals = calculateInvoiceTotals(lineItems);

    // توليد رقم الفاتورة
    const invoiceNumber = await generateInvoiceNumber();

    // إنشاء الفاتورة
    const invoice: ZatcaInvoice = {
      invoiceNumber,
      invoiceDate: new Date().toISOString(),
      invoiceType: options.invoiceType || 'simplified',
      seller,
      buyer: options.buyer,
      lineItems: totals.items,
      subtotal: totals.subtotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount,
      grandTotal: totals.grandTotal,
      paymentMethod: options.paymentMethod || 'cash',
      notes: options.notes,
      zatcaStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    // توليد QR Code
    invoice.qrCode = generateZatcaQRCode(invoice);

    // توليد XML
    invoice.xmlContent = generateInvoiceXML(invoice);

    // حفظ في Firebase
    const invoiceRef = await addDoc(collection(db, 'invoices'), invoice);
    console.log('✅ Invoice created:', invoiceRef.id);

    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

/**
 * إرسال الفاتورة إلى ZATCA (المرحلة الثانية)
 * يتطلب API Keys من ZATCA
 */
export async function submitInvoiceToZATCA(invoiceNumber: string): Promise<boolean> {
  try {
    // جلب إعدادات ZATCA
    const settingsDoc = await getDoc(doc(db, 'settings', 'legal_compliance'));
    if (!settingsDoc.exists() || !settingsDoc.data().zatcaEnabled) {
      console.log('⚠️ ZATCA integration not enabled');
      return false;
    }

    const settings = settingsDoc.data();
    const apiUrl = settings.zatcaEnvironment === 'production'
      ? 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core/invoices/reporting/single'
      : 'https://gw-fatoora.zatca.sa/e-invoicing/developer-portal';

    // جلب الفاتورة من Firebase
    // (يتطلب استعلام للبحث عن الفاتورة برقمها)
    
    // إرسال إلى ZATCA API
    // const response = await fetch(apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${settings.zatcaApiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     invoiceXml: invoice.xmlContent,
    //     invoiceHash: generateHash(invoice.xmlContent)
    //   })
    // });

    console.log('📤 Invoice would be submitted to ZATCA:', invoiceNumber);
    return true;
  } catch (error) {
    console.error('Error submitting to ZATCA:', error);
    return false;
  }
}

/**
 * استرجاع الفاتورة بصيغة قابلة للطباعة
 */
export function generateInvoiceHTML(invoice: ZatcaInvoice): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>فاتورة ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .invoice { max-width: 800px; margin: 20px auto; padding: 20px; border: 2px solid #333; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .qr-code { text-align: center; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
    th { background-color: #f2f2f2; }
    .total { font-weight: bold; font-size: 1.2em; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>${invoice.seller.nameAr}</h1>
      <p>الرقم الضريبي: ${invoice.seller.vatNumber}</p>
      <p>السجل التجاري: ${invoice.seller.commercialRegistration}</p>
      <hr>
      <h2>فاتورة ضريبية مبسطة</h2>
      <p>رقم الفاتورة: ${invoice.invoiceNumber}</p>
      <p>التاريخ: ${new Date(invoice.invoiceDate).toLocaleDateString('ar-SA')}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>البيان</th>
          <th>الكمية</th>
          <th>السعر</th>
          <th>المجموع</th>
          <th>الضريبة (15%)</th>
          <th>الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.lineItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice.toFixed(2)} ر.س</td>
          <td>${(item.unitPrice * item.quantity).toFixed(2)} ر.س</td>
          <td>${item.taxAmount.toFixed(2)} ر.س</td>
          <td>${item.totalAmount.toFixed(2)} ر.س</td>
        </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align: left;">المجموع قبل الضريبة:</td>
          <td>${invoice.subtotal.toFixed(2)} ر.س</td>
        </tr>
        <tr>
          <td colspan="5" style="text-align: left;">ضريبة القيمة المضافة (15%):</td>
          <td>${invoice.totalTax.toFixed(2)} ر.س</td>
        </tr>
        <tr class="total">
          <td colspan="5" style="text-align: left;">الإجمالي شامل الضريبة:</td>
          <td>${invoice.grandTotal.toFixed(2)} ر.س</td>
        </tr>
      </tfoot>
    </table>

    ${invoice.qrCode ? `
    <div class="qr-code">
      <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(invoice.qrCode)}&size=200x200" alt="QR Code">
      <p>امسح الرمز للتحقق من الفاتورة</p>
    </div>
    ` : ''}

    <div style="margin-top: 40px; text-align: center; color: #666;">
      <p>شكراً لتعاملكم معنا</p>
      <p>${invoice.seller.address} - ${invoice.seller.city}</p>
      <p>${invoice.seller.phone} - ${invoice.seller.email}</p>
    </div>
  </div>
</body>
</html>
  `;
}
