import {
  School,
  AcademicYear,
  ClassItem,
  SectionItem,
  User,
  MdmEntry,
  Enrolment,
  Holiday,
  AuditLog,
  DailySchoolSummary,
  DailyClassSummary,
  MonthlyRowSummary,
} from '../types';
import { computeTotals, combineCounts, isSunday, isFutureDate, isEntryPastOneDayLock, getTodayDateStr } from './calculations';

const STORAGE_KEYS = {
  SCHOOL: 'mdm_school',
  ACADEMIC_YEAR: 'mdm_academic_year',
  CLASSES: 'mdm_classes',
  SECTIONS: 'mdm_sections',
  USERS: 'mdm_users',
  CURRENT_USER: 'mdm_current_user',
  ENTRIES: 'mdm_entries',
  ENROLMENT: 'mdm_enrolment',
  HOLIDAYS: 'mdm_holidays',
  AUDIT_LOGS: 'mdm_audit_logs',
  SUPABASE_CONFIG: 'mdm_supabase_config',
};

// Seed Data
export const SEED_SCHOOL: School = {
  id: 'school-1',
  name: 'Zilla Parishad High School (ZPHS)',
  code: '28190501204',
  address: 'Main Road, Educational Zone, District Center',
  district: 'Visakhapatnam',
  state: 'Andhra Pradesh',
};

export const SEED_ACADEMIC_YEAR: AcademicYear = {
  id: 'ay-2026-27',
  school_id: 'school-1',
  name: '2026-2027',
  start_date: '2026-06-12',
  end_date: '2027-04-23',
  is_current: true,
};

export const SEED_CLASSES: ClassItem[] = [
  { id: 'class-6', school_id: 'school-1', number: 6, group_code: 'G1' },
  { id: 'class-7', school_id: 'school-1', number: 7, group_code: 'G1' },
  { id: 'class-8', school_id: 'school-1', number: 8, group_code: 'G1' },
  { id: 'class-9', school_id: 'school-1', number: 9, group_code: 'G2' },
  { id: 'class-10', school_id: 'school-1', number: 10, group_code: 'G2' },
];

export const SEED_SECTIONS: SectionItem[] = [
  { id: 'sec-6A', class_id: 'class-6', class_number: 6, name: 'A', display_name: 'Class 6 - A' },
  { id: 'sec-6B', class_id: 'class-6', class_number: 6, name: 'B', display_name: 'Class 6 - B' },
  { id: 'sec-7A', class_id: 'class-7', class_number: 7, name: 'A', display_name: 'Class 7 - A' },
  { id: 'sec-7B', class_id: 'class-7', class_number: 7, name: 'B', display_name: 'Class 7 - B' },
  { id: 'sec-8A', class_id: 'class-8', class_number: 8, name: 'A', display_name: 'Class 8 - A' },
  { id: 'sec-8B', class_id: 'class-8', class_number: 8, name: 'B', display_name: 'Class 8 - B' },
  { id: 'sec-9A', class_id: 'class-9', class_number: 9, name: 'A', display_name: 'Class 9 - A' },
  { id: 'sec-9B', class_id: 'class-9', class_number: 9, name: 'B', display_name: 'Class 9 - B' },
  { id: 'sec-10A', class_id: 'class-10', class_number: 10, name: 'A', display_name: 'Class 10 - A' },
  { id: 'sec-10B', class_id: 'class-10', class_number: 10, name: 'B', display_name: 'Class 10 - B' },
];

export const SEED_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Headmaster / Admin',
    phone_or_email: 'admin',
    role: 'headmaster',
    school_id: 'school-1',
    pin: '1234',
  },
];

