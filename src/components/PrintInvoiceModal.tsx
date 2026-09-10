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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:bg-white text-gray-200">
        
        {/* Header Controls Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 border border-blue-400/30 flex items-center justify-center text-[#2563EB]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-2">
                {layout.headerTitle}
                <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-blue-400/30 text-[10px] text-[#2563EB] font-mono">
                  TAX INVOICE
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Invoice #{order.orderNumber} • Type: <span className="text-white font-semibold">{order.orderType || 'TAX INVOICE'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Paper Format Switcher */}
            <div className="flex items-center bg-[#F8FAFC] border border-gray-200 rounded-xl p-1 text-xs">
              <button
                onClick={() => setPrintFormat('80MM')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${printFormat === '80MM' ? 'bg-[#2563EB] text-[#0A0A0B]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                80mm
              </button>
              <button
                onClick={() => setPrintFormat('58MM')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${printFormat === '58MM' ? 'bg-[#2563EB] text-[#0A0A0B]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                58mm
              </button>
              <button
                onClick={() => setPrintFormat('A4')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${printFormat === 'A4' ? 'bg-[#2563EB] text-[#0A0A0B]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                A4 Tax
              </button>
              <button
                onClick={() => setPrintFormat('KOT')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${printFormat === 'KOT' ? 'bg-[#2563EB] text-[#0A0A0B]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                KOT Slip
              </button>
            </div>

            {/* QR Scanner Toggle */}
            <button
              onClick={() => setShowQrScanner(!showQrScanner)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1",
                showQrScanner
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-900"
              )}
              title="Toggle QR Code Scanner on Receipt"
            >
              <span>{showQrScanner ? '📱 QR Code: ON' : '🚫 QR Code: OFF'}</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-500 text-gray-300 hover:text-gray-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs rounded-xl uppercase tracking-wider shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>

            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice View Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] print:bg-white print:p-0 flex justify-center">
          
          {/* FORMAT 1: 80MM / 58MM THERMAL RECEIPT */}
          {(printFormat === '80MM' || printFormat === '58MM') && (
            <div className={`${printFormat === '58MM' ? 'w-[240px] text-[10px]' : 'w-[320px] text-xs'} bg-white text-black p-4 font-mono rounded-lg shadow-2xl print:shadow-none print:w-full print:p-0`}>
              
              {/* Header */}
              <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
                <h2 className="font-extrabold text-sm sm:text-base uppercase tracking-tight">{layout.headerTitle}</h2>
                {layout.tagline && <p className="text-[9px] text-gray-600 italic">{layout.tagline}</p>}
                <p className="text-[10px] text-gray-600 mt-0.5">{settings.address}</p>
                <p className="text-[10px] text-gray-600">Ph: {settings.phone}</p>
                
                {/* Dynamic Regulatory License Header */}
                {settings.gstin && (
                  <p className="text-[10px] font-bold mt-1 uppercase">
                    GSTIN: {settings.gstin}
                  </p>
                )}
              </div>

              {/* Order Metadata */}
              <div className="border-b border-dashed border-gray-400 pb-2 mb-2 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Bill #: <strong>{order.orderNumber}</strong></span>
                  <span>{orderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type: <strong>{order.orderType}</strong></span>
                  <span>Pay: <strong>{order.paymentMethod || 'CASH'}</strong></span>
                </div>
                {order.table && (
                  <div>Table / Station: <strong>{order.table.name}</strong></div>
                )}
                {order.customer?.name && (
                  <div>Customer: <strong>{order.customer.name}</strong> {order.customer.mobile ? `(${order.customer.mobile})` : ''}</div>
                )}
                {order.doctorName && (
                  <div>Prescribing Doctor: <strong>Dr. {order.doctorName}</strong></div>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-left mb-3 border-b border-dashed border-gray-400">
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[9px]">
                    <th className="py-1">Item</th>
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
                      <tr key={idx}>
                        <td className="py-1 leading-tight">
                          <div>{item.menuItem.name}</div>
                          {(batch || exp) && (
                            <div className="text-[8px] text-gray-500 font-mono">B:{batch || '-'} E:{exp || '-'}</div>
                          )}
                          {serial && (
                            <div className="text-[8px] text-gray-500 font-mono">S/N: {serial}</div>
                          )}
                        </td>
                        <td className="py-1 text-center font-mono">{formatQuantityWithSubunit(item.quantity, item.menuItem.unit)}</td>
                        <td className="py-1 text-right font-bold">
                          ₹{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="space-y-1 text-[11px] text-right font-bold border-b border-dashed border-gray-400 pb-2 mb-3">
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
                <div className="flex justify-between text-sm border-t border-black pt-1">
                  <span>GRAND TOTAL:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
                {order.paidAmount !== undefined && order.paidAmount < order.total && (
                  <>
                    <div className="flex justify-between font-normal text-[#2563EB] pt-0.5">
                      <span>Paid Amount ({order.splitPaidMethod || order.paymentMethod}):</span>
                      <span>₹{order.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-red-600">
                      <span>Balance Amount Due:</span>
                      <span>₹{(order.balanceAmount ?? (order.total - order.paidAmount)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* UPI QR Code Preview - Hidden by default */}
              {showQrScanner && (
                <div className="flex flex-col items-center justify-center border-b border-dashed border-gray-400 pb-3 mb-3">
                  <img src={upiQrUrl} alt="UPI QR" className="w-24 h-24" />
                  <span className="text-[9px] text-gray-600 mt-1 font-bold">Scan & Pay ₹{order.total.toFixed(2)}</span>
                </div>
              )}

              {/* Dynamic Footer Terms & Note */}
              <div className="text-center text-[9px] text-gray-600 italic">
                <p>{layout.termsText}</p>
                <p className="font-bold text-black mt-1 text-[10px]">{layout.thankYouNote}</p>
              </div>
            </div>
          )}

          {/* FORMAT 2: A4 FULL TAX INVOICE */}
          {printFormat === 'A4' && (
            <div className="w-full max-w-3xl bg-white text-black p-8 text-xs font-sans rounded-xl shadow-2xl print:shadow-none print:w-full print:p-0">
              
              {/* Top Banner */}
              <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">{layout.headerTitle}</h2>
                  {layout.tagline && <p className="text-xs text-gray-600 italic">{layout.tagline}</p>}
                  <p className="text-xs text-gray-600 mt-1">{settings.address}</p>
                  <p className="text-xs text-gray-600">
                    {layout.taxLicenseLabel || 'GSTIN'}: <strong>{settings.gstin}</strong> | Phone: {settings.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold uppercase text-gray-900 tracking-wider">TAX INVOICE</span>
                  <p className="font-mono text-sm font-bold text-[#0A0A0B] mt-0.5">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{orderDate}</p>
                  <p className="text-[11px] text-gray-600 font-semibold mt-1">Invoice Type: {order.orderType}</p>
                </div>
              </div>

              {/* Bill To & Details */}
              <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50/50">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Billed To (Customer):</div>
                  <div className="font-bold text-sm text-black">{order.customer?.name || 'Walk-in Customer'}</div>
                  {order.customer?.mobile && <div className="text-xs text-gray-600">Mobile: {order.customer.mobile}</div>}
                  {order.customer?.gstNumber && <div className="text-xs text-gray-600">Customer GSTIN: {order.customer.gstNumber}</div>}
                  {order.patientName && <div className="text-xs text-gray-600">Patient: <strong>{order.patientName}</strong></div>}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Payment & Fulfillment:</div>
                  <div className="font-semibold text-xs">Payment Method: <strong>{order.paymentMethod || 'CASH'}</strong></div>
                  <div className="text-xs text-gray-600">Status: <strong className="text-emerald-700">{order.status || 'PAID'}</strong></div>
                  {order.table && <div className="text-xs text-gray-600">Service Point: <strong>{order.table.name}</strong></div>}
                  {order.doctorName && <div className="text-xs text-gray-600">Prescribing Doctor: <strong>Dr. {order.doctorName}</strong></div>}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs mb-6 border border-gray-300">
                <thead className="bg-gray-100 uppercase text-[10px] font-bold border-b border-gray-300">
                  <tr>
                    <th className="p-2.5 border-r">#</th>
                    <th className="p-2.5 border-r">Item Description & Specifications</th>
                    <th className="p-2.5 border-r text-center">HSN</th>
                    <th className="p-2.5 text-center border-r">Qty</th>
                    <th className="p-2.5 text-right border-r">Rate (₹)</th>
                    <th className="p-2.5 text-center border-r">GST %</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2.5 border-r text-gray-500 text-center">{idx + 1}</td>
                      <td className="p-2.5 border-r font-semibold">
                        <div>{item.menuItem.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {item.menuItem.sku && <span>SKU: {item.menuItem.sku} </span>}
                          {item.menuItem.batchNumber && <span>| Batch: {item.menuItem.batchNumber} </span>}
                          {item.menuItem.expiryDate && <span>| Exp: {item.menuItem.expiryDate} </span>}
                          {item.menuItem.serialNumber && <span>| S/N: {item.menuItem.serialNumber} </span>}
                        </div>
                      </td>
                      <td className="p-2.5 border-r text-center font-mono text-gray-600">{item.menuItem.hsnCode || '2106'}</td>
                      <td className="p-2.5 border-r text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 border-r text-right font-mono">₹{item.price.toFixed(2)}</td>
                      <td className="p-2.5 border-r text-center font-mono">{item.menuItem.gst || 5}%</td>
                      <td className="p-2.5 text-right font-bold font-mono">₹{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Tax Split */}
              <div className="grid grid-cols-2 gap-4 border-t-2 border-black pt-4">
                <div className="space-y-2">
                  <div className="border border-gray-200 rounded p-2 text-[10px] font-mono bg-gray-50">
                    <div className="font-bold text-gray-700 mb-1">GST Tax Breakdown:</div>
                    <div className="flex justify-between"><span>CGST:</span><span>₹{cgst}</span></div>
                    <div className="flex justify-between"><span>SGST:</span><span>₹{sgst}</span></div>
                    <div className="flex justify-between font-bold border-t border-gray-300 pt-0.5 mt-0.5"><span>Total GST:</span><span>₹{order.tax.toFixed(2)}</span></div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 italic">{layout.termsText}</p>
                    <p className="text-xs font-bold text-black mt-1">{layout.thankYouNote}</p>
                  </div>
                </div>

                <div className="text-right space-y-1 font-mono">
                  <div className="flex justify-between text-xs"><span>Subtotal:</span><span>₹{order.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs"><span>Total Tax:</span><span>₹{order.tax.toFixed(2)}</span></div>
                  {order.discount ? <div className="flex justify-between text-xs text-emerald-700"><span>Discount:</span><span>-₹{order.discount.toFixed(2)}</span></div> : null}
                  <div className="flex justify-between text-base font-extrabold border-t-2 border-black pt-1 mt-1 text-black">
                    <span>GRAND TOTAL:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                  {order.paidAmount !== undefined && order.paidAmount < order.total && (
                    <>
                      <div className="flex justify-between text-xs text-[#2563EB] font-bold">
                        <span>Paid Amount ({order.splitPaidMethod || order.paymentMethod}):</span>
                        <span>₹{order.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-red-600 font-extrabold">
                        <span>Balance Amount Due:</span>
                        <span>₹{(order.balanceAmount ?? (order.total - order.paidAmount)).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="text-[10px] text-gray-500 pt-1">Amount in words: <em>{numberToWords(order.total)}</em></div>
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
