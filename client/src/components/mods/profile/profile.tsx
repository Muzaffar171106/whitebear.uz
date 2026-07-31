
"use client";

import { ImageIcon, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/react";
import { Fetch } from "@/middlewares/Fetch";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-400/10 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-emerald-400/10 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-300",
};

interface Lang {
  en: string;
  uz: string;
  ru: string;
  ch: string;
}

interface OrderProduct {
  _id?: string;
  product_id?: {
    title?: Lang;
    image?: string;
  };
  price?: number;
  quantity?: number;
}

interface Order {
  _id?: string;
  order_id?: string;
  status?: string;
  payment?: string;
  payment_status?: string;
  total_price?: number;
  createdAt?: string;
  updatedAt?: string;
  driver?: boolean;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  products?: OrderProduct[];
}

export default function AccountSettings() {

  const { t } = useTranslation();

  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const fetcher = (url: string) => Fetch.get(url).then((res) => res.data);
  const { data: orders = [], error, isLoading } = useSWR<Order[]>(
    isSignedIn && userEmail ? `/order/customer/${userEmail}` : null,
    fetcher
  );

  if (!isLoaded) {
    return (
      <section className="min-h-screen bg-[#f3f6f8] py-10 text-[#0b2945] transition-colors dark:bg-[#0b1117] dark:text-white">
        <div className="container mx-auto flex flex-col gap-8 px-4 lg:flex-row lg:items-start">

          {/* LEFT PROFILE SKELETON */}
          <div className="w-full max-w-sm shrink-0">
            <Card className="rounded-lg border border-slate-200 bg-white shadow-[0_12px_34px_rgba(11,41,69,0.08)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/25">
              <CardContent className="flex flex-col items-center p-6 space-y-4">
                <Skeleton circle height={96} width={96} />

                <div className="space-y-2 w-full flex flex-col items-center">
                  <Skeleton width={140} height={20} />
                  <Skeleton width={180} height={15} />
                </div>

                <div className="w-full mt-4">
                  <Skeleton height={40} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT ORDERS SKELETON */}
          <div className="w-full flex-1">
            <Card className="rounded-lg border border-slate-200 bg-white shadow-[0_12px_34px_rgba(11,41,69,0.08)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/25">
              <CardContent className="space-y-6 p-6">

                {/* HEADER SKELETON */}
                <Skeleton width={160} height={20} />

                {/* ORDER CARDS */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="space-y-4 rounded-lg border border-slate-200 bg-[#f7f9fa] p-5 dark:border-white/10 dark:bg-[#0f171f]"
                  >
                    {/* top row */}
                    <div className="flex justify-between items-center">
                      <Skeleton width={120} height={18} />
                      <Skeleton width={80} height={20} />
                    </div>

                    {/* info grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton width="90%" />
                        <Skeleton width="80%" />
                        <Skeleton width="85%" />
                        <Skeleton width="70%" />
                      </div>

                      <div className="space-y-2">
                        <Skeleton width="88%" />
                        <Skeleton width="75%" />
                        <Skeleton width="82%" />
                        <Skeleton width="60%" />
                      </div>
                    </div>

                    {/* products */}
                    <div className="space-y-3">
                      {[1, 2].map((p) => (
                        <div key={p} className="flex items-center gap-3">
                          <Skeleton width={40} height={40} />
                          <div className="space-y-2 flex-1">
                            <Skeleton width="60%" />
                            <Skeleton width="40%" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              </CardContent>
            </Card>
          </div>

        </div>
      </section>
    );
  }

  if (error) {
    return <div className="min-h-screen bg-red-50 p-10 text-red-700 dark:bg-[#0b1117] dark:text-red-300">{t("error") || "Something went wrong"}</div>;
  }

  if (!isSignedIn || !user) {
    return (
      <section className="flex min-h-[55vh] items-center justify-center bg-[#f3f6f8] px-4 text-center text-[#0b2945] dark:bg-[#0b1117] dark:text-white">
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-12 shadow-[0_12px_34px_rgba(11,41,69,0.08)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/25">
          <p className="text-lg font-semibold">{t("pleaseSignIn")}</p>
        </div>
      </section>
    );
  }
  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#f3f6f8] py-10 text-[#0b2945] transition-colors dark:bg-[#0b1117] dark:text-white">
        <div className="container mx-auto flex flex-col gap-8 px-4 lg:flex-row lg:items-start">

          {/* LEFT PROFILE SKELETON */}
          <div className="w-full max-w-sm shrink-0">
            <Card className="rounded-lg border border-slate-200 bg-white shadow-[0_12px_34px_rgba(11,41,69,0.08)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/25">
              <CardContent className="flex flex-col items-center p-6 space-y-4">
                <Skeleton circle height={96} width={96} />

                <div className="space-y-2 w-full flex flex-col items-center">
                  <Skeleton width={140} height={20} />
                  <Skeleton width={180} height={15} />
                </div>

                <div className="w-full mt-4">
                  <Skeleton height={40} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT ORDERS SKELETON */}
          <div className="w-full flex-1">
            <Card className="rounded-lg border border-slate-200 bg-white shadow-[0_12px_34px_rgba(11,41,69,0.08)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/25">
              <CardContent className="space-y-6 p-6">

                {/* HEADER SKELETON */}
                <Skeleton width={160} height={20} />

                {/* ORDER CARDS */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="space-y-4 rounded-lg border border-slate-200 bg-[#f7f9fa] p-5 dark:border-white/10 dark:bg-[#0f171f]"
                  >
                    {/* top row */}
                    <div className="flex justify-between items-center">
                      <Skeleton width={120} height={18} />
                      <Skeleton width={80} height={20} />
                    </div>

                    {/* info grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton width="90%" />
                        <Skeleton width="80%" />
                        <Skeleton width="85%" />
                        <Skeleton width="70%" />
                      </div>

                      <div className="space-y-2">
                        <Skeleton width="88%" />
                        <Skeleton width="75%" />
                        <Skeleton width="82%" />
                        <Skeleton width="60%" />
                      </div>
                    </div>

                    {/* products */}
                    <div className="space-y-3">
                      {[1, 2].map((p) => (
                        <div key={p} className="flex items-center gap-3">
                          <Skeleton width={40} height={40} />
                          <div className="space-y-2 flex-1">
                            <Skeleton width="60%" />
                            <Skeleton width="40%" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              </CardContent>
            </Card>
          </div>

        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f3f6f8] py-10 text-[#0b2945] transition-colors dark:bg-[#0b1117] dark:text-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:px-8">
        <div className="w-full md:max-w-sm shrink-0">
          <Card className="rounded-lg border border-slate-200 bg-white text-slate-900 shadow-[0_12px_34px_rgba(11,41,69,0.08)] dark:border-white/10 dark:bg-[#111a23] dark:text-white dark:shadow-black/25">
            <CardHeader>
              <CardTitle className="text-center text-sm uppercase tracking-[0.25em] text-[#0B3B68] dark:text-[#72d2f3]">
                {t("accountDetail")}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center p-6">
              <img
                alt="Avatar"
                src={user?.imageUrl ?? "/logo.webp"}
                width={96}
                height={96}
                className="rounded-full border border-slate-200 bg-slate-100"
              />

              <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{user?.fullName ?? "Unknown User"}</h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {user?.emailAddresses?.[0]?.emailAddress ?? "No email available"}
              </p>

              <Button
                variant="outline"
                className="mt-6 w-full rounded-lg border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="w-full flex-1">
          <Card className="rounded-lg border border-slate-200 bg-white text-slate-900 shadow-[0_12px_34px_rgba(11,41,69,0.08)] dark:border-white/10 dark:bg-[#111a23] dark:text-white dark:shadow-black/25">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.25em] text-[#0B3B68] dark:text-[#72d2f3]">
                {t("myOrders")}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/15 dark:bg-[#0f171f] dark:text-slate-400">
                  {t("noOrders")}
                </div>
              ) : (
                orders.map((order) => (
                  <article
                    key={order._id || order.order_id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-white/10 dark:bg-[#0f171f]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{t("orderId")}</p>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{order.order_id || t("unknown")}</h2>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusColors[order.status ?? ""] || "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-slate-200"}`}>
                        {order.status || t("pending")}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <p><span className="font-semibold text-slate-900 dark:text-white">{t("payment")}:</span> {order.payment || "—"}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-white">{t("paymentStatus")}:</span> {order.payment_status || "—"}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-white">{t("totalPrice")}:</span> ${order.total_price ?? 0}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-white">{t("delivery")}:</span> {order.driver ? t("deliveryType") : t("pickup")}</p>
                      </div>

                      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <p><span className="font-semibold text-slate-900 dark:text-white">{t("customer")}:</span> {order.customer?.name || "—"}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-white">{t("email")}:</span> {order.customer?.email || "—"}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-white">{t("phone")}:</span> {order.customer?.phone || "—"}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-white">{t("address")}:</span> {order.customer?.address || "—"}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm dark:bg-[#111a23] dark:text-slate-300">
                      <p className="font-semibold text-slate-900 dark:text-white"> {t("orderDetails")}</p>

                      {order.products && order.products.length > 0 && (
                        <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          {order.products.map(({ _id, product_id, quantity, price }: OrderProduct) => (
                            <li key={_id} className="flex items-center gap-3">
                              <div className="relative h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                                {
                                  product_id?.image ? (
                                    <img
                                      src={product_id?.image || "/product.png"}
                                      alt={product_id?.title?.en || t("productImage")}
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center p-2">
                                      <span className="text-xs text-slate-500">
                                        <ImageIcon className="h-6 w-6" />
                                      </span>
                                    </div>
                                  )
                                }
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{product_id?.title?.en || t("unknownProduct")}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400"> {t("quantity")}: {quantity || 0} | {t("price")}: ${price ?? 0} </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