export const SEED_ENROLMENT: Enrolment[] = [
  {
    id: 'enr-6A',
    section_id: 'sec-6A',
    class_number: 6,
    section_name: 'A',
    academic_year_id: 'ay-2026-27',
    sc_boys: 5, sc_girls: 6,
    st_boys: 4, st_girls: 3,
    bc_boys: 12, bc_girls: 10,
    oc_boys: 4, oc_girls: 5,
    totals: computeTotals({ sc_boys: 5, sc_girls: 6, st_boys: 4, st_girls: 3, bc_boys: 12, bc_girls: 10, oc_boys: 4, oc_girls: 5 }),
  },
  {
    id: 'enr-6B',
    section_id: 'sec-6B',
    class_number: 6,
    section_name: 'B',
    academic_year_id: 'ay-2026-27',
    sc_boys: 6, sc_girls: 5,
    st_boys: 3, st_girls: 4,
    bc_boys: 11, bc_girls: 12,
    oc_boys: 5, oc_girls: 4,
    totals: computeTotals({ sc_boys: 6, sc_girls: 5, st_boys: 3, st_girls: 4, bc_boys: 11, bc_girls: 12, oc_boys: 5, oc_girls: 4 }),
  },
  {
    id: 'enr-7A',
    section_id: 'sec-7A',
    class_number: 7,
    section_name: 'A',
    academic_year_id: 'ay-2026-27',
    sc_boys: 5, sc_girls: 5,
    st_boys: 4, st_girls: 4,
    bc_boys: 14, bc_girls: 12,
    oc_boys: 5, oc_girls: 5,
    totals: computeTotals({ sc_boys: 5, sc_girls: 5, st_boys: 4, st_girls: 4, bc_boys: 14, bc_girls: 12, oc_boys: 5, oc_girls: 5 }),
  },
  {
    id: 'enr-7B',
    section_id: 'sec-7B',
    class_number: 7,
    section_name: 'B',
    academic_year_id: 'ay-2026-27',
    sc_boys: 6, sc_girls: 6,
    st_boys: 3, st_girls: 3,
    bc_boys: 13, bc_girls: 13,
    oc_boys: 4, oc_girls: 4,
    totals: computeTotals({ sc_boys: 6, sc_girls: 6, st_boys: 3, st_girls: 3, bc_boys: 13, bc_girls: 13, oc_boys: 4, oc_girls: 4 }),
  },
  {
    id: 'enr-8A',
    section_id: 'sec-8A',
    class_number: 8,
    section_name: 'A',
    academic_year_id: 'ay-2026-27',
    sc_boys: 7, sc_girls: 5,
    st_boys: 4, st_girls: 4,
    bc_boys: 15, bc_girls: 14,
    oc_boys: 6, oc_girls: 4,
    totals: computeTotals({ sc_boys: 7, sc_girls: 5, st_boys: 4, st_girls: 4, bc_boys: 15, bc_girls: 14, oc_boys: 6, oc_girls: 4 }),
  },
  {
    id: 'enr-8B',
    section_id: 'sec-8B',
    class_number: 8,
    section_name: 'B',
    academic_year_id: 'ay-2026-27',
    sc_boys: 5, sc_girls: 6,
    st_boys: 5, st_girls: 3,
    bc_boys: 14, bc_girls: 15,
    oc_boys: 5, oc_girls: 5,
    totals: computeTotals({ sc_boys: 5, sc_girls: 6, st_boys: 5, st_girls: 3, bc_boys: 14, bc_girls: 15, oc_boys: 5, oc_girls: 5 }),
  },
  {
    id: 'enr-9A',
    section_id: 'sec-9A',
    class_number: 9,
    section_name: 'A',
    academic_year_id: 'ay-2026-27',
    sc_boys: 6, sc_girls: 6,
    st_boys: 3, st_girls: 4,
    bc_boys: 16, bc_girls: 14,
    oc_boys: 6, oc_girls: 6,
    totals: computeTotals({ sc_boys: 6, sc_girls: 6, st_boys: 3, st_girls: 4, bc_boys: 16, bc_girls: 14, oc_boys: 6, oc_girls: 6 }),
  },
  {
    id: 'enr-9B',
    section_id: 'sec-9B',
    class_number: 9,
    section_name: 'B',
    academic_year_id: 'ay-2026-27',
    sc_boys: 7, sc_girls: 5,
    st_boys: 4, st_girls: 3,
    bc_boys: 15, bc_girls: 15,
    oc_boys: 5, oc_girls: 5,
    totals: computeTotals({ sc_boys: 7, sc_girls: 5, st_boys: 4, st_girls: 3, bc_boys: 15, bc_girls: 15, oc_boys: 5, oc_girls: 5 }),
  },
  {
    id: 'enr-10A',
    section_id: 'sec-10A',
    class_number: 10,
    section_name: 'A',
    academic_year_id: 'ay-2026-27',
    sc_boys: 6, sc_girls: 7,
    st_boys: 4, st_girls: 4,
    bc_boys: 17, bc_girls: 15,
    oc_boys: 6, oc_girls: 5,
    totals: computeTotals({ sc_boys: 6, sc_girls: 7, st_boys: 4, st_girls: 4, bc_boys: 17, bc_girls: 15, oc_boys: 6, oc_girls: 5 }),
  },
  {
    id: 'enr-10B',
    section_id: 'sec-10B',
    class_number: 10,
    section_name: 'B',
    academic_year_id: 'ay-2026-27',
    sc_boys: 6, sc_girls: 6,
    st_boys: 5, st_girls: 4,
    bc_boys: 16, bc_girls: 16,
    oc_boys: 5, oc_girls: 6,
    totals: computeTotals({ sc_boys: 6, sc_girls: 6, st_boys: 5, st_girls: 4, bc_boys: 16, bc_girls: 16, oc_boys: 5, oc_girls: 6 }),
  },
];

