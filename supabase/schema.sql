-- ====================================================================
-- MID-DAY MEAL (MDM) REGISTER APP - POSTGRESQL SCHEMA FOR SUPABASE
-- 100% Free Tier Compatible (Postgres 15+, Row Level Security, Views)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS schools (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    address TEXT NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACADEMIC YEARS TABLE
CREATE TABLE IF NOT EXISTS academic_years (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. '2026-2027'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLASSES TABLE (Classes 6 to 10)
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    number INTEGER NOT NULL CHECK (number BETWEEN 6 AND 10),
    group_code VARCHAR(10) NOT NULL CHECK (group_code IN ('G1', 'G2')), -- G1: 6,7,8 (Upper Primary), G2: 9,10 (High School)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, number)
);

-- 5. SECTIONS TABLE (A and B)
CREATE TABLE IF NOT EXISTS sections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(10) NOT NULL CHECK (name IN ('A', 'B')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, name)
);

-- 6. USERS TABLE (Staff & Admin)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_or_email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('headmaster', 'teacher', 'viewer')),
    pin VARCHAR(10) NOT NULL DEFAULT '1234', -- 4-digit PIN for quick school mobile login
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER_SECTIONS TABLE (Assignments for teachers)
CREATE TABLE IF NOT EXISTS user_sections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, section_id)
);

-- 8. MDM ENTRIES TABLE (Daily Meal Record)
-- Whole numbers >= 0. NULL means not entered (distinct from 0).
CREATE TABLE IF NOT EXISTS mdm_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL CHECK (entry_date <= CURRENT_DATE), -- No future dates allowed
    sc_boys INTEGER CHECK (sc_boys IS NULL OR sc_boys >= 0),
    sc_girls INTEGER CHECK (sc_girls IS NULL OR sc_girls >= 0),
    st_boys INTEGER CHECK (st_boys IS NULL OR st_boys >= 0),
    st_girls INTEGER CHECK (st_girls IS NULL OR st_girls >= 0),
    bc_boys INTEGER CHECK (bc_boys IS NULL OR bc_boys >= 0),
    bc_girls INTEGER CHECK (bc_girls IS NULL OR bc_girls >= 0),
    oc_boys INTEGER CHECK (oc_boys IS NULL OR oc_boys >= 0),
    oc_girls INTEGER CHECK (oc_girls IS NULL OR oc_girls >= 0),
    remarks TEXT,
    locked BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, entry_date)
);

-- 9. HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS holidays (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, date)
);

