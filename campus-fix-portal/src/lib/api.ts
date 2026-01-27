// API configuration - base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// Student API
export const studentApi = {
  submitTicket: (data: SubmitTicketRequest) =>
    apiRequest<SubmitTicketResponse>('/tickets/submit', { method: 'POST', body: data }),

  getMyTickets: (email: string) =>
    apiRequest<Ticket[]>(`/student/tickets?student_email=${encodeURIComponent(email)}`),
};

// Maintainer API
export const maintainerApi = {
  getTickets: () => apiRequest<Ticket[]>('/maintainer/tickets'),

  // Backend doesn't have a single ticket endpoint, so we fetch all and find one
  getTicket: async (id: number): Promise<Ticket> => {
    const tickets = await apiRequest<Ticket[]>('/maintainer/tickets');
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  },

  assignTicket: (id: number, maintainerEmail: string) =>
    apiRequest(`/maintainer/tickets/${id}/assign`, {
      method: 'POST',
      body: { maintainer_email: maintainerEmail },
    }),

  updateStatus: (id: number, status: string) =>
    apiRequest<Ticket>(`/maintainer/tickets/${id}/status`, { method: 'POST', body: { status } }),

  getChecklist: (id: number) => apiRequest<ChecklistItem[]>(`/maintainer/tickets/${id}/checklist`),

  toggleChecklistItem: (itemId: number) =>
    apiRequest<ChecklistItem>(`/maintainer/checklist/${itemId}/toggle`, { method: 'POST' }),

  addWorkLog: (id: number, maintainerEmail: string, action: string, notes: string) =>
    apiRequest(`/maintainer/tickets/${id}/log`, {
      method: 'POST',
      body: {
        maintainer_email: maintainerEmail,
        action,
        notes,
      },
    }),
};

// Types
export interface SubmitTicketRequest {
  student_name: string;
  student_email: string;
  complaint: string;
}

export interface SubmitTicketResponse {
  ticket_id: number;
  category: string | null;
  priority: string | null;
  status: string;
  valid: boolean;
  message: string;
  confidence: number;
  decision_reason: string | null;
}

export interface Ticket {
  id: number;
  complaint_text: string;
  category: string | null;
  priority: string | null;
  status: string;
  valid: boolean;
  confidence: number;
  assigned_to: number | null;
  student_id: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: number;
  ticket_id: number;
  task_name: string;
  is_completed: boolean;
}

export interface WorkLog {
  id: number;
  ticket_id: number;
  maintainer_id: number;
  action: string;
  notes: string;
  timestamp: string;
}
