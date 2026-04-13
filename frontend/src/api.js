const runtimeBase = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : 'http://localhost:4000';

const envBase = import.meta.env.VITE_API_URL;

const BASE = 'http://127.0.0.1:4000';

async function request(path, opts = {}) {
  const url = `${BASE}${path}`;
  const headers = opts.headers ? { ...opts.headers } : {};
  if (!(headers['Content-Type'] || headers['content-type'])) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (!opts.skipAuth && token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const response = await fetch(url, { ...opts, headers });
    const text = await response.text();
    let payload;
    try { payload = JSON.parse(text); }
    catch (e) { payload = text; }

    if (!response.ok) {
      if (payload && typeof payload === 'object' && payload.error) return payload;
      return { error: `Request failed (${response.status})` };
    }

    return payload;
  } catch (e) {
    return { error: `Unable to reach backend at ${BASE}. Please ensure backend is running on port 4000.` };
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function sendRegisterOtp({ email, phone }) {
  return request('/api/auth/register-init', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, phone }),
  });
}

export async function registerUser({ name, email, phone, password, platform, otp }) {
  return request('/api/auth/register', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ name, email, phone, password, platform, otp }),
  });
}

export async function adminChangeCredentials(updates) {
  return request('/api/auth/admin/change', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function loginUser({ identifier, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ identifier, password }),
  });
}

export async function socialLogin({ email, name }) {
  return request('/api/auth/social', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, name }),
  });
}

export async function verifyOtp({ identifier, otp }) {
  return request('/api/auth/verify-otp', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ identifier, otp }),
  });
}

export async function getCurrentUser() {
  return request('/api/auth/me', { method: 'GET' });
}

export async function forgotPassword({ email }) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ email, otp, newPassword }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

export async function updateUser(updates) {
  return request('/api/auth/me', { method: 'PUT', body: JSON.stringify(updates) });
}

// ── Plans ─────────────────────────────────────────────────────────────────────
export async function getPlans() {
  return request('/api/plans', { method: 'GET' });
}

export async function getPlanById(id) {
  return request(`/api/plans/${id}`, { method: 'GET' });
}

// ── Subscriptions / Payments ──────────────────────────────────────────────────
/**
 * Subscribe to a plan.
 * @param {object} payload - { planId, method, upiId?, txnReference? }
 *   method: "FREE_TRIAL" | "UPI" | "CARD" | "WALLET"
 */
export async function buyPlan({ planId, method, upiId, txnReference }) {
  return request('/api/subscriptions/buy', {
    method: 'POST',
    body: JSON.stringify({ planId, method, upiId: upiId || null, txnReference: txnReference || null }),
  });
}

export async function getMySubscriptions() {
  return request('/api/subscriptions/my', { method: 'GET' });
}

