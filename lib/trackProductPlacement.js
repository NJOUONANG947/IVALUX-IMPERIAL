/**
 * Product Placement Traceability - sends AI-driven placements to backend
 * Only tracks when user is authenticated.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const PLACEMENT_MAP = {
  chat_recommendation: 'chat',
  diagnostic_prescription: 'prescription',
  product_detail_recommendation: 'product_page',
  product_page: 'product_page',
  chat: 'chat',
  prescription: 'prescription',
};

async function trackProductPlacement({ productId, placementType, reason, confidence }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ivalux_access_token') : null;
  if (!token) return;

  const mappedType = PLACEMENT_MAP[placementType] || placementType;
  const validTypes = ['chat', 'prescription', 'product_page'];
  if (!validTypes.includes(mappedType)) return;

  try {
    await fetch(`${API_URL}/track/product-placement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
        placementType: mappedType,
        reason: reason || null,
        confidence: confidence ?? null,
      }),
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Traceability] Failed to track:', err.message);
    }
  }
}

export { trackProductPlacement };
