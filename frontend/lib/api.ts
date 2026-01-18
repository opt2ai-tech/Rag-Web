const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Room {
  id: number;
  name: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  amenities: string[];
  images: string[];
  available: boolean;
}

export interface Booking {
  id?: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guest_count: number;
  guest_name: string;
  guest_email: string;
  status?: string;
}

export interface ChatMessage {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Rooms
  async getRooms(availableOnly: boolean = false): Promise<Room[]> {
    return this.request(`/rooms/?available_only=${availableOnly}`);
  }

  async getRoom(id: number): Promise<Room> {
    return this.request(`/rooms/${id}`);
  }

  async checkAvailability(roomId: number, checkIn: string, checkOut: string) {
    return this.request(
      `/rooms/${roomId}/availability?check_in=${checkIn}&check_out=${checkOut}`
    );
  }

  // Bookings
  async createBooking(booking: Booking) {
    return this.request('/bookings/', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async getBookings() {
    return this.request('/bookings/');
  }

  async cancelBooking(id: number) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // Chat
  async sendChatMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    return this.request('/chat/', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  async getChatHistory(sessionId: string) {
    return this.request(`/chat/history/${sessionId}`);
  }

  // Admin - Rooms
  async createRoom(room: Omit<Room, 'id' | 'created_at'>) {
    return this.request('/rooms/', {
      method: 'POST',
      body: JSON.stringify(room),
    });
  }

  async updateRoom(id: number, room: Partial<Room>) {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(room),
    });
  }

  async deleteRoom(id: number) {
    return this.request(`/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Documents
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }

  async getDocuments() {
    return this.request('/documents/');
  }

  async deleteDocument(id: number) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getConversations() {
    return this.request('/documents/conversations');
  }

  // Admin - Stats
  async getDashboardStats() {
    return this.request('/admin/stats');
  }
}

export const api = new ApiClient();
