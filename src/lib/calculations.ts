import { MdmCounts, ComputedTotals } from '../types';

export function computeTotals(counts: Partial<MdmCounts>): ComputedTotals {
  const sc_b = counts.sc_boys ?? 0;
  const sc_g = counts.sc_girls ?? 0;
  const st_b = counts.st_boys ?? 0;
  const st_g = counts.st_girls ?? 0;
  const bc_b = counts.bc_boys ?? 0;
  const bc_g = counts.bc_girls ?? 0;
  const oc_b = counts.oc_boys ?? 0;
  const oc_g = counts.oc_girls ?? 0;

  const sc_total = sc_b + sc_g;
  const st_total = st_b + st_g;
  const bc_total = bc_b + bc_g;
  const oc_total = oc_b + oc_g;

  const boys_total = sc_b + st_b + bc_b + oc_b;
  const girls_total = sc_g + st_g + bc_g + oc_g;
  const grand_total = boys_total + girls_total;

  return {
    sc_total,
    st_total,
    bc_total,
    oc_total,
    boys_total,
    girls_total,
    grand_total,
  };
}

export function combineCounts(countsList: Array<Partial<MdmCounts>>): ComputedTotals {
  let sc_b = 0, sc_g = 0;
  let st_b = 0, st_g = 0;
  let bc_b = 0, bc_g = 0;
  let oc_b = 0, oc_g = 0;

  for (const item of countsList) {
    sc_b += item.sc_boys ?? 0;
    sc_g += item.sc_girls ?? 0;
    st_b += item.st_boys ?? 0;
    st_g += item.st_girls ?? 0;
    bc_b += item.bc_boys ?? 0;
    bc_g += item.bc_girls ?? 0;
    oc_b += item.oc_boys ?? 0;
    oc_g += item.oc_girls ?? 0;
  }

  const sc_total = sc_b + sc_g;
  const st_total = st_b + st_g;
  const bc_total = bc_b + bc_g;
  const oc_total = oc_b + oc_g;
  const boys_total = sc_b + st_b + bc_b + oc_b;
  const girls_total = sc_g + st_g + bc_g + oc_g;
  const grand_total = boys_total + girls_total;

  return {
    sc_total,
    st_total,
    bc_total,
    oc_total,
    boys_total,
    girls_total,
    grand_total,
  };
}

export function isSunday(dateStr: string): boolean {
  // dateStr in YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return d.getDay() === 0;
}

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Business Rule:
 * Teachers can only edit entries within 1 day (today or yesterday).
 * Older entries are locked for teachers and can only be modified by Headmaster / Admin.
 */
export function isEntryPastOneDayLock(entryDateStr: string, currentDateStr: string = getTodayDateStr()): boolean {
  const [eY, eM, eD] = entryDateStr.split('-').map(Number);
  const [cY, cM, cD] = currentDateStr.split('-').map(Number);

  const entryDate = new Date(eY, eM - 1, eD);
  const curDate = new Date(cY, cM - 1, cD);

  const diffTime = curDate.getTime() - entryDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If entry is older than 1 day (diffDays > 1), it is locked for normal teachers
  return diffDays > 1;
}

export function isFutureDate(entryDateStr: string, currentDateStr: string = getTodayDateStr()): boolean {
  return entryDateStr > currentDateStr;
}

export function formatDateIndian(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y}`;
}

