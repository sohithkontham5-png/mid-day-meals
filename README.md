# Mid-Day Meal (MDM) Register App

A web and mobile Progressive Web App (PWA) for schools to record the daily mid-day meal counts for **Classes 6 to 10** (Sections A and B), categorized by **SC, ST, BC, OC** and gender (**Boys & Girls**).

Built to be **100% completely free of cost** for database and hosting, working seamlessly on mobile phones (Android, iOS) and desktop web browsers.

---

## 🌟 Key Features

1. **Staff Selector & 4-Digit PIN Login**
   - No email hassle for teachers: simply select staff name and enter a 4-digit PIN.
   - Roles: **Headmaster / Admin**, **Class Teachers (6A-10B)**, and **Viewer / Inspector**.

2. **Daily Fast Entry Screen (< 30 Seconds)**
   - Pre-selects the teacher's assigned section with permission to enter for other sections as substitute.
   - 8 numeric inputs: SC, ST, BC, OC for Boys and Girls.
   - Mobile-optimized numeric keypad with auto-focus and auto-selection.
   - **Live Calculated Totals**: Caste totals (SC, ST, BC, OC), Boys Total, Girls Total, and Section Total update instantaneously without manual math.
   - **Enrolment Warnings**: Alerts if entered count exceeds the enrolled strength.
   - **1-Day Edit Lock**: Teachers can only edit counts within 1 day; older dates are locked automatically and require Headmaster approval to unlock.

3. **Real-time Completion Tracker Dashboard**
   - Visual progress bar and 10 interactive section cards (6A, 6B, 7A, 7B, 8A, 8B, 9A, 9B, 10A, 10B).
   - Instant visual check of which classes have submitted today and which are pending.
   - 1-click jump to enter any pending section.

4. **Multi-level Rollup Summaries**
   - **Class View**: Combines Section A + Section B into Class Total with full caste & gender breakdown.
   - **Group 1**: Upper Primary (Classes 6, 7, 8).
   - **Group 2**: High School (Classes 9, 10).
   - **School Grand Total**: All classes (6 to 10).

5. **Official Monthly Register**
   - Day-by-day matrix (Days 1 to 31).
   - Automatic exclusion of Sundays and marked holidays.
   - Metrics: Total Working Days, Days Meals Served, Total Meals Served, and Daily Average Meals.

6. **Government-Ready Exports**
   - **Excel (.xlsx)**: Pre-formatted spreadsheets with headers, subheadings, group totals, and grand totals.
   - **PDF**: Landscape layout formatted with signatures for MDM Incharge and Headmaster.
   - **1-Click Print**: Clean CSS print styling formatted for standard A4 landscape registers.

7. **Immutable Audit Trail**
   - Logs every entry creation, edit, lock, unlock, and delete with timestamp, user ID, user name, and before/after JSON diffs.

8. **100% Free Hosting & Offline-First Architecture**
   - Operates fully offline in rural areas with low connectivity using local storage.
   - Optional connection to **Supabase Free PostgreSQL** for multi-device live sync.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser or mobile phone on the same Wi-Fi.

### 3. Build for Production
```bash
npm run build
```

---

## 👥 Initial Setup & Adding Teachers

The app starts with a clean setup containing only the primary administrative account:

| Initial Account | Role | Access | Default PIN |
|---|---|---|---|
| **Headmaster / Admin** | Headmaster / Admin | All Sections & Settings | **`1234`** |

### How to Add Your School's Teachers:
1. Log in with the default Headmaster account (PIN: `1234`).
2. Go to the **School Admin** tab &rarr; click on **Staff & PINs**.
3. Click the green **`+ Add Teacher / Staff`** button.
4. Enter the teacher's name, assign their class/section (e.g. `Class 6 - A`), set their phone/ID, and give them a 4-digit PIN.
5. You can edit, change PINs, or remove teachers at any time!

---

## ☁️ 100% Free Hosting & Database Setup

### Step 1: Free Hosting on Vercel or Netlify (Zero Cost)
1. Push this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (both have generous free tiers).
3. Import your repository:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy**. Your app is live with free HTTPS and PWA support!

### Step 2: Free PostgreSQL on Supabase (Zero Cost)
1. Go to [Supabase](https://supabase.com) and create a free account.
2. Create a new project (select any free region, e.g. Singapore or Mumbai).
3. Go to the **SQL Editor** tab in Supabase.
4. Open the file `supabase/schema.sql` from this repository, copy all contents, paste into the SQL editor, and click **Run**.
5. Go to **Project Settings -> API** in Supabase:
   - Copy **Project URL**
   - Copy **Anon Public Key**
6. Open your MDM Register app, click the **Settings / Database** gear icon in the top right corner, paste the credentials, and click **Save Credentials**. All entries will now sync across all teachers' mobile phones in real-time!

---

## 🗄️ Database Schema & Views

The database schema is defined in [supabase/schema.sql](file:///c:/Users/konth/OneDrive/Desktop/MMD/supabase/schema.sql):
- **schools**: School profile, code, district, state.
- **academic_years**: Start/end dates, current year.
- **classes**: Classes 6 to 10 with group codes (G1 = 6-8, G2 = 9-10).
- **sections**: Sections A and B.
- **users**: Teachers, Headmaster, PINs.
- **user_sections**: Staff assignments.
- **mdm_entries**: Daily meal counts (SC, ST, BC, OC x Boys/Girls), remarks, lock state.
- **enrolment**: Section capacity limits for validation.
- **holidays**: Academic holidays calendar.
- **audit_log**: Complete history of changes with old/new values.
- **SQL Views**:
  - `v_entry_totals`: Section-level sums.
  - `v_class_daily`: Class-level combined totals (A + B).
  - `v_group_daily`: Group 1 (6-8) & Group 2 (9-10) totals.
  - `v_school_daily`: Grand total for all classes.
  - `v_monthly_summary`: Monthly rollup with days entered and daily averages.

---

## 📱 Mobile PWA Installation

- **On Android (Chrome / Brave / Edge)**: Open the web link, tap the 3 dots menu -> tap **"Install app"** or **"Add to Home Screen"**.
- **On iPhone (Safari)**: Open the web link, tap the **Share** button -> tap **"Add to Home Screen"**.
- The app will install as a native icon on the home screen, opening full-screen with offline caching enabled!