-- 10. ENROLMENT TABLE (Benchmark limits)
CREATE TABLE IF NOT EXISTS enrolment (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE UNIQUE,
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
    sc_boys INTEGER NOT NULL DEFAULT 0 CHECK (sc_boys >= 0),
    sc_girls INTEGER NOT NULL DEFAULT 0 CHECK (sc_girls >= 0),
    st_boys INTEGER NOT NULL DEFAULT 0 CHECK (st_boys >= 0),
    st_girls INTEGER NOT NULL DEFAULT 0 CHECK (st_girls >= 0),
    bc_boys INTEGER NOT NULL DEFAULT 0 CHECK (bc_boys >= 0),
    bc_girls INTEGER NOT NULL DEFAULT 0 CHECK (bc_girls >= 0),
    oc_boys INTEGER NOT NULL DEFAULT 0 CHECK (oc_boys >= 0),
    oc_girls INTEGER NOT NULL DEFAULT 0 CHECK (oc_girls >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOCK, UNLOCK
    old_json JSONB,
    new_json JSONB,
    user_id TEXT REFERENCES users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- SQL REPORTING VIEWS
-- ====================================================================

-- View 1: v_entry_totals (Caste totals, Boys, Girls and Total per section)
CREATE OR REPLACE VIEW v_entry_totals AS
SELECT 
    e.id,
    e.section_id,
    s.name AS section_name,
    c.number AS class_number,
    c.group_code,
    c.school_id,
    e.entry_date,
    COALESCE(e.sc_boys, 0) AS sc_boys,
    COALESCE(e.sc_girls, 0) AS sc_girls,
    (COALESCE(e.sc_boys, 0) + COALESCE(e.sc_girls, 0)) AS sc_total,
    COALESCE(e.st_boys, 0) AS st_boys,
    COALESCE(e.st_girls, 0) AS st_girls,
    (COALESCE(e.st_boys, 0) + COALESCE(e.st_girls, 0)) AS st_total,
    COALESCE(e.bc_boys, 0) AS bc_boys,
    COALESCE(e.bc_girls, 0) AS bc_girls,
    (COALESCE(e.bc_boys, 0) + COALESCE(e.bc_girls, 0)) AS bc_total,
    COALESCE(e.oc_boys, 0) AS oc_boys,
    COALESCE(e.oc_girls, 0) AS oc_girls,
    (COALESCE(e.oc_boys, 0) + COALESCE(e.oc_girls, 0)) AS oc_total,
    (COALESCE(e.sc_boys, 0) + COALESCE(e.st_boys, 0) + COALESCE(e.bc_boys, 0) + COALESCE(e.oc_boys, 0)) AS boys_total,
    (COALESCE(e.sc_girls, 0) + COALESCE(e.st_girls, 0) + COALESCE(e.bc_girls, 0) + COALESCE(e.oc_girls, 0)) AS girls_total,
    (COALESCE(e.sc_boys, 0) + COALESCE(e.sc_girls, 0) + COALESCE(e.st_boys, 0) + COALESCE(e.st_girls, 0) +
     COALESCE(e.bc_boys, 0) + COALESCE(e.bc_girls, 0) + COALESCE(e.oc_boys, 0) + COALESCE(e.oc_girls, 0)) AS section_grand_total,
    e.remarks,
    e.locked,
    e.created_by,
    e.updated_by,
    e.created_at,
    e.updated_at
FROM mdm_entries e
JOIN sections s ON e.section_id = s.id
JOIN classes c ON s.class_id = c.id;

-- View 2: v_class_daily (Sum of Sections A and B per class per day)
CREATE OR REPLACE VIEW v_class_daily AS
SELECT
    school_id,
    entry_date,
    class_number,
    group_code,
    SUM(sc_boys) AS sc_boys,
    SUM(sc_girls) AS sc_girls,
    SUM(sc_total) AS sc_total,
    SUM(st_boys) AS st_boys,
    SUM(st_girls) AS st_girls,
    SUM(st_total) AS st_total,
    SUM(bc_boys) AS bc_boys,
    SUM(bc_girls) AS bc_girls,
    SUM(bc_total) AS bc_total,
    SUM(oc_boys) AS oc_boys,
    SUM(oc_girls) AS oc_girls,
    SUM(oc_total) AS oc_total,
    SUM(boys_total) AS boys_total,
    SUM(girls_total) AS girls_total,
    SUM(section_grand_total) AS class_grand_total,
    COUNT(section_id) AS sections_entered_count
FROM v_entry_totals
GROUP BY school_id, entry_date, class_number, group_code;

-- View 3: v_group_daily (Group 1 [Classes 6-8] and Group 2 [Classes 9-10])
CREATE OR REPLACE VIEW v_group_daily AS
SELECT
    school_id,
    entry_date,
    group_code,
    SUM(sc_boys) AS sc_boys,
    SUM(sc_girls) AS sc_girls,
    SUM(sc_total) AS sc_total,
    SUM(st_boys) AS st_boys,
    SUM(st_girls) AS st_girls,
    SUM(st_total) AS st_total,
    SUM(bc_boys) AS bc_boys,
    SUM(bc_girls) AS bc_girls,
    SUM(bc_total) AS bc_total,
    SUM(oc_boys) AS oc_boys,
    SUM(oc_girls) AS oc_girls,
    SUM(oc_total) AS oc_total,
    SUM(boys_total) AS boys_total,
    SUM(girls_total) AS girls_total,
    SUM(class_grand_total) AS group_grand_total
FROM v_class_daily
GROUP BY school_id, entry_date, group_code;

-- View 4: v_school_daily (Grand total for all classes 6 to 10 per day)
CREATE OR REPLACE VIEW v_school_daily AS
SELECT
    school_id,
    entry_date,
    SUM(sc_boys) AS sc_boys,
    SUM(sc_girls) AS sc_girls,
    SUM(sc_total) AS sc_total,
    SUM(st_boys) AS st_boys,
    SUM(st_girls) AS st_girls,
    SUM(st_total) AS st_total,
    SUM(bc_boys) AS bc_boys,
    SUM(bc_girls) AS bc_girls,
    SUM(bc_total) AS bc_total,
    SUM(oc_boys) AS oc_boys,
    SUM(oc_girls) AS oc_girls,
    SUM(oc_total) AS oc_total,
    SUM(boys_total) AS boys_total,
    SUM(girls_total) AS girls_total,
    SUM(group_grand_total) AS school_grand_total
FROM v_group_daily
GROUP BY school_id, entry_date;

-- View 5: v_monthly_summary (Monthly aggregates with days entered and average meals)
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT
    school_id,
    DATE_TRUNC('month', entry_date) AS month_start,
    COUNT(DISTINCT entry_date) AS days_entered,
    SUM(sc_boys) AS sc_boys,
    SUM(sc_girls) AS sc_girls,
    SUM(sc_total) AS sc_total,
    SUM(st_boys) AS st_boys,
    SUM(st_girls) AS st_girls,
    SUM(st_total) AS st_total,
    SUM(bc_boys) AS bc_boys,
    SUM(bc_girls) AS bc_girls,
    SUM(bc_total) AS bc_total,
    SUM(oc_boys) AS oc_boys,
    SUM(oc_girls) AS oc_girls,
    SUM(oc_total) AS oc_total,
    SUM(boys_total) AS boys_total,
    SUM(girls_total) AS girls_total,
    SUM(school_grand_total) AS total_meals_served,
    ROUND(SUM(school_grand_total)::NUMERIC / NULLIF(COUNT(DISTINCT entry_date), 0), 1) AS average_meals_per_day
FROM v_school_daily
GROUP BY school_id, DATE_TRUNC('month', entry_date);

-- ====================================================================
-- AUDIT TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION fn_audit_mdm_entries()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (entity, entity_id, action, old_json, new_json, user_id)
        VALUES ('mdm_entries', NEW.id::text, 'CREATE', NULL, to_jsonb(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (entity, entity_id, action, old_json, new_json, user_id)
        VALUES ('mdm_entries', NEW.id::text, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.updated_by);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (entity, entity_id, action, old_json, new_json, user_id)
        VALUES ('mdm_entries', OLD.id::text, 'DELETE', to_jsonb(OLD), NULL, NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_mdm_entries ON mdm_entries;
CREATE TRIGGER trg_audit_mdm_entries
AFTER INSERT OR UPDATE OR DELETE ON mdm_entries
FOR EACH ROW EXECUTE FUNCTION fn_audit_mdm_entries();

-- ====================================================================
-- INITIAL SEED SCRIPT (Classes 6-10, Sections A & B, Enrolments, Headmaster)
-- ====================================================================
DO $$
BEGIN
    -- 1. Seed School
    INSERT INTO schools (id, name, code, address, district, state)
    VALUES ('school-1', 'Zilla Parishad High School (ZPHS)', '28190501204', 'Main Road, Educational Zone, District Center', 'Visakhapatnam', 'Andhra Pradesh')
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        code = EXCLUDED.code;

    -- 2. Seed Academic Year
    INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current)
    VALUES ('ay-2026-27', 'school-1', '2026-2027', '2026-06-12', '2027-04-23', true)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Seed Classes (Classes 6 to 10)
    INSERT INTO classes (id, school_id, number, group_code) VALUES
        ('class-6', 'school-1', 6, 'G1'),
        ('class-7', 'school-1', 7, 'G1'),
        ('class-8', 'school-1', 8, 'G1'),
        ('class-9', 'school-1', 9, 'G2'),
        ('class-10', 'school-1', 10, 'G2')
    ON CONFLICT (id) DO NOTHING;

    -- 4. Seed Sections (A and B for each class)
    INSERT INTO sections (id, class_id, name) VALUES
        ('sec-6A', 'class-6', 'A'),
        ('sec-6B', 'class-6', 'B'),
        ('sec-7A', 'class-7', 'A'),
        ('sec-7B', 'class-7', 'B'),
        ('sec-8A', 'class-8', 'A'),
        ('sec-8B', 'class-8', 'B'),
        ('sec-9A', 'class-9', 'A'),
        ('sec-9B', 'class-9', 'B'),
        ('sec-10A', 'class-10', 'A'),
        ('sec-10B', 'class-10', 'B')
    ON CONFLICT (id) DO NOTHING;

    -- 5. Seed Initial Headmaster / Admin user
    INSERT INTO users (id, school_id, name, phone_or_email, role, pin)
    VALUES ('user-admin', 'school-1', 'Headmaster / Admin', 'admin', 'headmaster', '1234')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Seed Baseline Enrolments (Classes 6-10 Sections A & B)
    INSERT INTO enrolment (id, section_id, academic_year_id, sc_boys, sc_girls, st_boys, st_girls, bc_boys, bc_girls, oc_boys, oc_girls)
    VALUES
        ('enr-6A', 'sec-6A', 'ay-2026-27', 5, 6, 4, 3, 12, 10, 4, 5),
        ('enr-6B', 'sec-6B', 'ay-2026-27', 6, 5, 3, 4, 11, 12, 5, 4),
        ('enr-7A', 'sec-7A', 'ay-2026-27', 5, 5, 4, 4, 14, 12, 5, 5),
        ('enr-7B', 'sec-7B', 'ay-2026-27', 6, 6, 3, 3, 13, 11, 4, 4),
        ('enr-8A', 'sec-8A', 'ay-2026-27', 6, 5, 4, 4, 12, 14, 5, 5),
        ('enr-8B', 'sec-8B', 'ay-2026-27', 5, 6, 4, 3, 13, 13, 4, 4),
        ('enr-9A', 'sec-9A', 'ay-2026-27', 4, 5, 3, 4, 15, 13, 4, 5),
        ('enr-9B', 'sec-9B', 'ay-2026-27', 5, 4, 4, 3, 14, 14, 5, 4),
        ('enr-10A', 'sec-10A', 'ay-2026-27', 5, 5, 4, 4, 13, 15, 4, 4),
        ('enr-10B', 'sec-10B', 'ay-2026-27', 4, 6, 3, 4, 15, 12, 5, 5)
    ON CONFLICT (section_id) DO NOTHING;
END $$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & PUBLIC API PERMISSIONS
-- Grants immediate, safe read/write access to anon & authenticated clients
-- ====================================================================
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'schools', 'academic_years', 'classes', 'sections', 
        'users', 'user_sections', 'enrolment', 'mdm_entries', 
        'holidays', 'audit_log'
    ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public full access policy" ON %I;', tbl);
        EXECUTE format('CREATE POLICY "Public full access policy" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
        EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role;', tbl);
    END LOOP;
END $$;

-- Grant access on reporting views to public API
GRANT SELECT ON v_entry_totals, v_class_daily, v_group_daily, v_school_daily, v_monthly_summary TO anon, authenticated, service_role;
