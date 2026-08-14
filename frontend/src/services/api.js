const API_BASE = import.meta.env.VITE_API_BASE;

function getToken() {
  return localStorage.getItem('sanos_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('sanos_token', token);
  } else {
    localStorage.removeItem('sanos_token');
  }
}

export function clearToken() {
  localStorage.removeItem('sanos_token');
}

async function request(endpoint, options = {}) {
  const { body, method = 'GET', headers = {}, auth = true } = options;

  const isFormData = body instanceof FormData;

  const config = {
    method,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...headers,
    },
  };

  if (auth) {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (res.status === 401) {
    clearToken();
    const event = new CustomEvent('auth:expired');
    window.dispatchEvent(event);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || data.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE.replace('/api', '');
  return `${baseUrl}${path}`;
}

export const uploadApi = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/upload', { method: 'POST', body: formData });
  }
};

// ─── Auth ───────────────────────────────────────────────
export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body, auth: false }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body, auth: false }),
};

// ─── Users ──────────────────────────────────────────────
export const usersApi = {
  getMe: () => request('/users/me'),
  updateMe: (body) => request('/users/me', { method: 'PATCH', body }),
  list: (params = '') => request(`/users${params ? `?${params}` : ''}`),
  getById: (id) => request(`/users/${id}`),
  updateById: (id, body) => request(`/users/${id}`, { method: 'PATCH', body }),
  approveInstructor: (id) => request(`/users/${id}/approve-instructor`, { method: 'POST' }),
  rejectInstructor: (id) => request(`/users/${id}/reject-instructor`, { method: 'POST' }),
};

// ─── Packages ───────────────────────────────────────────
export const packagesApi = {
  list: () => request('/packages', { auth: false }),
  getByCode: (code) => request(`/packages/${code}`, { auth: false }),
  create: (body) => request('/packages', { method: 'POST', body }),
  update: (id, body) => request(`/packages/${id}`, { method: 'PATCH', body }),
  delete: (id) => request(`/packages/${id}`, { method: 'DELETE' }),
};

// ─── Bookings ───────────────────────────────────────────
export const bookingsApi = {
  list: (params = '') => request(`/bookings${params ? `?${params}` : ''}`),
  create: (body) => request('/bookings', { method: 'POST', body }),
  getById: (id) => request(`/bookings/${id}`),
  update: (id, body) => request(`/bookings/${id}`, { method: 'PATCH', body }),
  confirm: (id) => request(`/bookings/${id}/confirm`, { method: 'POST' }),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'POST' }),
};

// ─── Payments (Stripe) ──────────────────────────────────
export const paymentsApi = {
  createCheckoutSession: (body) => request('/payments/create-checkout-session', { method: 'POST', body }),
};

// ─── Contact ────────────────────────────────────────────
export const contactApi = {
  submit: (body) => request('/contact', { method: 'POST', body, auth: false }),
  list: (params = '') => request(`/contact${params ? `?${params}` : ''}`),
  update: (id, body) => request(`/contact/${id}`, { method: 'PATCH', body }),
};

// ─── Dashboard ──────────────────────────────────────────
export const dashboardApi = {
  learner: () => request('/dashboard/learner'),
  updateLearnerProgress: (body) => request('/dashboard/learner/progress', { method: 'PATCH', body }),
  instructor: () => request('/dashboard/instructor'),
  admin: () => request('/dashboard/admin'),
  completeLesson: (id) => request(`/dashboard/instructor/lessons/${id}/complete`, { method: 'POST' }),
};

// ─── Audit Logs ────────────────────────────────────────
export const auditLogsApi = {
  list: (params = '') => request(`/audit-logs${params ? `?${params}` : ''}`),
};

// ─── Availability ───────────────────────────────────────
export const availabilityApi = {
  get: (params = '') => request(`/availability${params ? `?${params}` : ''}`, { auth: false }),
};

// ─── Vehicle Types ──────────────────────────────────────
export const vehicleTypesApi = {
  list: () => request('/vehicle-types', { auth: false }),
  create: (body) => request('/vehicle-types', { method: 'POST', body }),
  update: (id, body) => request(`/vehicle-types/${id}`, { method: 'PATCH', body }),
};

// ─── Content (CMS) ─────────────────────────────────────
export const contentApi = {
  list: () => request('/content', { auth: false }),
  getBySlug: (slug) => request(`/content/${slug}`, { auth: false }),
  create: (body) => request('/content', { method: 'POST', body }),
  update: (id, body) => request(`/content/${id}`, { method: 'PATCH', body }),
};

// ─── Instructors ────────────────────────────────────────
export const instructorsApi = {
  list: () => request('/instructors', { auth: false }),
  nearby: (params = '') => request(`/instructors/nearby${params ? `?${params}` : ''}`, { auth: false }),
};

// ─── Matching ───────────────────────────────────────────
export const matchingApi = {
  nearby: (params = '') => request(`/matching/nearby${params ? `?${params}` : ''}`, { auth: false }),
  routeDistance: (body) => request('/matching/route-distance', { method: 'POST', body, auth: false }),
};

// ─── Training Requests ──────────────────────────────────
export const trainingRequestsApi = {
  list: (params = '') => request(`/training-requests${params ? `?${params}` : ''}`),
  getById: (id) => request(`/training-requests/${id}`),
  create: (body) => request('/training-requests', { method: 'POST', body }),
  accept: (id, body = {}) => request(`/training-requests/${id}/accept`, { method: 'POST', body }),
  reject: (id, body = {}) => request(`/training-requests/${id}/reject`, { method: 'POST', body }),
  moreInfo: (id, body) => request(`/training-requests/${id}/more-info`, { method: 'POST', body }),
};

// ─── Learner Documents ──────────────────────────────────
export const learnerDocumentsApi = {
  create: (body) => request('/learner-documents', { method: 'POST', body }),
  getMine: () => request('/learner-documents/me'),
  updateStatus: (id, body) => request(`/learner-documents/${id}/status`, { method: 'PATCH', body }),
};

// ─── Assignments ────────────────────────────────────────
export const assignmentsApi = {
  getMine: () => request('/assignments/me'),
  createTransferRequest: (id, body) => request(`/assignments/${id}/transfer-request`, { method: 'POST', body }),
  listTransferRequests: () => request('/assignments/transfer-requests'),
};

// ─── Transfer Requests ──────────────────────────────────
export const transferRequestsApi = {
  list: () => request('/transfer-requests'),
  getById: (id) => request(`/transfer-requests/${id}`),
  approve: (id, body = {}) => request(`/transfer-requests/${id}/approve`, { method: 'POST', body }),
  reject: (id, body = {}) => request(`/transfer-requests/${id}/reject`, { method: 'POST', body }),
  complete: (id, body = {}) => request(`/transfer-requests/${id}/complete`, { method: 'POST', body }),
};

// ─── Health ─────────────────────────────────────────────
export const healthApi = {
  check: () => request('/health', { auth: false }),
};
