import { useState, useEffect } from 'react';
import { Printer, Download, X, Copy, Check, QrCode, Utensils, Receipt, FileText, Building2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { formatQuantityWithSubunit } from '../pages/BillingPOS';

export interface OrderPrintData {
  id?: string;
  orderNumber: string;
  orderType: string;
  createdAt?: string | Date;
  status?: string;
  paymentMethod?: string;
  subtotal: number;
  tax: number;
  packingCharge?: number;
  deliveryCharge?: number;
  discount?: number;
  total: number;
  paidAmount?: number;
  balanceAmount?: number;
  splitPaidMethod?: string;
  table?: { name: string } | null;
  customer?: { name: string; mobile?: string; gstNumber?: string; address?: string } | null;
  customerNotes?: string | null;
  kitchenNotes?: string | null;
  estimatedPrepTime?: number | null;
  doctorName?: string | null;
  patientName?: string | null;
  items: {
    quantity: number;
    price: number;
    discount?: number;
    notes?: string | null;
    menuItem: {
      name: string;
      unit?: string | null;
      hsnCode?: string | null;
      gst?: number;
      kitchenSection?: string | null;
      dietary?: string | null;
      sku?: string | null;
      barcode?: string | null;
      batchNumber?: string | null;
      expiryDate?: string | null;
      serialNumber?: string | null;
      warrantyMonths?: number | null;
      brand?: string | null;
      attributes?: Record<string, any> | null;
    };
  }[];
}

interface PrintInvoiceModalProps {
  order: OrderPrintData | null;
  isOpen: boolean;
  onClose: () => void;
  isDuplicate?: boolean;
  autoPrint?: boolean;
}

export default function PrintInvoiceModal({
  order,
  isOpen,
  onClose,
  isDuplicate = false,
  autoPrint = false
}: PrintInvoiceModalProps) {
  const { businessProfile } = useAuth();
  
  const layout = {
    headerTitle: businessProfile.businessName || "My Business",
    tagline: businessProfile.tagline || "Point of Sale & Invoicing",
    taxLicenseLabel: "GSTIN",
    termsText: businessProfile.termsText || "Goods once sold will not be taken back without original bill.",
    thankYouNote: businessProfile.thankYouNote || "Thank you for your business! Visit again soon 😊",
    showQrCode: false,
    showLogo: true,
  };

  const defaultPaper = (businessProfile.paperSize === 'A4' ? 'A4' : (businessProfile.paperSize === '58MM' ? '58MM' : '80MM')) as '80MM' | '58MM' | 'A4' | 'KOT';
  const [printFormat, setPrintFormat] = useState<'80MM' | '58MM' | 'A4' | 'KOT'>(defaultPaper);
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const settings = {
    profileName: businessProfile.businessName || "My Business",
    tagline: businessProfile.tagline || "Point of Sale & Invoicing",
    address: businessProfile.address || "124, Commercial Road, Chennai - 600001",
    phone: businessProfile.phone || "+91 98765 43210",
    email: businessProfile.email || "contact@mybusiness.com",
    gstin: businessProfile.gstin || "33AAAAA0000A1Z5",
    licenseNo: businessProfile.fssai || "",
    fssai: businessProfile.fssai || "",
    upiId: `pay@${businessProfile.phone?.replace(/[^0-9]/g, '') || '9876543210'}`,
  };

  useEffect(() => {
    if (businessProfile.paperSize) {
      setPrintFormat(businessProfile.paperSize === 'A4' ? 'A4' : (businessProfile.paperSize === '58MM' ? '58MM' : '80MM'));
    }
  }, [businessProfile.paperSize]);

  if (!isOpen || !order) return null;

  const orderDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) 
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const cgst = (order.tax / 2).toFixed(2);
  const sgst = (order.tax / 2).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `Invoice #${order.orderNumber}\nBusiness: ${layout.headerTitle}\nDate: ${orderDate}\nTotal: ₹${order.total.toFixed(2)}\nPayment: ${order.paymentMethod || 'CASH'}\nStatus: ${order.status || 'COMPLETED'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const numberToWords = (num: number) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const n = Math.floor(num);
    if (n === 0) return 'Zero Rupees Only';
    let str = '';
    if (n >= 1000) str += a[Math.floor(n / 1000)] + 'Thousand ';
    const rem = n % 1000;
    if (rem >= 100) str += a[Math.floor(rem / 100)] + 'Hundred ';
    const rem2 = rem % 100;
    if (rem2 > 0) {
      if (rem2 < 20) str += a[rem2];
      else str += b[Math.floor(rem2 / 10)] + ' ' + a[rem2 % 10];
    }
    return str.trim() + ' Rupees Only';
  };

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(layout.headerTitle)}&am=${order.total.toFixed(2)}&cu=INR`)}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 z-50 overflow-y-auto print:p-0 print:m-0 print:bg-transparent print:static print:block print:overflow-visible print:inset-auto print:w-full print:h-auto print-invoice-modal">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:h-auto print:bg-transparent print:overflow-visible print:static print:w-full print:p-0 print:m-0 text-slate-100">
        
        {/* Header Controls Bar */}
        <div className="p-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4 bg-slate-850 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                {layout.headerTitle}
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 font-mono font-bold">
                  TAX INVOICE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Invoice #{order.orderNumber} • Type: <span className="text-slate-200 font-semibold">{order.orderType || 'TAX INVOICE'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Paper Format Switcher */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 text-xs">
              <button
                onClick={() => setPrintFormat('80MM')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${printFormat === '80MM' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                80mm
              </button>
              <button
                onClick={() => setPrintFormat('58MM')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${printFormat === '58MM' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                58mm
              </button>
              <button
                onClick={() => setPrintFormat('A4')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${printFormat === 'A4' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                A4 Tax
              </button>
              <button
                onClick={() => setPrintFormat('KOT')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${printFormat === 'KOT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                KOT Slip
              </button>
            </div>

            {/* QR Scanner Toggle */}
            <button
              onClick={() => setShowQrScanner(!showQrScanner)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer",
                showQrScanner
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              )}
              title="Toggle QR Code Scanner on Receipt"
            >
              <span>{showQrScanner ? '📱 QR Code: ON' : '🚫 QR Code: OFF'}</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-md shadow-blue-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice View Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950 print:bg-transparent print:p-0 print:m-0 print:overflow-visible print:block flex justify-center items-start">
          
          {/* FORMAT 1A: 58MM COMPACT THERMAL RECEIPT */}
          {printFormat === '58MM' && (
            <div className="w-[200px] max-w-[200px] thermal-receipt-58mm bg-white text-black p-2 font-mono text-[9px] leading-tight rounded-lg shadow-2xl print:shadow-none print:border-none print:rounded-none">
              
              {/* Header */}
              <div className="text-center border-b border-dashed border-gray-400 pb-1.5 mb-1.5">
                <h2 className="font-extrabold text-xs uppercase tracking-tight break-words">{layout.headerTitle}</h2>
                {layout.tagline && <p className="text-[8px] text-gray-600 italic break-words">{layout.tagline}</p>}
                <p className="text-[8.5px] text-gray-600 mt-0.5 break-words">{settings.address}</p>
                <p className="text-[8.5px] text-gray-600">Ph: {settings.phone}</p>
                
                {/* Dynamic Regulatory License Header */}
                {settings.gstin && (
                  <p className="text-[8.5px] font-bold mt-0.5 uppercase break-words">
                    GSTIN: {settings.gstin}
                  </p>
                )}
              </div>

              {/* Order Metadata */}
              <div className="border-b border-dashed border-gray-400 pb-1.5 mb-1.5 text-[8.5px] space-y-0.5">
                <div className="flex justify-between gap-1">
                  <span className="truncate">Bill: <strong>{order.orderNumber}</strong></span>
                  <span className="shrink-0">{orderDate}</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span>Type: <strong>{order.orderType}</strong></span>
                  <span>Pay: <strong>{order.paymentMethod || 'CASH'}</strong></span>
                </div>
                {order.table && (
                  <div className="break-words">Table: <strong>{order.table.name}</strong></div>
                )}
                {order.customer?.name && (
                  <div className="break-words">Cust: <strong>{order.customer.name}</strong> {order.customer.mobile ? `(${order.customer.mobile})` : ''}</div>
                )}
                {order.doctorName && (
                  <div className="break-words">Dr: <strong>{order.doctorName}</strong></div>
                )}
              </div>

              {/* Items Table - Proportional fixed layout prevents horizontal overflow */}
              <table className="w-full text-left mb-2 border-b border-dashed border-gray-400 table-fixed thermal-table">
                <colgroup>
                  <col style={{ width: '56%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '26%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[8px]">
                    <th className="py-0.5 text-left">Item</th>
                    <th className="py-0.5 text-center">Qty</th>
                    <th className="py-0.5 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => {
                    const parsedAttrs = (item.menuItem as any).attributes || {};
                    const batch = item.menuItem.batchNumber || parsedAttrs.batchNumber;
                    const exp = item.menuItem.expiryDate || parsedAttrs.expiryDate;
                    const serial = item.menuItem.serialNumber || parsedAttrs.serialNumber;

                    return (
                      <tr key={idx} className="align-top">
                        <td className="py-0.5 leading-tight break-words pr-0.5">
                          <div className="font-semibold text-[8.5px]">{item.menuItem.name}</div>
                          {(batch || exp) && (
                            <div className="text-[7px] text-gray-500 font-mono">B:{batch || '-'} E:{exp || '-'}</div>
                          )}
                          {serial && (
                            <div className="text-[7px] text-gray-500 font-mono">S/N: {serial}</div>
                          )}
                        </td>
                        <td className="py-0.5 text-center font-mono text-[8px] whitespace-nowrap align-top">
                          {formatQuantityWithSubunit(item.quantity, item.menuItem.unit)}
                        </td>
                        <td className="py-0.5 text-right font-bold font-mono text-[8.5px] whitespace-nowrap align-top">
                          ₹{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="space-y-0.5 text-[9px] text-right font-bold border-b border-dashed border-gray-400 pb-1.5 mb-2">
                <div className="flex justify-between font-normal">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-normal">
                  <span>GST Tax:</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                {order.discount ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                ) : null}
                {order.packingCharge ? (
                  <div className="flex justify-between font-normal">
                    <span>Packing:</span>
                    <span>+₹{order.packingCharge.toFixed(2)}</span>
                  </div>
                ) : null}
                {order.deliveryCharge ? (
                  <div className="flex justify-between font-normal">
                    <span>Delivery:</span>
                    <span>+₹{order.deliveryCharge.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-[11px] font-black border-t border-black pt-1">
                  <span>TOTAL:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
                {order.paidAmount !== undefined && order.paidAmount < order.total && (
                  <>
                    <div className="flex justify-between font-normal text-[#2563EB] pt-0.5 text-[8px]">
                      <span>Paid ({order.splitPaidMethod || order.paymentMethod}):</span>
                      <span>₹{order.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-red-600 text-[8px]">
                      <span>Due:</span>
                      <span>₹{(order.balanceAmount ?? (order.total - order.paidAmount)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* UPI QR Code Preview - Centered & sized specifically for 58mm */}
              {showQrScanner && (
                <div className="flex flex-col items-center justify-center border-b border-dashed border-gray-400 pb-2 mb-2 w-full text-center">
                  <img src={upiQrUrl} alt="UPI QR" className="w-15 h-15 thermal-qr-58mm mx-auto block object-contain" />
                  <span className="text-[7.5px] text-gray-600 mt-0.5 font-bold block">Scan & Pay ₹{order.total.toFixed(2)}</span>
                </div>
              )}

              {/* Dynamic Footer Terms & Note */}
              <div className="text-center text-[7.5px] text-gray-600 italic break-words space-y-0.5">
                <p>{layout.termsText}</p>
                <p className="font-bold text-black text-[8px]">{layout.thankYouNote}</p>
              </div>
            </div>
          )}

          {/* FORMAT 1B: 80MM STANDARD THERMAL RECEIPT */}
          {printFormat === '80MM' && (
            <div className="w-[290px] max-w-[290px] thermal-receipt-80mm bg-white text-black p-3.5 font-mono text-[10.5px] leading-tight rounded-lg shadow-2xl print:shadow-none print:border-none print:rounded-none">
              
              {/* Header */}
              <div className="text-center border-b border-dashed border-gray-400 pb-2.5 mb-2.5">
                <h2 className="font-extrabold text-sm uppercase tracking-tight break-words">{layout.headerTitle}</h2>
                {layout.tagline && <p className="text-[9px] text-gray-600 italic break-words">{layout.tagline}</p>}
                <p className="text-[9.5px] text-gray-600 mt-0.5 break-words">{settings.address}</p>
                <p className="text-[9.5px] text-gray-600">Ph: {settings.phone}</p>
                
                {/* Dynamic Regulatory License Header */}
                {settings.gstin && (
                  <p className="text-[9.5px] font-bold mt-0.5 uppercase break-words">
                    GSTIN: {settings.gstin}
                  </p>
                )}
              </div>

              {/* Order Metadata */}
              <div className="border-b border-dashed border-gray-400 pb-2 mb-2 text-[9.5px] space-y-0.5">
                <div className="flex justify-between gap-1">
                  <span className="truncate">Bill #: <strong>{order.orderNumber}</strong></span>
                  <span className="shrink-0">{orderDate}</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span>Type: <strong>{order.orderType}</strong></span>
                  <span>Pay: <strong>{order.paymentMethod || 'CASH'}</strong></span>
                </div>
                {order.table && (
                  <div className="break-words">Table / Station: <strong>{order.table.name}</strong></div>
                )}
                {order.customer?.name && (
                  <div className="break-words">Customer: <strong>{order.customer.name}</strong> {order.customer.mobile ? `(${order.customer.mobile})` : ''}</div>
                )}
                {order.doctorName && (
                  <div className="break-words">Prescribing Doctor: <strong>Dr. {order.doctorName}</strong></div>
                )}
              </div>

              {/* Items Table - Proportional fixed layout prevents horizontal overflow */}
              <table className="w-full text-left mb-2.5 border-b border-dashed border-gray-400 table-fixed thermal-table">
                <colgroup>
                  <col style={{ width: '54%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '26%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[9px]">
                    <th className="py-1 text-left">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => {
                    const parsedAttrs = (item.menuItem as any).attributes || {};
                    const batch = item.menuItem.batchNumber || parsedAttrs.batchNumber;
                    const exp = item.menuItem.expiryDate || parsedAttrs.expiryDate;
                    const serial = item.menuItem.serialNumber || parsedAttrs.serialNumber;

                    return (
                      <tr key={idx} className="align-top">
                        <td className="py-1 leading-tight break-words pr-1">
                          <div className="font-semibold text-[10px]">{item.menuItem.name}</div>
                          {(batch || exp) && (
                            <div className="text-[8px] text-gray-500 font-mono">B:{batch || '-'} E:{exp || '-'}</div>
                          )}
                          {serial && (
                            <div className="text-[8px] text-gray-500 font-mono">S/N: {serial}</div>
                          )}
                        </td>
                        <td className="py-1 text-center font-mono text-[9.5px] whitespace-nowrap align-top">
                          {formatQuantityWithSubunit(item.quantity, item.menuItem.unit)}
                        </td>
                        <td className="py-1 text-right font-bold font-mono text-[10px] whitespace-nowrap align-top">
                          ₹{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="space-y-1 text-[10.5px] text-right font-bold border-b border-dashed border-gray-400 pb-2 mb-2.5">
                <div className="flex justify-between font-normal">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-normal">
                  <span>GST Tax (CGST+SGST):</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                {order.discount ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                ) : null}
                {order.packingCharge ? (
                  <div className="flex justify-between font-normal">
                    <span>Packing Charges:</span>
                    <span>+₹{order.packingCharge.toFixed(2)}</span>
                  </div>
                ) : null}
                {order.deliveryCharge ? (
                  <div className="flex justify-between font-normal">
                    <span>Delivery Charges:</span>
                    <span>+₹{order.deliveryCharge.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-black border-t border-black pt-1">
                  <span>GRAND TOTAL:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
                {order.paidAmount !== undefined && order.paidAmount < order.total && (
                  <>
                    <div className="flex justify-between font-normal text-[#2563EB] pt-0.5 text-[9.5px]">
                      <span>Paid Amount ({order.splitPaidMethod || order.paymentMethod}):</span>
                      <span>₹{order.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-red-600 text-[9.5px]">
                      <span>Balance Due:</span>
                      <span>₹{(order.balanceAmount ?? (order.total - order.paidAmount)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* UPI QR Code Preview - Centered & sized specifically for 80mm */}
              {showQrScanner && (
                <div className="flex flex-col items-center justify-center border-b border-dashed border-gray-400 pb-2.5 mb-2.5 w-full text-center">
                  <img src={upiQrUrl} alt="UPI QR" className="w-20 h-20 thermal-qr-80mm mx-auto block object-contain" />
                  <span className="text-[8.5px] text-gray-600 mt-1 font-bold block">Scan & Pay ₹{order.total.toFixed(2)}</span>
                </div>
              )}

              {/* Dynamic Footer Terms & Note */}
              <div className="text-center text-[8.5px] text-gray-600 italic break-words space-y-0.5">
                <p>{layout.termsText}</p>
                <p className="font-bold text-black text-[9.5px]">{layout.thankYouNote}</p>
              </div>
            </div>
          )}

          {/* FORMAT 2: A4 FULL TAX INVOICE */}
          {printFormat === 'A4' && (
            <div className="a4-tax-invoice w-full max-w-[210mm] bg-white text-slate-900 p-8 md:p-10 font-sans rounded-md shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:rounded-none print:w-full flex flex-col justify-between">
              
              <div>
                {/* Top Banner */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
                  <div className="max-w-[60%]">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950">{layout.headerTitle}</h2>
                    {layout.tagline && <p className="text-xs text-slate-600 italic font-medium mt-0.5">{layout.tagline}</p>}
                    <p className="text-xs text-slate-700 mt-1 leading-snug">{settings.address}</p>
                    <p className="text-xs text-slate-800 font-semibold mt-0.5">
                      {layout.taxLicenseLabel || 'GSTIN'}: <strong className="font-bold text-slate-950">{settings.gstin}</strong> | Phone: {settings.phone}
                    </p>
                    {settings.email && <p className="text-[11px] text-slate-600">Email: {settings.email}</p>}
                    {settings.fssai && <p className="text-[11px] text-slate-700 font-semibold">License / FSSAI: {settings.fssai}</p>}
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="px-3 py-1 bg-slate-950 text-white text-xs font-black tracking-widest uppercase rounded shadow-sm">
                      TAX INVOICE
                    </span>
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                      Original for Recipient
                    </span>
                    <p className="font-mono text-base font-extrabold text-slate-950 mt-1 tracking-tight">#{order.orderNumber}</p>
                    <p className="text-xs text-slate-600">{orderDate}</p>
                    <p className="text-[11px] text-slate-700 font-semibold mt-0.5">Invoice Type: {order.orderType || 'TAX INVOICE'}</p>
                  </div>
                </div>

                {/* Bill To & Details */}
                <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-lg p-3.5 mb-5 bg-slate-50/80">
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">BILLED TO (CUSTOMER):</div>
                    <div className="font-bold text-sm text-slate-950">{order.customer?.name || 'Walk-in Customer'}</div>
                    {order.customer?.mobile && <div className="text-xs text-slate-700 mt-0.5">Phone: {order.customer.mobile}</div>}
                    {order.customer?.address && <div className="text-xs text-slate-600 mt-0.5">{order.customer.address}</div>}
                    {order.customer?.gstNumber && <div className="text-xs text-slate-800 font-semibold mt-0.5">Customer GSTIN: {order.customer.gstNumber}</div>}
                    {order.patientName && <div className="text-xs text-slate-700 mt-0.5">Patient Name: <strong>{order.patientName}</strong></div>}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">PAYMENT & FULFILLMENT:</div>
                    <div className="text-xs text-slate-700">Payment Method: <strong className="font-bold text-slate-950">{order.paymentMethod || 'CASH'}</strong></div>
                    <div className="text-xs text-slate-700 mt-0.5">Payment Status: <strong className="text-emerald-700 font-bold">{order.status || 'COMPLETED'}</strong></div>
                    {order.table && <div className="text-xs text-slate-700 mt-0.5">Station / Table: <strong>{order.table.name}</strong></div>}
                    {order.doctorName && <div className="text-xs text-slate-700 mt-0.5">Prescribing Doctor: <strong>Dr. {order.doctorName}</strong></div>}
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs mb-5 border-collapse border border-slate-300 a4-table table-fixed">
                  <colgroup>
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '42%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '12%' }} />
                  </colgroup>
                  <thead className="bg-slate-100 uppercase text-[10px] font-extrabold border-b border-slate-300 text-slate-800">
                    <tr>
                      <th className="p-2.5 border border-slate-300 text-center">#</th>
                      <th className="p-2.5 border border-slate-300 text-left">Item Description & Specifications</th>
                      <th className="p-2.5 border border-slate-300 text-center">HSN</th>
                      <th className="p-2.5 border border-slate-300 text-center">Qty</th>
                      <th className="p-2.5 border border-slate-300 text-right">Rate (₹)</th>
                      <th className="p-2.5 border border-slate-300 text-center">GST %</th>
                      <th className="p-2.5 border border-slate-300 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5 border border-slate-300 text-slate-500 text-center font-mono">{idx + 1}</td>
                        <td className="p-2.5 border border-slate-300">
                          <div className="font-bold text-slate-950 text-xs">{item.menuItem.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex flex-wrap gap-x-2">
                            {item.menuItem.sku && <span>SKU: {item.menuItem.sku}</span>}
                            {item.menuItem.batchNumber && <span>Batch: {item.menuItem.batchNumber}</span>}
                            {item.menuItem.expiryDate && <span>Exp: {item.menuItem.expiryDate}</span>}
                            {item.menuItem.serialNumber && <span>S/N: {item.menuItem.serialNumber}</span>}
                          </div>
                        </td>
                        <td className="p-2.5 border border-slate-300 text-center font-mono text-slate-700">{item.menuItem.hsnCode || '2106'}</td>
                        <td className="p-2.5 border border-slate-300 text-center font-bold font-mono text-slate-950">{item.quantity}</td>
                        <td className="p-2.5 border border-slate-300 text-right font-mono text-slate-800">₹{item.price.toFixed(2)}</td>
                        <td className="p-2.5 border border-slate-300 text-center font-mono text-slate-800">{(typeof item.menuItem?.gst === 'number' ? item.menuItem.gst : 5)}%</td>
                        <td className="p-2.5 border border-slate-300 text-right font-bold font-mono text-slate-950">₹{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tax Split Footer Section */}
              <div className="grid grid-cols-12 gap-5 border-t-2 border-slate-900 pt-4 mt-auto">
                {/* Left Column: Tax Table & Notes */}
                <div className="col-span-7 space-y-3">
                  <div className="border border-slate-300 rounded-md overflow-hidden bg-slate-50/90 shadow-sm">
                    <div className="bg-slate-200/80 px-2.5 py-1 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      GST Tax Breakdown
                    </div>
                    <table className="w-full text-[10px] font-mono">
                      <thead className="border-b border-slate-300 text-slate-600 bg-slate-100">
                        <tr>
                          <th className="py-1 px-2.5 text-left font-bold">Tax Component</th>
                          <th className="py-1 px-2 text-right">Taxable Value</th>
                          <th className="py-1 px-2 text-center">Rate</th>
                          <th className="py-1 px-2.5 text-right font-bold">Tax Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-1 px-2.5 text-left font-medium">Central GST (CGST)</td>
                          <td className="py-1 px-2 text-right text-slate-700">₹{order.subtotal.toFixed(2)}</td>
                          <td className="py-1 px-2 text-center text-slate-700">{(order.tax > 0 && order.subtotal > 0 ? ((order.tax / order.subtotal) * 50).toFixed(1) : '2.5')}%</td>
                          <td className="py-1 px-2.5 text-right font-bold text-slate-900">₹{cgst}</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2.5 text-left font-medium">State GST (SGST)</td>
                          <td className="py-1 px-2 text-right text-slate-700">₹{order.subtotal.toFixed(2)}</td>
                          <td className="py-1 px-2 text-center text-slate-700">{(order.tax > 0 && order.subtotal > 0 ? ((order.tax / order.subtotal) * 50).toFixed(1) : '2.5')}%</td>
                          <td className="py-1 px-2.5 text-right font-bold text-slate-900">₹{sgst}</td>
                        </tr>
                      </tbody>
                      <tfoot className="border-t border-slate-300 font-bold bg-slate-100 text-slate-950">
                        <tr>
                          <td colSpan={3} className="py-1 px-2.5 text-left font-bold uppercase">Total GST Output</td>
                          <td className="py-1 px-2.5 text-right font-black font-mono">₹{order.tax.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="text-[11px] text-slate-700 leading-snug">
                    Amount in words: <strong className="font-bold text-slate-950 italic">{numberToWords(order.total)}</strong>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[9.5px] text-slate-500 leading-tight space-y-0.5">
                    <p className="italic">{layout.termsText}</p>
                    <p className="font-bold text-slate-900 text-[10.5px]">{layout.thankYouNote}</p>
                  </div>
                </div>

                {/* Right Column: Calculations & Grand Total & Signatory */}
                <div className="col-span-5 space-y-2 text-right font-mono flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Subtotal (Taxable):</span>
                      <span className="font-bold text-slate-950">₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Total GST Tax:</span>
                      <span className="font-bold text-slate-950">₹{order.tax.toFixed(2)}</span>
                    </div>
                    {order.discount ? (
                      <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                        <span>Discount Applied:</span>
                        <span>-₹{order.discount.toFixed(2)}</span>
                      </div>
                    ) : null}
                    {order.packingCharge ? (
                      <div className="flex justify-between text-xs text-slate-700">
                        <span>Packing Charges:</span>
                        <span>+₹{order.packingCharge.toFixed(2)}</span>
                      </div>
                    ) : null}
                    {order.deliveryCharge ? (
                      <div className="flex justify-between text-xs text-slate-700">
                        <span>Delivery Charges:</span>
                        <span>+₹{order.deliveryCharge.toFixed(2)}</span>
                      </div>
                    ) : null}

                    {/* High-Contrast Framed Grand Total */}
                    <div className="bg-slate-950 text-white px-3 py-2.5 rounded-lg flex justify-between items-center shadow-md mt-2">
                      <span className="text-xs font-black uppercase tracking-wider font-sans">GRAND TOTAL:</span>
                      <span className="text-base font-black">₹{order.total.toFixed(2)}</span>
                    </div>

                    {order.paidAmount !== undefined && order.paidAmount < order.total && (
                      <div className="pt-1.5 space-y-0.5">
                        <div className="flex justify-between text-xs text-blue-700 font-bold">
                          <span>Paid ({order.splitPaidMethod || order.paymentMethod}):</span>
                          <span>₹{order.paidAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-red-600 font-extrabold">
                          <span>Balance Due:</span>
                          <span>₹{(order.balanceAmount ?? (order.total - order.paidAmount)).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Authorized Signatory Box */}
                  <div className="pt-6 text-center border-t border-slate-200 mt-4">
                    <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight">For {layout.headerTitle}</div>
                    <div className="h-8"></div>
                    <div className="border-t border-dashed border-slate-400 pt-1 text-[9px] text-slate-500 font-sans uppercase font-bold tracking-wider">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 3: KOT / DISPATCH SLIP */}
          {printFormat === 'KOT' && (
            <div className="w-[300px] bg-white text-black p-4 text-xs font-mono rounded-lg shadow-2xl print:shadow-none print:w-full print:p-0">
              <div className="text-center border-b-2 border-black pb-2 mb-2">
                <h2 className="font-extrabold text-sm uppercase tracking-widest">
                  ORDER DISPATCH / PACKING SLIP
                </h2>
                <p className="text-[11px] font-bold">Order #{order.orderNumber}</p>
                <p className="text-[10px] text-gray-600">{orderDate}</p>
              </div>

              <div className="border-b border-black pb-2 mb-2 text-[11px] font-bold">
                {order.table && <div>Table / Station: {order.table.name}</div>}
                <div>Order Type: {order.orderType}</div>
                {order.kitchenNotes && <div className="text-red-700">Notes: {order.kitchenNotes}</div>}
              </div>

              <table className="w-full text-left mb-3">
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[10px]">
                    <th className="py-1">Item Description</th>
                    <th className="py-1 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-bold">
                        {item.menuItem.name}
                        {item.notes && <div className="text-[9px] text-red-600 font-normal">» {item.notes}</div>}
                      </td>
                      <td className="py-1.5 text-right font-extrabold text-sm">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-center text-[9px] text-gray-500 border-t border-black pt-2">
                Generated from POS • Send to Fulfillment Station
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
