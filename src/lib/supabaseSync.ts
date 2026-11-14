import { getSupabaseClient, getSupabaseConfig } from './supabase';
import { StorageService } from './storage';
import { MdmEntry } from '../types';
import { computeTotals } from './calculations';

export class SupabaseSyncService {
  private static isSyncing = false;

  public static isConnected(): boolean {
    const config = getSupabaseConfig();
    return Boolean(config.url && config.anonKey);
  }

  /**
   * Upsert a single entry to Supabase
   */
  public static async pushEntry(entry: MdmEntry): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const payload = {
        id: entry.id,
        section_id: entry.section_id,
        entry_date: entry.entry_date,
        sc_boys: entry.sc_boys,
        sc_girls: entry.sc_girls,
        st_boys: entry.st_boys,
        st_girls: entry.st_girls,
        bc_boys: entry.bc_boys,
        bc_girls: entry.bc_girls,
        oc_boys: entry.oc_boys,
        oc_girls: entry.oc_girls,
        remarks: entry.remarks || '',
        locked: Boolean(entry.locked),
        created_by: entry.created_by || null,
        updated_by: entry.updated_by || null,
        created_at: entry.created_at || new Date().toISOString(),
        updated_at: entry.updated_at || new Date().toISOString(),
      };

      const { error } = await client
        .from('mdm_entries')
        .upsert(payload, { onConflict: 'section_id,entry_date' });

      if (error) {
        console.warn('Supabase entry sync warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase entry sync failed:', err);
      return false;
    }
  }

  /**
   * Pull all remote entries from Supabase and merge with local storage
   */
  public static async pullEntries(): Promise<number> {
    const client = getSupabaseClient();
    if (!client || this.isSyncing) return 0;

    this.isSyncing = true;
    try {
      const { data, error } = await client
        .from('mdm_entries')
        .select('*');

      if (error || !data) {
        console.warn('Supabase pull warning:', error?.message);
        return 0;
      }

      const sections = StorageService.getSections();
      const localEntries = StorageService.getEntries();
      const localMap = new Map(localEntries.map(e => [`${e.entry_date}_${e.section_id}`, e]));

      let newOrUpdatedCount = 0;

      data.forEach((row: any) => {
        const key = `${row.entry_date}_${row.section_id}`;
        const existing = localMap.get(key);
        const section = sections.find(s => s.id === row.section_id);

        const counts = {
          sc_boys: row.sc_boys,
          sc_girls: row.sc_girls,
          st_boys: row.st_boys,
          st_girls: row.st_girls,
          bc_boys: row.bc_boys,
          bc_girls: row.bc_girls,
          oc_boys: row.oc_boys,
          oc_girls: row.oc_girls,
        };

        const mergedEntry: MdmEntry = {
          id: row.id || `entry-${row.entry_date}-${row.section_id}`,
          section_id: row.section_id,
          class_number: section?.class_number ?? (existing?.class_number || 6),
          section_name: section?.name ?? (existing?.section_name || 'A'),
          entry_date: row.entry_date,
          remarks: row.remarks || '',
          locked: Boolean(row.locked),
          created_by: row.created_by || 'system',
          created_by_name: existing?.created_by_name || 'Teacher / Admin',
          updated_by: row.updated_by || 'system',
          updated_by_name: existing?.updated_by_name || 'Teacher / Admin',
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
          ...counts,
          totals: computeTotals(counts),
        };

        localMap.set(key, mergedEntry);
        newOrUpdatedCount++;
      });

      const updatedList = Array.from(localMap.values());
      localStorage.setItem('mdm_entries', JSON.stringify(updatedList));
      return newOrUpdatedCount;
    } catch (err) {
      console.warn('Supabase pull failed:', err);
      return 0;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Push all local entries to Supabase (Initial seed/sync)
   */
  public static async pushAllLocalEntries(): Promise<number> {
    const client = getSupabaseClient();
    if (!client) return 0;

    try {
      const entries = StorageService.getEntries();
      if (entries.length === 0) return 0;

      const payloads = entries.map((entry) => ({
        id: entry.id,
        section_id: entry.section_id,
        entry_date: entry.entry_date,
        sc_boys: entry.sc_boys,
        sc_girls: entry.sc_girls,
        st_boys: entry.st_boys,
        st_girls: entry.st_girls,
        bc_boys: entry.bc_boys,
        bc_girls: entry.bc_girls,
        oc_boys: entry.oc_boys,
        oc_girls: entry.oc_girls,
        remarks: entry.remarks || '',
        locked: Boolean(entry.locked),
        created_by: entry.created_by || null,
        updated_by: entry.updated_by || null,
        created_at: entry.created_at || new Date().toISOString(),
        updated_at: entry.updated_at || new Date().toISOString(),
      }));

      const { error } = await client
        .from('mdm_entries')
        .upsert(payloads, { onConflict: 'section_id,entry_date' });

      if (error) {
        console.warn('Supabase bulk push warning:', error.message);
        return 0;
      }

      return payloads.length;
    } catch (err) {
      console.warn('Supabase bulk push failed:', err);
      return 0;
    }
  }
}

