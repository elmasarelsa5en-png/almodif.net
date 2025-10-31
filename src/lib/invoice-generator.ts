/**
 * Invoice Generator Library
 * يولد فواتير PDF احترافية مع QR code للزكاة والدخل وشعار الفندق
 */

export interface InvoiceData {
  id?: string;
  number: string;
  date: string;
  customerName: string;
  phone?: string;
  room?: string;
  description: string;
  amountBeforeTax: number;
  taxAmount: number;
  amountAfterTax: number;
  taxNumber?: string;
  paymentType?: string;
  bookingId?: string;
  roomNights?: number;
  hotelName?: string;
  hotelAddress?: string;
  hotelPhone?: string;
  hotelEmail?: string;
  hotelLogo?: string;
  hotelVAT?: string;
  hotelCR?: string;
}

/**
 * يولد QR Code للزكاة والدخل (Zatca Format)
 * يحتوي على: اسم الفندق، الرقم الضريبي، التاريخ، المبلغ الكلي، ضريبة القيمة المضافة
 */
export const generateZatcaQRCode = (invoice: InvoiceData): string => {
  // Zatca QR Format: TLV (Tag-Length-Value)
  // Tag 1: Seller Name
  // Tag 2: VAT Registration Number
  // Tag 3: Timestamp
  // Tag 4: Invoice Total (with VAT)
  // Tag 5: VAT Amount
  
  const sellerName = invoice.hotelName || 'المضيف سمارت لإدارة الفنادق والمنتجعات';
  const vatNumber = invoice.hotelVAT || invoice.taxNumber || '300092095780003';
  const timestamp = new Date(invoice.date).toISOString();
  const invoiceTotal = invoice.amountAfterTax.toFixed(2);
  const vatAmount = invoice.taxAmount.toFixed(2);
  
  // تنسيق بسيط: كل قيمة مفصولة بـ |
  const qrData = `1|${sellerName}|2|${vatNumber}|3|${timestamp}|4|${invoiceTotal}|5|${vatAmount}`;
  
  // ترميز base64
  const qrDataBase64 = btoa(unescape(encodeURIComponent(qrData)));
  
  // استخدام خدمة QR Code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataBase64)}`;
};

/**
 * يفتح نافذة طباعة للفاتورة مع تصميم احترافي
 */
