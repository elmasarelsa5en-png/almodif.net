import React from 'react';

interface InvoiceData {
  number: string;
  customerName: string;
  room: string;
  amount: number;
  amountBeforeTax: number;
  amountAfterTax: number;
  taxNumber: string;
  paymentType: string;
  status: string;
  date: string;
  dueDate: string;
  description: string;
  phone?: string;
  email?: string;
  bookingId?: string;
  roomNights?: number;
}

interface InvoicePrintTemplateProps {
  invoice: InvoiceData;
}

export default function InvoicePrintTemplate({ invoice }: InvoicePrintTemplateProps) {
  const taxAmount = invoice.amountAfterTax - invoice.amountBeforeTax;
  const taxRate = invoice.amountBeforeTax > 0 ? (taxAmount / invoice.amountBeforeTax * 100).toFixed(1) : '0.0';

  return (
    <div className="invoice-print-template" style={{
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm',
      margin: '0 auto',
      background: 'white',
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      {/* Header with Logo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px solid #4F46E5',
        paddingBottom: '20px',
        marginBottom: '30px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            {/* Logo */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '36px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}>
              AM
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1F2937',
                letterSpacing: '-0.5px'
              }}>Al-Modif CRM</h1>
              <p style={{
                margin: '5px 0 0 0',
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: '500'
              }}>نظام إدارة الفنادق الذكي</p>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <h2 style={{
            margin: 0,
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#4F46E5',
            letterSpacing: '-1px'
          }}>فاتورة</h2>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '16px',
            color: '#6B7280',
            fontWeight: '600'
          }}>INVOICE</p>
        </div>
      </div>

      {/* Invoice Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Company Info */}
        <div style={{
          padding: '20px',
          background: '#F9FAFB',
          borderRadius: '12px',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#374151',
            borderBottom: '2px solid #4F46E5',
            paddingBottom: '8px'
          }}>من:</h3>
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#4B5563', fontWeight: '600' }}>
            Al-Modif Hotel Management
          </p>
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#6B7280' }}>
            📍 شارع الملك فيصل، الرياض، المملكة العربية السعودية
          </p>
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#6B7280' }}>
            📞 +966 11 234 5678
          </p>
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#6B7280' }}>
            📧 info@almodif.com
          </p>
        </div>

        {/* Customer Info */}
        <div style={{
          padding: '20px',
          background: '#F0F9FF',
          borderRadius: '12px',
          border: '1px solid #BAE6FD'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#374151',
            borderBottom: '2px solid #0EA5E9',
            paddingBottom: '8px'
          }}>إلى:</h3>
          <p style={{ margin: '8px 0', fontSize: '16px', color: '#0C4A6E', fontWeight: 'bold' }}>
            {invoice.customerName}
          </p>
          {invoice.phone && (
            <p style={{ margin: '5px 0', fontSize: '13px', color: '#075985' }}>
              📞 {invoice.phone}
            </p>
          )}
          {invoice.email && (
            <p style={{ margin: '5px 0', fontSize: '13px', color: '#075985' }}>
              📧 {invoice.email}
            </p>
          )}
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#075985' }}>
            🏠 الغرفة: {invoice.room}
          </p>
        </div>
      </div>

      {/* Invoice Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '40px'
      }}>
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.9 }}>رقم الفاتورة</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{invoice.number}</p>
        </div>
        
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.9 }}>تاريخ الإصدار</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{invoice.date}</p>
        </div>
        
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.9 }}>تاريخ الاستحقاق</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{invoice.dueDate}</p>
        </div>
        
        <div style={{
          padding: '15px',
          background: invoice.status === 'مدفوع' 
            ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
            : invoice.status === 'معلق'
            ? 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)'
            : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.9 }}>الحالة</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{invoice.status}</p>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div style={{ marginBottom: '40px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <th style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>الوصف</th>
              <th style={{ padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>الكمية</th>
              <th style={{ padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>السعر</th>
              <th style={{ padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>المجموع</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '15px', fontSize: '14px', color: '#374151' }}>
                {invoice.description}
                {invoice.roomNights && (
                  <span style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>
                    عدد الليالي: {invoice.roomNights}
                  </span>
                )}
                {invoice.bookingId && (
                  <span style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>
                    رقم الحجز: {invoice.bookingId}
                  </span>
                )}
              </td>
              <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>
                {invoice.roomNights || 1}
              </td>
              <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                {(invoice.amountBeforeTax / (invoice.roomNights || 1)).toFixed(2)} ر.س
              </td>
              <td style={{ padding: '15px', textAlign: 'center', fontSize: '15px', color: '#4F46E5', fontWeight: 'bold' }}>
                {invoice.amountBeforeTax.toFixed(2)} ر.س
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '40px'
      }}>
        <div style={{ width: '400px' }}>
          <div style={{
            padding: '20px',
            background: '#F9FAFB',
            borderRadius: '12px',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>المبلغ الأساسي:</span>
              <span style={{ fontSize: '15px', color: '#374151', fontWeight: '600' }}>
                {invoice.amountBeforeTax.toFixed(2)} ر.س
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>الضريبة ({taxRate}%):</span>
              <span style={{ fontSize: '15px', color: '#374151', fontWeight: '600' }}>
                {taxAmount.toFixed(2)} ر.س
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              marginTop: '15px'
            }}>
              <span style={{ fontSize: '16px', color: 'white', fontWeight: 'bold' }}>الإجمالي:</span>
              <span style={{ fontSize: '20px', color: 'white', fontWeight: 'bold' }}>
                {invoice.amountAfterTax.toFixed(2)} ر.س
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          padding: '15px',
          background: '#FEF3C7',
          borderRadius: '10px',
          border: '1px solid #FDE68A'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#92400E', fontWeight: 'bold' }}>
            💳 طريقة الدفع
          </p>
          <p style={{ margin: 0, fontSize: '15px', color: '#78350F', fontWeight: '600' }}>
            {invoice.paymentType}
          </p>
        </div>
        
        <div style={{
          padding: '15px',
          background: '#DBEAFE',
          borderRadius: '10px',
          border: '1px solid #BFDBFE'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#1E40AF', fontWeight: 'bold' }}>
            🔢 الرقم الضريبي
          </p>
          <p style={{ margin: 0, fontSize: '15px', color: '#1E3A8A', fontWeight: '600' }}>
            {invoice.taxNumber}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '2px solid #E5E7EB',
        paddingTop: '20px',
        marginTop: 'auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
            شكراً لتعاملكم معنا
          </p>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.9 }}>
            🌐 www.almodif.com | 📧 support@almodif.com | 📞 +966 11 234 5678
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '11px', opacity: 0.8 }}>
            تم إنشاء هذه الفاتورة بواسطة نظام Al-Modif CRM
          </p>
        </div>
      </div>

      {/* Watermark */}
      {invoice.status !== 'مدفوع' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          fontSize: '120px',
          fontWeight: 'bold',
          color: invoice.status === 'معلق' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0
        }}>
          {invoice.status}
        </div>
      )}
    </div>
  );
}