export const SEED_HOLIDAYS: Holiday[] = [
  { id: 'hol-1', school_id: 'school-1', date: '2026-08-15', reason: 'Independence Day' },
  { id: 'hol-2', school_id: 'school-1', date: '2026-09-05', reason: 'Teachers Day & Local Holiday' },
  { id: 'hol-3', school_id: 'school-1', date: '2026-10-02', reason: 'Gandhi Jayanti' },
  { id: 'hol-4', school_id: 'school-1', date: '2026-10-20', reason: 'Dussehra / Vijayadashami' },
  { id: 'hol-5', school_id: 'school-1', date: '2026-11-08', reason: 'Diwali Festival' },
  { id: 'hol-6', school_id: 'school-1', date: '2027-01-14', reason: 'Sankranti / Pongal' },
  { id: 'hol-7', school_id: 'school-1', date: '2027-01-26', reason: 'Republic Day' },
];

// Helper to generate seed entries for yesterday and today
function generateSampleEntries(): MdmEntry[] {
  const today = getTodayDateStr();
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split('T')[0];

  const entries: MdmEntry[] = [];

  // Yesterday completed for all 10 sections
  SEED_SECTIONS.forEach((sec, idx) => {
    const counts = {
      sc_boys: 4 + (idx % 3),
      sc_girls: 5 + (idx % 2),
      st_boys: 3 + (idx % 2),
      st_girls: 3 + (idx % 3),
      bc_boys: 11 + (idx % 4),
      bc_girls: 10 + (idx % 3),
      oc_boys: 4 + (idx % 2),
      oc_girls: 4 + (idx % 2),
    };
    entries.push({
      id: `entry-${yesterday}-${sec.id}`,
      section_id: sec.id,
      class_number: sec.class_number,
      section_name: sec.name,
      entry_date: yesterday,
      remarks: '',
      locked: false,
      created_by: 'user-admin',
      created_by_name: 'Headmaster / Admin',
      updated_by: 'user-admin',
      updated_by_name: 'Headmaster / Admin',
      created_at: `${yesterday}T13:30:00Z`,
      updated_at: `${yesterday}T13:30:00Z`,
      ...counts,
      totals: computeTotals(counts),
    });
  });

  // Today: Enter first 6 sections so 4 are pending to demo the Completion Tracker!
  SEED_SECTIONS.slice(0, 6).forEach((sec, idx) => {
    const counts = {
      sc_boys: 5 + (idx % 2),
      sc_girls: 5 + (idx % 3),
      st_boys: 4,
      st_girls: 3,
      bc_boys: 12 + (idx % 3),
      bc_girls: 11 + (idx % 2),
      oc_boys: 4,
      oc_girls: 5,
    };
    entries.push({
      id: `entry-${today}-${sec.id}`,
      section_id: sec.id,
      class_number: sec.class_number,
      section_name: sec.name,
      entry_date: today,
      remarks: '',
      locked: false,
      created_by: 'user-admin',
      created_by_name: 'Headmaster / Admin',
      updated_by: 'user-admin',
      updated_by_name: 'Headmaster / Admin',
      created_at: `${today}T13:15:00Z`,
      updated_at: `${today}T13:15:00Z`,
      ...counts,
      totals: computeTotals(counts),
    });
  });

  return entries;
}

