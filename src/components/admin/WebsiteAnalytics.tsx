import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, Eye, ShoppingCart, ShoppingBag, ArrowUpRight, 
  TrendingUp, RefreshCw, Calendar, Smartphone, Monitor, 
  Tablet, Globe, Search, Filter, AlertCircle, CheckCircle, 
  Clock, Zap, ArrowDownRight, Download, BarChart3, ChevronDown,
  ChevronUp, ArrowUpDown, X, ExternalLink, Info, Award
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { 
  AnalyticsEvent, 
  AnalyticsDateFilter, 
  AnalyticsOverviewMetrics, 
  ProductAnalyticsRow, 
  TrafficSourceMetric, 
  DeviceMetric 
} from "../../types/analytics";

interface Props {
  products?: any[];
}

type ProductSortField = 
  | "rank" 
  | "views" 
  | "uniqueVisitors" 
  | "todayViews" 
  | "viewsLast7Days" 
  | "viewsLast30Days" 
  | "carts" 
  | "checkouts" 
  | "orders" 
  | "conversionRate";

export const WebsiteAnalytics: React.FC<Props> = ({ products = [] }) => {
  const [dateFilter, setDateFilter] = useState<AnalyticsDateFilter | "all">("7d");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Product Performance state
  const [productSearch, setProductSearch] = useState<string>("");
  const [productSortBy, setProductSortBy] = useState<ProductSortField>("views");
  const [productSortOrder, setProductSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedProductModal, setSelectedProductModal] = useState<ProductAnalyticsRow | null>(null);

  // Visitor Activity state
  const [activitySearch, setActivitySearch] = useState<string>("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");

  // Determine active date boundary
  const getDateRange = useCallback((): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();

    if (dateFilter === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (dateFilter === "7d" || dateFilter === "7days") {
      start.setDate(end.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (dateFilter === "30d" || dateFilter === "30days") {
      start.setDate(end.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (dateFilter === "all") {
      start.setFullYear(2020, 0, 1);
      start.setHours(0, 0, 0, 0);
    } else if (dateFilter === "custom" && customStartDate) {
      const parsedStart = new Date(customStartDate);
      parsedStart.setHours(0, 0, 0, 0);
      const parsedEnd = customEndDate ? new Date(customEndDate) : new Date();
      parsedEnd.setHours(23, 59, 59, 999);
      return { start: parsedStart, end: parsedEnd };
    }
    return { start, end };
  }, [dateFilter, customStartDate, customEndDate]);

  // Fetch analytics events from Supabase or server API
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { start } = getDateRange();
      // Ensure we query at least 30 days of data so todayViews, 7d, and 30d metrics are always accurate
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const queryStart = new Date(Math.min(start.getTime(), thirtyDaysAgo.getTime()));
      const isoStart = queryStart.toISOString();

      let fetchedEvents: AnalyticsEvent[] = [];

      // 1. Try Supabase direct query
      if (supabase) {
        try {
          const { data, error: sbError } = await supabase
            .from("analytics_events")
            .select("*")
            .gte("created_at", isoStart)
            .order("created_at", { ascending: false })
            .limit(10000);

          if (!sbError && data) {
            fetchedEvents = data as AnalyticsEvent[];
          }
        } catch {
          // ignore, fall back to API
        }
      }

      // 2. If Supabase returned empty or table missing, fallback to /api/admin/analytics endpoint
      if (fetchedEvents.length === 0) {
        try {
          const resp = await fetch(`/api/admin/analytics?start=${encodeURIComponent(isoStart)}`);
          if (resp.ok) {
            const result = await resp.json();
            if (Array.isArray(result.events)) {
              fetchedEvents = result.events;
            }
          }
        } catch {
          // api endpoint fallback optional
        }
      }

      setEvents(fetchedEvents);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error("Error fetching analytics events:", err);
      setError(err?.message || "Failed to load analytics events");
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh active visitors interval every 45s
  useEffect(() => {
    const timer = setInterval(() => {
      fetchAnalytics();
    }, 45000);
    return () => clearInterval(timer);
  }, [fetchAnalytics]);

  // Filter events within currently selected date range for overview metrics
  const activeEvents = useMemo(() => {
    const { start, end } = getDateRange();
    const startTime = start.getTime();
    const endTime = end.getTime();

    return events.filter((ev) => {
      const t = new Date(ev.created_at).getTime();
      return t >= startTime && t <= endTime;
    });
  }, [events, getDateRange]);

  // Overview Metrics
  const metrics: AnalyticsOverviewMetrics = useMemo(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    const uniqueVisitorIds = new Set<string>();
    const activeVisitorsSet = new Set<string>();
    let totalPageViews = 0;
    let productDetailViews = 0;
    let addToCartCount = 0;
    let checkoutStarts = 0;
    let completedOrders = 0;

    // Check active visitors in last 5 minutes from ALL recent events
    events.forEach((ev) => {
      const evTime = new Date(ev.created_at).getTime();
      if (evTime >= fiveMinutesAgo && ev.visitor_id) {
        activeVisitorsSet.add(ev.visitor_id);
      }
    });

    activeEvents.forEach((ev) => {
      if (ev.visitor_id) {
        uniqueVisitorIds.add(ev.visitor_id);
      }

      if (ev.event_type === "page_view") {
        totalPageViews++;
      } else if (ev.event_type === "product_view") {
        productDetailViews++;
      } else if (ev.event_type === "add_to_cart") {
        addToCartCount++;
      } else if (ev.event_type === "checkout_start") {
        checkoutStarts++;
      } else if (ev.event_type === "order_completed") {
        completedOrders++;
      }
    });

    const totalVisitors = uniqueVisitorIds.size;
    const conversionRate = totalVisitors > 0 ? (completedOrders / totalVisitors) * 100 : 0;

    return {
      totalVisitors,
      estimatedUniqueVisitors: totalVisitors,
      totalPageViews,
      productDetailViews,
      activeVisitorsLast5Min: activeVisitorsSet.size,
      addToCartCount,
      checkoutStarts,
      completedOrders,
      conversionRate
    };
  }, [activeEvents, events]);

  // =========================================================================
  // Comprehensive Product Performance Section Calculation
  // =========================================================================
  const productPerformanceRows: ProductAnalyticsRow[] = useMemo(() => {
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTime = todayStart.getTime();

    const sevenDaysAgoTime = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgoTime = now - 30 * 24 * 60 * 60 * 1000;

    const { start: filterStart, end: filterEnd } = getDateRange();
    const filterStartTime = filterStart.getTime();
    const filterEndTime = filterEnd.getTime();

    // Map by canonical product ID
    const productStatsMap = new Map<string, {
      product: any;
      views: number;
      uniqueVisitorsSet: Set<string>;
      todayViews: number;
      views7d: number;
      views30d: number;
      clicks: number;
      carts: number;
      checkouts: number;
      orders: number;
    }>();

    // 1. Seed map with all actual catalog products from database
    products.forEach((p) => {
      const pid = String(p.id);
      productStatsMap.set(pid, {
        product: p,
        views: 0,
        uniqueVisitorsSet: new Set<string>(),
        todayViews: 0,
        views7d: 0,
        views30d: 0,
        clicks: 0,
        carts: 0,
        checkouts: 0,
        orders: 0
      });
    });

    // Helper to resolve product ID accurately
    const resolveProductId = (evPid?: string, evName?: string): string | null => {
      if (evPid && productStatsMap.has(String(evPid))) {
        return String(evPid);
      }
      if (evPid) {
        // Try slug or case match
        for (const [id, entry] of productStatsMap.entries()) {
          if (id.toLowerCase() === evPid.toLowerCase() || entry.product.slug === evPid) {
            return id;
          }
        }
      }
      if (evName) {
        const cleanName = evName.trim().toLowerCase();
        for (const [id, entry] of productStatsMap.entries()) {
          const pName = (entry.product.name || entry.product.product_name || "").toLowerCase();
          if (pName === cleanName || pName.includes(cleanName) || cleanName.includes(pName)) {
            return id;
          }
        }
      }
      return evPid ? String(evPid) : null;
    };

    // 2. Aggregate all recorded events
    events.forEach((ev) => {
      if (!ev.product_id && !ev.product_name) return;

      const matchedId = resolveProductId(ev.product_id, ev.product_name);
      if (!matchedId) return;

      if (!productStatsMap.has(matchedId)) {
        // Uncataloged / legacy product tracking
        productStatsMap.set(matchedId, {
          product: {
            id: matchedId,
            name: ev.product_name || `Product #${matchedId}`,
            sku: `BB-${matchedId.slice(0, 4).toUpperCase()}`,
            image: null
          },
          views: 0,
          uniqueVisitorsSet: new Set<string>(),
          todayViews: 0,
          views7d: 0,
          views30d: 0,
          clicks: 0,
          carts: 0,
          checkouts: 0,
          orders: 0
        });
      }

      const item = productStatsMap.get(matchedId)!;
      const evTime = new Date(ev.created_at).getTime();

      // Aggregate windowed views (Today, 7D, 30D)
      if (ev.event_type === "product_view") {
        if (evTime >= todayStartTime) {
          item.todayViews++;
        }
        if (evTime >= sevenDaysAgoTime) {
          item.views7d++;
        }
        if (evTime >= thirtyDaysAgoTime) {
          item.views30d++;
        }
      }

      // Aggregate within currently active date filter
      if (evTime >= filterStartTime && evTime <= filterEndTime) {
        if (ev.event_type === "product_view") {
          item.views++;
          if (ev.visitor_id) {
            item.uniqueVisitorsSet.add(ev.visitor_id);
          }
        } else if (ev.event_type === "product_click") {
          item.clicks++;
        } else if (ev.event_type === "add_to_cart") {
          item.carts++;
        } else if (ev.event_type === "checkout_start") {
          item.checkouts++;
        } else if (ev.event_type === "order_completed") {
          item.orders++;
        }
      }
    });

    // 3. Transform to ProductAnalyticsRow array
    const rows: ProductAnalyticsRow[] = Array.from(productStatsMap.entries()).map(([pid, data]) => {
      const p = data.product;
      const views = data.views;
      const orders = data.orders;
      const conversionRate = views > 0 ? (orders / views) * 100 : 0;

      return {
        productId: pid,
        productName: p.name || p.product_name || `Product #${pid}`,
        thumbnail: p.image || p.images?.[0] || null,
        sku: p.sku || `BB-${pid.slice(0, 4).toUpperCase()}`,
        category: p.category || "Incense Offering",
        price: p.price,
        stock: p.stock_quantity,
        availabilityLabel: p.availability_label || "Available Now",
        views,
        uniqueVisitors: data.uniqueVisitorsSet.size,
        todayViews: data.todayViews,
        viewsLast7Days: data.views7d,
        viewsLast30Days: data.views30d,
        clicks: data.clicks,
        carts: data.carts,
        checkouts: data.checkouts,
        orders,
        conversionRate,
      };
    });

    // 4. Sort primarily by Views descending to determine default ranking
    rows.sort((a, b) => b.views - a.views);

    // Assign canonical rank (1 to N) based on views
    rows.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    return rows;
  }, [events, products, getDateRange]);

  // Filter and sort Product Performance rows for the table view
  const displayProductRows = useMemo(() => {
    let filtered = productPerformanceRows;

    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      filtered = filtered.filter((r) => 
        r.productName.toLowerCase().includes(q) ||
        r.productId.toLowerCase().includes(q) ||
        (r.sku && r.sku.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }

    return [...filtered].sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      switch (productSortBy) {
        case "rank":
          valA = a.rank || 0;
          valB = b.rank || 0;
          break;
        case "views":
          valA = a.views;
          valB = b.views;
          break;
        case "uniqueVisitors":
          valA = a.uniqueVisitors;
          valB = b.uniqueVisitors;
          break;
        case "todayViews":
          valA = a.todayViews;
          valB = b.todayViews;
          break;
        case "viewsLast7Days":
          valA = a.viewsLast7Days;
          valB = b.viewsLast7Days;
          break;
        case "viewsLast30Days":
          valA = a.viewsLast30Days;
          valB = b.viewsLast30Days;
          break;
        case "carts":
          valA = a.carts;
          valB = b.carts;
          break;
        case "checkouts":
          valA = a.checkouts;
          valB = b.checkouts;
          break;
        case "orders":
          valA = a.orders;
          valB = b.orders;
          break;
        case "conversionRate":
          valA = a.conversionRate;
          valB = b.conversionRate;
          break;
        default:
          valA = a.views;
          valB = b.views;
      }

      if (productSortOrder === "asc") {
        return valA - valB;
      }
      return valB - valA;
    });
  }, [productPerformanceRows, productSearch, productSortBy, productSortOrder]);

  const toggleSort = (field: ProductSortField) => {
    if (productSortBy === field) {
      setProductSortOrder(prev => (prev === "desc" ? "asc" : "desc"));
    } else {
      setProductSortBy(field);
      setProductSortOrder(field === "rank" ? "asc" : "desc");
    }
  };

  // Selected Product historical trend data for modal
  const selectedProductTimeline = useMemo(() => {
    if (!selectedProductModal) return [];

    const pid = selectedProductModal.productId;
    const now = new Date();
    const daysMap: { [day: string]: { label: string; views: number; uniqueVisitors: Set<string>; carts: number; orders: number } } = {};

    // Generate last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      daysMap[key] = { label, views: 0, uniqueVisitors: new Set(), carts: 0, orders: 0 };
    }

    events.forEach((ev) => {
      const matches = ev.product_id === pid || ev.product_name === selectedProductModal.productName;
      if (!matches) return;

      const key = ev.created_at.split("T")[0];
      if (daysMap[key]) {
        if (ev.event_type === "product_view") {
          daysMap[key].views++;
          if (ev.visitor_id) daysMap[key].uniqueVisitors.add(ev.visitor_id);
        } else if (ev.event_type === "add_to_cart") {
          daysMap[key].carts++;
        } else if (ev.event_type === "order_completed") {
          daysMap[key].orders++;
        }
      }
    });

    return Object.entries(daysMap).map(([key, data]) => ({
      dateKey: key,
      label: data.label,
      views: data.views,
      uniqueVisitors: data.uniqueVisitors.size,
      carts: data.carts,
      orders: data.orders
    }));
  }, [selectedProductModal, events]);

  const maxSelectedTimelineValue = useMemo(() => {
    let max = 5;
    selectedProductTimeline.forEach((d) => {
      if (d.views > max) max = d.views;
      if (d.uniqueVisitors > max) max = d.uniqueVisitors;
      if (d.carts > max) max = d.carts;
      if (d.orders > max) max = d.orders;
    });
    return max;
  }, [selectedProductTimeline]);

  // Traffic Sources Breakdown
  const trafficSources: TrafficSourceMetric[] = useMemo(() => {
    const counts: { [source: string]: number } = {};
    let total = 0;

    activeEvents.forEach((ev) => {
      if (ev.event_type === "page_view" || ev.event_type === "product_view") {
        const src = ev.traffic_source || "Direct / Organic";
        counts[src] = (counts[src] || 0) + 1;
        total++;
      }
    });

    return Object.entries(counts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeEvents]);

  // Device Breakdown
  const deviceMetrics: DeviceMetric[] = useMemo(() => {
    const counts: { [cat: string]: number } = {
      mobile: 0,
      desktop: 0,
      tablet: 0
    };
    let total = 0;

    activeEvents.forEach((ev) => {
      if (ev.event_type === "page_view" || ev.event_type === "product_view") {
        const cat = (ev.device_category || "desktop").toLowerCase();
        if (cat in counts) counts[cat]++;
        else counts.desktop++;
        total++;
      }
    });

    return [
      { category: "Mobile", count: counts.mobile, percentage: total > 0 ? Math.round((counts.mobile / total) * 100) : 0 },
      { category: "Desktop", count: counts.desktop, percentage: total > 0 ? Math.round((counts.desktop / total) * 100) : 0 },
      { category: "Tablet", count: counts.tablet, percentage: total > 0 ? Math.round((counts.tablet / total) * 100) : 0 }
    ];
  }, [activeEvents]);

  // Daily Visitors and Page Views (Timeline)
  const dailyTimeline = useMemo(() => {
    const daysMap: { [day: string]: { dateStr: string; visitors: Set<string>; pageViews: number } } = {};
    const { start, end } = getDateRange();

    const curr = new Date(start);
    while (curr <= end) {
      const key = curr.toISOString().split("T")[0];
      const dayLabel = curr.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      daysMap[key] = { dateStr: dayLabel, visitors: new Set(), pageViews: 0 };
      curr.setDate(curr.getDate() + 1);
    }

    activeEvents.forEach((ev) => {
      const key = ev.created_at.split("T")[0];
      if (daysMap[key]) {
        if (ev.event_type === "page_view" || ev.event_type === "product_view") {
          daysMap[key].pageViews++;
        }
        if (ev.visitor_id) {
          daysMap[key].visitors.add(ev.visitor_id);
        }
      }
    });

    return Object.entries(daysMap).map(([key, data]) => ({
      dateKey: key,
      label: data.dateStr,
      pageViews: data.pageViews,
      visitors: data.visitors.size
    }));
  }, [activeEvents, getDateRange]);

  const maxDailyValue = useMemo(() => {
    let max = 10;
    dailyTimeline.forEach((d) => {
      if (d.pageViews > max) max = d.pageViews;
      if (d.visitors > max) max = d.visitors;
    });
    return max;
  }, [dailyTimeline]);

  // Recent Activity Log
  const filteredActivity = useMemo(() => {
    return activeEvents
      .filter((ev) => {
        if (eventTypeFilter !== "all" && ev.event_type !== eventTypeFilter) return false;
        if (!activitySearch) return true;
        const q = activitySearch.toLowerCase();
        return (
          (ev.path || "").toLowerCase().includes(q) ||
          (ev.product_name || "").toLowerCase().includes(q) ||
          (ev.traffic_source || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 50);
  }, [activeEvents, eventTypeFilter, activitySearch]);

  // Export to CSV
  const exportToCSV = () => {
    if (productPerformanceRows.length === 0) return;
    const headers = [
      "Rank", "Product ID", "Product Name", "SKU", "Views (Selected Filter)",
      "Unique Visitors", "Today Views", "Last 7 Days Views", "Last 30 Days Views",
      "Add to Cart", "Checkout Starts", "Completed Orders", "Conversion Rate %"
    ];
    const rows = productPerformanceRows.map((p) => [
      p.rank || "",
      `"${p.productId}"`,
      `"${p.productName.replace(/"/g, '""')}"`,
      `"${p.sku || ""}"`,
      p.views,
      p.uniqueVisitors,
      p.todayViews,
      p.viewsLast7Days,
      p.viewsLast30Days,
      p.carts,
      p.checkouts,
      p.orders,
      p.conversionRate.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bb_product_analytics_${dateFilter}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Bar: Title, Date Filter, Refresh & Export */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-chai-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-marigold-100 text-marigold-800 rounded-lg">
                <BarChart3 className="w-5 h-5 text-marigold-600" />
              </span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-espresso-900">
                Website & Product Analytics
              </h1>
            </div>
            <p className="text-xs text-espresso-600 mt-1">
              Authoritative visitor metrics, engagement tracking, and product performance for Bhakt & Bhakti Incense.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date filter pills */}
            <div className="inline-flex bg-chai-100 p-1 rounded-xl text-xs font-bold text-espresso-700">
              <button
                onClick={() => setDateFilter("today")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === "today" ? "bg-white text-espresso-900 shadow-xs" : "hover:text-espresso-900"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter("7d")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === "7d" ? "bg-white text-espresso-900 shadow-xs" : "hover:text-espresso-900"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateFilter("30d")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === "30d" ? "bg-white text-espresso-900 shadow-xs" : "hover:text-espresso-900"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === "all" ? "bg-white text-espresso-900 shadow-xs" : "hover:text-espresso-900"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilter("custom")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === "custom" ? "bg-white text-espresso-900 shadow-xs" : "hover:text-espresso-900"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="p-2 bg-white border border-chai-200 text-espresso-700 rounded-xl hover:bg-chai-50 transition-colors shadow-xs"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-marigold-600" : ""}`} />
            </button>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-espresso-900 text-chai-50 rounded-xl hover:bg-espresso-800 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-xs"
              title="Export Product Analytics to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Custom date range picker if custom active */}
        {dateFilter === "custom" && (
          <div className="mt-4 pt-4 border-t border-chai-100 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-espresso-700">Date Range:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 border border-chai-200 rounded-lg bg-chai-50 text-espresso-900 focus:outline-none focus:ring-1 focus:ring-marigold-500"
            />
            <span className="text-espresso-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 border border-chai-200 rounded-lg bg-chai-50 text-espresso-900 focus:outline-none focus:ring-1 focus:ring-marigold-500"
            />
            <button
              onClick={fetchAnalytics}
              className="px-3 py-1.5 bg-marigold-600 text-white rounded-lg font-bold hover:bg-marigold-700 transition-colors"
            >
              Apply Filter
            </button>
          </div>
        )}

        {/* Last Refreshed notice */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-espresso-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live event tracking connected</span>
          </div>
          <div>Last refreshed: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Visitors */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-chai-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-espresso-600 uppercase tracking-wider">Unique Visitors</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-espresso-900">
            {metrics.totalVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] text-espresso-500 mt-1">Unique shoppers in period</div>
        </div>

        {/* Page Views */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-chai-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-espresso-600 uppercase tracking-wider">Total Views</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-espresso-900">
            {metrics.totalPageViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-espresso-500 mt-1">{metrics.productDetailViews} product detail views</div>
        </div>

        {/* Active Visitors (Last 5m) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl shadow-md text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Live Active (5m)</span>
            <div className="p-2 bg-white/20 text-white rounded-xl backdrop-blur-sm">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-2">
            {metrics.activeVisitorsLast5Min}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
          <div className="text-[11px] text-emerald-100 mt-1">Active visitors on site right now</div>
        </div>

        {/* Store Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-chai-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-espresso-600 uppercase tracking-wider">Store Conversion</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-espresso-900">
            {metrics.conversionRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-espresso-500 mt-1">
            {metrics.completedOrders} orders / {metrics.totalVisitors || 0} visitors
          </div>
        </div>
      </div>

      {/* =====================================================================
          MANDATORY FEATURE: DETAILED PRODUCT PERFORMANCE SECTION
      ===================================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-chai-200 overflow-hidden">
        {/* Section Header */}
        <div className="p-6 border-b border-chai-100 bg-gradient-to-r from-orange-50/50 via-white to-transparent">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <h2 className="text-xl font-bold font-serif text-espresso-900">
                  Product Performance & Conversion Analytics
                </h2>
              </div>
              <p className="text-xs text-espresso-600 mt-1">
                Detailed metrics for every offering in your catalog: detail views, unique visitors, daily trajectory, cart additions, checkouts, orders, and individual conversion rates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Product search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-espresso-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, ID or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-chai-200 rounded-xl bg-chai-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-marigold-500 w-56 text-espresso-900"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch("")}
                    className="absolute right-2.5 top-2 text-espresso-400 hover:text-espresso-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick sort dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-espresso-700 bg-chai-50 px-3 py-1.5 rounded-xl border border-chai-200">
                <Filter className="w-3.5 h-3.5 text-espresso-500" />
                <span className="font-semibold">Sort:</span>
                <select
                  value={productSortBy}
                  onChange={(e) => setProductSortBy(e.target.value as ProductSortField)}
                  className="bg-transparent font-bold text-espresso-900 focus:outline-none cursor-pointer"
                >
                  <option value="views">Most Views (Selected)</option>
                  <option value="uniqueVisitors">Unique Visitors</option>
                  <option value="todayViews">Today's Views</option>
                  <option value="viewsLast7Days">Last 7 Days Views</option>
                  <option value="viewsLast30Days">Last 30 Days Views</option>
                  <option value="carts">Add to Cart Count</option>
                  <option value="checkouts">Checkout Initiations</option>
                  <option value="orders">Completed Orders</option>
                  <option value="conversionRate">Conversion Rate</option>
                  <option value="rank">Overall Rank (#)</option>
                </select>
                <button
                  onClick={() => setProductSortOrder(prev => (prev === "desc" ? "asc" : "desc"))}
                  className="p-0.5 hover:bg-chai-200 rounded text-espresso-600 ml-1"
                  title={`Sort ${productSortOrder === "desc" ? "Ascending" : "Descending"}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Performance Table */}
        {displayProductRows.length === 0 ? (
          <div className="p-12 text-center text-espresso-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-chai-300" />
            <p className="font-bold text-espresso-700 text-sm">No products matched your search</p>
            <p className="text-xs text-espresso-500 mt-1">Try searching with a different product name, ID, or SKU.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-chai-100/70 text-espresso-700 font-bold uppercase tracking-wider border-b border-chai-200">
                <tr>
                  <th 
                    onClick={() => toggleSort("rank")}
                    className="py-3.5 px-4 cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span># Rank</span>
                      {productSortBy === "rank" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 min-w-[200px]">Product Info</th>
                  <th 
                    onClick={() => toggleSort("views")}
                    className="py-3.5 px-3 text-center cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                    title="Product detail views within the currently selected date filter"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Filter Views</span>
                      {productSortBy === "views" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("uniqueVisitors")}
                    className="py-3.5 px-3 text-center cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                    title="Estimated unique visitors who viewed this product"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Unique Visitors</span>
                      {productSortBy === "uniqueVisitors" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("todayViews")}
                    className="py-3.5 px-3 text-center cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                    title="Views recorded today since midnight"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Today</span>
                      {productSortBy === "todayViews" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("viewsLast7Days")}
                    className="py-3.5 px-3 text-center cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                    title="Views recorded across the last 7 days"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>7 Days</span>
                      {productSortBy === "viewsLast7Days" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("viewsLast30Days")}
                    className="py-3.5 px-3 text-center cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                    title="Views recorded across the last 30 days"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>30 Days</span>
                      {productSortBy === "viewsLast30Days" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("carts")}
                    className="py-3.5 px-3 text-center cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Add to Cart</span>
                      {productSortBy === "carts" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("checkouts")}
                    className="py-3.5 px-3 text-center cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                    title="Checkout starts involving this product"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Checkouts</span>
                      {productSortBy === "checkouts" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("orders")}
                    className="py-3.5 px-3 text-center cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                    title="Successfully completed orders attributed to this product"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Orders</span>
                      {productSortBy === "orders" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("conversionRate")}
                    className="py-3.5 px-4 text-right cursor-pointer hover:bg-chai-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Conversion</span>
                      {productSortBy === "conversionRate" && (
                        productSortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chai-100">
                {displayProductRows.map((row) => {
                  const hasData = row.views > 0 || row.carts > 0 || row.orders > 0;

                  return (
                    <tr 
                      key={row.productId} 
                      className="hover:bg-amber-50/40 transition-colors group"
                    >
                      {/* Rank column */}
                      <td className="py-3.5 px-4 font-extrabold text-espresso-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {row.rank === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-espresso-900 flex items-center justify-center text-xs shadow-xs font-black">
                              1
                            </span>
                          ) : row.rank === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300 text-espresso-900 flex items-center justify-center text-xs shadow-xs font-black">
                              2
                            </span>
                          ) : row.rank === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs shadow-xs font-black">
                              3
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-chai-100 text-espresso-600 flex items-center justify-center text-xs font-bold">
                              {row.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {row.thumbnail ? (
                            <img
                              src={row.thumbnail}
                              alt={row.productName}
                              className="w-10 h-10 rounded-xl object-cover border border-chai-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-chai-100 text-espresso-700 flex items-center justify-center font-bold text-sm border border-chai-200 flex-shrink-0">
                              {row.productName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-espresso-900 truncate max-w-[200px]" title={row.productName}>
                              {row.productName}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-espresso-500 mt-0.5">
                              <span className="font-mono bg-chai-100 px-1 py-0.2 rounded border border-chai-200">
                                ID: {row.productId}
                              </span>
                              {row.sku && <span>SKU: {row.sku}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Filter Views */}
                      <td className="py-3.5 px-3 text-center font-bold text-espresso-900">
                        {row.views > 0 ? (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-800 rounded-md font-extrabold border border-orange-200/60">
                            {row.views.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-espresso-300 font-medium">0</span>
                        )}
                      </td>

                      {/* Estimated Unique Visitors */}
                      <td className="py-3.5 px-3 text-center font-semibold text-espresso-800">
                        {row.uniqueVisitors > 0 ? (
                          <span>{row.uniqueVisitors.toLocaleString()}</span>
                        ) : (
                          <span className="text-espresso-300">0</span>
                        )}
                      </td>

                      {/* Today Views */}
                      <td className="py-3.5 px-3 text-center">
                        {row.todayViews > 0 ? (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[11px] border border-emerald-200">
                            +{row.todayViews}
                          </span>
                        ) : (
                          <span className="text-espresso-300">0</span>
                        )}
                      </td>

                      {/* Last 7 Days Views */}
                      <td className="py-3.5 px-3 text-center font-medium text-espresso-700">
                        {row.viewsLast7Days > 0 ? row.viewsLast7Days.toLocaleString() : <span className="text-espresso-300">0</span>}
                      </td>

                      {/* Last 30 Days Views */}
                      <td className="py-3.5 px-3 text-center font-medium text-espresso-700">
                        {row.viewsLast30Days > 0 ? row.viewsLast30Days.toLocaleString() : <span className="text-espresso-300">0</span>}
                      </td>

                      {/* Add to Cart Count */}
                      <td className="py-3.5 px-3 text-center font-bold text-amber-700">
                        {row.carts > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-50 rounded-md border border-amber-200">
                            {row.carts}
                          </span>
                        ) : (
                          <span className="text-espresso-300 font-normal">0</span>
                        )}
                      </td>

                      {/* Checkout Initiations */}
                      <td className="py-3.5 px-3 text-center font-semibold text-purple-700">
                        {row.checkouts > 0 ? (
                          <span className="px-2 py-0.5 bg-purple-50 rounded-md border border-purple-200">
                            {row.checkouts}
                          </span>
                        ) : (
                          <span className="text-espresso-300 font-normal">0</span>
                        )}
                      </td>

                      {/* Completed Orders Attributed */}
                      <td className="py-3.5 px-3 text-center font-black text-emerald-700">
                        {row.orders > 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 shadow-2xs">
                            {row.orders}
                          </span>
                        ) : (
                          <span className="text-espresso-300 font-normal">0</span>
                        )}
                      </td>

                      {/* Product Conversion Rate */}
                      <td className="py-3.5 px-4 text-right">
                        {row.conversionRate > 0 ? (
                          <div className="inline-flex items-center gap-1 font-extrabold text-emerald-700">
                            <span>{row.conversionRate.toFixed(1)}%</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                        ) : hasData ? (
                          <span className="text-espresso-400 font-semibold">0.0%</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-chai-100 text-espresso-400 rounded-full text-[10px] font-medium">
                            No data yet
                          </span>
                        )}
                      </td>

                      {/* View Performance Button */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedProductModal(row)}
                          className="px-2.5 py-1.5 bg-chai-100 hover:bg-marigold-500 hover:text-white text-espresso-800 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 mx-auto"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Section footer info */}
        <div className="p-4 bg-chai-50/70 border-t border-chai-100 flex flex-col sm:flex-row items-center justify-between text-xs text-espresso-500 gap-2">
          <div>
            Showing <span className="font-bold text-espresso-900">{displayProductRows.length}</span> products ({productPerformanceRows.filter(p => p.views > 0).length} with recorded view traffic).
          </div>
          <div className="flex items-center gap-1 text-[11px] text-espresso-600">
            <Info className="w-3.5 h-3.5 text-marigold-600" />
            <span>Product conversion rate calculated as (Completed Orders ÷ Total Views) × 100</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PRODUCT PERFORMANCE MODAL / FLYOUT DETAIL VIEW
      ===================================================================== */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-chai-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-chai-200 bg-gradient-to-r from-orange-50 via-white to-amber-50/30 flex items-start justify-between gap-4 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                {selectedProductModal.thumbnail ? (
                  <img
                    src={selectedProductModal.thumbnail}
                    alt={selectedProductModal.productName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-chai-200 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-marigold-100 text-marigold-800 flex items-center justify-center text-xl font-bold border-2 border-marigold-200 shadow-sm">
                    {selectedProductModal.productName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-marigold-100 text-marigold-800 text-[10px] font-black uppercase tracking-wider">
                      Rank #{selectedProductModal.rank}
                    </span>
                    <span className="text-xs text-espresso-500 font-semibold">{selectedProductModal.category}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-espresso-900 mt-0.5">
                    {selectedProductModal.productName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-espresso-600 mt-1">
                    <span className="font-mono bg-chai-100 px-2 py-0.5 rounded border border-chai-200 text-[11px]">
                      Product ID: {selectedProductModal.productId}
                    </span>
                    {selectedProductModal.sku && (
                      <span className="font-mono text-espresso-500">SKU: {selectedProductModal.sku}</span>
                    )}
                    {selectedProductModal.price && (
                      <span className="font-bold text-espresso-900">₹{selectedProductModal.price}</span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-chai-100 text-espresso-700">
                      {selectedProductModal.availabilityLabel}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProductModal(null)}
                className="p-2 text-espresso-400 hover:text-espresso-900 hover:bg-chai-100 rounded-xl transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 text-center">
                  <div className="text-xs font-bold text-orange-800 uppercase tracking-wider">Total Views</div>
                  <div className="text-2xl font-black text-espresso-900 mt-1">
                    {selectedProductModal.views.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-espresso-500 mt-0.5">In selected date filter</div>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
                  <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Unique Visitors</div>
                  <div className="text-2xl font-black text-espresso-900 mt-1">
                    {selectedProductModal.uniqueVisitors.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-espresso-500 mt-0.5">Distinct shopper IDs</div>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Add to Carts</div>
                  <div className="text-2xl font-black text-espresso-900 mt-1">
                    {selectedProductModal.carts.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-espresso-500 mt-0.5">Cart additions</div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Completed Orders</div>
                  <div className="text-2xl font-black text-emerald-800 mt-1">
                    {selectedProductModal.orders.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-espresso-500 mt-0.5">Confirmed checkouts</div>
                </div>
              </div>

              {/* Trajectory Breakdown (Today, 7D, 30D) */}
              <div className="bg-chai-50 p-4 rounded-2xl border border-chai-200">
                <h4 className="text-xs font-bold text-espresso-700 uppercase tracking-wider mb-3">
                  Historical View Cadence
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-chai-200">
                    <div className="text-[10px] font-bold text-espresso-500 uppercase">Today Since Midnight</div>
                    <div className="text-xl font-black text-espresso-900 mt-0.5">{selectedProductModal.todayViews}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-chai-200">
                    <div className="text-[10px] font-bold text-espresso-500 uppercase">Last 7 Days Views</div>
                    <div className="text-xl font-black text-espresso-900 mt-0.5">{selectedProductModal.viewsLast7Days}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-chai-200">
                    <div className="text-[10px] font-bold text-espresso-500 uppercase">Last 30 Days Views</div>
                    <div className="text-xl font-black text-espresso-900 mt-0.5">{selectedProductModal.viewsLast30Days}</div>
                  </div>
                </div>
              </div>

              {/* Historical 14-Day Trajectory SVG Chart */}
              <div className="bg-white p-5 rounded-2xl border border-chai-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-espresso-900 text-sm">14-Day Performance Trajectory</h3>
                    <p className="text-xs text-espresso-500">Daily product views vs. unique visitors</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-orange-500"></span>
                      <span className="text-espresso-600 font-medium">Views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                      <span className="text-espresso-600 font-medium">Unique Visitors</span>
                    </div>
                  </div>
                </div>

                {selectedProductTimeline.length === 0 || maxSelectedTimelineValue <= 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-espresso-400 text-xs">
                    <Calendar className="w-6 h-6 mb-1 text-chai-300" />
                    <span>No recorded event trajectory in this timeframe.</span>
                  </div>
                ) : (
                  <div className="relative pt-6">
                    <div className="h-44 w-full flex items-end justify-between gap-1 sm:gap-2 px-1 pb-6 border-b border-chai-200">
                      {selectedProductTimeline.map((item, idx) => {
                        const pvHeight = Math.max(6, Math.round((item.views / maxSelectedTimelineValue) * 100));
                        const uvHeight = Math.max(6, Math.round((item.uniqueVisitors / maxSelectedTimelineValue) * 100));

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Hover tooltip */}
                            <div className="absolute -top-12 bg-espresso-900 text-white text-[10px] rounded-lg py-1 px-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-lg">
                              <div className="font-bold">{item.label}</div>
                              <div>Views: {item.views}</div>
                              <div>Visitors: {item.uniqueVisitors}</div>
                              {item.carts > 0 && <div>Carts: {item.carts}</div>}
                              {item.orders > 0 && <div>Orders: {item.orders}</div>}
                            </div>

                            <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                              <div
                                style={{ height: `${pvHeight}%` }}
                                className="w-1/2 max-w-[12px] bg-orange-500 rounded-t-xs transition-all group-hover:bg-orange-600"
                              ></div>
                              <div
                                style={{ height: `${uvHeight}%` }}
                                className="w-1/2 max-w-[12px] bg-blue-500 rounded-t-xs transition-all group-hover:bg-blue-600"
                              ></div>
                            </div>

                            <span className="absolute -bottom-5 text-[9px] text-espresso-400 truncate max-w-full">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Conversion Funnel */}
              <div className="bg-white p-5 rounded-2xl border border-chai-200">
                <h3 className="font-bold text-espresso-900 text-sm mb-1">Product Conversion Funnel</h3>
                <p className="text-xs text-espresso-500 mb-4">Drop-off journey for this specific fragrance</p>

                <div className="space-y-3">
                  {/* Step 1: Views */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-espresso-800 mb-1">
                      <span>1. Product Page Views</span>
                      <span>{selectedProductModal.views} (100%)</span>
                    </div>
                    <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  {/* Step 2: Add to Cart */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-espresso-800 mb-1">
                      <span>2. Added to Cart</span>
                      <span>
                        {selectedProductModal.carts} (
                        {selectedProductModal.views > 0
                          ? ((selectedProductModal.carts / selectedProductModal.views) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2.5 rounded-full"
                        style={{
                          width: `${selectedProductModal.views > 0 ? Math.min(100, (selectedProductModal.carts / selectedProductModal.views) * 100) : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Step 3: Checkout Initiated */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-espresso-800 mb-1">
                      <span>3. Checkout Started</span>
                      <span>
                        {selectedProductModal.checkouts} (
                        {selectedProductModal.views > 0
                          ? ((selectedProductModal.checkouts / selectedProductModal.views) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{
                          width: `${selectedProductModal.views > 0 ? Math.min(100, (selectedProductModal.checkouts / selectedProductModal.views) * 100) : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Step 4: Completed Order */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-espresso-800 mb-1">
                      <span>4. Completed Orders</span>
                      <span className="text-emerald-700">
                        {selectedProductModal.orders} ({selectedProductModal.conversionRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2.5 rounded-full"
                        style={{
                          width: `${selectedProductModal.views > 0 ? Math.min(100, (selectedProductModal.orders / selectedProductModal.views) * 100) : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-chai-200 bg-chai-50 flex items-center justify-between text-xs">
              <span className="text-espresso-500">
                Performance data recorded exclusively from authenticated live store telemetry.
              </span>
              <button
                onClick={() => setSelectedProductModal(null)}
                className="px-4 py-2 bg-espresso-900 text-chai-50 rounded-xl font-bold hover:bg-espresso-800 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STORE TRAFFIC & CONVERSION FUNNEL
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Traffic Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-chai-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold font-serif text-espresso-900">Daily Website Traffic</h2>
              <p className="text-xs text-espresso-500">Trends across the selected timeframe</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-espresso-600 font-medium">Page Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-espresso-600 font-medium">Unique Visitors</span>
              </div>
            </div>
          </div>

          {dailyTimeline.length === 0 || maxDailyValue === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-espresso-400 text-sm">
              <Calendar className="w-8 h-8 mb-2 stroke-1 text-chai-300" />
              <span>No recorded events in this date range</span>
            </div>
          ) : (
            <div className="relative pt-4">
              <div className="h-64 w-full flex items-end justify-between gap-1 sm:gap-2 px-2 pb-6 border-b border-chai-200">
                {dailyTimeline.map((item, idx) => {
                  const pvHeightPercent = Math.max(6, Math.round((item.pageViews / maxDailyValue) * 100));
                  const vHeightPercent = Math.max(6, Math.round((item.visitors / maxDailyValue) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="absolute -top-12 bg-espresso-900 text-white text-[10px] rounded-lg py-1 px-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-lg">
                        <div className="font-bold">{item.label}</div>
                        <div>Page Views: {item.pageViews}</div>
                        <div>Visitors: {item.visitors}</div>
                      </div>

                      <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                        <div
                          style={{ height: `${pvHeightPercent}%` }}
                          className="w-1/2 max-w-[14px] bg-orange-500 rounded-t-sm transition-all group-hover:bg-orange-600"
                        ></div>
                        <div
                          style={{ height: `${vHeightPercent}%` }}
                          className="w-1/2 max-w-[14px] bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600"
                        ></div>
                      </div>

                      <span className="absolute -bottom-5 text-[10px] text-espresso-400 truncate max-w-full">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Global Conversion Funnel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-chai-200 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-espresso-900">Overall Store Funnel</h2>
            <p className="text-xs text-espresso-500 mb-6">Aggregate customer journey</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-espresso-700 mb-1">
                  <span>1. All Page Views</span>
                  <span>{metrics.totalPageViews}</span>
                </div>
                <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-espresso-700 mb-1">
                  <span>2. Product Details Viewed</span>
                  <span>
                    {metrics.productDetailViews} ({metrics.totalPageViews > 0 ? Math.round((metrics.productDetailViews / metrics.totalPageViews) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full"
                    style={{
                      width: `${metrics.totalPageViews > 0 ? (metrics.productDetailViews / metrics.totalPageViews) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-espresso-700 mb-1">
                  <span>3. Add to Cart</span>
                  <span>
                    {metrics.addToCartCount} ({metrics.productDetailViews > 0 ? Math.round((metrics.addToCartCount / metrics.productDetailViews) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full"
                    style={{
                      width: `${metrics.totalPageViews > 0 ? (metrics.addToCartCount / metrics.totalPageViews) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-espresso-700 mb-1">
                  <span>4. Checkout Started</span>
                  <span>
                    {metrics.checkoutStarts} ({metrics.addToCartCount > 0 ? Math.round((metrics.checkoutStarts / metrics.addToCartCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full"
                    style={{
                      width: `${metrics.totalPageViews > 0 ? (metrics.checkoutStarts / metrics.totalPageViews) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-espresso-700 mb-1">
                  <span>5. Completed Orders</span>
                  <span className="text-emerald-700 font-bold">
                    {metrics.completedOrders} ({metrics.checkoutStarts > 0 ? Math.round((metrics.completedOrders / metrics.checkoutStarts) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-chai-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full"
                    style={{
                      width: `${metrics.totalPageViews > 0 ? (metrics.completedOrders / metrics.totalPageViews) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-chai-200 bg-orange-50/50 rounded-xl p-3 text-xs text-orange-900">
            <span className="font-bold">Checkout Completion: </span>
            {metrics.checkoutStarts > 0
              ? `${((metrics.completedOrders / metrics.checkoutStarts) * 100).toFixed(1)}% of shoppers who started checkout completed their order`
              : "No checkout sessions initiated yet"}
          </div>
        </div>
      </div>

      {/* Traffic Sources & Device Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-chai-200">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold font-serif text-espresso-900">Traffic Sources</h2>
          </div>
          {trafficSources.length === 0 ? (
            <p className="text-xs text-espresso-400 py-6 text-center">No traffic source data available</p>
          ) : (
            <div className="space-y-3">
              {trafficSources.map((src, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-espresso-700">
                    <span className="font-medium truncate max-w-[200px]">{src.source}</span>
                    <span className="font-bold text-espresso-900">
                      {src.count} ({src.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-chai-100 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${src.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-chai-200">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold font-serif text-espresso-900">Device Breakdown</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {deviceMetrics.map((d, i) => (
              <div key={i} className="p-4 rounded-xl border border-chai-200 bg-chai-50/50 text-center">
                <div className="flex justify-center mb-2 text-espresso-500">
                  {d.category === "Mobile" && <Smartphone className="w-5 h-5 text-orange-500" />}
                  {d.category === "Desktop" && <Monitor className="w-5 h-5 text-blue-500" />}
                  {d.category === "Tablet" && <Tablet className="w-5 h-5 text-emerald-500" />}
                </div>
                <div className="text-xl font-bold text-espresso-900">{d.percentage}%</div>
                <div className="text-xs text-espresso-600 font-medium">{d.category}</div>
                <div className="text-[10px] text-espresso-400 mt-0.5">{d.count} views</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visitor Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-chai-200 overflow-hidden">
        <div className="p-6 border-b border-chai-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-espresso-900">Recent Visitor Activity</h2>
              <p className="text-xs text-espresso-500">Live stream of browsing, interactions, and orders</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search activity..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="px-3 py-1.5 text-xs border border-chai-200 rounded-xl bg-chai-50 focus:bg-white focus:outline-none w-44"
              />

              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-chai-200 rounded-xl bg-chai-50 focus:bg-white focus:outline-none text-espresso-700 font-medium"
              >
                <option value="all">All Events</option>
                <option value="page_view">Page Views</option>
                <option value="product_view">Product Views</option>
                <option value="product_click">Product Clicks</option>
                <option value="add_to_cart">Add to Cart</option>
                <option value="checkout_start">Checkout Start</option>
                <option value="order_completed">Orders Completed</option>
              </select>
            </div>
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="p-8 text-center text-espresso-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 text-chai-300" />
            <span>No activity matches the current filter.</span>
          </div>
        ) : (
          <div className="divide-y divide-chai-100 max-h-96 overflow-y-auto">
            {filteredActivity.map((ev, i) => {
              const timeStr = new Date(ev.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

              return (
                <div key={ev.id || i} className="p-4 flex items-center justify-between gap-4 hover:bg-chai-50/50 text-xs transition-colors">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
                        ev.event_type === "order_completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : ev.event_type === "checkout_start"
                          ? "bg-purple-100 text-purple-800"
                          : ev.event_type === "add_to_cart"
                          ? "bg-amber-100 text-amber-800"
                          : ev.event_type === "product_view"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-chai-100 text-espresso-700"
                      }`}
                    >
                      {ev.event_type.replace("_", " ")}
                    </span>

                    <div>
                      <div className="font-medium text-espresso-900">
                        {ev.product_name ? (
                          <span>
                            <span className="text-espresso-500">Product: </span>
                            <span className="font-bold">{ev.product_name}</span>
                          </span>
                        ) : (
                          <span>Path: {ev.path || "/"}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-espresso-400 flex items-center gap-2">
                        <span>Device: {ev.device_category || ev.device_type || "desktop"}</span>
                        <span>•</span>
                        <span>Source: {ev.traffic_source || "Direct"}</span>
                        {ev.session_duration_seconds ? (
                          <>
                            <span>•</span>
                            <span>Duration: {ev.session_duration_seconds}s</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-espresso-400 whitespace-nowrap">
                    <div>{timeStr}</div>
                    <div className="text-[10px] text-espresso-300">ID: {ev.visitor_id.slice(-6)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
