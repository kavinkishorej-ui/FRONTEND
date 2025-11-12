const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// normalize base URL: remove trailing slash if present
function normalizeBaseUrl(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

const API_URL = normalizeBaseUrl(RAW_API_URL);

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // safe json parse: if there's no JSON body, fall back to empty object
    let data: any = {};
    try {
      data = await response.json();
    } catch (e) {
      // keep data as {} when response has no JSON
    }

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async login(role: string, username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async forgotPassword(role: string, identifier: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ role, identifier }),
    });
  }

  async verifyOtp(role: string, identifier: string, otp: string, newPassword: string) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ role, identifier, otp, newPassword }),
    });
  }

  async getSession() {
    return this.request('/auth/session');
  }

  async getDepartments() {
    return this.request('/admin/departments');
  }

  async createDepartment(name: string) {
    return this.request('/admin/departments', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getTeachers() {
    return this.request('/admin/teachers');
  }

  async createTeacher(data: any) {
    return this.request('/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacher(id: string, data: any) {
    return this.request(`/admin/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacher(id: string) {
    return this.request(`/admin/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getTeacherDashboard() {
    return this.request('/teacher/dashboard');
  }

  async getStudents() {
    return this.request('/teacher/students');
  }

  async createStudent(data: any) {
    return this.request('/teacher/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateStudents(data: any) {
    return this.request('/teacher/students/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkUploadStudents(students: any[]) {
    return this.request('/teacher/students/bulk-upload', {
      method: 'POST',
      body: JSON.stringify({ students }),
    });
  }

  async updateStudent(id: string, data: any) {
    return this.request(`/teacher/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: string) {
    return this.request(`/teacher/students/${id}`, {
      method: 'DELETE',
    });
  }

  async getSubjects() {
    return this.request('/teacher/subjects');
  }

  async createSubject(code: string, name: string) {
    return this.request('/teacher/subjects', {
      method: 'POST',
      body: JSON.stringify({ code, name }),
    });
  }

  async addMarks(data: any) {
    return this.request('/teacher/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadMarks(marks: any[]) {
    return this.request('/teacher/marks/upload', {
      method: 'POST',
      body: JSON.stringify({ marks }),
    });
  }

  async getStudentProfile() {
    return this.request('/student/profile');
  }

  async getStudentMarks(exam?: string) {
    const query = exam ? `?exam=${encodeURIComponent(exam)}` : '';
    return this.request(`/student/marks${query}`);
  }

  async getStudentSubjects() {
    return this.request('/student/subjects');
  }

  async getStudentSummary() {
    return this.request('/student/summary');
  }

  async updateStudentProfile(data: any) {
    return this.request('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_URL);