export class StorageService {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Failed to load ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key} to storage:`, e);
    }
  }

  public static initialize(): void {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.SCHOOL)) {
        this.set(STORAGE_KEYS.SCHOOL, SEED_SCHOOL);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEAR)) {
        this.set(STORAGE_KEYS.ACADEMIC_YEAR, SEED_ACADEMIC_YEAR);
      }
      if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
        this.set(STORAGE_KEYS.CLASSES, SEED_CLASSES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.SECTIONS)) {
        this.set(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
      }
      // Clean up any old mock users from previous storage
      const existingUsers = this.get<User[]>(STORAGE_KEYS.USERS, []);
      if (Array.isArray(existingUsers) && existingUsers.some(u => u?.name?.includes('Lakshmi Devi') || u?.name?.includes('Rama Rao') || u?.name?.includes('Suresh Kumar'))) {
        this.set(STORAGE_KEYS.USERS, SEED_USERS);
        this.set(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
      } else if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        this.set(STORAGE_KEYS.USERS, SEED_USERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ENROLMENT)) {
        this.set(STORAGE_KEYS.ENROLMENT, SEED_ENROLMENT);
      }
      if (!localStorage.getItem(STORAGE_KEYS.HOLIDAYS)) {
        this.set(STORAGE_KEYS.HOLIDAYS, SEED_HOLIDAYS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ENTRIES)) {
        this.set(STORAGE_KEYS.ENTRIES, generateSampleEntries());
      } else {
        // Clean up any legacy menu/remarks (e.g. 'Egg Curry & Rice served') from stored entries
        const existingEntries = this.get<MdmEntry[]>(STORAGE_KEYS.ENTRIES, []);
        if (Array.isArray(existingEntries)) {
          let modified = false;
          for (const e of existingEntries) {
            if (e && e.remarks) {
              e.remarks = '';
              modified = true;
            }
          }
          if (modified) {
            this.set(STORAGE_KEYS.ENTRIES, existingEntries);
          }
        }
      }
      if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
        const sampleLogs: AuditLog[] = [
          {
            id: 'log-1',
            entity: 'mdm_entries',
            entity_id: 'seed-init',
            action: 'CREATE',
            old_json: null,
            new_json: { status: 'System Initialized' },
            user_id: 'user-admin',
            user_name: 'Headmaster / Admin',
            timestamp: new Date().toISOString(),
          },
        ];
        this.set(STORAGE_KEYS.AUDIT_LOGS, sampleLogs);
      }
      // Default current user to Headmaster if not set
      if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        this.set(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
      }
    } catch (e) {
      console.error('StorageService initialize failed:', e);
    }
  }

  // School & Metadata
  public static getSchool(): School {
    const s = this.get<School>(STORAGE_KEYS.SCHOOL, SEED_SCHOOL);
    if (!s || !s.name) {
      this.set(STORAGE_KEYS.SCHOOL, SEED_SCHOOL);
      return SEED_SCHOOL;
    }
    return s;
  }

  public static updateSchool(school: School): void {
    this.set(STORAGE_KEYS.SCHOOL, school);
  }

  public static getAcademicYear(): AcademicYear {
    const ay = this.get<AcademicYear>(STORAGE_KEYS.ACADEMIC_YEAR, SEED_ACADEMIC_YEAR);
    if (!ay || !ay.name) {
      this.set(STORAGE_KEYS.ACADEMIC_YEAR, SEED_ACADEMIC_YEAR);
      return SEED_ACADEMIC_YEAR;
    }
    return ay;
  }

  public static getClasses(): ClassItem[] {
    return this.get<ClassItem[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
  }

  public static getSections(): SectionItem[] {
    return this.get<SectionItem[]>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
  }

  // Users & Auth
  public static getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  public static saveUsers(users: User[]): void {
    this.set(STORAGE_KEYS.USERS, users);
  }

  public static addStaffUser(
    user: Omit<User, 'id'>,
    byUser: User
  ): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    users.push(newUser);
    this.saveUsers(users);

    this.addAuditLog({
      entity: 'users',
      entity_id: newUser.id,
      action: 'CREATE',
      old_json: null,
      new_json: newUser,
      user_id: byUser.id,
      user_name: byUser.name,
    });

    return newUser;
  }

  public static deleteStaffUser(userId: string, byUser: User): boolean {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    // Do not delete if it is the only headmaster
    const hmCount = users.filter((u) => u.role === 'headmaster').length;
    if (target.role === 'headmaster' && hmCount <= 1) {
      return false;
    }

    const updated = users.filter((u) => u.id !== userId);
    this.saveUsers(updated);

    this.addAuditLog({
      entity: 'users',
      entity_id: userId,
      action: 'DELETE',
      old_json: target,
      new_json: null,
      user_id: byUser.id,
      user_name: byUser.name,
    });

    return true;
  }

  public static getCurrentUser(): User {
    const user = this.get<User>(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
    if (!user || !user.id || !user.name || !user.role) {
      this.set(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
      return SEED_USERS[0];
    }
    return user;
  }

  public static setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  public static authenticateWithPin(userId: string, pin: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId && u.pin.trim() === pin.trim());
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  // Enrolment
  public static getEnrolments(): Enrolment[] {
    const list = this.get<Enrolment[]>(STORAGE_KEYS.ENROLMENT, SEED_ENROLMENT);
    if (!Array.isArray(list) || list.length === 0) {
      this.set(STORAGE_KEYS.ENROLMENT, SEED_ENROLMENT);
      return SEED_ENROLMENT;
    }
    return list.map((e) => {
      if (!e.totals) {
        e.totals = computeTotals(e);
      }
      return e;
    });
  }

  public static getEnrolmentForSection(sectionId: string): Enrolment | undefined {
    const list = this.getEnrolments();
    return list.find((e) => e.section_id === sectionId);
  }

  public static updateEnrolment(enrolment: Enrolment, user: User): void {
    const list = this.getEnrolments();
    const idx = list.findIndex((e) => e.section_id === enrolment.section_id);
    const oldVal = idx >= 0 ? list[idx] : null;

    enrolment.totals = computeTotals(enrolment);

    if (idx >= 0) {
      list[idx] = enrolment;
    } else {
      list.push(enrolment);
    }
    this.set(STORAGE_KEYS.ENROLMENT, list);

    this.addAuditLog({
      entity: 'enrolment',
      entity_id: enrolment.section_id,
      action: idx >= 0 ? 'UPDATE' : 'CREATE',
      old_json: oldVal,
      new_json: enrolment,
      user_id: user.id,
      user_name: user.name,
    });
  }

  // Holidays
  public static getHolidays(): Holiday[] {
    return this.get<Holiday[]>(STORAGE_KEYS.HOLIDAYS, SEED_HOLIDAYS);
  }

  public static isHoliday(dateStr: string): { is_holiday: boolean; reason?: string } {
    const holidays = this.getHolidays();
    const found = holidays.find((h) => h.date === dateStr);
    if (found) {
      return { is_holiday: true, reason: found.reason };
    }
    return { is_holiday: false };
  }

  public static addHoliday(holiday: Omit<Holiday, 'id'>, user: User): void {
    const holidays = this.getHolidays();
    const newHol: Holiday = {
      ...holiday,
      id: `hol-${Date.now()}`,
    };
    holidays.push(newHol);
    this.set(STORAGE_KEYS.HOLIDAYS, holidays);

    this.addAuditLog({
      entity: 'holidays',
      entity_id: newHol.id,
      action: 'CREATE',
      old_json: null,
      new_json: newHol,
      user_id: user.id,
      user_name: user.name,
    });
  }

  public static deleteHoliday(holidayId: string, user: User): void {
    const holidays = this.getHolidays();
    const target = holidays.find((h) => h.id === holidayId);
    const updated = holidays.filter((h) => h.id !== holidayId);
    this.set(STORAGE_KEYS.HOLIDAYS, updated);

    if (target) {
      this.addAuditLog({
        entity: 'holidays',
        entity_id: holidayId,
        action: 'DELETE',
        old_json: target,
        new_json: null,
        user_id: user.id,
        user_name: user.name,
      });
    }
  }

  // MDM Entries
  public static getEntries(): MdmEntry[] {
    return this.get<MdmEntry[]>(STORAGE_KEYS.ENTRIES, []);
  }

  public static getEntriesForDate(dateStr: string): MdmEntry[] {
    const entries = this.getEntries();
    return entries.filter((e) => e.entry_date === dateStr);
  }

  public static getEntry(dateStr: string, sectionId: string): MdmEntry | undefined {
    const entries = this.getEntries();
    return entries.find((e) => e.entry_date === dateStr && e.section_id === sectionId);
  }

  public static saveEntry(
    data: {
      section_id: string;
      entry_date: string;
      sc_boys: number | null;
      sc_girls: number | null;
      st_boys: number | null;
      st_girls: number | null;
      bc_boys: number | null;
      bc_girls: number | null;
      oc_boys: number | null;
      oc_girls: number | null;
      remarks?: string;
    },
    user: User
  ): { success: boolean; message?: string; entry?: MdmEntry } {
    if (isFutureDate(data.entry_date)) {
      return { success: false, message: 'Future dates are not permitted.' };
    }

    const sections = this.getSections();
    const section = sections.find((s) => s.id === data.section_id);
    if (!section) {
      return { success: false, message: 'Invalid class section selected.' };
    }

    const entries = this.getEntries();
    const existingIndex = entries.findIndex(
      (e) => e.entry_date === data.entry_date && e.section_id === data.section_id
    );
    const existing = existingIndex >= 0 ? entries[existingIndex] : null;

    // Check 1-Day Edit Lock for teachers
    if (user.role === 'teacher') {
      if (existing?.locked) {
        return { success: false, message: 'This entry has been locked by the Headmaster.' };
      }
      if (isEntryPastOneDayLock(data.entry_date)) {
        return {
          success: false,
          message: 'Entry locked: Teachers can only edit counts within 1 day. Please contact Headmaster to unlock.',
        };
      }
    }

    const totals = computeTotals(data);
    const nowIso = new Date().toISOString();

    let savedEntry: MdmEntry;
    if (existing) {
      savedEntry = {
        ...existing,
        ...data,
        totals,
        updated_by: user.id,
        updated_by_name: user.name,
        updated_at: nowIso,
      };
      entries[existingIndex] = savedEntry;

      this.addAuditLog({
        entity: 'mdm_entries',
        entity_id: savedEntry.id,
        action: 'UPDATE',
        old_json: existing,
        new_json: savedEntry,
        user_id: user.id,
        user_name: user.name,
      });
    } else {
      savedEntry = {
        id: `entry-${data.entry_date}-${data.section_id}`,
        class_number: section.class_number,
        section_name: section.name,
        remarks: data.remarks || '',
        locked: false,
        created_by: user.id,
        created_by_name: user.name,
        updated_by: user.id,
        updated_by_name: user.name,
        created_at: nowIso,
        updated_at: nowIso,
        ...data,
        totals,
      };
      entries.push(savedEntry);

      this.addAuditLog({
        entity: 'mdm_entries',
        entity_id: savedEntry.id,
        action: 'CREATE',
        old_json: null,
        new_json: savedEntry,
        user_id: user.id,
        user_name: user.name,
      });
    }

    this.set(STORAGE_KEYS.ENTRIES, entries);
    return { success: true, entry: savedEntry };
  }

  public static toggleEntryLock(entryId: string, locked: boolean, user: User): boolean {
    if (user.role !== 'headmaster') return false;

    const entries = this.getEntries();
    const idx = entries.findIndex((e) => e.id === entryId);
    if (idx < 0) return false;

    const old = entries[idx];
    entries[idx] = { ...old, locked, updated_by: user.id, updated_by_name: user.name, updated_at: new Date().toISOString() };
    this.set(STORAGE_KEYS.ENTRIES, entries);

    this.addAuditLog({
      entity: 'mdm_entries',
      entity_id: entryId,
      action: locked ? 'LOCK' : 'UNLOCK',
      old_json: { locked: old.locked },
      new_json: { locked },
      user_id: user.id,
      user_name: user.name,
    });
    return true;
  }

  // Audit Logs
  public static getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  public static addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog); // latest first
    // Keep max 500 logs
    if (logs.length > 500) logs.pop();
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // Reporting calculations: Daily Summary
  public static getDailySummary(dateStr: string): DailySchoolSummary {
    const entries = this.getEntriesForDate(dateStr);
    const classes = this.getClasses();
    const sections = this.getSections();
    const holCheck = this.isHoliday(dateStr);
    const sunCheck = isSunday(dateStr);

    const classSummaries: DailyClassSummary[] = classes.map((cls) => {
      const secAItem = sections.find((s) => s.class_number === cls.number && s.name === 'A');
      const secBItem = sections.find((s) => s.class_number === cls.number && s.name === 'B');

      const secAEntry = secAItem ? entries.find((e) => e.section_id === secAItem.id) : undefined;
      const secBEntry = secBItem ? entries.find((e) => e.section_id === secBItem.id) : undefined;

      const toCombine: Array<Partial<MdmEntry>> = [];
      if (secAEntry) toCombine.push(secAEntry);
      if (secBEntry) toCombine.push(secBEntry);

      const combined = combineCounts(toCombine);
      const isComplete = Boolean(secAEntry && secBEntry);

      return {
        class_number: cls.number,
        group_code: cls.group_code,
        section_a: secAEntry,
        section_b: secBEntry,
        combined_totals: combined,
        is_complete: isComplete,
      };
    });

    // Group 1: Classes 6, 7, 8
    const g1Classes = classSummaries.filter((c) => c.group_code === 'G1');
    const g1Counts: Array<Partial<MdmEntry>> = [];
    g1Classes.forEach((c) => {
      if (c.section_a) g1Counts.push(c.section_a);
      if (c.section_b) g1Counts.push(c.section_b);
    });
    const g1Totals = combineCounts(g1Counts);

    // Group 2: Classes 9, 10
    const g2Classes = classSummaries.filter((c) => c.group_code === 'G2');
    const g2Counts: Array<Partial<MdmEntry>> = [];
    g2Classes.forEach((c) => {
      if (c.section_a) g2Counts.push(c.section_a);
      if (c.section_b) g2Counts.push(c.section_b);
    });
    const g2Totals = combineCounts(g2Counts);

    // Grand Totals: all classes 6-10
    const allCounts: Array<Partial<MdmEntry>> = [];
    classSummaries.forEach((c) => {
      if (c.section_a) allCounts.push(c.section_a);
      if (c.section_b) allCounts.push(c.section_b);
    });
    const schoolGrandTotals = combineCounts(allCounts);

    return {
      date: dateStr,
      classes: classSummaries,
      group1_totals: g1Totals,
      group2_totals: g2Totals,
      school_grand_totals: schoolGrandTotals,
      total_sections_count: sections.length,
      entered_sections_count: entries.length,
      is_holiday: holCheck.is_holiday,
      holiday_reason: holCheck.reason,
      is_sunday: sunCheck,
    };
  }

  // Completion Tracker
  public static getCompletionTracker(dateStr: string = getTodayDateStr()) {
    const sections = this.getSections();
    const entries = this.getEntriesForDate(dateStr);
    const hol = this.isHoliday(dateStr);
    const sun = isSunday(dateStr);

    const sectionStatuses = sections.map((sec) => {
      const entry = entries.find((e) => e.section_id === sec.id);
      return {
        section_id: sec.id,
        class_number: sec.class_number,
        section_name: sec.name,
        display_name: sec.display_name,
        is_entered: Boolean(entry),
        entry: entry || null,
        grand_total: entry?.totals.grand_total ?? null,
      };
    });

    const enteredCount = sectionStatuses.filter((s) => s.is_entered).length;
    const pendingCount = sections.length - enteredCount;
    const percentage = Math.round((enteredCount / sections.length) * 100);

    return {
      date: dateStr,
      is_holiday: hol.is_holiday,
      holiday_reason: hol.reason,
      is_sunday: sun,
      total_sections: sections.length,
      entered_count: enteredCount,
      pending_count: pendingCount,
      percentage,
      sections: sectionStatuses,
    };
  }

  // Monthly Summary
  public static getMonthlySummary(year: number, month: number, filterSectionId?: string, filterGroup?: 'G1' | 'G2') {
    // month is 1-12
    const daysInMonth = new Date(year, month, 0).getDate();
    const allEntries = this.getEntries();

    const rows: MonthlyRowSummary[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let totalMeals = 0;
    let daysWithMeals = 0;
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(year, month - 1, day);
      const dayName = dayNames[d.getDay()];
      const sun = d.getDay() === 0;
      const hol = this.isHoliday(dateStr);

      if (!sun && !hol.is_holiday) {
        workingDays++;
      }

      // Filter entries for this date
      let dateEntries = allEntries.filter((e) => e.entry_date === dateStr);

      if (filterSectionId) {
        dateEntries = dateEntries.filter((e) => e.section_id === filterSectionId);
      } else if (filterGroup === 'G1') {
        dateEntries = dateEntries.filter((e) => e.class_number >= 6 && e.class_number <= 8);
      } else if (filterGroup === 'G2') {
        dateEntries = dateEntries.filter((e) => e.class_number >= 9 && e.class_number <= 10);
      }

      const combined = combineCounts(dateEntries);
      const isEntered = dateEntries.length > 0;

      if (isEntered && combined.grand_total > 0) {
        daysWithMeals++;
        totalMeals += combined.grand_total;
      }

      rows.push({
        date: dateStr,
        day_name: dayName,
        is_sunday: sun,
        is_holiday: hol.is_holiday,
        holiday_reason: hol.reason,
        is_entered: isEntered,
        sc_boys: combined.boys_total > 0 ? dateEntries.reduce((s, e) => s + (e.sc_boys || 0), 0) : 0,
        sc_girls: combined.girls_total > 0 ? dateEntries.reduce((s, e) => s + (e.sc_girls || 0), 0) : 0,
        sc_total: combined.sc_total,
        st_boys: dateEntries.reduce((s, e) => s + (e.st_boys || 0), 0),
        st_girls: dateEntries.reduce((s, e) => s + (e.st_girls || 0), 0),
        st_total: combined.st_total,
        bc_boys: dateEntries.reduce((s, e) => s + (e.bc_boys || 0), 0),
        bc_girls: dateEntries.reduce((s, e) => s + (e.bc_girls || 0), 0),
        bc_total: combined.bc_total,
        oc_boys: dateEntries.reduce((s, e) => s + (e.oc_boys || 0), 0),
        oc_girls: dateEntries.reduce((s, e) => s + (e.oc_girls || 0), 0),
        oc_total: combined.oc_total,
        boys_total: combined.boys_total,
        girls_total: combined.girls_total,
        grand_total: combined.grand_total,
      });
    }

    const monthTotals = combineCounts(rows);
    const avgMealsPerDay = daysWithMeals > 0 ? Math.round((totalMeals / daysWithMeals) * 10) / 10 : 0;

    return {
      year,
      month,
      days_in_month: daysInMonth,
      working_days: workingDays,
      days_with_meals: daysWithMeals,
      total_meals: totalMeals,
      average_meals_per_day: avgMealsPerDay,
      rows,
      totals: monthTotals,
    };
  }

  // Backup & Restore
  public static exportFullBackup() {
    return {
      school: this.getSchool(),
      academic_year: this.getAcademicYear(),
      classes: this.getClasses(),
      sections: this.getSections(),
      users: this.getUsers(),
      enrolment: this.getEnrolments(),
      holidays: this.getHolidays(),
      entries: this.getEntries(),
      audit_logs: this.getAuditLogs(),
      exported_at: new Date().toISOString(),
    };
  }

  public static importBackup(data: any): boolean {
    try {
      if (data.school) this.set(STORAGE_KEYS.SCHOOL, data.school);
      if (data.classes) this.set(STORAGE_KEYS.CLASSES, data.classes);
      if (data.sections) this.set(STORAGE_KEYS.SECTIONS, data.sections);
      if (data.users) this.set(STORAGE_KEYS.USERS, data.users);
      if (data.enrolment) this.set(STORAGE_KEYS.ENROLMENT, data.enrolment);
      if (data.holidays) this.set(STORAGE_KEYS.HOLIDAYS, data.holidays);
      if (data.entries) this.set(STORAGE_KEYS.ENTRIES, data.entries);
      if (data.audit_logs) this.set(STORAGE_KEYS.AUDIT_LOGS, data.audit_logs);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  public static resetToFactoryDemo(): void {
    localStorage.clear();
    this.initialize();
  }
}
