export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'manager' | 'telephonist';
  assigned_lines: string[];
  telegram_chat_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SIPLine {
  id: string;
  name: string;
  number: string;
  color: string;
  description?: string;
  assigned_user_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ErrorTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Ticket {
  id: string;
  sip_line_id: string;
  created_by_id: string;
  assigned_to_id?: string;
  error_template_id: string;
  title: string;
  description?: string;
  status: 'new' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: Date;
}

export interface Statistics {
  total_lines: number;
  active_lines: number;
  total_tickets: number;
  completed_tickets: number;
  average_resolution_time: number;
  tickets_by_status: Record<string, number>;
  tickets_by_priority: Record<string, number>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
