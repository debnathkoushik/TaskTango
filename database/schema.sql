-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create time_sessions table
CREATE TABLE IF NOT EXISTS time_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_task_id ON time_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON time_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON time_sessions(user_id, end_time) WHERE end_time IS NULL;

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;

-- Policies on tasks
CREATE POLICY "users_can_view_own_tasks" ON tasks FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_can_insert_own_tasks" ON tasks FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_can_update_own_tasks" ON tasks FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_can_delete_own_tasks" ON tasks FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Policies on time_sessions
CREATE POLICY "users_can_view_own_sessions" ON time_sessions FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_can_insert_own_sessions" ON time_sessions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_can_update_own_sessions" ON time_sessions FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_can_delete_own_sessions" ON time_sessions FOR DELETE USING ((SELECT auth.uid()) = user_id);