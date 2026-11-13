import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Order } from "@/types";
import { formatINR } from "@/lib/pricing";

const paymentMethodLabel: Record<string, string> = {
  cod: "Cash on delivery",
  online: "Card / Netbanking",
  upi: "UPI",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmed",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  awaiting_payment: "Payment pending",
};

export function OrderHistory() {
  const { user } = useAuth();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: () => api<Order[]>("/orders/mine"),
  });

  return (
    <div className="mt-10 rounded-2xl border border-gold/40 bg-card p-6">
      <h2 className="font-display text-3xl font-semibold text-primary">My orders</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map((o) => (
            <li key={o.id} id={o.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-medium">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </span>
              </div>
              <ul className="mt-2 text-sm text-muted-foreground">
                {o.items.map((i, idx) => <li key={idx}>{i.name} × {i.quantity}</li>)}
              </ul>
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-gold">
                  {statusLabel[o.status] ?? o.status} · {paymentMethodLabel[o.paymentMethod] ?? o.paymentMethod}
                  {o.upiUtr ? <span className="ml-1 font-mono text-xs text-muted-foreground">(UTR: {o.upiUtr})</span> : null}
                </span>
                <span className="font-semibold text-primary">{formatINR(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
