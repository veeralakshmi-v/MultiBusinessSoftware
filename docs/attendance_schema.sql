-- ============================================================
-- FEATURE 19 – ATTENDANCE MODULE – SQL DDL REFERENCE
-- Dialect: SQLite (primary) / PostgreSQL (see notes)
-- 13 Tables for the Staff Attendance & HR Suite
-- All tables reference businessId and branchId for full
-- multi-tenancy support across every business and branch.
-- ============================================================

-- ── TABLE 1: Department ──────────────────────────────────────
CREATE TABLE "Department" (
  "id"          TEXT      NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"  TEXT      NOT NULL DEFAULT 'biz-default-business',
  "branchId"    TEXT,
  "name"        TEXT      NOT NULL,
  "code"        TEXT,
  "description" TEXT,
  "managerId"   TEXT,                       -- references Employee.id (kept loose to avoid circular FK)
  "isActive"    INTEGER   NOT NULL DEFAULT 1,
  "createdAt"   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   DATETIME  NOT NULL,
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE,
  FOREIGN KEY ("branchId")   REFERENCES "Branch"("id")
);

-- ── TABLE 2: Designation ─────────────────────────────────────
CREATE TABLE "Designation" (
  "id"           TEXT      NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"   TEXT      NOT NULL DEFAULT 'biz-default-business',
  "departmentId" TEXT,
  "title"        TEXT      NOT NULL,
  "grade"        TEXT,
  "salaryBand"   TEXT,
  "isActive"     INTEGER   NOT NULL DEFAULT 1,
  "createdAt"    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    DATETIME  NOT NULL,
  FOREIGN KEY ("businessId")   REFERENCES "Business"("id")    ON DELETE CASCADE,
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
);

-- ── TABLE 3: Employee ────────────────────────────────────────
-- Core HR record. Linked to Business, Branch, Department,
-- Designation and Shift. role controls attendance permissions
-- (ADMIN | HR | MANAGER | EMPLOYEE).
CREATE TABLE "Employee" (
  "id"               TEXT      NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"       TEXT      NOT NULL DEFAULT 'biz-default-business',
  "branchId"         TEXT,
  "departmentId"     TEXT,
  "designationId"    TEXT,
  "shiftId"          TEXT,
  "employeeCode"     TEXT      NOT NULL UNIQUE,
  "firstName"        TEXT      NOT NULL,
  "lastName"         TEXT      NOT NULL,
  "fullName"         TEXT      NOT NULL,
  "email"            TEXT,
  "phone"            TEXT,
  "gender"           TEXT      NOT NULL DEFAULT 'MALE',           -- MALE | FEMALE | OTHER
  "dateOfBirth"      DATETIME,
  "dateOfJoining"    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "employmentType"   TEXT      NOT NULL DEFAULT 'FULL_TIME',      -- FULL_TIME | PART_TIME | CONTRACT
  "status"           TEXT      NOT NULL DEFAULT 'ACTIVE',         -- ACTIVE | INACTIVE | TERMINATED | ON_LEAVE
  "role"             TEXT      NOT NULL DEFAULT 'EMPLOYEE',       -- ADMIN | HR | MANAGER | EMPLOYEE
  "profilePhoto"     TEXT,
  "address"          TEXT,
  "emergencyContact" TEXT,
  "bankAccount"      TEXT,
  "ifscCode"         TEXT,
  "panNumber"        TEXT,
  "aadharNumber"     TEXT,
  "pfNumber"         TEXT,
  "esiNumber"        TEXT,
  "baseSalary"       REAL      NOT NULL DEFAULT 0,
  "createdAt"        DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        DATETIME  NOT NULL,
  FOREIGN KEY ("businessId")    REFERENCES "Business"("id")    ON DELETE CASCADE,
  FOREIGN KEY ("branchId")      REFERENCES "Branch"("id"),
  FOREIGN KEY ("departmentId")  REFERENCES "Department"("id"),
  FOREIGN KEY ("designationId") REFERENCES "Designation"("id"),
  FOREIGN KEY ("shiftId")       REFERENCES "Shift"("id")
);

