# 🎮 Guild Beta Test - Realtime Kanban Board

A full-stack, real-time Kanban board application designed specifically for a **40-person gaming guild beta test**. Powered by **React (Vite)**, **Tailwind CSS v3**, and **Supabase (Realtime Database & Broadcast)**.

---

## 🌟 Key Features

1. **4-Column Kanban Workflow**:
   - `To Test` (Cyan): New raid mechanics, class balancing, or addon features awaiting playtesting.
   - `In Progress` (Amber): Claimed by guild members actively running test dungeons or raid bosses.
   - `Result` (Emerald): Completed test tasks with verified feedback notes, damage logs, and screenshots.
   - `Failed` (Rose): Features with reproducible bugs, Lua errors, or balance issues.

2. **Real-time Data Synchronization**:
   - Integrated with Supabase Postgres Realtime.
   - Instant live updates across 40 simultaneous guild members without page refreshes.
   - Automatic fallback to `localStorage` demo mode if Supabase keys are not set.

3. **Character Identity & Task Claiming**:
   - Guild testers can set their active character name (e.g. `Valkyrie_Tank`, `Shadow_Priest`).
   - 1-click task claiming linked directly to active character identity.

4. **Result Sharing & Bug Tracker Modal**:
   - Click any card to edit column status.
   - Record text notes, logs, and tester feedback.
   - Attach screenshot URLs or embed YouTube playtest video clips.
   - Integrated bug tracker to report issues with severity levels (`Critical`, `Major`, `Minor`) and mark them fixed/open.

5. **Dark Mode Gaming UI**:
   - Built with Tailwind CSS v3, custom glowing accents, glassmorphism panels, and gaming typography (`Orbitron` & `Inter`).

---

## 🚀 Step 1: Supabase Database Setup

1. Create a free project at [Supabase.com](https://supabase.com).
2. In your Supabase Project Dashboard, navigate to the **SQL Editor** (left menu).
3. Open the `supabase-schema.sql` file provided in this repository, copy its contents, paste them into the SQL Editor, and click **RUN**.
4. This will:
   - Create the `public.tasks` table.
   - Configure public access policies (Row Level Security).
   - Enable `supabase_realtime` publication for instant multi-user board updates.
   - Seed sample guild beta test tasks.
5. Go to **Project Settings -> API** in Supabase and copy your:
   - `Project URL`
   - `anon / public API key`

---

## 💻 Step 2: Running Locally

1. Clone the repository and navigate into the folder:
   ```bash
   cd "Forever Kanban"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

4. Start the Vite local development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note**: If `.env.local` is omitted, the app automatically runs in **Demo Mode** using `localStorage` so you can test all features immediately!

---

## 🌐 Step 3: Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your Kanban board repository.
4. In the **Environment Variables** section on Vercel, add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-actual-anon-key`
5. Click **Deploy**. Vercel will build and host your production app with HTTPS automatically.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite)
- **Styling**: Tailwind CSS v3, Lucide React Icons
- **Backend / Realtime**: Supabase (`@supabase/supabase-js`), Postgres Database
- **Hosting**: Vercel / Netlify
