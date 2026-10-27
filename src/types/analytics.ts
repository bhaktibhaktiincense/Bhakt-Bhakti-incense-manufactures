export type AnalyticsEventType = 
  | "page_view"
  | "product_view"
  | "product_click"
  | "add_to_cart"
  | "checkout_start"
  | "order_completed"
  | "heartbeat";

export type DeviceCategory = "mobile" | "desktop" | "tablet";

export interface AnalyticsEvent {
  id?: string;
  event_type: AnalyticsEventType;
  path?: string;
  page_path?: string;
  page_title?: string;
  product_id?: string;
  product_name?: string;
  visitor_id: string;
  session_id: string;
  traffic_source: string;
  referrer?: string;
  referrer_domain?: string;
  device_category?: DeviceCategory | string;
  device_type?: DeviceCategory | string;
  browser?: string;
  order_id?: string;
  order_value?: number;
  metadata?: Record<string, any>;
  session_duration_seconds?: number;
  created_at: string;
}

export interface AnalyticsOverviewMetrics {
  totalVisitors: number;
  estimatedUniqueVisitors: number;
  uniqueVisitors?: number;
  totalPageViews: number;
  productDetailViews: number;
  productPageViews?: number;
  activeVisitorsLast5Min: number;
  addToCartCount: number;
  addToCartEvents?: number;
  checkoutStarts: number;
  completedOrders: number;
  conversionRate: number;
  cartConversionRate?: number;
}

export interface ProductAnalyticsRow {
  productId: string;
  productName: string;
  thumbnail: string | null;
  sku?: string;
  category?: string;
  price?: number;
  stock?: number;
  availabilityLabel?: string;
  views: number;
  uniqueVisitors: number;
  todayViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  clicks: number;
  carts: number;
  checkouts: number;
  orders: number;
  conversionRate: number;
  rank?: number;
}
export type ProductAnalyticsRank = ProductAnalyticsRow;

export interface DailyTrendPoint {
  date: string;
  label: string;
  pageViews: number;
  visitors: number;
  addToCart: number;
  orders: number;
}

export interface TrafficSourceMetric {
  source: string;
  count: number;
  percentage: number;
}
export type TrafficSourceCount = TrafficSourceMetric;

export interface DeviceMetric {
  category: string;
  count: number;
  percentage: number;
}
export type DeviceCount = DeviceMetric;

export type AnalyticsDateFilter = "today" | "7d" | "30d" | "7days" | "30days" | "custom";