-- ── TABLE 4: Shift ───────────────────────────────────────────
-- Defines work timings, grace periods, and overtime thresholds.
CREATE TABLE "Shift" (
  "id"                    TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"            TEXT     NOT NULL DEFAULT 'biz-default-business',
  "branchId"              TEXT,
  "name"                  TEXT     NOT NULL,
  "code"                  TEXT,
  "startTime"             TEXT     NOT NULL,   -- "HH:MM" e.g. "08:00"
  "endTime"               TEXT     NOT NULL,   -- "HH:MM" e.g. "17:00"
  "gracePeriodMinutes"    INTEGER  NOT NULL DEFAULT 15,
  "breakDurationMins"     INTEGER  NOT NULL DEFAULT 60,
  "workingHours"          REAL     NOT NULL DEFAULT 8.0,
  "overtimeThresholdMins" INTEGER  NOT NULL DEFAULT 480,
  "isNightShift"          INTEGER  NOT NULL DEFAULT 0,
  "daysOfWeek"            TEXT     NOT NULL DEFAULT '1,2,3,4,5',   -- CSV: 0=Sun … 6=Sat
  "isActive"              INTEGER  NOT NULL DEFAULT 1,
  "createdAt"             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             DATETIME NOT NULL,
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE,
  FOREIGN KEY ("branchId")   REFERENCES "Branch"("id")
);

-- ── TABLE 5: OfficeLocation ──────────────────────────────────
-- GPS geofence anchors for punch-in validation.
CREATE TABLE "OfficeLocation" (
  "id"            TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"    TEXT     NOT NULL DEFAULT 'biz-default-business',
  "branchId"      TEXT,
  "officeName"    TEXT     NOT NULL,
  "address"       TEXT,
  "latitude"      REAL     NOT NULL,
  "longitude"     REAL     NOT NULL,
  "allowedRadius" REAL     NOT NULL DEFAULT 100,  -- metres
  "isActive"      INTEGER  NOT NULL DEFAULT 1,
  "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     DATETIME NOT NULL,
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE,
  FOREIGN KEY ("branchId")   REFERENCES "Branch"("id")
);

-- ── TABLE 6: Attendance ──────────────────────────────────────
-- One row per employee per calendar day. Stores punch times,
-- computed work minutes, and optional manual-edit metadata.
-- status: PRESENT | ABSENT | LATE | HALF_DAY | LEAVE | HOLIDAY | WEEKEND | WFH
CREATE TABLE "Attendance" (
  "id"                 TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"         TEXT     NOT NULL DEFAULT 'biz-default-business',
  "employeeId"         TEXT     NOT NULL,
  "shiftId"            TEXT,
  "attendanceDate"     DATETIME NOT NULL,
  "status"             TEXT     NOT NULL DEFAULT 'PRESENT',
  "punchInTime"        DATETIME,
  "punchOutTime"       DATETIME,
  "grossWorkMinutes"   INTEGER  NOT NULL DEFAULT 0,
  "breakMinutes"       INTEGER  NOT NULL DEFAULT 0,
  "netWorkMinutes"     INTEGER  NOT NULL DEFAULT 0,
  "overtimeMinutes"    INTEGER  NOT NULL DEFAULT 0,
  "lateMinutes"        INTEGER  NOT NULL DEFAULT 0,
  "earlyLeaveMinutes"  INTEGER  NOT NULL DEFAULT 0,
  "punchInLatitude"    REAL,
  "punchInLongitude"   REAL,
  "punchOutLatitude"   REAL,
  "punchOutLongitude"  REAL,
  "punchInDeviceInfo"  TEXT,   -- JSON: { browser, device, ip }
  "punchOutDeviceInfo" TEXT,
  "isManualEntry"      INTEGER  NOT NULL DEFAULT 0,
  "editedBy"           TEXT,
  "editReason"         TEXT,
  "notes"              TEXT,
  "createdAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          DATETIME NOT NULL,
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE,
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
  FOREIGN KEY ("shiftId")    REFERENCES "Shift"("id")
);

-- ── TABLE 7: AttendanceLocation ──────────────────────────────
-- Precise GPS capture per attendance record (1:1 with Attendance).
-- Also stores geofence check result, IP address, browser and device.
CREATE TABLE "AttendanceLocation" (
  "id"                 TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "attendanceId"       TEXT     NOT NULL UNIQUE,
  "officeLocationId"   TEXT,
  "punchInLat"         REAL     NOT NULL,
  "punchInLon"         REAL     NOT NULL,
  "punchInAccuracy"    REAL,
  "punchInAddress"     TEXT,
  "punchOutLat"        REAL,
  "punchOutLon"        REAL,
  "punchOutAccuracy"   REAL,
  "punchOutAddress"    TEXT,
  "distanceFromOfficeM" REAL,  -- distance in metres at time of punch-in
  "isWithinGeofence"   INTEGER  NOT NULL DEFAULT 1,
  "ipAddress"          TEXT,
  "deviceInfo"         TEXT,
  "browser"            TEXT,
  "createdAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          DATETIME NOT NULL,
  FOREIGN KEY ("attendanceId")     REFERENCES "Attendance"("id")      ON DELETE CASCADE,
  FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id")
);

