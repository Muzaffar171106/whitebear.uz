import { Image, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import useSWR from "swr";
import { Fetch } from "@/middlewares/Fetch";
import { useMemo, useState } from "react";
import type { OrderTypes } from "@/types/RootTypes";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const paymentOptions = ["paid", "unpaid"] as const;
const statusLabels: Record<(typeof statusOptions)[number], string> = {
    pending: "Kutilmoqda",
    processing: "Jarayonda",
    shipped: "Yuborilgan",
    delivered: "Yetkazilgan",
    cancelled: "Bekor qilingan",
};
const paymentLabels: Record<(typeof paymentOptions)[number], string> = {
    paid: "To'langan",
    unpaid: "To'lanmagan",
};
const statusColors: Record<string, string> = {
    pending: "wb-status wb-status-pending",
    processing: "wb-status wb-status-processing",
    shipped: "wb-status wb-status-shipped",
    delivered: "wb-status wb-status-delivered",
    cancelled: "wb-status wb-status-cancelled",
};
const paymentColors: Record<string, string> = {
    paid: "wb-payment wb-payment-paid",
    unpaid: "wb-payment wb-payment-unpaid",
};
const typeColors: Record<string, string> = {
    delivery: "wb-type",
    pickup: "wb-type",
};
const paymentMethodColors: Record<string, string> = {
    cash: "wb-paymethod",
    card: "wb-paymethod",
};
const fetcher = (url: string) => Fetch.get(url).then((res) => res.data);

export const Orders = () => {
    const { data, error, isLoading, mutate } = useSWR("order?page=1&limit=100", fetcher);
    const [searchTerm, setSearchTerm] = useState("");
    const orders = useMemo<OrderTypes[]>(
        () => Array.isArray(data?.orders) ? data.orders : Array.isArray(data) ? data : [],
        [data]
    );
    const totalOrders = Number(data?.totalOrders ?? orders.length);
    const [lang, setLang] = useState<"en" | "uz" | "ru" | "ch">("uz");
    const filteredOrders = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) return orders;

        return orders.filter((order: OrderTypes) => {
            const productText = (order.products ?? [])
                .map((item) => [item.product_id?.title?.en, item.product_id?.title?.uz, item.product_id?.title?.ru, item.product_id?.title?.ch].filter(Boolean).join(" "))
                .join(" ");

            return [order.order_id, order.customer?.name, order.customer?.email, order.customer?.phone, order.status, order.payment_status, productText]
                .join(" ")
                .toLowerCase()
                .includes(term);
        });
    }, [orders, searchTerm]);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await Fetch.put(`/order/${id}/status`, { status });
            toast.success("Order status updated");
            mutate();
        } catch (err) {
            toast.error("Unable to update order status");
            console.error(err);
        }
    };

    const handlePaymentChange = async (id: string, payment_status: string) => {
        try {
            await Fetch.put(`/order/${id}/payment`, { payment_status });
            toast.success("Payment status updated");
            mutate();
        } catch (err) {
            toast.error("Unable to update payment status");
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            await Fetch.delete(`/order/${id}`);
            toast.success("Order deleted");
            mutate();
        } catch (err) {
            toast.error("Unable to delete order");
            console.error(err);
        }
    };

    if (error) {
        return (
            <div className="min-h-[calc(100vh-70px)] rounded-lg border border-slate-200 bg-white p-4">
                <h1 className="text-center text-destructive">Error loading orders</h1>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-70px)] rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-center h-[calc(100vh-150px)]">
                    <Loader2 className="animate-spin text-cyan-600" size={30} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-70px)] rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Buyurtmalar</h1>
                    <p className="text-sm text-slate-500">Buyurtma, to'lov va mahsulot holatini bir joyda boshqaring.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="relative block w-full sm:min-w-[280px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Buyurtma, mijoz yoki mahsulot..."
                            className="mt-0 rounded-lg border-slate-300 bg-slate-50 pl-9 text-slate-900 shadow-none focus-visible:ring-slate-200"
                        />
                    </label>
                    <Select onValueChange={(value) => setLang(value as "en" | "uz" | "ru" | "ch")} value={lang}>
                        <SelectTrigger className="w-full rounded-lg bg-white text-slate-900 sm:w-24">
                            <SelectValue placeholder="Til" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="uz">UZ</SelectItem>
                            <SelectItem value="en">EN</SelectItem>
                            <SelectItem value="ru">RU</SelectItem>
                            <SelectItem value="ch">CH</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="inline-flex h-9 min-w-[72px] shrink-0 items-center justify-center self-stretch whitespace-nowrap rounded-lg bg-blue-50 px-3 text-center text-xs font-semibold text-blue-700 sm:self-auto">
                        {searchTerm.trim() ? `${filteredOrders.length} / ${totalOrders}` : `${totalOrders} ta`}
                    </span>
                </div>
            </div>

            <div className="space-y-4 lg:hidden">
                {filteredOrders.map((order: OrderTypes) => (
                    <article key={order._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-950">{order.order_id}</p>
                                <p className="mt-1 text-xs text-slate-500">{order.customer?.name || "-"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-semibold text-slate-950">${order.total_price ?? 0}</p>
                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${typeColors[order.driver ? "delivery" : "pickup"]}`}>
                                    {order.driver ? "Yetkazish" : "Olib ketish"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-slate-500">
                            <p>{order.customer?.email || "-"}</p>
                            <p>{order.customer?.phone || "-"}</p>
                            {order.customer?.address && <p>{order.customer.address}</p>}
                        </div>

                        <div className="mt-4 space-y-2">
                            {(order.products ?? []).map((item) => {
                                const productTitle = item.product_id?.title?.[lang] ?? item.product_id?.title?.en ?? "O'chirilgan mahsulot";
                                return (
                                    <div key={item._id || item.product_id?._id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
                                        {item.product_id?.image ? (
                                            <img src={item.product_id.image} alt="" loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain" />
                                        ) : (
                                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400">
                                                <Image className="h-5 w-5" />
                                            </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-slate-900">{productTitle}</p>
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                {item.quantity ?? 0} dona x ${item.price ?? 0}
                                            </p>
                                            {item.size && (
                                                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                                    O'lcham: {item.size}
                                                </p>
                                            )}
                                        </div>
                                        <p className="shrink-0 text-xs font-semibold text-slate-900">
                                            ${((item.quantity ?? 0) * (item.price ?? 0)).toFixed(2)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Holat</label>
                                <Select value={order.status ?? "pending"} onValueChange={(value) => handleStatusChange(String(order._id), value)}>
                                    <SelectTrigger className={`w-full rounded-lg text-xs ${statusColors[order.status ?? "pending"]}`}>
                                        <SelectValue placeholder="Holat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((item) => <SelectItem key={item} value={item}>{statusLabels[item]}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[11px] font-medium text-slate-500">To'lov</label>
                                <Select value={order.payment_status ?? "unpaid"} onValueChange={(value) => handlePaymentChange(String(order._id), value)}>
                                    <SelectTrigger className={`w-full rounded-lg text-xs ${paymentColors[order.payment_status ?? "unpaid"]}`}>
                                        <SelectValue placeholder="To'lov" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentOptions.map((item) => <SelectItem key={item} value={item}>{paymentLabels[item]}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${paymentMethodColors[order.payment ?? "cash"]}`}>
                                {order.payment ?? "cash"}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Buyurtmani o'chirish"
                                onClick={() => order._id && handleDelete(order._id)}
                                className="wb-delete-button h-9 w-9 rounded-lg"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border border-slate-200 lg:block">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="min-w-[180px]">Buyurtma</TableHead>
                            <TableHead className="min-w-[260px]">Mahsulotlar</TableHead>
                            <TableHead>Holat</TableHead>
                            <TableHead>To'lov</TableHead>
                            <TableHead>Jami</TableHead>
                            <TableHead className="text-right">Amallar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map((order: OrderTypes) => (
                            <TableRow key={order._id} className="align-top hover:bg-slate-50/80 dark:hover:bg-[#142536]">
                                <TableCell className="align-top">
                                    <div className="space-y-1 text-sm text-slate-700">
                                        <p className="text-base font-semibold text-slate-900">{order.order_id}</p>
                                        <p>{order.customer?.name || "—"}</p>
                                        <p className="text-slate-500">{order.customer?.email || "—"}</p>
                                        <p className="text-slate-500">{order.customer?.phone || "—"}</p>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${typeColors[order.driver ? "delivery" : "pickup"] || "bg-white text-slate-900"}`}>
                                            {order.driver ? "Delivery" : "Pickup"}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="space-y-3">
                                        {(order.products ?? []).map((item) => {
                                            const lineTotal = (item.quantity ?? 0) * (item.price ?? 0);

                                            return (
                                                <div key={item._id || item.product_id?._id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                                                    {
                                                        item.product_id?.image ? (
                                                            <img src={item.product_id?.image || "/placeholder.png"} alt="" loading="lazy" decoding="async" className="h-20 w-20 rounded-md object-object-contain " />
                                                        ) : (
                                                            <div className="p-1 border border-border h-20 w-20"><Image className="w-full h-full" /></div>
                                                        )
                                                    }
                                                    <div className="min-w-0 flex-1 text-sm text-slate-700">
                                                        <p className="font-semibold text-slate-900">{item.product_id?.title?.[lang] ?? item.product_id?.title?.en ?? "Deleted product"}</p>
                                                        <p className="text-slate-500">Narx: ${item.price ?? 0} · Soni: {item.quantity ?? 0} dona</p>
                                                        {item.size && <p className="text-slate-500">O'lcham: {item.size}</p>}
                                                        <p className="text-slate-900">Jami: ${lineTotal.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <Select value={order.status ?? "pending"} onValueChange={(value) => handleStatusChange(String(order._id), value)}>
                                        <SelectTrigger className={`w-full min-w-[150px] ${statusColors[order.status ?? "pending"] || "bg-white text-slate-900"} `}>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent >
                                            {statusOptions.map((item) => <SelectItem className={`  ${statusColors[item] || "bg-white text-slate-900"}`} key={item} value={item}>{statusLabels[item]}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell className="align-top">
                                    <Select value={order.payment_status ?? "unpaid"} onValueChange={(value) => handlePaymentChange(String(order._id), value)}>
                                        <SelectTrigger className={`w-full min-w-[150px] ${paymentColors[order.payment_status ?? "unpaid"] || "bg-white text-slate-900"} `}>
                                            <SelectValue placeholder="Payment status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentOptions.map((item) => <SelectItem className={`  ${paymentColors[item] || "bg-white text-slate-900"}`} key={item} value={item}>{paymentLabels[item]}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell className="align-top text-sm text-slate-900">
                                    <div className="space-y-1">
                                        <p className="font-semibold">${order.total_price ?? 0}</p>
                                        <p className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${paymentMethodColors[order.payment ?? "cash"] || "bg-white text-slate-900"}`}>
                                            {order.payment ?? "cash"}
                                        </p>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top text-right">
                                    <Button variant="outline" onClick={() => order._id && handleDelete(order._id)} className="wb-delete-button w-full sm:w-auto">
                                        <Trash2 className="mr-2 h-4 w-4" /> O'chirish
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {filteredOrders.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No orders found for this search.</div>
            )}
        </div>
    );
};
