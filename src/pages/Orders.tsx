import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, CheckCircle, Utensils, XCircle, Search, Timer, Printer, Sparkles, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { io } from 'socket.io-client';
import PrintInvoiceModal, { OrderPrintData } from '../components/PrintInvoiceModal';
import { useAuth } from '../context/AuthContext';
import { WorkflowEngine } from '../lib/workflows/workflowEngine';

interface OrderItem {
  id: string;
  menuItem: { name: string; hsnCode?: string | null; gst?: number; kitchenSection?: string | null };
  quantity: number;
  price?: number;
  discount?: number;
  notes: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  paymentMethod?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  tableId: string | null;
  table: { name: string } | null;
  customerNotes: string | null;
  kitchenNotes: string | null;
  estimatedPrepTime: number | null;
  items: OrderItem[];
  createdAt: string;
}

const playSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1100, ctx.currentTime);
      osc2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.15);
    }, 150);
  } catch (e) {}
};

const LiveTimer = ({ startTime, estimatedPrepTime }: { startTime: string, estimatedPrepTime: number | null }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const update = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isLate = estimatedPrepTime && mins >= estimatedPrepTime;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-bold", isLate ? "text-red-400" : "text-gray-400")}>
      <Timer className="w-3.5 h-3.5" />
      <span>{mins}:{secs.toString().padStart(2, '0')}</span>
    </div>
  );
};

export default function Orders() {
  const { activeTemplate, user, businessType } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('ALL');

  const [activePrintOrder, setActivePrintOrder] = useState<OrderPrintData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const pipeline = WorkflowEngine.getStatusPipeline(activeTemplate);

  const fetchOrders = () => {
    fetch('/api/orders' + (filter !== 'ALL' ? '?status=' + filter : ''))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
  }, [filter, businessType]);

  useEffect(() => {
    const socket = io();

    socket.on('newOrder', (order: Order) => {
      playSound();
      setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
    });

    socket.on('orderUpdate', (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const handleOpenPrint = (order: Order) => {
    const printData: OrderPrintData = {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      createdAt: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod || 'CASH',
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      total: order.total || 0,
      table: order.table,
      customerNotes: order.customerNotes,
      kitchenNotes: order.kitchenNotes,
      estimatedPrepTime: order.estimatedPrepTime,
      items: order.items.map(i => ({
        quantity: i.quantity,
        price: i.price || 0,
        discount: i.discount || 0,
        notes: i.notes,
        menuItem: {
          name: i.menuItem.name,
          hsnCode: i.menuItem.hsnCode,
          gst: i.menuItem.gst,
          kitchenSection: i.menuItem.kitchenSection
        }
      }))
    };
    setActivePrintOrder(printData);
    setIsPrintModalOpen(true);
  };

  const activeOrders = orders.filter(o => {
    if (filter !== 'ALL') return o.status === filter;
    return o.status !== 'COMPLETED' && o.status !== 'CANCELLED';
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-lg shadow-gray-200/50">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#2563EB]" />
            {activeTemplate.terms?.fulfillmentNoun || 'Workflow & Orders Pipeline'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeTemplate.name} live order tracking and status transitions
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('ALL')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              filter === 'ALL' ? "bg-[#2563EB] text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Active ({orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length})
          </button>

          {pipeline.map(step => (
            <button
              key={step.code}
              onClick={() => setFilter(step.code)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                filter === step.code ? "bg-[#2563EB] text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeOrders.map(order => {
          const step = WorkflowEngine.getStep(order.status, activeTemplate) || {
            code: order.status,
            label: order.status,
            color: 'orange' as const,
            nextAllowedStatuses: []
          };
          const badgeStyle = WorkflowEngine.getStatusBadgeStyles(step.color);
          const nextSteps = WorkflowEngine.getNextSteps(order.status, user?.role || 'ADMIN', activeTemplate);
          const progress = WorkflowEngine.getStepProgress(order.status, activeTemplate);

          return (
            <div key={order.id} className="bg-white/90 border border-gray-100 rounded-2xl overflow-hidden shadow-md shadow-gray-100/50 flex flex-col shadow-xl">
              
              <div className={cn("p-4 border-b flex justify-between items-center", badgeStyle.border, badgeStyle.bg)}>
                <div className="flex items-center gap-2">
                  <span className={cn("font-bold text-xs uppercase tracking-wider", badgeStyle.text)}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Step {progress.currentStepIndex}/{progress.totalSteps}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <LiveTimer startTime={order.createdAt} estimatedPrepTime={order.estimatedPrepTime} />
                  <div className="text-gray-400 text-xs font-bold font-mono">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-mono">{order.orderNumber}</h3>
                    <div className="text-xs text-[#2563EB] font-bold">
                      {order.orderType.replace('_', ' ')} {order.table ? `• ${order.table.name}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPrint(order)}
                      className="p-2 bg-gray-50 hover:bg-gray-100 text-[#2563EB] rounded-xl border border-gray-200 transition-colors"
                      title="Print Invoice / KOT"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {order.estimatedPrepTime && (
                      <div className="bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono">
                        {order.estimatedPrepTime}m
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Items Ordered</div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {order.items.map(item => (
                      <div key={item.id} className="bg-[#F8FAFC] p-2.5 rounded-xl border border-gray-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-900 font-bold">{item.quantity}x {item.menuItem.name}</span>
                        </div>
                        {item.notes && <div className="text-[10px] text-orange-400 mt-1 pl-2 border-l border-orange-500/30">» {item.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {(order.customerNotes || order.kitchenNotes) && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-200 text-xs">
                    {order.customerNotes && (
                      <div><span className="text-gray-500">Customer:</span> <span className="text-gray-600">{order.customerNotes}</span></div>
                    )}
                    {order.kitchenNotes && (
                      <div><span className="text-gray-500">Notes:</span> <span className="text-orange-400">{order.kitchenNotes}</span></div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-200 bg-[#F8FAFC] flex flex-wrap gap-2">
                {nextSteps.map(nextStep => {
                  const btnStyles = WorkflowEngine.getStatusBadgeStyles(nextStep.color);
                  return (
                    <button
                      key={nextStep.code}
                      onClick={() => updateStatus(order.id, nextStep.code)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all border flex items-center justify-center gap-1.5",
                        btnStyles.bg,
                        btnStyles.text,
                        btnStyles.border,
                        "hover:opacity-90 shadow-sm"
                      )}
                    >
                      {nextStep.label}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => updateStatus(order.id, 'CANCELLED')}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Cancel Order"
                >
                  <XCircle className="w-4 h-4"/>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {activeOrders.length === 0 && (
        <div className="py-20 text-center bg-white border border-gray-200 rounded-2xl">
          <ChefHat className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-gray-400">No Active Orders</h3>
          <p className="text-xs text-gray-600 mt-1">All orders in this stage have been fulfilled and processed.</p>
        </div>
      )}

      {/* Print Invoice Modal */}
      <PrintInvoiceModal
        order={activePrintOrder}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}

