const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Dev-time helper: show which API base is used (helps when debugging proxy vs explicit URL)
if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[api] API_BASE_URL =', API_BASE_URL);
}

interface ApiResponse<T> {
    data?: T;
    error?: string;
    errors?: Array<{ msg: string; param: string }>;
    status?: number;
}

class ApiClient {
    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            let data: any = null;
            try {
                data = await response.json();
            } catch (parseErr) {
                const text = await response.text();
                data = { message: text || 'Non-JSON response from server' };
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.warn('API non-JSON response', { endpoint, text });
                }
            }

            if (!response.ok) {
                console.error('API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                });

                // Format validation errors for better display
                let errorMessage = data.error || data.message || `Request failed: ${response.statusText}`;
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    const errorMessages = data.errors.map((err: any) =>
                        err.msg || `${err.param}: ${err.msg || 'Invalid value'}`
                    ).join(', ');
                    errorMessage = errorMessages;
                }

                return {
                    error: errorMessage,
                    errors: data.errors,
                    status: response.status,
                };
            }

            return { data, status: response.status };
        } catch (error) {
            console.error('Network Error:', error);
            return {
                error: error instanceof Error ? error.message : 'Network error',
                status: 0, // 0 = network/abort error (no HTTP response)
            };
        }
    }

    // Auth endpoints
    async signup(userData: any) {
        return this.request<{ token: string; user: any }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(username: string, password: string, role: 'student' | 'faculty') {
        return this.request<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password, role }),
        });
    }

    async getCurrentUser(options?: { signal?: AbortSignal }) {
        return this.request<{ user: any }>('/auth/me', {
            method: 'GET',
            signal: options?.signal,
        });
    }

    async updateProfile(updates: any) {
        return this.request<{ user: any }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async changePassword(currentPassword: string, newPassword: string) {
        return this.request<{ message: string }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    async uploadAvatar(formData: FormData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            return { error: data.message || 'Failed to upload avatar', data: null };
        }
        return { error: null, data };
    }

    // Complaint endpoints
    async getComplaints(params?: {
        status?: string;
        category?: string;
        page?: number;
        limit?: number;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        return this.request<{
            complaints: any[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(`/complaints${query ? `?${query}` : ''}`, {
            method: 'GET',
        });
    }

    async getComplaint(id: string) {
        return this.request<{ complaint: any }>(`/complaints/${id}`, {
            method: 'GET',
        });
    }

    async createComplaint(complaintData: any) {
        return this.request<{ complaint: any }>('/complaints', {
            method: 'POST',
            body: JSON.stringify(complaintData),
        });
    }

    async updateComplaint(id: string, updates: any) {
        return this.request<{ complaint: any }>(`/complaints/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async updateComplaintStatus(
        id: string,
        status: string,
        note?: string,
        assignedTo?: string,
        clarificationMessage?: string
    ) {
        return this.request<{ complaint: any }>(`/complaints/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, note, assignedTo, clarificationMessage }),
        });
    }

    async deleteComplaint(id: string) {
        return this.request<{ message: string }>(`/complaints/${id}`, {
            method: 'DELETE',
        });
    }

    // User endpoints
    async getUsers(params?: { role?: string; page?: number; limit?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.append('role', params.role);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        return this.request<{
            users: any[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(`/users${query ? `?${query}` : ''}`, {
            method: 'GET',
        });
    }

    async getUser(id: string) {
        return this.request<{ user: any }>(`/users/${id}`, {
            method: 'GET',
        });
    }

    async updateUser(id: string, updates: any) {
        return this.request<{ user: any }>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteUser(id: string) {
        return this.request<{ message: string }>(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    async patch<T = any>(endpoint: string, body?: any) {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async post<T = any>(endpoint: string, body?: any) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
}

export const apiClient = new ApiClient();

