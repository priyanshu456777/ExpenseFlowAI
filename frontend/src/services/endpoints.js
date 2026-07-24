import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, password) => api.patch(`/auth/reset-password/${token}`, { password }).then((r) => r.data),
  updatePassword: (data) => api.patch('/auth/update-password', data).then((r) => r.data),
};

export const userService = {
  updateProfile: (formData) =>
    api
      .patch('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  deleteAccount: (password) => api.delete('/users/me', { data: { password } }).then((r) => r.data),
  getPublicProfile: (id) => api.get(`/users/${id}`).then((r) => r.data),
  getFavorites: () => api.get('/users/favorites').then((r) => r.data),
  toggleFavorite: (memberId) => api.patch(`/users/favorites/${memberId}`).then((r) => r.data),
};

export const groupService = {
  create: (formData) =>
    api.post('/groups', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  getMyGroups: () => api.get('/groups').then((r) => r.data),
  getById: (id) => api.get(`/groups/${id}`).then((r) => r.data),
  update: (id, formData) =>
    api.patch(`/groups/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  delete: (id) => api.delete(`/groups/${id}`).then((r) => r.data),
  inviteByEmail: (id, email) => api.post(`/groups/${id}/invite`, { email }).then((r) => r.data),
  getByInviteCode: (code) => api.get(`/groups/invite/${code}`).then((r) => r.data),
  joinByCode: (inviteCode) => api.post('/groups/join', { inviteCode }).then((r) => r.data),
  updateMemberRole: (id, memberId, role) => api.patch(`/groups/${id}/members/${memberId}/role`, { role }).then((r) => r.data),
  removeMember: (id, memberId) => api.delete(`/groups/${id}/members/${memberId}`).then((r) => r.data),
  transferOwnership: (id, memberId) => api.patch(`/groups/${id}/transfer-ownership/${memberId}`).then((r) => r.data),
  togglePin: (id) => api.patch(`/groups/${id}/pin`).then((r) => r.data),
};

export const expenseService = {
  create: (formData) =>
    api.post('/expenses', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  getGroupExpenses: (groupId, params) => api.get(`/expenses/group/${groupId}`, { params }).then((r) => r.data),
  getById: (id) => api.get(`/expenses/${id}`).then((r) => r.data),
  update: (id, formData) =>
    api.patch(`/expenses/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  delete: (id) => api.delete(`/expenses/${id}`).then((r) => r.data),
};

export const settlementService = {
  getBalances: (groupId) => api.get(`/settlements/group/${groupId}/balances`).then((r) => r.data),
  getSuggestions: (groupId) => api.get(`/settlements/group/${groupId}/suggestions`).then((r) => r.data),
  getHistory: (groupId, params) => api.get(`/settlements/group/${groupId}/history`, { params }).then((r) => r.data),
  record: (data) => api.post('/settlements', data).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/settlements/${id}/status`, { status }).then((r) => r.data),
};

export const notificationService = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.patch('/notifications/read-all').then((r) => r.data),
  delete: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
};

export const analyticsService = {
  getDashboardStats: () => api.get('/analytics/dashboard').then((r) => r.data),
  getMonthlySpending: (groupId, months) => api.get(`/analytics/group/${groupId}/monthly`, { params: { months } }).then((r) => r.data),
  getCategoryBreakdown: (groupId, params) => api.get(`/analytics/group/${groupId}/categories`, { params }).then((r) => r.data),
  getWeeklyTrend: (groupId, weeks) => api.get(`/analytics/group/${groupId}/weekly-trend`, { params: { weeks } }).then((r) => r.data),
  getTopContributors: (groupId, limit) => api.get(`/analytics/group/${groupId}/top-contributors`, { params: { limit } }).then((r) => r.data),
  getHeatmap: (groupId, year) => api.get(`/analytics/group/${groupId}/heatmap`, { params: { year } }).then((r) => r.data),
};

export const insightService = {
  getOverview: () => api.get('/insights/overview').then((r) => r.data),
  getGroupInsights: (groupId) => api.get(`/insights/group/${groupId}`).then((r) => r.data),
};

export const invitationService = {
  getByToken: (token) => api.get(`/invitations/${token}`).then((r) => r.data),
  accept: (token) => api.post(`/invitations/${token}/accept`).then((r) => r.data),
  decline: (token) => api.post(`/invitations/${token}/decline`).then((r) => r.data),
};

export const activityService = {
  getGroupActivity: (groupId, params) => api.get(`/activity/group/${groupId}`, { params }).then((r) => r.data),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  listUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  toggleSuspension: (id) => api.patch(`/admin/users/${id}/suspend`).then((r) => r.data),
  listGroups: (params) => api.get('/admin/groups', { params }).then((r) => r.data),
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (data) => api.patch('/admin/settings', data).then((r) => r.data),
};
