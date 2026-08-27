import React, { useState } from 'react';
import { 
  Bell, BellRing, Check, CheckCheck, Clock, AlertTriangle, 
  CheckCircle2, XCircle, LogIn, LogOut, Send, Filter, 
  Smartphone, Mail, MessageSquare, ShieldAlert, Sparkles, User
} from 'lucide-react';
import { 
  AttendanceNotification, 
  NotificationType 
} from '../../types/attendanceNotification';
import { AttendanceNotificationEngine } from '../../lib/notifications/attendanceNotificationEngine';
import { EmployeeEngine } from '../../lib/employees/employeeEngine';
import { cn } from '../../lib/utils';

export default function AttendanceNotificationStudio() {
  const [selectedEmpId, setSelectedEmpId] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const [employees] = useState(EmployeeEngine.getEmployees({ pageSize: 50 }).employees);
  const [notifications, setNotifications] = useState<AttendanceNotification[]>(
    AttendanceNotificationEngine.getNotifications('ALL')
  );

  const refreshFeed = () => {
    setNotifications(
      AttendanceNotificationEngine.getNotifications(
        selectedEmpId,
        {
          type: typeFilter,
          isRead: unreadOnly ? false : undefined,
        }
      )
    );
  };

  const handleMarkAsRead = (id: string) => {
    AttendanceNotificationEngine.markAsRead(id);
    refreshFeed();
  };

  const handleMarkAllAsRead = () => {
    AttendanceNotificationEngine.markAllAsRead(selectedEmpId);
    refreshFeed();
  };

  // 6 Simulation Triggers
  const handleSimulate = (type: NotificationType) => {
    const targetEmpId = selectedEmpId === 'ALL' ? 'emp-001' : selectedEmpId;
    const targetEmp = employees.find(e => e.id === targetEmpId) || employees[0];

    switch (type) {
      case 'LATE':
        AttendanceNotificationEngine.notifyLate(targetEmp.id, targetEmp.name, 'Morning Shift', 25);
        break;
      case 'ABSENT':
        AttendanceNotificationEngine.notifyAbsent(targetEmp.id, targetEmp.name);
        break;
      case 'LEAVE_APPROVED':
        AttendanceNotificationEngine.notifyLeaveApproved(targetEmp.id, targetEmp.name, 'Casual Leave', 'Aug 28 – Aug 29', 'Venkatesh Prabhu');
        break;
      case 'LEAVE_REJECTED':
        AttendanceNotificationEngine.notifyLeaveRejected(targetEmp.id, targetEmp.name, 'Earned Leave', 'Staffing constraints', 'Branch Manager');
        break;
      case 'MISSED_PUNCH_IN':
        AttendanceNotificationEngine.notifyMissedPunchIn(targetEmp.id, targetEmp.name, 'General Shift', '09:00 AM');
        break;
      case 'MISSED_PUNCH_OUT':
        AttendanceNotificationEngine.notifyMissedPunchOut(targetEmp.id, targetEmp.name, 'Morning Early Shift');
        break;
    }
    refreshFeed();
  };

  const unreadCount = AttendanceNotificationEngine.getUnreadCount(selectedEmpId);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <BellRing className="w-5 h-5 text-[#C5A059]" />
            Staff Attendance Notification & Alert Automation
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Automated alerts dispatched via In-App, SMS, Email, and WhatsApp for Late, Absent, Leaves, and Missed Punches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <select
              value={selectedEmpId}
              onChange={e => {
                setSelectedEmpId(e.target.value);
                setNotifications(AttendanceNotificationEngine.getNotifications(e.target.value));
              }}
              className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">All Staff Members</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleMarkAllAsRead}
            className="px-3 py-1.5 bg-[#0A0A0B] border border-[#2D2D30] hover:border-[#C5A059] text-gray-300 font-mono text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#C5A059]" />
            Mark All Read ({unreadCount})
          </button>
        </div>
      </div>

      {/* 6 NOTIFICATION SIMULATION DISPATCHERS */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-4 shadow-md space-y-2.5">
        <span className="text-[10px] font-mono text-gray-500 uppercase font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          Instant Notification Simulator (6 Required Triggers):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          
          {/* 1. Late */}
          <button
            onClick={() => handleSimulate('LATE')}
            className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Clock className="w-3.5 h-3.5" /> 1. Late Alert
          </button>

          {/* 2. Absent */}
          <button
            onClick={() => handleSimulate('ABSENT')}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> 2. Absent Alert
          </button>

          {/* 3. Leave Approved */}
          <button
            onClick={() => handleSimulate('LEAVE_APPROVED')}
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> 3. Leave Approved
          </button>

          {/* 4. Leave Rejected */}
          <button
            onClick={() => handleSimulate('LEAVE_REJECTED')}
            className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <XCircle className="w-3.5 h-3.5" /> 4. Leave Rejected
          </button>

          {/* 5. Missed Punch In */}
          <button
            onClick={() => handleSimulate('MISSED_PUNCH_IN')}
            className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" /> 5. Missed Punch In
          </button>

          {/* 6. Missed Punch Out */}
          <button
            onClick={() => handleSimulate('MISSED_PUNCH_OUT')}
            className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> 6. Missed Punch Out
          </button>

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'LATE', 'ABSENT', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'MISSED_PUNCH_IN', 'MISSED_PUNCH_OUT'].map(type => (
          <button
            key={type}
            onClick={() => {
              setTypeFilter(type);
              setNotifications(
                AttendanceNotificationEngine.getNotifications(
                  selectedEmpId,
                  { type, isRead: unreadOnly ? false : undefined }
                )
              );
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-mono transition-all border",
              typeFilter === type
                ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] font-bold shadow-md shadow-[#C5A059]/20"
                : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
            )}
          >
            {type.replace(/_/g, ' ')}
          </button>
        ))}

        <button
          onClick={() => {
            const next = !unreadOnly;
            setUnreadOnly(next);
            setNotifications(
              AttendanceNotificationEngine.getNotifications(
                selectedEmpId,
                { type: typeFilter, isRead: next ? false : undefined }
              )
            );
          }}
          className={cn(
            "ml-auto px-3 py-1.5 rounded-xl text-xs font-mono transition-all border flex items-center gap-1",
            unreadOnly
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Bell className="w-3.5 h-3.5" />
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* NOTIFICATION FEED STREAM */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 bg-[#131315] border border-[#1F1F21] rounded-2xl text-center text-gray-500 font-mono text-xs">
            No attendance notifications found for selected filters.
          </div>
        ) : (
          notifications.map(notif => {
            const isLate = notif.type === 'LATE';
            const isAbsent = notif.type === 'ABSENT';
            const isLeaveApp = notif.type === 'LEAVE_APPROVED';
            const isLeaveRej = notif.type === 'LEAVE_REJECTED';
            const isMissedIn = notif.type === 'MISSED_PUNCH_IN';
            const isMissedOut = notif.type === 'MISSED_PUNCH_OUT';

            return (
              <div
                key={notif.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden",
                  !notif.isRead ? "bg-[#161618] border-l-4" : "bg-[#131315] border-[#1F1F21] opacity-75",
                  isLate && "border-l-amber-500 border-amber-500/20",
                  isAbsent && "border-l-rose-500 border-rose-500/20",
                  isLeaveApp && "border-l-emerald-500 border-emerald-500/20",
                  isLeaveRej && "border-l-purple-500 border-purple-500/20",
                  isMissedIn && "border-l-cyan-500 border-cyan-500/20",
                  isMissedOut && "border-l-orange-500 border-orange-500/20"
                )}
              >
                {/* Left icon & content */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                    isLate && "bg-amber-500/10 text-amber-400",
                    isAbsent && "bg-rose-500/10 text-rose-400",
                    isLeaveApp && "bg-emerald-500/10 text-emerald-400",
                    isLeaveRej && "bg-purple-500/10 text-purple-400",
                    isMissedIn && "bg-cyan-500/10 text-cyan-400",
                    isMissedOut && "bg-orange-500/10 text-orange-400"
                  )}>
                    {isLate && <Clock className="w-5 h-5" />}
                    {isAbsent && <AlertTriangle className="w-5 h-5" />}
                    {isLeaveApp && <CheckCircle2 className="w-5 h-5" />}
                    {isLeaveRej && <XCircle className="w-5 h-5" />}
                    {isMissedIn && <LogIn className="w-5 h-5" />}
                    {isMissedOut && <LogOut className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white text-xs font-sans">{notif.title}</h4>
                      <span className="text-gray-400 text-[10px] font-mono">
                        to <strong>{notif.employeeName}</strong>
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase",
                        notif.priority === 'URGENT' ? "bg-rose-500/20 text-rose-400" :
                        notif.priority === 'HIGH' ? "bg-amber-500/20 text-amber-400" :
                        "bg-blue-500/20 text-blue-400"
                      )}>
                        {notif.priority}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300">{notif.message}</p>

                    {/* Delivery channels */}
                    <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-gray-500">
                      <span>Channels:</span>
                      {notif.channels.map(c => (
                        <span key={c} className="px-1.5 py-0.2 rounded bg-[#0A0A0B] text-gray-400 border border-[#2D2D30]">
                          {c}
                        </span>
                      ))}
                      <span className="text-gray-600 ml-2">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right action button */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!notif.isRead ? (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3 py-1.5 bg-[#0A0A0B] hover:bg-[#1F1F21] border border-[#2D2D30] text-gray-300 text-xs font-mono rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Mark Read
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-gray-500" /> Read
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
