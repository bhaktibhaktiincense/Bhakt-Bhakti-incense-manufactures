import { supabase } from '../lib/supabase';
import { AnalyticsEvent, AnalyticsEventType, DeviceCategory } from '../types/analytics';

const VISITOR_ID_KEY = 'bb_vid';
const SESSION_ID_KEY = 'bb_sid';
const LAST_ACTIVE_KEY = 'bb_last_act';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

function generateRandomId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
  return `${prefix}_${rand}`;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'server_visitor';
  try {
    let vid = localStorage.getItem(VISITOR_ID_KEY);
    if (!vid || vid.length < 8) {
      vid = generateRandomId('vid');
      localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    return vid;
  } catch {
    return generateRandomId('vid_tmp');
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    const now = Date.now();
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
    let sid = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sid || !lastActive || (now - lastActive > SESSION_TIMEOUT_MS)) {
      sid = generateRandomId('sess');
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }

    localStorage.setItem(LAST_ACTIVE_KEY, String(now));
    return sid;
  } catch {
    return generateRandomId('sess_tmp');
  }
}

export function getTrafficSource(): { source: string; domain?: string } {
  if (typeof window === 'undefined') return { source: 'Direct' };

  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    if (utmSource) {
      return { source: utmSource.trim() };
    }

    const ref = document.referrer;
    if (!ref) {
      return { source: 'Direct Traffic' };
    }

    const refUrl = new URL(ref);
    const host = refUrl.hostname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    if (host === currentHost) {
      return { source: 'Direct / Internal' };
    }

    if (host.includes('google.')) return { source: 'Google Search', domain: host };
    if (host.includes('instagram.com') || host.includes('l.instagram.com')) return { source: 'Instagram', domain: host };
    if (host.includes('whatsapp.') || host.includes('wa.me')) return { source: 'WhatsApp', domain: host };
    if (host.includes('facebook.com') || host.includes('fb.com') || host.includes('l.facebook.com')) return { source: 'Facebook', domain: host };
    if (host.includes('youtube.com') || host.includes('youtu.be')) return { source: 'YouTube', domain: host };
    if (host.includes('bing.com')) return { source: 'Bing Search', domain: host };
    if (host.includes('yahoo.com')) return { source: 'Yahoo Search', domain: host };
    if (host.includes('twitter.com') || host.includes('t.co') || host.includes('x.com')) return { source: 'X / Twitter', domain: host };
    if (host.includes('pinterest.')) return { source: 'Pinterest', domain: host };

    return { source: host.replace(/^www\./, ''), domain: host };
  } catch {
    return { source: 'Direct Traffic' };
  }
}

export function getDeviceCategory(): DeviceCategory {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();

  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua)) {
    return 'tablet';
  }
  if (/(mobi|ipod|phone|blackberry|opera mini|iemobile)/i.test(ua) || (window.innerWidth < 768 && 'ontouchstart' in window)) {
    return 'mobile';
  }
  return 'desktop';
}

export function getBrowserName(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
  return 'Other';
}

const recentEventsCache = new Map<string, number>();

function isDuplicate(key: string, cooldownMs = 2500): boolean {
  const now = Date.now();
  const last = recentEventsCache.get(key);
  if (last && (now - last < cooldownMs)) {
    return true;
  }
  recentEventsCache.set(key, now);

  if (recentEventsCache.size > 200) {
    for (const [k, time] of recentEventsCache.entries()) {
      if (now - time > 10000) recentEventsCache.delete(k);
    }
  }
  return false;
}

export async function trackEvent(
  eventType: AnalyticsEventType,
  data?: {
    pagePath?: string;
    pageTitle?: string;
    productId?: string;
    productName?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  if (typeof window === 'undefined') return;

  const path = data?.pagePath || window.location.pathname;

  if (path.startsWith('/admin') || path.startsWith('/invoice/')) {
    return;
  }

  const { source, domain } = getTrafficSource();
  const visitorId = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  const deviceType = getDeviceCategory();
  const browser = getBrowserName();

  const payload: AnalyticsEvent = {
    event_type: eventType,
    page_path: path,
    page_title: data?.pageTitle || (typeof document !== 'undefined' ? document.title : ''),
    product_id: data?.productId || undefined,
    product_name: data?.productName || undefined,
    visitor_id: visitorId,
    session_id: sessionId,
    traffic_source: source,
    referrer_domain: domain || undefined,
    device_category: deviceType,
    browser: browser,
    metadata: data?.metadata || undefined,
    created_at: new Date().toISOString()
  };

  try {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});

    supabase
      .from('analytics_events')
      .insert(payload)
      .then(
        ({ error }: any) => {
          if (error && error.code !== 'PGRST205') {
            console.warn('Supabase analytics notice:', error.message);
          }
        },
        () => {}
      );
  } catch {
    // Fail silently
  }
}

export function trackPageView(path: string, title?: string) {
  const key = `page_${path}`;
  if (isDuplicate(key, 2000)) return;
  trackEvent('page_view', { pagePath: path, pageTitle: title });
}

export function trackProductView(productId: string, productName: string) {
  const key = `pview_${productId}`;
  if (isDuplicate(key, 3000)) return;
  trackEvent('product_view', {
    productId,
    productName,
    metadata: { action: 'detail_view' }
  });
}

export function trackProductClick(productId: string, productName: string, fromPath?: string) {
  const key = `pclick_${productId}_${fromPath || ''}`;
  if (isDuplicate(key, 1000)) return;
  trackEvent('product_click', {
    productId,
    productName,
    metadata: { from_path: fromPath || window.location.pathname }
  });
}

export function trackAddToCart(productId: string, productName: string, quantity = 1, price?: number) {
  trackEvent('add_to_cart', {
    productId,
    productName,
    metadata: { quantity, price }
  });
}

export function trackCheckoutStart(
  subtotal?: number, 
  itemCount?: number, 
  items?: Array<{ product_id?: string; id?: string; name?: string; price?: number; quantity?: number }>
) {
  const key = 'checkout_start';
  if (!isDuplicate(key, 3000)) {
    trackEvent('checkout_start', {
      metadata: { item_count: itemCount, subtotal }
    });
  }

  // Record item-level checkout initiations for accurate product conversion attribution
  if (Array.isArray(items)) {
    items.forEach((item) => {
      const pid = item.product_id || item.id;
      if (pid) {
        trackEvent('checkout_start', {
          productId: String(pid),
          productName: item.name,
          metadata: { quantity: item.quantity || 1, price: item.price || 0 }
        });
      }
    });
  }
}

export function trackOrderCompleted(
  orderNumber: string, 
  total: number, 
  itemsOrCount?: any
) {
  const key = `order_${orderNumber}`;
  if (isDuplicate(key, 30000)) return;

  const items = Array.isArray(itemsOrCount) ? itemsOrCount : [];
  const itemCount = Array.isArray(itemsOrCount) ? items.length : (typeof itemsOrCount === 'number' ? itemsOrCount : 1);

  // 1. Record master order completion event
  trackEvent('order_completed', {
    metadata: { order_number: orderNumber, total, item_count: itemCount }
  });

  // 2. Record attributed product order events for each line item
  items.forEach((item: any) => {
    const pid = item.product_id || item.id;
    if (pid) {
      trackEvent('order_completed', {
        productId: String(pid),
        productName: item.name,
        metadata: {
          order_id: orderNumber,
          quantity: item.quantity || 1,
          price: item.price || 0
        }
      });
    }
  });
}

export function trackHeartbeat() {
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
    return;
  }
  trackEvent('heartbeat');
}