export async function getPaymentHistory() {
  return request('/api/subscriptions/payments', { method: 'GET' });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function getDashboardSummary() {
  return request('/api/subscriptions/dashboard', { method: 'GET' });
}

// ── Razorpay ──────────────────────────────────────────────────────────────────
export async function getRazorpayKey() {
  return request('/api/payments/razorpay/key', { method: 'GET' });
}
export async function createRazorpayOrder(amount) {
  return request('/api/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ amount }) });
}
export async function verifyRazorpayPayment(data) {
  return request('/api/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(data) });
}

// ── User queries / chat support ─────────────────────────────────────────────────
export async function postQuery(question) {
  return request('/api/queries', { method: 'POST', body: JSON.stringify({ question }) });
}
export async function claimPayment(id) {
  return request(`/api/payments/${id}/claim`, { method: 'POST' });
}
export async function getMyQueries() {
  return request('/api/queries/my', { method: 'GET' });
}
export async function userClearChat() {
  return request('/api/queries/my/clear', { method: 'DELETE' });
}
export async function userMarkQueriesAsRead() {
  return request('/api/queries/my/mark-read', { method: 'POST' });
}

// ── Admin endpoints ──────────────────────────────────────────────────────────
export async function adminListUsers() {
  return request('/api/admin/users', { method: 'GET' });
}
export async function adminDeleteUser(id) {
  return request(`/api/admin/users/${id}`, { method: 'DELETE' });
}
export async function adminUpdateUser(id, updates) {
  return request(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function adminListPlans() {
  return request('/api/admin/plans', { method: 'GET' });
}
export async function adminUpdatePlan(id, updates) {
  return request(`/api/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}
export async function adminCreatePlan(plan) {
  return request('/api/admin/plans', { method: 'POST', body: JSON.stringify(plan) });
}

export async function adminListPayments() {
  return request('/api/admin/payments', { method: 'GET' });
}
export async function adminApprovePayment(id) {
  return request(`/api/admin/payments/${id}/approve`, { method: 'PUT' });
}
export async function adminRejectPayment(id) {
  return request(`/api/admin/payments/${id}/reject`, { method: 'PUT' });
}
export async function adminDeletePayment(id) {
  return request(`/api/admin/payments/${id}`, { method: 'DELETE' });
}

export async function adminListQueries() {
  return request('/api/admin/queries', { method: 'GET' });
}
export async function adminReplyQuery(id, body) {
  return request(`/api/admin/queries/${id}/reply`, { method: 'PUT', body: JSON.stringify(body) });
}
export async function adminClearUserChat(userId) {
  return request(`/api/admin/queries/user/${userId}/clear`, { method: 'DELETE' });
}

// ── Partners ──────────────────────────────────────────────────────────────────
export async function getPartners() {
  return request('/api/partners', { method: 'GET' });
}

export async function adminAddPartner(partner) {
  return request('/api/admin/partners', { method: 'POST', body: JSON.stringify(partner) });
}

export async function adminDeletePartner(id) {
  return request(`/api/admin/partners/${id}`, { method: 'DELETE' });
}

// Admin Wallet
export async function adminGetWallet() {
  return request('/api/admin/wallet', { method: 'GET' });
}

export async function submitClaimRequest(data) {
  return request('/api/claims/requests', { method: 'POST', body: JSON.stringify(data) });
}
export async function getMyClaimRequests() {
  return request('/api/claims/requests/my', { method: 'GET' });
}
export async function claimRequestPayout(id) {
  return request(`/api/claims/requests/${id}/claim`, { method: 'POST' });
}
export async function adminListClaimRequests() {
  return request('/api/claims/requests/admin/all', { method: 'GET' });
}
export async function adminApproveClaimRequest(id) {
  return request(`/api/claims/requests/admin/${id}/approve`, { method: 'PUT' });
}
export async function adminRejectClaimRequest(id) {
  return request(`/api/claims/requests/admin/${id}/reject`, { method: 'PUT' });
}

// Notifications
export async function getMyNotifications() {
  return request('/api/notifications', { method: 'GET' });
}
export async function markNotificationAsRead(id) {
  return request(`/api/notifications/${id}/read`, { method: 'PUT' });
}

// ── AI Model Endpoints ────────────────────────────────────────────────────────

/** AI dynamic premium calculation */
export async function getAIPremium(planName = 'Smart') {
  return request(`/api/ai/premium?planName=${encodeURIComponent(planName)}`, { method: 'GET' });
}

/** AI risk assessment for authenticated user */
export async function getAIRisk() {
  return request('/api/ai/risk', { method: 'GET' });
}

/** AI fraud detection for a claim */
export async function detectFraud(data) {
  return request('/api/ai/fraud/detect', { method: 'POST', body: JSON.stringify(data) });
}

/** AI parametric trigger check for user location */
export async function checkParametric() {
  return request('/api/ai/parametric/check', { method: 'GET' });
}

/** AI weather data for user location */
export async function getAIWeather() {
  return request('/api/ai/weather', { method: 'GET' });
}

/** Full AI insights dashboard */
export async function getAIDashboard() {
  return request('/api/ai/dashboard', { method: 'GET' });
}

/** AI plan recommendation */
export async function getAIPlanRecommendation() {
  return request('/api/ai/plans/recommend', { method: 'GET' });
}

/** Fraud prevention statistics (no auth needed) */
export async function getFraudStats() {
  return request('/api/ai/fraud/stats', { method: 'GET' });
}

/** All parametric triggers across India (no auth needed) */
export async function getAllTriggers() {
  return request('/api/ai/parametric/triggers', { method: 'GET' });
}

/** Admin weather report — all active user locations */
export async function adminGetWeatherReport() {
  return request('/api/ai/admin/weather-report', { method: 'GET' });
}

export default {
  registerUser, loginUser, socialLogin, verifyOtp, getCurrentUser, updateUser,
  forgotPassword, resetPassword,
  getPlans, getPlanById,
  buyPlan, getMySubscriptions, getPaymentHistory,
  getDashboardSummary,
  postQuery, getMyQueries,
  adminChangeCredentials,
  adminListUsers, adminDeleteUser, adminUpdateUser,
  adminListPlans, adminUpdatePlan, adminCreatePlan,
  adminListPayments, adminApprovePayment, adminRejectPayment, adminDeletePayment,
  adminListQueries, adminReplyQuery, adminClearUserChat, userClearChat, userMarkQueriesAsRead,
  claimPayment,
  submitClaimRequest, getMyClaimRequests, claimRequestPayout,
  adminListClaimRequests, adminApproveClaimRequest, adminRejectClaimRequest,
  adminGetWallet, adminGetWeatherReport,
  getMyNotifications, markNotificationAsRead,
  getPartners, adminAddPartner, adminDeletePartner,
  // AI endpoints
  getAIPremium, getAIRisk, detectFraud, checkParametric,
  getAIWeather, getAIDashboard, getAIPlanRecommendation,
  getFraudStats, getAllTriggers,
};