export const generateAndPrintInvoice = (invoice: InvoiceData) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة');
    return;
  }

  const logoUrl = invoice.hotelLogo || (typeof window !== 'undefined' ? window.location.origin + '/app-logo.png' : '');
  const qrCodeUrl = generateZatcaQRCode(invoice);
  const taxRate = invoice.amountBeforeTax > 0 ? (invoice.taxAmount / invoice.amountBeforeTax * 100).toFixed(1) : '15.0';
  
  const hotelName = invoice.hotelName || 'المضيف سمارت لإدارة الفنادق والمنتجعات';
  const hotelAddress = invoice.hotelAddress || 'أبها، شارع العرين';
  const hotelPhone = invoice.hotelPhone || '+966559902557';
  const hotelEmail = invoice.hotelEmail || 'akramabdelaziz1992@gmail.com';
  const vatNumber = invoice.hotelVAT || invoice.taxNumber || '300092095780003';
  const crNumber = invoice.hotelCR || '7017845756';

  const invoiceHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة - ${invoice.number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .invoice-container {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          padding: 20mm;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        @media print {
          @page {
            size: A4;
            margin: 10mm 8mm;
          }
          
          body {
            background: white;
            padding: 0;
            margin: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .invoice-container {
            width: 100%;
            max-width: 100%;
            min-height: auto;
            margin: 0;
            padding: 5mm 8mm;
            box-shadow: none;
            page-break-after: always;
          }
          
          .no-print {
            display: none;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          font-weight: bold;
          opacity: 0.05;
          pointer-events: none;
          z-index: -1;
          color: #667eea;
        }
        
        .print-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 15px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          z-index: 1000;
        }
        
        .print-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header Section: Logo in Center + Company Info on Sides -->
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-bottom: 10px; gap: 15px;">
          <!-- Arabic Info - Right Side -->
          <div style="text-align: right; direction: rtl;">
            <h1 style="margin: 0; font-size: 13px; font-weight: bold; color: #667eea;">${hotelName}</h1>
            <p style="margin: 2px 0; font-size: 9px; color: #6B7280;">${hotelAddress}</p>
          </div>
          
          <!-- Logo - Center -->
          <div style="text-align: center;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #3b82f6 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: 2px solid rgba(255, 255, 255, 0.3);">
              <img src="${logoUrl}" alt="Logo" style="width: 62px; height: 62px; object-fit: contain; border-radius: 50%;" onerror="this.style.display='none'" />
            </div>
          </div>
          
          <!-- English Info - Left Side -->
          <div style="text-align: left; direction: ltr;">
            <h1 style="margin: 0; font-size: 13px; font-weight: bold; color: #667eea;">Smart Host Hotel Management</h1>
            <p style="margin: 2px 0; font-size: 9px; color: #6B7280;">Abha, Al-Areen St</p>
          </div>
        </div>

        <!-- VAT & CR Number Bar -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 10px; margin-bottom: 10px; border-radius: 6px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
          <div style="text-align: right; font-size: 9px; direction: rtl;">
            <strong>الرقم الضريبي</strong> ${vatNumber} | <strong>السجل التجاري</strong> ${crNumber}
          </div>
          <div style="text-align: left; font-size: 9px; direction: ltr;">
            <strong>VAT No</strong> ${vatNumber} | <strong>CR No</strong> ${crNumber}
          </div>
        </div>

        <!-- Invoice Title -->
        <div style="text-align: center; margin-bottom: 10px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">فاتورة ضريبية مبسطة</h2>
        </div>

        <!-- QR Code + Invoice Details Grid -->
        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
          <!-- QR Code -->
          <div style="flex: 0 0 120px; text-align: center;">
            <div style="border: 2px solid transparent; background: linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box; padding: 5px; border-radius: 8px; box-shadow: 0 2px 10px rgba(102, 126, 234, 0.15);">
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 120px; height: 120px; display: block;" />
            </div>
          </div>

          <!-- Invoice Details Grid -->
          <div style="flex: 1;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #667eea; border-radius: 6px; overflow: hidden;">
              <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
                <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; width: 50%; color: #4F46E5;">رقم الفاتورة</td>
                <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; width: 50%; color: #4F46E5;">Invoice No</td>
              </tr>
              <tr style="background: white;">
                <td colspan="2" style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; font-weight: 600;">${invoice.number}</td>
              </tr>
              
              <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
                <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5;">تاريخ الفاتورة</td>
                <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5;">Invoice Date</td>
              </tr>
              <tr style="background: white;">
                <td colspan="2" style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.date}</td>
              </tr>
              
              <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
                <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5;">رقم الخدمة</td>
                <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5;">Service No</td>
              </tr>
              <tr style="background: white;">
                <td colspan="2" style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.bookingId || 'SRV-' + invoice.number.split('-').pop()}</td>
              </tr>
              
              <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
                <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5;">طريقة الدفع</td>
                <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5;">Payment Method</td>
              </tr>
              <tr style="background: white;">
                <td colspan="2" style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.paymentType || 'نقدي'}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Bill To Section -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 10px; margin-bottom: 8px; text-align: center; font-size: 11px; font-weight: bold; border-radius: 6px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
          فاتورة إلى (Bill To)
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #667eea; border-radius: 6px; overflow: hidden;">
          <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; width: 25%; color: #4F46E5; direction: rtl;">اسم الشركة</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; font-weight: 600; width: 50%;">${invoice.customerName}</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; width: 25%; color: #4F46E5; direction: ltr;">Company Name</td>
          </tr>
          <tr style="background: white;">
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5; direction: rtl;">اسم المسؤول</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.customerName}</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5; direction: ltr;">Contact Person</td>
          </tr>
          <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5; direction: rtl;">الفندق المستضيف</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.room || 'غير محدد'}</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5; direction: ltr;">Host Hotel</td>
          </tr>
          <tr style="background: white;">
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5; direction: rtl;">رقم هاتف المسؤول</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; direction: ltr;">${invoice.phone || 'غير محدد'}</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5; direction: ltr;">Contact Phone</td>
          </tr>
          <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5; direction: rtl;">الرقم الضريبي</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.taxNumber || 'غير محدد'}</td>
            <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5; direction: ltr;">VAT Number</td>
          </tr>
        </table>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #667eea; border-radius: 6px; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
          <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: right; font-size: 8px; direction: rtl;">الوصف<br/><span style="font-size: 7px; opacity: 0.9;">Description</span></th>
              <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 8%;">عدد<br/>الأيام<br/><span style="font-size: 6px; opacity: 0.9;">Days</span></th>
              <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 12%;">سعر<br/>الفرد<br/><span style="font-size: 6px; opacity: 0.9;">Unit Price</span></th>
              <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 13%;">المبلغ قبل<br/>الضريبة<br/><span style="font-size: 6px; opacity: 0.9;">Before Tax</span></th>
              <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 10%;">الضريبة<br/>(${taxRate}%)<br/><span style="font-size: 6px; opacity: 0.9;">Tax</span></th>
              <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 12%;">الإجمالي<br/><span style="font-size: 6px; opacity: 0.9;">Total</span></th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
              <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px;">
                ${invoice.description}
                ${invoice.bookingId ? `<br/><span style="font-size: 8px; color: #6B7280;">رقم الحجز: ${invoice.bookingId}</span>` : ''}
              </td>
              <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; font-weight: bold;">${invoice.roomNights || 1}</td>
              <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${(invoice.amountBeforeTax / (invoice.roomNights || 1)).toFixed(2)}</td>
              <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; font-weight: bold;">${invoice.amountBeforeTax.toFixed(2)}</td>
              <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.taxAmount.toFixed(2)}</td>
              <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 10px; font-weight: bold; color: #667eea;">${invoice.amountAfterTax.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Summary Section -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
          <div style="width: 100%; max-width: 320px;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #667eea; border-radius: 6px; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                <td style="padding: 5px 8px; text-align: right; font-size: 9px; border: 1px solid #c7d2fe; font-weight: bold; color: #4F46E5; direction: rtl; width: 35%;">المبلغ الخاضع للضريبة</td>
                <td style="padding: 5px 8px; text-align: center; font-size: 9px; font-weight: bold; border: 1px solid #c7d2fe; width: 25%;">${invoice.amountBeforeTax.toFixed(2)}</td>
                <td style="padding: 5px 8px; text-align: left; font-size: 8px; border: 1px solid #c7d2fe; color: #6B7280; direction: ltr; width: 40%;">Taxable Amount</td>
              </tr>
              
              <tr style="background: white;">
                <td style="padding: 5px 8px; text-align: right; font-size: 9px; border: 1px solid #c7d2fe; font-weight: bold; color: #4F46E5; direction: rtl;">ضريبة القيمة المضافة (${taxRate}%)</td>
                <td style="padding: 5px 8px; text-align: center; font-size: 9px; font-weight: bold; border: 1px solid #c7d2fe;">${invoice.taxAmount.toFixed(2)}</td>
                <td style="padding: 5px 8px; text-align: left; font-size: 8px; border: 1px solid #c7d2fe; color: #6B7280; direction: ltr;">VAT (${taxRate}%)</td>
              </tr>
              
              <tr style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">
                <td style="padding: 6px 8px; text-align: right; font-size: 10px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: 1px solid #667eea; -webkit-print-color-adjust: exact; print-color-adjust: exact; direction: rtl;">الإجمالي الكلي</td>
                <td style="padding: 6px 8px; text-align: center; font-size: 11px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: 1px solid #667eea; -webkit-print-color-adjust: exact; print-color-adjust: exact;">${invoice.amountAfterTax.toFixed(2)}</td>
                <td style="padding: 6px 8px; text-align: left; font-size: 10px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: 1px solid #667eea; -webkit-print-color-adjust: exact; print-color-adjust: exact; direction: ltr;">Grand Total</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 8px; border-top: 2px solid #667eea; margin-top: 8px;">
          <p style="margin: 2px 0; font-size: 10px; font-weight: bold; color: #667eea;">${hotelName}</p>
          <p style="margin: 2px 0; font-size: 8px; color: #6B7280; direction: ltr;">📞 ${hotelPhone} | 📧 ${hotelEmail}</p>
        </div>
      </div>
      
      <button class="print-button no-print" onclick="window.print()">
        🖨️ طباعة الفاتورة
      </button>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};

/**
 * يحسب ضريبة القيمة المضافة (15%)
 */
export const calculateVAT = (amountBeforeTax: number, vatRate: number = 15): { taxAmount: number; amountAfterTax: number } => {
  const taxAmount = (amountBeforeTax * vatRate) / 100;
  const amountAfterTax = amountBeforeTax + taxAmount;
  
  return {
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    amountAfterTax: parseFloat(amountAfterTax.toFixed(2))
  };
};