-- ── TABLE 8: LeaveType ───────────────────────────────────────
-- Configures leave policies: CL, EL, SL, ML, etc.
CREATE TABLE "LeaveType" (
  "id"               TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"       TEXT     NOT NULL DEFAULT 'biz-default-business',
  "name"             TEXT     NOT NULL,
  "code"             TEXT     NOT NULL,   -- CL | EL | SL | ML | PL …
  "description"      TEXT,
  "annualQuota"      REAL     NOT NULL DEFAULT 0,  -- days per year
  "isCarryForward"   INTEGER  NOT NULL DEFAULT 0,
  "maxCarryDays"     INTEGER  NOT NULL DEFAULT 0,
  "isPaidLeave"      INTEGER  NOT NULL DEFAULT 1,
  "requiresApproval" INTEGER  NOT NULL DEFAULT 1,
  "noticeDaysReqd"   INTEGER  NOT NULL DEFAULT 0,
  "isActive"         INTEGER  NOT NULL DEFAULT 1,
  "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        DATETIME NOT NULL,
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE
);

-- ── TABLE 9: LeaveRequest ────────────────────────────────────
-- Employee leave applications with approval workflow.
-- status: PENDING | APPROVED | REJECTED | CANCELLED
CREATE TABLE "LeaveRequest" (
  "id"              TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"      TEXT     NOT NULL DEFAULT 'biz-default-business',
  "employeeId"      TEXT     NOT NULL,
  "leaveTypeId"     TEXT     NOT NULL,
  "startDate"       DATETIME NOT NULL,
  "endDate"         DATETIME NOT NULL,
  "totalDays"       REAL     NOT NULL,
  "isHalfDay"       INTEGER  NOT NULL DEFAULT 0,
  "halfDaySession"  TEXT,               -- MORNING | AFTERNOON
  "reason"          TEXT,
  "status"          TEXT     NOT NULL DEFAULT 'PENDING',
  "appliedAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy"      TEXT,
  "approvedAt"      DATETIME,
  "rejectionReason" TEXT,
  "attachmentUrl"   TEXT,
  "createdAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       DATETIME NOT NULL,
  FOREIGN KEY ("businessId")  REFERENCES "Business"("id")  ON DELETE CASCADE,
  FOREIGN KEY ("employeeId")  REFERENCES "Employee"("id")  ON DELETE CASCADE,
  FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id")
);

-- ── TABLE 10: Holiday ────────────────────────────────────────
-- National and company holidays per branch.
-- isRecurring = 1 means the same date repeats every calendar year.
CREATE TABLE "Holiday" (
  "id"          TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"  TEXT     NOT NULL DEFAULT 'biz-default-business',
  "branchId"    TEXT,
  "holidayName" TEXT     NOT NULL,
  "date"        TEXT     NOT NULL,   -- stored as "YYYY-MM-DD"
  "description" TEXT,
  "isRecurring" INTEGER  NOT NULL DEFAULT 0,
  "isActive"    INTEGER  NOT NULL DEFAULT 1,
  "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   DATETIME NOT NULL,
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE,
  FOREIGN KEY ("branchId")   REFERENCES "Branch"("id")
);

-- ── TABLE 11: BreakTime ──────────────────────────────────────
-- Records individual break sessions within an attendance day.
-- breakType: LUNCH | TEA | CUSTOM
CREATE TABLE "BreakTime" (
  "id"           TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "attendanceId" TEXT     NOT NULL,
  "employeeId"   TEXT     NOT NULL,
  "breakType"    TEXT     NOT NULL DEFAULT 'LUNCH',
  "label"        TEXT,
  "startTime"    DATETIME NOT NULL,
  "endTime"      DATETIME,
  "durationMins" INTEGER  NOT NULL DEFAULT 0,
  "isActive"     INTEGER  NOT NULL DEFAULT 1,
  "notes"        TEXT,
  "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    DATETIME NOT NULL,
  FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE,
  FOREIGN KEY ("employeeId")   REFERENCES "Employee"("id")   ON DELETE CASCADE
);

