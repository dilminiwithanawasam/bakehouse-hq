"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
var react_router_1 = require("@tanstack/react-router");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var page_header_1 = require("@/components/page-header");
var stat_card_1 = require("@/components/dashboard/stat-card");
var chart_card_1 = require("@/components/dashboard/chart-card");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var auth_1 = require("@/lib/auth");
var mock_data_1 = require("@/lib/mock-data");
exports.Route = (0, react_router_1.createFileRoute)("/app/dashboard")({ component: DashboardPage });
var PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
function DashboardPage() {
    var user = (0, auth_1.useAuth)().user;
    if (!user)
        return null;
    return user.role === "salesperson" ? <SalespersonDashboard /> : <ExecutiveDashboard />;
}
function ExecutiveDashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    var response = (0, react_query_1.useQuery)({ queryKey: ["dashboard"], queryFn: api_1.api.getDashboardData }).data;
    // Safely extract data from the API response wrapper
    var data = response === null || response === void 0 ? void 0 : response.data;
    // Extract KPI metrics from today_stats with optional chaining
    var totalSalesToday = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.today_stats) === null || _a === void 0 ? void 0 : _a.sales) === null || _b === void 0 ? void 0 : _b.total_revenue) !== null && _c !== void 0 ? _c : 0;
    var totalItemsToday = (_f = (_e = (_d = data === null || data === void 0 ? void 0 : data.today_stats) === null || _d === void 0 ? void 0 : _d.sales) === null || _e === void 0 ? void 0 : _e.transaction_count) !== null && _f !== void 0 ? _f : 0;
    var wastageCost = (_j = (_h = (_g = data === null || data === void 0 ? void 0 : data.today_stats) === null || _g === void 0 ? void 0 : _g.wastage) === null || _h === void 0 ? void 0 : _h.total_loss) !== null && _j !== void 0 ? _j : 0;
    var lowStockCount = (_m = (_l = (_k = data === null || data === void 0 ? void 0 : data.today_stats) === null || _k === void 0 ? void 0 : _k.stock) === null || _l === void 0 ? void 0 : _l.low_stock_count) !== null && _m !== void 0 ? _m : 0;
    var outOfStockCount = (_q = (_p = (_o = data === null || data === void 0 ? void 0 : data.today_stats) === null || _o === void 0 ? void 0 : _o.stock) === null || _p === void 0 ? void 0 : _p.out_of_stock_count) !== null && _q !== void 0 ? _q : 0;
    // Map list data from API response with proper property extraction
    var lowStock = (_s = (_r = data === null || data === void 0 ? void 0 : data.low_stock_alerts) === null || _r === void 0 ? void 0 : _r.map(function (item) {
        var _a, _b;
        return ({
            id: item === null || item === void 0 ? void 0 : item.id,
            name: item === null || item === void 0 ? void 0 : item.name,
            stock: (_a = item === null || item === void 0 ? void 0 : item.stock) !== null && _a !== void 0 ? _a : 0,
            minStock: (_b = item === null || item === void 0 ? void 0 : item.min_stock) !== null && _b !== void 0 ? _b : 0,
            category: item === null || item === void 0 ? void 0 : item.category__name,
        });
    })) !== null && _s !== void 0 ? _s : [];
    var productSales = (_u = (_t = data === null || data === void 0 ? void 0 : data.top_products) === null || _t === void 0 ? void 0 : _t.map(function (p) {
        var _a, _b;
        return ({
            id: p === null || p === void 0 ? void 0 : p.product__id,
            name: p === null || p === void 0 ? void 0 : p.product__name,
            qty: (_a = p === null || p === void 0 ? void 0 : p.total_qty) !== null && _a !== void 0 ? _a : 0,
            revenue: (_b = p === null || p === void 0 ? void 0 : p.total_revenue) !== null && _b !== void 0 ? _b : 0,
        });
    })) !== null && _u !== void 0 ? _u : [];
    var best = productSales === null || productSales === void 0 ? void 0 : productSales[0];
    // Map wastage breakdown with proper property extraction
    var wastageTrend = (_w = (_v = data === null || data === void 0 ? void 0 : data.wastage_breakdown) === null || _v === void 0 ? void 0 : _v.map(function (w) {
        var _a, _b;
        return ({
            reason: w === null || w === void 0 ? void 0 : w.reason,
            count: (_a = w === null || w === void 0 ? void 0 : w.count) !== null && _a !== void 0 ? _a : 0,
            loss: (_b = w === null || w === void 0 ? void 0 : w.total_loss) !== null && _b !== void 0 ? _b : 0,
        });
    })) !== null && _w !== void 0 ? _w : [];
    return (<>
      <page_header_1.PageHeader title="Executive dashboard" description="Real-time view of outlet performance, inventory and losses." actions={<>
            <tabs_1.Tabs defaultValue="today">
              <tabs_1.TabsList className="rounded-lg">
                <tabs_1.TabsTrigger value="today">Today</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="week">Week</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="month">Month</tabs_1.TabsTrigger>
              </tabs_1.TabsList>
            </tabs_1.Tabs>
            <button_1.Button variant="outline" size="sm"><lucide_react_1.Download className="h-4 w-4 mr-2"/>Export</button_1.Button>
          </>}/>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <stat_card_1.StatCard label="Sales today" value={(0, mock_data_1.currency)(totalSalesToday)} delta="+12.4% vs yesterday" trend="up" icon={lucide_react_1.IndianRupee}/>
        <stat_card_1.StatCard label="Items sold" value={totalItemsToday} delta="+8.1%" trend="up" icon={lucide_react_1.ShoppingBag} accent="amber"/>
        <stat_card_1.StatCard label="Wastage cost" value={(0, mock_data_1.currency)(wastageCost)} delta="-4.2% vs avg" trend="up" icon={lucide_react_1.Trash2} accent="destructive"/>
        <stat_card_1.StatCard label="Net revenue" value={(0, mock_data_1.currency)(totalSalesToday - wastageCost)} delta="+11.6%" trend="up" icon={lucide_react_1.TrendingUp} accent="sage"/>
        <stat_card_1.StatCard label="Low stock alerts" value={lowStockCount + outOfStockCount} delta={"".concat(lowStockCount + outOfStockCount, " need restock")} trend="down" icon={lucide_react_1.AlertTriangle} accent="destructive"/>
        <stat_card_1.StatCard label="Top product" value={(_x = best === null || best === void 0 ? void 0 : best.name) !== null && _x !== void 0 ? _x : "—"} delta={"".concat((_y = best === null || best === void 0 ? void 0 : best.qty) !== null && _y !== void 0 ? _y : 0, " sold")} icon={lucide_react_1.Star} accent="amber"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <chart_card_1.ChartCard title="Daily sales trend" description="Last 14 days" className="lg:col-span-2">
          <recharts_1.ResponsiveContainer width="100%" height={280}>
            <recharts_1.AreaChart data={(_1 = (_0 = (_z = data === null || data === void 0 ? void 0 : data.period_comparison) === null || _z === void 0 ? void 0 : _z.current_period) === null || _0 === void 0 ? void 0 : _0.dates) !== null && _1 !== void 0 ? _1 : []}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <recharts_1.XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <recharts_1.YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <recharts_1.Tooltip contentStyle={tooltipStyle}/>
              <recharts_1.Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2}/>
            </recharts_1.AreaChart>
          </recharts_1.ResponsiveContainer>
        </chart_card_1.ChartCard>

        <chart_card_1.ChartCard title="Category mix" description="Share of revenue">
          <recharts_1.ResponsiveContainer width="100%" height={280}>
            <recharts_1.PieChart>
              <recharts_1.Pie data={(_4 = (_3 = (_2 = data === null || data === void 0 ? void 0 : data.period_comparison) === null || _2 === void 0 ? void 0 : _2.current_period) === null || _3 === void 0 ? void 0 : _3.categories) !== null && _4 !== void 0 ? _4 : []} dataKey="total" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {((_7 = (_6 = (_5 = data === null || data === void 0 ? void 0 : data.period_comparison) === null || _5 === void 0 ? void 0 : _5.current_period) === null || _6 === void 0 ? void 0 : _6.categories) !== null && _7 !== void 0 ? _7 : []).map(function (_, i) { return <recharts_1.Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>; })}
              </recharts_1.Pie>
              <recharts_1.Tooltip contentStyle={tooltipStyle}/>
              <recharts_1.Legend iconType="circle" wrapperStyle={{ fontSize: 12 }}/>
            </recharts_1.PieChart>
          </recharts_1.ResponsiveContainer>
        </chart_card_1.ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <chart_card_1.ChartCard title="Sales by hour" description="Today's hourly volume">
          <recharts_1.ResponsiveContainer width="100%" height={240}>
            <recharts_1.BarChart data={(_10 = (_9 = (_8 = data === null || data === void 0 ? void 0 : data.period_comparison) === null || _8 === void 0 ? void 0 : _8.current_period) === null || _9 === void 0 ? void 0 : _9.hourly) !== null && _10 !== void 0 ? _10 : []}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <recharts_1.XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}/>
              <recharts_1.YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}/>
              <recharts_1.Tooltip contentStyle={tooltipStyle}/>
              <recharts_1.Bar dataKey="sales" fill="var(--chart-2)" radius={[6, 6, 0, 0]}/>
            </recharts_1.BarChart>
          </recharts_1.ResponsiveContainer>
        </chart_card_1.ChartCard>

        <chart_card_1.ChartCard title="Wastage trend" description="Daily loss in INR">
          <recharts_1.ResponsiveContainer width="100%" height={240}>
            <recharts_1.LineChart data={wastageTrend}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <recharts_1.XAxis dataKey="reason" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}/>
              <recharts_1.YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}/>
              <recharts_1.Tooltip contentStyle={tooltipStyle}/>
              <recharts_1.Line type="monotone" dataKey="loss" stroke="var(--destructive)" strokeWidth={2} dot={{ r: 3 }}/>
            </recharts_1.LineChart>
          </recharts_1.ResponsiveContainer>
        </chart_card_1.ChartCard>

        <chart_card_1.ChartCard title="Top selling products" description="By quantity sold">
          <recharts_1.ResponsiveContainer width="100%" height={240}>
            <recharts_1.BarChart data={productSales.slice(0, 5)} layout="vertical" margin={{ left: 120 }}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
              <recharts_1.XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}/>
              <recharts_1.YAxis dataKey="name" type="category" width={110} stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}/>
              <recharts_1.Tooltip contentStyle={tooltipStyle}/>
              <recharts_1.Bar dataKey="qty" fill="var(--chart-1)" radius={[0, 6, 6, 0]}/>
            </recharts_1.BarChart>
          </recharts_1.ResponsiveContainer>
        </chart_card_1.ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <card_1.Card className="rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top selling products</h3>
            <button_1.Button variant="ghost" size="sm">View all</button_1.Button>
          </div>
          <div className="space-y-2">
            {productSales.slice(0, 6).map(function (p) { return (<div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.qty} units · {(0, mock_data_1.currency)(p.revenue)}</div>
                </div>
                <div className="text-sm font-semibold">{(0, mock_data_1.currency)(p.revenue)}</div>
              </div>); })}
          </div>
        </card_1.Card>

        <card_1.Card className="rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Stock alerts</h3>
            <badge_1.Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">{lowStockCount + outOfStockCount}</badge_1.Badge>
          </div>
          <div className="space-y-2">
            {lowStock.slice(0, 6).map(function (p) { return (<div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Min {p.minStock} · {p.category}</div>
                </div>
                <badge_1.Badge variant="secondary" className={p.stock === 0
                ? "bg-destructive/10 text-destructive border-0"
                : "bg-accent/40 text-foreground border-0"}>
                  {p.stock === 0 ? "Out" : "".concat(p.stock, " left")}
                </badge_1.Badge>
              </div>); })}
          </div>
        </card_1.Card>
      </div>
    </>);
}
function SalespersonDashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var response = (0, react_query_1.useQuery)({ queryKey: ["dashboard"], queryFn: api_1.api.getDashboardData }).data;
    var data = response === null || response === void 0 ? void 0 : response.data;
    var totalSalesToday = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.today_stats) === null || _a === void 0 ? void 0 : _a.sales) === null || _b === void 0 ? void 0 : _b.total_revenue) !== null && _c !== void 0 ? _c : 0;
    var totalItemsToday = (_f = (_e = (_d = data === null || data === void 0 ? void 0 : data.today_stats) === null || _d === void 0 ? void 0 : _d.sales) === null || _e === void 0 ? void 0 : _e.transaction_count) !== null && _f !== void 0 ? _f : 0;
    var lowStockCount = (_j = (_h = (_g = data === null || data === void 0 ? void 0 : data.today_stats) === null || _g === void 0 ? void 0 : _g.stock) === null || _h === void 0 ? void 0 : _h.low_stock_count) !== null && _j !== void 0 ? _j : 0;
    var outOfStockCount = (_m = (_l = (_k = data === null || data === void 0 ? void 0 : data.today_stats) === null || _k === void 0 ? void 0 : _k.stock) === null || _l === void 0 ? void 0 : _l.out_of_stock_count) !== null && _m !== void 0 ? _m : 0;
    var productSales = (_p = (_o = data === null || data === void 0 ? void 0 : data.top_products) === null || _o === void 0 ? void 0 : _o.map(function (p) {
        var _a, _b;
        return ({
            id: p === null || p === void 0 ? void 0 : p.product__id,
            name: p === null || p === void 0 ? void 0 : p.product__name,
            qty: (_a = p === null || p === void 0 ? void 0 : p.total_qty) !== null && _a !== void 0 ? _a : 0,
            revenue: (_b = p === null || p === void 0 ? void 0 : p.total_revenue) !== null && _b !== void 0 ? _b : 0,
        });
    })) !== null && _p !== void 0 ? _p : [];
    return (<>
      <page_header_1.PageHeader title="Good morning, today's floor" description="A quick view of your shift performance."/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <stat_card_1.StatCard label="Sales today" value={(0, mock_data_1.currency)(totalSalesToday)} delta="+9% vs avg" trend="up" icon={lucide_react_1.IndianRupee}/>
        <stat_card_1.StatCard label="Transactions" value={totalItemsToday} icon={lucide_react_1.ShoppingCart} accent="amber"/>
        <stat_card_1.StatCard label="Items sold" value={totalItemsToday} icon={lucide_react_1.ShoppingBag} accent="sage"/>
        <stat_card_1.StatCard label="Pending counts" value={lowStockCount + outOfStockCount} delta={"".concat(lowStockCount + outOfStockCount, " categories low")} icon={lucide_react_1.Boxes} accent="destructive"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <chart_card_1.ChartCard title="Top products today" description="Units sold" className="lg:col-span-2">
          <recharts_1.ResponsiveContainer width="100%" height={260}>
            <recharts_1.BarChart data={productSales.slice(0, 7)}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <recharts_1.XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <recharts_1.YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <recharts_1.Tooltip contentStyle={tooltipStyle}/>
              <recharts_1.Bar dataKey="qty" fill="var(--chart-2)" radius={[6, 6, 0, 0]}/>
            </recharts_1.BarChart>
          </recharts_1.ResponsiveContainer>
        </chart_card_1.ChartCard>

        <card_1.Card className="rounded-xl p-5">
          <h3 className="font-semibold mb-4">Quick actions</h3>
          <div className="grid grid-cols-1 gap-2">
            <a href="/app/sales" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition">
              <span className="text-sm font-medium flex items-center gap-2"><lucide_react_1.ShoppingCart className="h-4 w-4"/>New sale</span>
              <lucide_react_1.Plus className="h-4 w-4 text-muted-foreground"/>
            </a>
            <a href="/app/wastage" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition">
              <span className="text-sm font-medium flex items-center gap-2"><lucide_react_1.Trash2 className="h-4 w-4"/>Record wastage</span>
              <lucide_react_1.Plus className="h-4 w-4 text-muted-foreground"/>
            </a>
            <a href="/app/stock" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition">
              <span className="text-sm font-medium flex items-center gap-2"><lucide_react_1.Boxes className="h-4 w-4"/>Update stock</span>
              <lucide_react_1.Plus className="h-4 w-4 text-muted-foreground"/>
            </a>
          </div>
        </card_1.Card>
      </div>

      <card_1.Card className="rounded-xl p-5 mt-4">
        <h3 className="font-semibold mb-4">Top products</h3>
        <div className="space-y-2">
          {productSales.slice(0, 5).map(function (p) { return (<div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.qty} units · {(0, mock_data_1.currency)(p.revenue)}</div>
              </div>
              <div className="text-sm font-semibold">{(0, mock_data_1.currency)(p.revenue)}</div>
            </div>); })}
        </div>
      </card_1.Card>
    </>);
}
var tooltipStyle = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--foreground)",
};
