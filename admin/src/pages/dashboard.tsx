import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useSWR from "swr";
import {
  ArrowUpRight,
  Box,
  CircleDollarSign,
  Clock3,
  Mail,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Fetch } from "@/middlewares/Fetch";
import type { RootState } from "@/store/RootStore";
import type { OrderTypes, ProductTypes } from "@/types/RootTypes";

const fetcher = (url: string) => Fetch.get(url).then((response) => response.data);

const statusLabels: Record<string, string> = {
  pending: "Kutilmoqda",
  processing: "Jarayonda",
  shipped: "Yuborilgan",
  delivered: "Yetkazilgan",
  cancelled: "Bekor qilingan",
};

const statusStyles: Record<string, string> = {
  pending: "wb-status wb-status-pending",
  processing: "wb-status wb-status-processing",
  shipped: "wb-status wb-status-shipped",
  delivered: "wb-status wb-status-delivered",
  cancelled: "wb-status wb-status-cancelled",
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("uz-UZ", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const shortMonths = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyun",
  "Iyul",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

const formatDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")} ${shortMonths[date.getMonth()]} ${date.getFullYear()}`;

function getCollection<T>(value: unknown, key?: string): T[] {
  if (Array.isArray(value)) return value as T[];
  if (key && value && typeof value === "object") {
    const collection = (value as Record<string, unknown>)[key];
    if (Array.isArray(collection)) return collection as T[];
  }
  return [];
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  loading,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof ShoppingBag;
  tone: string;
  loading?: boolean;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-9 w-24" />
          ) : (
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          )}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
        {detail}
      </p>
    </article>
  );
}

