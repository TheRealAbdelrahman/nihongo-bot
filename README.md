# にほんごBot

An AI-powered Japanese language learning chatbot for beginner-level students (JFS A0–A2), built as a Final Year Project at Universiti Teknologi Malaysia (UTM).

**Live app:** https://nihongo-bot.hafizuddin2001.workers.dev

---

## What it does

- Five scenario-based conversation modes (Greetings, Self Introduction, Enquiry, Restaurant, Invitation), each with a distinct AI character
- Automatic session feedback after each conversation covering vocabulary, grammar, corrections, and encouragement
- Teacher portal for registering students via CSV, uploading PDF learning materials, and messaging students
- Student portal for conversation practice, chat history replay, materials access, and messaging teachers
- Powered by Groq (Llama 3.3 70B) for conversation and feedback generation, with Supabase as the backend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, plain CSS-in-JS |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Deployment | Cloudflare Pages |

---

## Project Structure

```
src/
├── components/
│   ├── ProtectedRoute.jsx      # Role-based route guard
│   └── ScrollToTop.jsx         # Forces page reload on navigation
├── context/
│   └── AuthContext.jsx         # Auth state, signIn, signUp, signOut
├── lib/
│   ├── japaneseUtils.js        # Response parser
│   └── supabaseClient.js       # Supabase client instance
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── StudentDashboard.jsx
│   ├── StudentMaterials.jsx
│   ├── StudentMessages.jsx
│   ├── ChatPage.jsx            # Main conversation UI
│   ├── ChatHistory.jsx
│   ├── TeacherDashboard.jsx
│   ├── TeacherMaterials.jsx
│   ├── TeacherMessages.jsx
│   └── RegisterStudents.jsx
└── App.jsx                     # Routes

supabase/
└── functions/
    └── chat/
        └── index.ts            # Edge function — conversation + feedback
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Groq API key (free at console.groq.com)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd nihongo-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Supabase URL can be found in your Supabase **Project Overview**.
Supabase anon key can be found in your Supabase project under **Project Settings → API Keys → Legacy anon, service_role API keys**.

### 4. Set up Supabase secrets (for the edge function)

Go to Supabase **Edge Functions → Secrets** and add your Groq API Key under the name `GROQ_API_KEY`.

### 5. Deploy the edge function

Go to Supabase **Edge Functions → Functions** and click on **Deploy a new function → Via Editor**.
Paste in function `chat.txt` and `register.txt` under `chat` and `register-students` respectively. 

### 6. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Supabase Database Tables

The following tables are required. Create them in your Supabase SQL editor:

### `profiles`
Automatically populated via a trigger on `auth.users`. Contains `id`, `full_name`, `email`, `role` (student/teacher), `level` (A0/A1/A2).

### `chat_sessions`
Stores each conversation session. Columns: `id`, `student_id`, `lesson_mode`, `created_at`, `updated_at`.

### `chat_messages`
Stores individual messages. Columns: `id`, `session_id`, `role` (user/assistant), `content`, `created_at`.

### `session_feedback`
Stores AI-generated feedback per session. Columns: `id`, `session_id`, `student_id`, `lesson_mode`, `vocabulary_notes`, `grammar_notes`, `effort_notes`, `corrections` (jsonb), `encouragement`, `created_at`.

### `materials`
Stores uploaded PDF metadata. Columns: `id`, `teacher_id`, `title`, `description`, `file_path`, `file_name`, `file_size`, `lesson_mode`, `created_at`.

### `teacher_students`
Maps students to their teacher. Columns: `teacher_id`, `student_id`, `assigned_at`.

### `conversations`
Stores messaging threads. Columns: `id`, `participant_a`, `participant_b`, `updated_at`.

### `messages`
Stores individual chat messages between teacher and student. Columns: `id`, `conversation_id`, `sender_id`, `content`, `read_at`, `created_at`.

### `teacher_lesson_stats` (view)
A SQL view used by the Teacher Dashboard to show session counts per lesson mode per teacher. Create it as:

```sql
CREATE VIEW teacher_lesson_stats AS
SELECT
  ts.teacher_id,
  cs.lesson_mode,
  COUNT(cs.id) AS session_count
FROM teacher_students ts
JOIN chat_sessions cs ON cs.student_id = ts.student_id
GROUP BY ts.teacher_id, cs.lesson_mode;
```

---

## Supabase Storage

Create a storage bucket named `materials` with the following policy:

- Teachers can upload to their own folder (`{teacher_id}/...`)
- Teachers and their assigned students can read files
- Only the uploading teacher can delete files

---

## Deployment (Cloudflare Pages)

### 1. Connect your repository to Cloudflare Pages

In the Cloudflare dashboard, create a new Pages project and connect your Git repository.

### 2. Set build settings

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |

### 3. Add environment variables

In Workers & Pages → Settings → Build → Variables and secrets, add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Deploy

Push to your main branch. Cloudflare Pages will build and deploy automatically.

---

## Key Design Decisions

**Why Groq instead of OpenAI?**
Groq provide free tier subscription which is sufficient for development and small-scale classroom use.

**Why Edge Functions instead of a separate backend?**
Supabase Edge Functions run close to the database, simplify auth (the service role key is available automatically), and avoid the need for a separate Node/Express server.

**Why `sessionStorage` in `ScrollToTop`?**
The app renders before fonts and auth state fully load on first navigation, causing buttons to be unresponsive. A one-time reload per route visit on first load fixes this. The flag is stored in `sessionStorage` so it resets on each new browser session.

---

## User Roles

| Role | How to get an account |
|---|---|
| Teacher | Self-register on the Login page using the Teacher toggle |
| Student | Registered by a teacher via CSV upload on the Register Students page |

---

## Lesson Modes

| ID | Label | Character | Scenario |
|---|---|---|---|
| `greeting` | Greetings | やまだ ゆい | Everyday greetings on campus |
| `self_intro` | Self Introduction | たなか けんじ | University orientation |
| `shopping` | Enquiry | すずき はな | Convenience store enquiry |
| `food` | Restaurant | さとう りょう | Ordering food at a restaurant |
| `directions` | Invitation | きむら あおい | Phone call invitation |

---

## Known Limitations

- The AI uses Groq's `llama-3.3-70b-versatile` model which wil be deprecated by August 2026.
- The session will stall if user moves to a different browser tab, a refresh is required to interact with the app again.

---

## Author

**Ahmad Hafizuddin bin Rahmat** (A23MJ5070)  
Bachelor of Computer Science (Software Engineering) with Honours  
Universiti Teknologi Malaysia  
Supervisor: Dr. Neo Chin Chea  
Academic Session: 2025/2026
