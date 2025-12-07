export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null | undefined;
  status: "pending" | "in_progress" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  time_sessions?: TimeSession[];
}

export interface TimeSession {
  id: string;
  user_id: string;
  task_id: string;
  start_time: string;
  end_time: string | null | undefined;
  duration_seconds: number | null | undefined;
  notes: string | null | undefined;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface TaskWithSessions extends Task {
  time_sessions: TimeSession[];
}

// Form data types
export interface TaskFormData {
  title: string;
  description?: string;
  status?: Task["status"];
}

// Component event detail types
export interface TaskCreatedEvent {
  detail: Task;
}

export interface TaskUpdatedEvent {
  detail: Task;
}

export interface SessionStartedEvent {
  detail: TimeSession;
}

export interface ToggleSelectionEvent {
  detail: string; // task id
}