export default function Dashboard() {
  const productState = useSelector((state: RootState) => state.product);
  const contactState = useSelector((state: RootState) => state.contact);
  const blogState = useSelector((state: RootState) => state.blog);
  const user = useSelector((state: RootState) => state.user.data);

  const {
    data: orderData,
    error: orderError,
    isLoading: ordersLoading,
    isValidating,
    mutate,
  } = useSWR("order?page=1&limit=100", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
    keepPreviousData: true,
  });

  const orders = useMemo(
    () => getCollection<OrderTypes>(orderData, "orders"),
    [orderData],
  );
  const totalOrders = Number(
    orderData && typeof orderData === "object" && "totalOrders" in orderData
      ? orderData.totalOrders
      : orders.length,
  );
  const products = useMemo(
    () => getCollection<ProductTypes>(productState.data, "products"),
    [productState.data],
  );
  const contacts = useMemo(
    () => getCollection(contactState.data, "contacts"),
    [contactState.data],
  );
  const blogs = useMemo(
    () => getCollection(blogState.data, "blogs"),
    [blogState.data],
  );

  const totalValue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0),
    [orders],
  );
  const pendingOrders = useMemo(
    () => orders.filter((order) => (order.status || "pending") === "pending").length,
    [orders],
  );
  const availableProducts = useMemo(
    () => products.filter((product) => product.stock !== false).length,
    [products],
  );
  const outOfStock = products.length - availableProducts;

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        name: shortMonths[date.getMonth()],
        orders: 0,
        value: 0,
      };
    });

    const monthMap = new Map(months.map((month) => [month.key, month]));
    orders.forEach((order) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const item = monthMap.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (!item) return;
      item.orders += 1;
      item.value += Number(order.total_price || 0);
    });

    return months;
  }, [orders]);

  const statusData = useMemo(() => {
    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    return statuses.map((status) => ({
      status,
      label: statusLabels[status],
      count: orders.filter((order) => (order.status || "pending") === status).length,
    }));
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 5),
    [orders],
  );

  const dashboardLoading =
    ordersLoading || productState.loading || contactState.loading || blogState.loading;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-700">White Bear boshqaruv markazi</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">
            Salom, {"firstName" in user ? user.firstName : "Admin"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Savdo, mahsulot va mijozlar holatini bitta ekranda kuzating.
          </p>
        </div>
        <div className="flex self-end items-center gap-3">
          <span className="hidden text-xs text-slate-500 sm:block">
            Oxirgi yangilanish: hozir
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-slate-200 bg-white"
            onClick={() => mutate()}
            disabled={isValidating}
            title="Ma'lumotlarni yangilash"
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </section>

      {orderError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Buyurtmalar statistikasi vaqtincha yuklanmadi. Qayta yangilab ko'ring.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Jami buyurtmalar"
          value={compactFormatter.format(totalOrders)}
          detail={`${pendingOrders} ta buyurtma kutmoqda`}
          icon={ShoppingBag}
          tone="bg-[#edf4fb] text-[#285f8c] dark:bg-[#142b40] dark:text-[#91c7ed]"
          loading={dashboardLoading}
        />
        <MetricCard
          label="Buyurtmalar qiymati"
          value={moneyFormatter.format(totalValue)}
          detail="Barcha buyurtmalar bo'yicha"
          icon={CircleDollarSign}
          tone="bg-[#e9f6f6] text-[#176b78] dark:bg-[#12313a] dark:text-[#82d1dc]"
          loading={dashboardLoading}
        />
        <MetricCard
          label="Mahsulotlar"
          value={compactFormatter.format(products.length)}
          detail={`${outOfStock} ta mahsulot qolmagan`}
          icon={Box}
          tone="bg-[#eef3f7] text-[#4b6274] dark:bg-[#172a3b] dark:text-[#b5c7d5]"
          loading={dashboardLoading}
        />
        <MetricCard
          label="Murojaatlar"
          value={compactFormatter.format(contacts.length)}
          detail={`${blogs.length} ta faol blog materiali`}
          icon={Mail}
          tone="bg-[#eaf7f1] text-[#246a53] dark:bg-[#133129] dark:text-[#82d5b3]"
          loading={dashboardLoading}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)]">
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Savdo dinamikasi</h2>
              <p className="text-xs text-slate-500">So'nggi 6 oy buyurtmalari va qiymati</p>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 sm:mt-0">
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-blue-600" />
                Buyurtma
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-cyan-500" />
                Qiymat
              </span>
            </div>
          </div>
          <div className="mt-5 h-[290px] w-full">
            {dashboardLoading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={1}
                initialDimension={{ width: 500, height: 290 }}
              >
                <AreaChart data={monthlyData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orderArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis
                    yAxisId="orders"
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis yAxisId="value" orientation="right" hide />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: "#dbe4ee", boxShadow: "0 10px 30px rgba(15,23,42,.08)" }}
                    formatter={(value, name) =>
                      name === "value"
                        ? [moneyFormatter.format(Number(value)), "Qiymat"]
                        : [Number(value), "Buyurtma"]
                    }
                  />
                  <Area
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#orderArea)"
                    activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                  />
                  <Area
                    yAxisId="value"
                    type="monotone"
                    dataKey="value"
                    stroke="#0891b2"
                    strokeWidth={2}
                    fill="transparent"
                    activeDot={{ r: 4, fill: "#0891b2", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Buyurtma holati</h2>
            <p className="text-xs text-slate-500">Joriy jarayon bo'yicha taqsimot</p>
          </div>
          <div className="mt-6 space-y-5">
            {statusData.map((item) => {
              const percentage = orders.length ? Math.round((item.count / orders.length) * 100) : 0;
              return (
                <div key={item.status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={
                        item.status === "pending"
                          ? "h-full rounded-full bg-[#c79536]"
                          : item.status === "delivered"
                            ? "h-full rounded-full bg-[#2f8b6b]"
                            : item.status === "cancelled"
                              ? "h-full rounded-full bg-[#b05a66]"
                              : item.status === "shipped"
                                ? "h-full rounded-full bg-[#3b8899]"
                                : "h-full rounded-full bg-[#3974a6]"
                      }
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to="/orders"
            className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Barcha buyurtmalar
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.65fr)]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">So'nggi buyurtmalar</h2>
              <p className="text-xs text-slate-500">Eng yangi 5 ta buyurtma</p>
            </div>
            <Link to="/orders" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
              Barchasini ko'rish
            </Link>
          </div>
          <div className="divide-y divide-slate-100 sm:hidden">
            {dashboardLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))
              : recentOrders.map((order) => (
                  <div key={order._id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {order.order_id || "Noma'lum"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.customer?.name || "Mehmon"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-950">
                        {moneyFormatter.format(Number(order.total_price || 0))}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[order.status || "pending"]
                        }`}
                      >
                        {statusLabels[order.status || "pending"]}
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.createdAt ? formatDate(new Date(order.createdAt)) : "-"}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Buyurtma</th>
                  <th className="px-5 py-3">Mijoz</th>
                  <th className="px-5 py-3">Sana</th>
                  <th className="px-5 py-3">Holat</th>
                  <th className="px-5 py-3 text-right">Qiymat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index}>
                        <td colSpan={5} className="px-5 py-4">
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  : recentOrders.map((order) => (
                      <tr key={order._id} className="text-sm hover:bg-slate-50/70">
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {order.order_id || "Noma'lum"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {order.customer?.name || "Mehmon"}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {order.createdAt ? formatDate(new Date(order.createdAt)) : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusStyles[order.status || "pending"]
                            }`}
                          >
                            {statusLabels[order.status || "pending"]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-900">
                          {moneyFormatter.format(Number(order.total_price || 0))}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {!dashboardLoading && recentOrders.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              Hozircha buyurtmalar mavjud emas.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h2 className="text-base font-semibold text-slate-950">Ombor holati</h2>
          <p className="text-xs text-slate-500">Mahsulot mavjudligi</p>
          <div className="mt-6 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <PackageCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{availableProducts}</p>
              <p className="text-xs text-slate-500">Sotuvda mavjud</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock3 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{outOfStock}</p>
              <p className="text-xs text-slate-500">Qayta to'ldirish kerak</p>
            </div>
          </div>
          <Link
            to="/products"
            className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Omborni boshqarish
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
