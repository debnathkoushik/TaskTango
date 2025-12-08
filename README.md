# TaskTango - Time Tracking Application

A modern, full-stack time tracking application built with SvelteKit and Supabase. Track your tasks, manage time sessions, and monitor productivity with an intuitive interface.

## 🚀 Features

- **User Authentication** - Secure email/password authentication with session management
- **Task Management** - Create, read, update, and delete tasks
- **Time Tracking** - Start/stop timers on tasks with live countdown
- **Session History** - View detailed history of all time tracking sessions
- **Task Organization** - Organize tasks by status (pending, in-progress, completed, archived)
- **Real-time Updates** - Live timer display with automatic updates
- **Bulk Operations** - Select and delete multiple tasks at once
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Type Safety** - Full TypeScript support throughout the application

## 🛠️ Tech Stack

### Frontend

- **[SvelteKit](https://kit.svelte.dev/)** - Full-stack web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Svelte](https://svelte.dev/)** - Reactive UI framework
- **CSS3** - Custom styling with responsive design

### Backend & Database

- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

### Deployment

- **[Vercel](https://vercel.com/)** - Hosting and deployment platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **pnpm** or **yarn** - Package manager
- **Git** - Version control
- **Supabase Account** - [Sign up](https://supabase.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/task-tango.git
cd task-tango
```

### 2. Install Dependencies

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

Or using yarn:

```bash
yarn install
```

### 3. Set Up Supabase

#### 3.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details:
   - Project name (e.g., "TaskTango")
   - Database password (save this securely)
   - Region (choose closest to you)
4. Click "Create new project"
5. Wait for the project to be set up (~2 minutes)

#### 3.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)

#### 3.3 Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `database/schema.sql` from this repository
4. Click "Run" to execute the SQL

This will create:

- `tasks` table
- `time_sessions` table
- Row Level Security (RLS) policies
- Indexes for performance

#### 3.4 Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to: `http://localhost:5173` (for development)
5. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - Your production URL when ready (e.g., `https://yourdomain.com/auth/callback`)

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Or create `.env` manually with:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Replace the values with your actual Supabase credentials from step 3.2

### 5. Start Development Server

```bash
npm run dev
```

Or with other package managers:

```bash
pnpm dev
# or
yarn dev
```

The application will be available at: **http://localhost:5173**

### 6. Create Your First Account

1. Open http://localhost:5173 in your browser
2. Click "Sign up"
3. Enter your email and password
4. You'll be logged in automatically (if email confirmation is disabled)
5. Start creating tasks and tracking time!

## 📁 Project Structure

```
task-tango/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   │   ├── Modal.svelte
│   │   │   ├── TaskCard.svelte
│   │   │   ├── TaskForm.svelte
│   │   │   └── Timer.svelte
│   │   ├── server/              # Server-side utilities
│   │   │   └── supabaseServer.js
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── supabaseClient.ts    # Client-side Supabase instance
│   │
│   ├── routes/                  # SvelteKit routes
│   │   ├── auth/
│   │   │   └── callback/        # OAuth callback handler
│   │   ├── dashboard/           # Main dashboard
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts
│   │   ├── login/               # Login page
│   │   ├── signup/              # Sign up page
│   │   ├── forgot-password/     # Password reset
│   │   ├── +layout.svelte       # Root layout
│   │   ├── +layout.server.ts    # Root layout server
│   │   └── +page.server.ts      # Root redirect
│   │
│   ├── hooks.server.js          # SvelteKit server hooks
│   └── app.html                 # HTML template
│
├── database/
│   └── schema.sql               # Database schema and RLS policies
│
├── static/                      # Static assets
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
├── svelte.config.js             # SvelteKit configuration
├── tsconfig.json                # TypeScript configuration
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

## 🎮 Usage

### Creating a Task

1. Click the **"+ New Task"** button in the dashboard
2. Enter task title (required) and description (optional)
3. Click **"Create Task"**

### Starting a Timer

1. Find your task in the list
2. Click the **"▶ Start"** button
3. The timer will begin counting in real-time
4. Task status automatically changes to "in_progress"

### Stopping a Timer

1. Click the **"⏹ Stop"** button on the active task
2. Duration is calculated and saved automatically
3. Session is added to the task's history

### Viewing Session History

1. Click the session count button (e.g., "▶ 3 sessions")
2. Expand to see all time tracking sessions
3. View start time, end time, and duration for each session

### Editing a Task

1. Select a task using the checkbox
2. Click **"✏️ Edit Selected"** (only works with one task selected)
3. Modify title, description, or status
4. Click **"Update Task"**

### Deleting Tasks

1. Select one or more tasks using checkboxes
2. Click **"🗑️ Delete Selected"**
3. Confirm deletion in the popup

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Server-side authentication** - Secure session management
- **HTTPS in production** - Encrypted connections
- **httpOnly cookies** - Protection against XSS attacks
- **CSRF protection** - Built-in SvelteKit security

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects SvelteKit

3. **Add Environment Variables**

   - In Vercel project settings → Environment Variables
   - Add:
     - `PUBLIC_SUPABASE_URL` = your Supabase URL
     - `PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - Apply to Production, Preview, and Development

4. **Update Supabase Settings**

   - In Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to:
     - Site URL: `https://your-project.vercel.app`
     - Redirect URLs: `https://your-project.vercel.app/auth/callback`

5. **Deploy**
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run check

# Run type checking in watch mode
npm run check:watch

# Format code
npm run format

# Lint code
npm run lint
```

### Code Style

- **TypeScript** - Full type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Svelte best practices** - Component composition

## 🐛 Troubleshooting

### "Auth session missing!" error

**Solution:** Make sure your `.env` file has the correct Supabase credentials and restart the dev server.

### Can't create tasks

**Solution:** Check browser console for errors. Ensure:

1. You're logged in
2. Database migrations were run
3. RLS policies are enabled

### Timer not updating

**Solution:** Refresh the page. The timer should start automatically.

### Build fails on Vercel

**Solution:**

1. Check environment variables are set in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Check Vercel build logs for specific errors

### Session not persisting

**Solution:**

1. Clear browser cookies
2. Log out and log in again
3. Check Supabase authentication settings

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**

- GitHub: [@debnathkoushik](https://github.com/debnathkoushik)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Amazing full-stack framework
- [Supabase](https://supabase.com/) - Powerful backend infrastructure
- [Vercel](https://vercel.com/) - Seamless deployment platform

---

**Built with ❤️ using SvelteKit and Supabase**
