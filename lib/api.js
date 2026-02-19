/**
 * API client for IVALUX IMPERIAL backend
 * Empty = same origin (localhost:3000), API proxied via Next.js rewrites
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ivalux_access_token');
};

export async function apiRequest(path, options = {}) {
  const url = `${API_URL}${path}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error?.message || `Request failed: ${res.status}`);
  }
  return data;
}

export async function getProducts(country) {
  const qs = country ? `?country=${encodeURIComponent(country)}` : '';
  return apiRequest(`/products${qs}`);
}

export async function getProduct(id) {
  return apiRequest(`/products/${id}`);
}

export async function createProduct(data) {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id, data) {
  return apiRequest(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id) {
  return apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(email, password, fullName) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName || null }),
  });
}

export async function logout() {
  const token = getToken();
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    // Ignore logout errors
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ivalux_access_token');
    }
  }
}

export async function getMe() {
  return apiRequest('/auth/me');
}

export async function updateProfile({ full_name, country }) {
  return apiRequest('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ full_name, country }),
  });
}

export async function changePassword(new_password) {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ new_password }),
  });
}

export async function trackProductPlacement(payload) {
  return apiRequest('/track/product-placement', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAdminDistributors(country) {
  const qs = country ? `?country=${encodeURIComponent(country)}` : '';
  return apiRequest(`/admin/distributors${qs}`);
}

export async function getAdminProductHandlings() {
  return apiRequest('/admin/product-handlings');
}

export async function getAdminClients() {
  return apiRequest('/admin/clients');
}

export async function getAdminUsers(params = {}) {
  const qs = new URLSearchParams();
  if (params.role) qs.set('role', params.role);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/admin/users${qs.toString() ? `?${qs}` : ''}`);
}

export async function updateUserRole(userId, role) {
  return apiRequest(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function getAdminDashboard() {
  return apiRequest('/admin/dashboard');
}

export async function getAdminConsultations(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/admin/consultations${qs.toString() ? `?${qs}` : ''}`);
}

export async function getAdminAppointments(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/admin/appointments${qs.toString() ? `?${qs}` : ''}`);
}

export async function getAdminReviews(params = {}) {
  const qs = new URLSearchParams();
  if (params.rating) qs.set('rating', params.rating);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/admin/reviews${qs.toString() ? `?${qs}` : ''}`);
}

export async function deleteAdminReview(id) {
  return apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' });
}

export async function getAdminSubscriptions(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/admin/subscriptions${qs.toString() ? `?${qs}` : ''}`);
}

export async function createQuest({ name, description, quest_type, points_reward, is_active }) {
  return apiRequest('/admin/quests', {
    method: 'POST',
    body: JSON.stringify({ name, description, quest_type, points_reward, is_active }),
  });
}

export async function updateQuest(id, { name, description, quest_type, points_reward, is_active }) {
  return apiRequest(`/admin/quests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description, quest_type, points_reward, is_active }),
  });
}

export async function deleteQuest(id) {
  return apiRequest(`/admin/quests/${id}`, { method: 'DELETE' });
}

export async function getAdminQuests() {
  return apiRequest('/admin/quests');
}

// ========== Employee API ==========

export async function getEmployeeDashboard() {
  return apiRequest('/employee/dashboard');
}

export async function getEmployeeConsultations(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  const query = qs.toString();
  return apiRequest(`/employee/consultations${query ? `?${query}` : ''}`);
}

export async function createConsultation({ client_name, consultation_type, status, notes }) {
  return apiRequest('/employee/consultations', {
    method: 'POST',
    body: JSON.stringify({ client_name, consultation_type, status, notes }),
  });
}

export async function updateConsultation(id, { status, notes, amount, satisfaction_rating }) {
  return apiRequest(`/employee/consultations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes, amount, satisfaction_rating }),
  });
}

export async function getEmployeeProductHandlings() {
  return apiRequest('/employee/my-products');
}

export async function handleProduct({ product_id, country }) {
  return apiRequest('/employee/handle-product', {
    method: 'POST',
    body: JSON.stringify({ product_id, country }),
  });
}

export async function unassignProduct(handlingId) {
  return apiRequest(`/employee/handle-product/${handlingId}`, { method: 'DELETE' });
}

export async function getEmployeeClients() {
  return apiRequest('/employee/clients');
}

export async function createEmployeeAppointment({ client_id, datetime, duration_minutes, type, notes }) {
  return apiRequest('/employee/appointments', {
    method: 'POST',
    body: JSON.stringify({ client_id, datetime, duration_minutes, type, notes }),
  });
}

export async function getEmployeeReport(params = {}) {
  const qs = new URLSearchParams();
  if (params.start_date) qs.set('start_date', params.start_date);
  if (params.end_date) qs.set('end_date', params.end_date);
  return apiRequest(`/employee/report${qs.toString() ? `?${qs}` : ''}`);
}

export async function downloadEmployeeReportCsv(params = {}) {
  const qs = new URLSearchParams({ ...params, format: 'csv' });
  const url = `${API_URL}/employee/report?${qs}`;
  const token = getToken();
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Failed to download report');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `report-${params.start_date || 'start'}-${params.end_date || 'end'}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function getEmployeeInvoices(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/employee/invoices${qs.toString() ? `?${qs}` : ''}`);
}

export async function createEmployeeInvoiceAI({ client_id, consultation_id, order_id, amount, tax, notes, ai_prompt }) {
  return apiRequest('/employee/invoices/generate-ai', {
    method: 'POST',
    body: JSON.stringify({ client_id, consultation_id, order_id, amount, tax, notes, ai_prompt }),
  });
}

export async function sendInvoiceToClient(invoiceId) {
  return apiRequest(`/employee/invoices/${invoiceId}/send`, { method: 'POST' });
}

// ========== Orders API ==========

export async function getOrders(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/orders${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export async function getOrder(id) {
  return apiRequest(`/orders/${id}`);
}

export async function createOrder({ items, country, shipping_address, billing_address, payment_method, notes, employee_id }) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify({ items, country, shipping_address, billing_address, payment_method, notes, employee_id }),
  });
}

export async function updateOrderStatus(id, status) {
  return apiRequest(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ========== Invoices API ==========

export async function getInvoices(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/invoices${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export async function getInvoice(id) {
  return apiRequest(`/invoices/${id}`);
}

export async function createInvoice({ order_id, consultation_id, client_id, amount, tax, due_date, notes }) {
  return apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify({ order_id, consultation_id, client_id, amount, tax, due_date, notes }),
  });
}

export async function updateInvoiceStatus(id, { status, paid_at }) {
  return apiRequest(`/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, paid_at }),
  });
}

export async function downloadInvoicePdf(id) {
  const url = `${API_URL}/invoices/${id}/pdf`;
  const token = getToken();
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Failed to download invoice PDF');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `invoice-${id}.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ========== Appointments API ==========

export async function getAppointments(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.start_date) qs.set('start_date', params.start_date);
  if (params.end_date) qs.set('end_date', params.end_date);
  return apiRequest(`/appointments${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export async function createAppointment({ employee_id, datetime, duration_minutes, type, notes }) {
  return apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify({ employee_id, datetime, duration_minutes, type, notes }),
  });
}

export async function updateAppointment(id, { status, notes, datetime }) {
  return apiRequest(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes, datetime }),
  });
}

// ========== Messages API ==========

export async function getConversations() {
  return apiRequest('/messages');
}

export async function getMessages(userId, limit = 50) {
  return apiRequest(`/messages/${userId}?limit=${limit}`);
}

export async function sendMessage({ receiver_id, consultation_id, appointment_id, content, attachments }) {
  return apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify({ receiver_id, consultation_id, appointment_id, content, attachments }),
  });
}

export async function markMessageRead(id) {
  return apiRequest(`/messages/${id}/read`, {
    method: 'PATCH',
  });
}

// ========== Financial API (Admin) ==========

export async function getFinancialDashboard(period = 'month') {
  return apiRequest(`/financial/dashboard?period=${period}`);
}

export async function getFinancialRevenue(params = {}) {
  const qs = new URLSearchParams();
  if (params.start_date) qs.set('start_date', params.start_date);
  if (params.end_date) qs.set('end_date', params.end_date);
  if (params.group_by) qs.set('group_by', params.group_by);
  return apiRequest(`/financial/revenue${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export async function getFinancialPayments(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/financial/payments${qs.toString() ? `?${qs.toString()}` : ''}`);
}

// ========== Loyalty API ==========

export async function getLoyaltyPoints() {
  return apiRequest('/loyalty/points');
}

export async function earnPoints({ client_id, points, source_type, source_id, description, expires_at }) {
  return apiRequest('/loyalty/points/earn', {
    method: 'POST',
    body: JSON.stringify({ client_id, points, source_type, source_id, description, expires_at }),
  });
}

export async function getQuests() {
  return apiRequest('/loyalty/quests');
}

export async function getMyLoyaltyQuests() {
  return apiRequest('/loyalty/quests/my');
}

export async function completeQuest(id) {
  return apiRequest(`/loyalty/quests/${id}/complete`, {
    method: 'POST',
  });
}

// ========== Subscriptions API ==========

export async function getSubscriptions(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  return apiRequest(`/subscriptions${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export async function createSubscription({ product_id, plan_type, amount, billing_cycle_start, customization }) {
  return apiRequest('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ product_id, plan_type, amount, billing_cycle_start, customization }),
  });
}

export async function pauseSubscription(id) {
  return apiRequest(`/subscriptions/${id}/pause`, {
    method: 'POST',
  });
}

export async function resumeSubscription(id) {
  return apiRequest(`/subscriptions/${id}/resume`, {
    method: 'POST',
  });
}

// ========== Notifications API ==========

export async function getNotifications(params = {}) {
  const qs = new URLSearchParams();
  if (params.unread_only === true) qs.set('unread_only', 'true');
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/notifications${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export async function markNotificationRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead() {
  return apiRequest('/notifications/read-all', {
    method: 'PATCH',
  });
}

// ========== Reviews API ==========

export async function getReviews(params = {}) {
  const qs = new URLSearchParams();
  if (params.product_id) qs.set('product_id', params.product_id);
  if (params.client_id) qs.set('client_id', params.client_id);
  if (params.rating) qs.set('rating', params.rating);
  if (params.limit) qs.set('limit', params.limit);
  if (params.offset) qs.set('offset', params.offset);
  return apiRequest(`/reviews${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export async function getReview(id) {
  return apiRequest(`/reviews/${id}`);
}

export async function createReview({ product_id, rating, title, content, photos }) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify({ product_id, rating, title, content, photos }),
  });
}

export async function updateReview(id, { rating, title, content, photos }) {
  return apiRequest(`/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ rating, title, content, photos }),
  });
}

export async function deleteReview(id) {
  return apiRequest(`/reviews/${id}`, {
    method: 'DELETE',
  });
}

// ========== Analytics & Behavioral Analysis API ==========

export async function trackBehavior({ event_type, event_data, product_id, category, session_id }) {
  return apiRequest('/analytics/behavior', {
    method: 'POST',
    body: JSON.stringify({ event_type, event_data, product_id, category, session_id }),
  });
}

export async function getBehaviorAnalytics(params = {}) {
  const qs = new URLSearchParams();
  if (params.user_id) qs.set('user_id', params.user_id);
  if (params.event_type) qs.set('event_type', params.event_type);
  if (params.start_date) qs.set('start_date', params.start_date);
  if (params.end_date) qs.set('end_date', params.end_date);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/analytics/behavior${qs.toString() ? `?${qs}` : ''}`);
}

export async function getUserSegment(params = {}) {
  const qs = new URLSearchParams();
  if (params.user_id) qs.set('user_id', params.user_id);
  return apiRequest(`/analytics/segments${qs.toString() ? `?${qs}` : ''}`);
}

export async function getAIPredictions(params = {}) {
  const qs = new URLSearchParams();
  if (params.user_id) qs.set('user_id', params.user_id);
  if (params.prediction_type) qs.set('prediction_type', params.prediction_type);
  return apiRequest(`/analytics/predictions${qs.toString() ? `?${qs}` : ''}`);
}

export async function generateAIPrediction({ user_id, prediction_type }) {
  return apiRequest('/analytics/predictions/generate', {
    method: 'POST',
    body: JSON.stringify({ user_id, prediction_type }),
  });
}

export async function getAnalyticsDashboard(period = 'month') {
  return apiRequest(`/analytics/dashboard?period=${period}`);
}

// ========== Sentiment Analysis API ==========

export async function analyzeReviewSentiment(reviewId) {
  return apiRequest(`/sentiment/analyze/${reviewId}`, { method: 'POST' });
}

export async function getSentimentAnalysis(params = {}) {
  const qs = new URLSearchParams();
  if (params.product_id) qs.set('product_id', params.product_id);
  if (params.start_date) qs.set('start_date', params.start_date);
  if (params.end_date) qs.set('end_date', params.end_date);
  if (params.sentiment) qs.set('sentiment', params.sentiment);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/sentiment/reviews${qs.toString() ? `?${qs}` : ''}`);
}

export async function getSatisfactionAlerts(params = {}) {
  const qs = new URLSearchParams();
  if (params.severity) qs.set('severity', params.severity);
  if (params.resolved) qs.set('resolved', params.resolved);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/sentiment/alerts${qs.toString() ? `?${qs}` : ''}`);
}

export async function resolveSatisfactionAlert(alertId) {
  return apiRequest(`/sentiment/alerts/${alertId}/resolve`, { method: 'PATCH' });
}

export async function getSentimentDashboard(period = 'month') {
  return apiRequest(`/sentiment/dashboard?period=${period}`);
}

// ========== Metaverse API ==========

export async function getMetaverseStores(params = {}) {
  const qs = new URLSearchParams();
  if (params.platform) qs.set('platform', params.platform);
  if (params.is_active) qs.set('is_active', params.is_active);
  return apiRequest(`/metaverse/stores${qs.toString() ? `?${qs}` : ''}`);
}

export async function createMetaverseStore({ platform, store_name, world_coordinates, store_url, metadata }) {
  return apiRequest('/metaverse/stores', {
    method: 'POST',
    body: JSON.stringify({ platform, store_name, world_coordinates, store_url, metadata }),
  });
}

export async function getUserAvatars(params = {}) {
  const qs = new URLSearchParams();
  if (params.user_id) qs.set('user_id', params.user_id);
  return apiRequest(`/metaverse/avatars${qs.toString() ? `?${qs}` : ''}`);
}

export async function createOrUpdateAvatar({ avatar_name, avatar_data, skin_tone, hair_style, hair_color, eye_color }) {
  return apiRequest('/metaverse/avatars', {
    method: 'POST',
    body: JSON.stringify({ avatar_name, avatar_data, skin_tone, hair_style, hair_color, eye_color }),
  });
}

export async function getDigitalLooks(params = {}) {
  const qs = new URLSearchParams();
  if (params.user_id) qs.set('user_id', params.user_id);
  if (params.avatar_id) qs.set('avatar_id', params.avatar_id);
  if (params.is_public) qs.set('is_public', params.is_public);
  if (params.is_nft) qs.set('is_nft', params.is_nft);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/metaverse/looks${qs.toString() ? `?${qs}` : ''}`);
}

export async function createDigitalLook({ avatar_id, look_name, products_used, look_data, preview_image_url, is_public }) {
  return apiRequest('/metaverse/looks', {
    method: 'POST',
    body: JSON.stringify({ avatar_id, look_name, products_used, look_data, preview_image_url, is_public }),
  });
}

export async function mintLookAsNFT(lookId, { nft_token_id, nft_contract_address }) {
  return apiRequest(`/metaverse/looks/${lookId}/mint-nft`, {
    method: 'POST',
    body: JSON.stringify({ nft_token_id, nft_contract_address }),
  });
}

export async function getVirtualEvents(params = {}) {
  const qs = new URLSearchParams();
  if (params.platform) qs.set('platform', params.platform);
  if (params.event_type) qs.set('event_type', params.event_type);
  if (params.is_public) qs.set('is_public', params.is_public);
  if (params.upcoming_only) qs.set('upcoming_only', params.upcoming_only);
  return apiRequest(`/metaverse/events${qs.toString() ? `?${qs}` : ''}`);
}

export async function createVirtualEvent({ event_name, event_type, platform, event_date, duration_minutes, description, max_attendees, is_public, metadata }) {
  return apiRequest('/metaverse/events', {
    method: 'POST',
    body: JSON.stringify({ event_name, event_type, platform, event_date, duration_minutes, description, max_attendees, is_public, metadata }),
  });
}

export async function attendVirtualEvent(eventId, { avatar_id }) {
  return apiRequest(`/metaverse/events/${eventId}/attend`, {
    method: 'POST',
    body: JSON.stringify({ avatar_id }),
  });
}

// ========== Marketplace B2B2C API ==========

export async function getMarketplaceSellers(params = {}) {
  const qs = new URLSearchParams();
  if (params.seller_type) qs.set('seller_type', params.seller_type);
  if (params.country) qs.set('country', params.country);
  if (params.is_verified) qs.set('is_verified', params.is_verified);
  return apiRequest(`/marketplace/sellers${qs.toString() ? `?${qs}` : ''}`);
}

export async function registerAsSeller({ seller_name, seller_type, contact_email, country, metadata }) {
  return apiRequest('/marketplace/sellers', {
    method: 'POST',
    body: JSON.stringify({ seller_name, seller_type, contact_email, country, metadata }),
  });
}

export async function verifySeller(sellerId, { commission_rate }) {
  return apiRequest(`/marketplace/sellers/${sellerId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ commission_rate }),
  });
}

export async function getMarketplaceProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.seller_id) qs.set('seller_id', params.seller_id);
  if (params.product_id) qs.set('product_id', params.product_id);
  if (params.is_active) qs.set('is_active', params.is_active);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/marketplace/products${qs.toString() ? `?${qs}` : ''}`);
}

export async function addProductToMarketplace({ product_id, seller_id, price, stock_quantity, metadata }) {
  return apiRequest('/marketplace/products', {
    method: 'POST',
    body: JSON.stringify({ product_id, seller_id, price, stock_quantity, metadata }),
  });
}

export async function updateMarketplaceProduct(productId, { price, stock_quantity, is_active }) {
  return apiRequest(`/marketplace/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ price, stock_quantity, is_active }),
  });
}

// ========== IoT Devices API ==========

export async function getIoTDevices(params = {}) {
  const qs = new URLSearchParams();
  if (params.device_type) qs.set('device_type', params.device_type);
  if (params.is_connected) qs.set('is_connected', params.is_connected);
  return apiRequest(`/iot/devices${qs.toString() ? `?${qs}` : ''}`);
}

export async function registerIoTDevice({ device_type, device_name, device_serial, metadata }) {
  return apiRequest('/iot/devices', {
    method: 'POST',
    body: JSON.stringify({ device_type, device_name, device_serial, metadata }),
  });
}

export async function submitIoTData(deviceId, { data_type, data_value }) {
  return apiRequest(`/iot/devices/${deviceId}/data`, {
    method: 'POST',
    body: JSON.stringify({ data_type, data_value }),
  });
}

export async function getIoTDeviceData(deviceId, params = {}) {
  const qs = new URLSearchParams();
  if (params.data_type) qs.set('data_type', params.data_type);
  if (params.start_date) qs.set('start_date', params.start_date);
  if (params.end_date) qs.set('end_date', params.end_date);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/iot/devices/${deviceId}/data${qs.toString() ? `?${qs}` : ''}`);
}

// ========== Personalized Formulations API ==========

export async function getFormulations(params = {}) {
  const qs = new URLSearchParams();
  if (params.user_id) qs.set('user_id', params.user_id);
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/formulations${qs.toString() ? `?${qs}` : ''}`);
}

export async function createFormulation({ formulation_name, skin_type, skin_concerns, ingredients, formulation_data }) {
  return apiRequest('/formulations', {
    method: 'POST',
    body: JSON.stringify({ formulation_name, skin_type, skin_concerns, ingredients, formulation_data }),
  });
}

export async function updateFormulationStatus(formulationId, { status, order_id }) {
  return apiRequest(`/formulations/${formulationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, order_id }),
  });
}

// ========== Advanced Gamification API ==========

export async function getBeautyQuests(params = {}) {
  const qs = new URLSearchParams();
  if (params.quest_type) qs.set('quest_type', params.quest_type);
  if (params.difficulty) qs.set('difficulty', params.difficulty);
  if (params.is_active) qs.set('is_active', params.is_active);
  if (params.limit) qs.set('limit', params.limit);
  return apiRequest(`/gamification/quests${qs.toString() ? `?${qs}` : ''}`);
}

export async function createBeautyQuest({ quest_name, quest_type, description, points_reward, badge_reward, nft_reward, requirements, difficulty }) {
  return apiRequest('/gamification/quests', {
    method: 'POST',
    body: JSON.stringify({ quest_name, quest_type, description, points_reward, badge_reward, nft_reward, requirements, difficulty }),
  });
}

export async function getMyQuests(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  return apiRequest(`/gamification/my-quests${qs.toString() ? `?${qs}` : ''}`);
}

export async function startQuest(questId) {
  return apiRequest(`/gamification/quests/${questId}/start`, { method: 'POST' });
}

export async function completeBeautyQuest(questId) {
  return apiRequest(`/gamification/quests/${questId}/complete`, { method: 'POST' });
}
