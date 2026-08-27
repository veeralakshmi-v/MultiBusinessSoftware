import React, { useState } from 'react';
import { 
  Shield, Lock, Unlock, CheckCircle2, XCircle, 
  UserCheck, AlertTriangle, Key, Users, Eye, 
  Edit3, Play, Clock, LogIn, LogOut, Coffee, Calendar, MapPin
} from 'lucide-react';
import { 
  AttendanceRole, 
  AttendanceAction, 
  AttendancePermissionMatrix 
} from '../../types/attendancePermissions';
import { AttendancePermissionEngine } from '../../lib/auth/attendancePermissionEngine';
import { cn } from '../../lib/utils';

export default function AttendancePermissionsStudio() {
  const [selectedRole, setSelectedRole] = useState<AttendanceRole>('EMPLOYEE');
  const [testAction, setTestAction] = useState<AttendanceAction>('EDIT_ATTENDANCE');
  const [testResult, setTestResult] = useState(
    AttendancePermissionEngine.validateAction('EMPLOYEE', 'EDIT_ATTENDANCE')
  );

  const matrices = AttendancePermissionEngine.getAllRoleMatrices();

  const handleTest = (role: AttendanceRole, action: AttendanceAction) => {
    setSelectedRole(role);
    setTestAction(action);
    setTestResult(AttendancePermissionEngine.validateAction(role, action));
  };

  const actionList: { action: AttendanceAction; title: string; category: string }[] = [
    { action: 'PUNCH_IN', title: 'Punch In (GPS / Web)', category: 'Self-Service' },
    { action: 'PUNCH_OUT', title: 'Punch Out (Worked Hours)', category: 'Self-Service' },
    { action: 'START_BREAK', title: 'Start Lunch / Tea Break', category: 'Self-Service' },
    { action: 'END_BREAK', title: 'End Active Break', category: 'Self-Service' },
    { action: 'VIEW_OWN_ATTENDANCE', title: 'View Own Attendance Logs', category: 'Self-Service' },
    { action: 'APPLY_LEAVE', title: 'Apply For Leave', category: 'Self-Service' },
    { action: 'CANCEL_OWN_LEAVE', title: 'Cancel Own Pending Leave', category: 'Self-Service' },
    { action: 'VIEW_TEAM_ATTENDANCE', title: 'View Team Attendance Stream', category: 'Supervision' },
    { action: 'APPROVE_LEAVE', title: 'Approve Leave Applications', category: 'Supervision' },
    { action: 'REJECT_LEAVE', title: 'Reject Leave Applications', category: 'Supervision' },
    { action: 'FORWARD_LEAVE', title: 'Forward Leave Application', category: 'Supervision' },
    { action: 'EDIT_ATTENDANCE', title: 'Edit Attendance Records (Admin/HR Only)', category: 'Governance' },
    { action: 'OVERRIDE_GEOFENCE', title: 'Override Geofence Restriction', category: 'Governance' },
    { action: 'HR_OVERRIDE_LEAVE', title: 'Administrative Leave Override', category: 'Governance' },
    { action: 'MANAGE_SHIFTS', title: 'Manage Shifts & Grace Times', category: 'Administration' },
    { action: 'MANAGE_HOLIDAYS', title: 'Configure Holiday Calendar', category: 'Administration' },
    { action: 'MANAGE_OFFICES', title: 'Configure Office Geofence Points', category: 'Administration' },
    { action: 'EXPORT_REPORTS', title: 'Export Excel / CSV / PDF Reports', category: 'Reports' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C5A059]" />
            Role-Based Attendance Access Control & Security Matrix
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Strict role governance across Admin, HR, Manager, and Employee tiers with attendance modification locks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-400">Security Policy:</span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Only Admin & HR Edit
          </span>
        </div>
      </div>

      {/* 4 ROLE PROFILE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {matrices.map(m => {
          const isSelected = selectedRole === m.role;
          return (
            <div
              key={m.role}
              onClick={() => handleTest(m.role, testAction)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-md",
                isSelected 
                  ? "bg-[#161618] border-[#C5A059] ring-2 ring-[#C5A059]/40 shadow-[#C5A059]/10" 
                  : "bg-[#131315] border-[#1F1F21] hover:border-gray-700"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase", m.badgeColor)}>
                  {m.role}
                </span>
                {m.canEditAttendance ? (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Can Edit
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read Only
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-white text-xs">{m.roleTitle}</h4>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{m.description}</p>
              </div>

              <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1F1F21] flex items-center justify-between">
                <span>Allowed Actions</span>
                <strong className="text-white">{m.allowedActions.length} Permitted</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE PERMISSION VALIDATION SIMULATOR */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1F21] pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#C5A059]" />
              Live Permission Enforcement Tester
            </h4>
            <p className="text-xs text-gray-400">
              Simulate role-based authorization checks for any attendance operation in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRole}
              onChange={e => handleTest(e.target.value as AttendanceRole, testAction)}
              className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-[#C5A059] outline-none"
            >
              <option value="ADMIN">Role: ADMIN</option>
              <option value="HR">Role: HR</option>
              <option value="MANAGER">Role: MANAGER</option>
              <option value="EMPLOYEE">Role: EMPLOYEE</option>
            </select>

            <select
              value={testAction}
              onChange={e => handleTest(selectedRole, e.target.value as AttendanceAction)}
              className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-[#C5A059] outline-none"
            >
              {actionList.map(a => (
                <option key={a.action} value={a.action}>{a.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Evaluation Output Box */}
        <div className={cn(
          "p-4 rounded-2xl border transition-all flex items-start gap-3",
          testResult.allowed 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        )}>
          {testResult.allowed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <strong className="font-mono text-xs uppercase tracking-wider">
                {testResult.allowed ? 'PERMISSION GRANTED' : 'PERMISSION DENIED'}
              </strong>
              <span className="text-[11px] opacity-80">
                [ Role: {testResult.role} • Action: {testResult.action} ]
              </span>
            </div>

            <p className="text-xs">
              {testResult.allowed
                ? `The ${testResult.role} tier is fully authorized to execute "${testResult.action}".`
                : testResult.reason}
            </p>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE PERMISSIONS MATRIX TABLE */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C5A059]" />
            Complete Attendance Authorization Matrix
          </h4>
          <p className="text-xs text-gray-400">
            Cross-functional capability matrix enforcing strict self-service vs supervisory privileges.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                <th className="py-3 px-4">Attendance Operation / Privilege</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">HR</th>
                <th className="py-3 px-4 text-center">Manager</th>
                <th className="py-3 px-4 text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {actionList.map(item => {
                const isAdmin = AttendancePermissionEngine.hasPermission('ADMIN', item.action);
                const isHR = AttendancePermissionEngine.hasPermission('HR', item.action);
                const isManager = AttendancePermissionEngine.hasPermission('MANAGER', item.action);
                const isEmployee = AttendancePermissionEngine.hasPermission('EMPLOYEE', item.action);
                const isHighlight = item.action === 'EDIT_ATTENDANCE';

                return (
                  <tr 
                    key={item.action} 
                    className={cn(
                      "hover:bg-[#161618] transition-colors",
                      isHighlight && "bg-[#C5A059]/5 font-bold"
                    )}
                  >
                    <td className="py-3 px-4 font-sans text-white flex items-center gap-2">
                      {isHighlight && <Lock className="w-3.5 h-3.5 text-[#C5A059]" />}
                      {item.title}
                    </td>

                    <td className="py-3 px-4 text-gray-400 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-[#0A0A0B] border border-[#2D2D30]">
                        {item.category}
                      </span>
                    </td>

                    {/* Admin */}
                    <td className="py-3 px-4 text-center">
                      {isAdmin ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500/60 mx-auto" />
                      )}
                    </td>

                    {/* HR */}
                    <td className="py-3 px-4 text-center">
                      {isHR ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500/60 mx-auto" />
                      )}
                    </td>

                    {/* Manager */}
                    <td className="py-3 px-4 text-center">
                      {isManager ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500/60 mx-auto" />
                      )}
                    </td>

                    {/* Employee */}
                    <td className="py-3 px-4 text-center">
                      {isEmployee ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500/60 mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