-- ── TABLE 12: AttendanceLog ──────────────────────────────────
-- Immutable audit trail. Every PUNCH_IN, PUNCH_OUT, BREAK_START,
-- BREAK_END, MANUAL_EDIT, OVERRIDE, LEAVE_APPLIED, LEAVE_APPROVED,
-- LEAVE_REJECTED event is appended here with before/after JSON snapshots.
CREATE TABLE "AttendanceLog" (
  "id"            TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"    TEXT     NOT NULL DEFAULT 'biz-default-business',
  "employeeId"    TEXT     NOT NULL,
  "eventType"     TEXT     NOT NULL,   -- see comment above
  "eventTime"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "latitude"      REAL,
  "longitude"     REAL,
  "accuracy"      REAL,
  "ipAddress"     TEXT,
  "deviceInfo"    TEXT,
  "browser"       TEXT,
  "performedBy"   TEXT,               -- userId or "SYSTEM"
  "previousValue" TEXT,               -- JSON snapshot before change
  "newValue"      TEXT,               -- JSON snapshot after change
  "notes"         TEXT,
  "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE,
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

-- ── TABLE 13: AttendanceSettings ────────────────────────────
-- One row per business. Controls geofence, overtime, alerts
-- and week-off configuration for the entire attendance module.
CREATE TABLE "AttendanceSettings" (
  "id"                      TEXT     NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "businessId"              TEXT     NOT NULL UNIQUE DEFAULT 'biz-default-business',
  "enableGeofence"          INTEGER  NOT NULL DEFAULT 1,
  "defaultGeofenceRadiusM"  INTEGER  NOT NULL DEFAULT 100,
  "allowSelfieOnPunch"      INTEGER  NOT NULL DEFAULT 0,
  "allowWfhPunch"           INTEGER  NOT NULL DEFAULT 1,
  "enableOvertime"          INTEGER  NOT NULL DEFAULT 1,
  "overtimeMultiplier"      REAL     NOT NULL DEFAULT 1.5,
  "enableAutoAbsentMark"    INTEGER  NOT NULL DEFAULT 1,
  "autoAbsentAfterMins"     INTEGER  NOT NULL DEFAULT 60,
  "enableMissedPunchAlert"  INTEGER  NOT NULL DEFAULT 1,
  "missedPunchAlertMins"    INTEGER  NOT NULL DEFAULT 30,
  "enableLateAlert"         INTEGER  NOT NULL DEFAULT 1,
  "enableAbsentAlert"       INTEGER  NOT NULL DEFAULT 1,
  "enableLeaveNotification" INTEGER  NOT NULL DEFAULT 1,
  "weekOffDays"             TEXT     NOT NULL DEFAULT '0,6',  -- CSV: 0=Sun, 6=Sat
  "workingHoursPerDay"      REAL     NOT NULL DEFAULT 8.0,
  "gracePeriodMins"         INTEGER  NOT NULL DEFAULT 15,
  "updatedAt"               DATETIME NOT NULL,
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE
);

-- ============================================================
-- INDEXES for performance on high-frequency queries
-- ============================================================
CREATE INDEX IF NOT EXISTS "idx_attendance_employee_date"
  ON "Attendance"("employeeId", "attendanceDate");
CREATE INDEX IF NOT EXISTS "idx_attendance_business_date"
  ON "Attendance"("businessId", "attendanceDate");
CREATE INDEX IF NOT EXISTS "idx_attendance_status"
  ON "Attendance"("status");
CREATE INDEX IF NOT EXISTS "idx_leave_request_status"
  ON "LeaveRequest"("employeeId", "status");
CREATE INDEX IF NOT EXISTS "idx_attendance_log_employee"
  ON "AttendanceLog"("employeeId", "eventTime");
CREATE INDEX IF NOT EXISTS "idx_break_time_attendance"
  ON "BreakTime"("attendanceId");
CREATE INDEX IF NOT EXISTS "idx_employee_business_status"
  ON "Employee"("businessId", "status");
CREATE INDEX IF NOT EXISTS "idx_holiday_business_date"
  ON "Holiday"("businessId", "date");
