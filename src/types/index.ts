export type Role = 'headmaster' | 'teacher' | 'viewer';

export interface School {
  id: string;
  name: string;
  code?: string;
  address: string;
  district?: string;
  state?: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // e.g. "2026-2027"
  start_date: string; // YYYY-MM-DD
  end_date: string;
  is_current: boolean;
}

export interface ClassItem {
  id: string;
  school_id: string;
  number: number; // 6, 7, 8, 9, 10
  group_code: 'G1' | 'G2'; // G1 = 6-8 (Upper Primary), G2 = 9-10 (High School)
}

export interface SectionItem {
  id: string;
  class_id: string;
  class_number: number;
  name: 'A' | 'B';
  display_name: string; // "Class 6 - A"
}

export interface User {
  id: string;
  name: string;
  phone_or_email: string;
  role: Role;
  school_id: string;
  pin: string; // 4-digit PIN for quick login
  assigned_section_id?: string; // default section
  assigned_section_name?: string;
}

export interface MdmCounts {
  sc_boys: number | null;
  sc_girls: number | null;
  st_boys: number | null;
  st_girls: number | null;
  bc_boys: number | null;
  bc_girls: number | null;
  oc_boys: number | null;
  oc_girls: number | null;
}

export interface ComputedTotals {
  sc_total: number;
  st_total: number;
  bc_total: number;
  oc_total: number;
  boys_total: number;
  girls_total: number;
  grand_total: number;
}

export interface MdmEntry extends MdmCounts {
  id: string;
  section_id: string;
  class_number: number;
  section_name: 'A' | 'B';
  entry_date: string; // YYYY-MM-DD
  remarks?: string;
  locked: boolean;
  created_by: string;
  created_by_name: string;
  updated_by: string;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
  // Computed fields for UI convenience
  totals: ComputedTotals;
}

export interface Enrolment extends MdmCounts {
  id: string;
  section_id: string;
  class_number: number;
  section_name: 'A' | 'B';
  academic_year_id: string;
  totals: ComputedTotals;
}

export interface Holiday {
  id: string;
  school_id: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOCK' | 'UNLOCK';
  old_json: any;
  new_json: any;
  user_id: string;
  user_name: string;
  timestamp: string;
}

export interface DailyClassSummary {
  class_number: number;
  group_code: 'G1' | 'G2';
  section_a?: MdmEntry;
  section_b?: MdmEntry;
  combined_totals: ComputedTotals;
  is_complete: boolean;
}

export interface DailySchoolSummary {
  date: string;
  classes: DailyClassSummary[];
  group1_totals: ComputedTotals; // Classes 6, 7, 8
  group2_totals: ComputedTotals; // Classes 9, 10
  school_grand_totals: ComputedTotals;
  total_sections_count: number; // 10
  entered_sections_count: number;
  is_holiday: boolean;
  holiday_reason?: string;
  is_sunday: boolean;
}

export interface MonthlyRowSummary {
  date: string;
  day_name: string;
  is_sunday: boolean;
  is_holiday: boolean;
  holiday_reason?: string;
  is_entered: boolean;
  sc_boys: number;
  sc_girls: number;
  sc_total: number;
  st_boys: number;
  st_girls: number;
  st_total: number;
  bc_boys: number;
  bc_girls: number;
  bc_total: number;
  oc_boys: number;
  oc_girls: number;
  oc_total: number;
  boys_total: number;
  girls_total: number;
  grand_total: number;
}

