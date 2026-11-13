import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Check, Copy, CreditCard, ExternalLink, Loader2, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api";
import { formatINR, orderTotal } from "@/lib/pricing";
import { useCart } from "@/lib/shop";


type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const fields = [
  ["full_name", "Full name"],
  ["phone", "Phone number"],
  ["address_line", "House / street / area"],
  ["city", "City"],
  ["state", "State"],
  ["pincode", "Pincode"],
] as const;

type PlacedOrder = { orderId: string; total: number; razorpayOrderId: string | null; keyId: string | null };

export default function CheckoutPage() {
  useDocumentTitle("Checkout — Parika");
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: lines = [], isLoading } = useCart();
  const { data: config } = useQuery({
    queryKey: ["payment-config"],
    queryFn: () => api<{ onlineAvailable: boolean; upiAvailable: boolean; upiId: string; upiName: string }>("/orders/payment-config"),
  });
  const online = { available: !!config?.onlineAvailable };
  const upiId = config?.upiId || "rushendra1729@okaxis";
  const upiName = config?.upiName || "Parika Jewels";

  const [form, setForm] = useState<Record<string, string>>({
    full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "",
  });
  const [method, setMethod] = useState<"upi" | "online" | "cod">("upi");
  const [upiUtr, setUpiUtr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [busy, setBusy] = useState(false);
  const total = orderTotal(lines.map((l) => ({ price: l.product.price, quantity: l.quantity })));

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${total}&cu=INR&tn=${encodeURIComponent("Parika Jewels Order")}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(upiUri)}`;

  useEffect(() => {
    const name = user?.fullName;
    if (name) setForm((f) => ({ ...f, full_name: f["full_name"] || name }));
  }, [user]);

  useEffect(() => {
    // If cards/netbanking is selected but Razorpay is not configured, fall back to UPI
    if (config && !config.onlineAvailable && method === "online") {
      setMethod("upi");
    }
  }, [config, method]);

  function copyUpiId() {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopiedUpi(false), 2000);
  }

  const done = (orderId: string) => {
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["orders"] });
    toast.success("Order placed! Thank you for shopping with Parika.");
    navigate(`/profile#${orderId}`);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(form["pincode"] ?? "")) return toast.error("Enter a valid 6-digit pincode");
    if (!/^[+\d\s-]{10,15}$/.test(form["phone"] ?? "")) return toast.error("Enter a valid phone number");

    if (method === "upi" && upiUtr.trim() && !/^\d{12}$/.test(upiUtr.trim())) {
      return toast.error("UPI UTR must be a 12-digit number from your payment receipt");
    }

    setBusy(true);
    try {
      const res = await api<PlacedOrder>("/orders", {
        method: "POST",
        body: {
          fullName: form["full_name"],
          phone: form["phone"],
          addressLine: form["address_line"],
          city: form["city"],
          state: form["state"],
          pincode: form["pincode"],
          paymentMethod: method,
          upiUtr: method === "upi" ? upiUtr.trim() || undefined : undefined,
        },
      });

      // Direct UPI & Cash On Delivery complete immediately without Razorpay
      if (method === "cod" || method === "upi") {
        return done(res.orderId);
      }

      // Online card / netbanking flow using Razorpay
      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error("Could not load payment window");

      new window.Razorpay({
        key: res.keyId,
        amount: Math.round(res.total * 100),
        currency: "INR",
        name: "Parika",
        description: "Jewels & Ethnic Wear",
        order_id: res.razorpayOrderId,
        prefill: { name: form["full_name"], email: user?.email, contact: form["phone"] },
        theme: { color: "#7a1f2b" },
        handler: async (r: RazorpayResponse) => {
          try {
            await api("/orders/verify-payment", { method: "POST", body: { orderId: res.orderId, ...r } });
            done(res.orderId);
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error("Payment could not be verified. Contact us on WhatsApp.");
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
      setBusy(false);
    }
  }

  if (!isLoading && lines.length === 0) {
    return (
      <section className="py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild variant="royal" className="mt-6 rounded-full"><Link to="/jewellery">Start shopping</Link></Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-center font-display text-5xl font-semibold text-primary">Checkout</h1>
      <form onSubmit={submit} className="mt-10 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([key, label]) => (
              <div key={key} className={key === "address_line" ? "sm:col-span-2" : ""}>
                <Label htmlFor={key}>{label}</Label>
                <Input id={key} required value={form[key]} className="mt-1.5"
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <h2 className="font-display text-2xl font-semibold">Payment method</h2>
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as "upi" | "online" | "cod")} className="space-y-3">
            {/* Direct UPI Option */}
            <div className={`rounded-xl border transition-all ${
              method === "upi" ? "border-gold bg-gold/5 shadow-sm" : "border-border hover:border-gold/50"
            }`}>
              <label className="flex cursor-pointer items-start gap-3.5 p-4">
                <RadioGroupItem value="upi" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <QrCode className="size-4 text-gold" />
                      <span className="font-medium text-foreground">UPI (Instant QR & UPI Apps)</span>
                    </div>
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Instant · 0% Fee
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Scan dynamic QR code with Google Pay, PhonePe, Paytm, or open your UPI app
                  </p>
                </div>
              </label>

              {method === "upi" && (
                <div className="border-t border-gold/20 p-4 pt-3 sm:p-5">
                  <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
                    {/* QR Code Container */}
                    <div className="flex flex-col items-center rounded-2xl border border-gold/30 bg-card p-3 text-center shadow-card">
                      <div className="relative aspect-square w-full max-w-[160px] overflow-hidden rounded-xl bg-white p-2">
                        <img
                          src={qrCodeUrl}
                          alt="Scan to pay via UPI"
                          width={240}
                          height={240}
                          className="size-full object-contain"
                        />
                      </div>
                      <span className="mt-2 text-[11px] font-medium text-muted-foreground">
                        Scan with any UPI app
                      </span>
                      <span className="font-display text-sm font-semibold text-primary">
                        Amount: {formatINR(total)}
                      </span>
                    </div>

                    {/* App / Details instructions */}
                    <div className="space-y-3">
                      {/* Mobile Pay Button */}
                      <div>
                        <a
                          href={upiUri}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-royal transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
                        >
                          <Smartphone className="size-4 text-gold" />
                          <span>Open in UPI App (GPay / PhonePe / Paytm)</span>
                          <ExternalLink className="size-3.5 opacity-80" />
                        </a>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          On your phone? Tap above to open your UPI app directly with amount prefilled.
                        </p>
                      </div>

                      {/* Payee Info & Copy UPI ID */}
                      <div className="rounded-xl border border-border/70 bg-background/80 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-muted-foreground">UPI ID (VPA):</p>
                            <p className="font-mono text-sm font-semibold text-foreground">{upiId}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyUpiId}
                            className="h-8 gap-1.5 text-xs"
                          >
                            {copiedUpi ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                            <span>{copiedUpi ? "Copied" : "Copy ID"}</span>
                          </Button>
                        </div>
                        <p className="mt-1.5 text-muted-foreground">
                          Payee: <span className="font-medium text-foreground">{upiName}</span>
                        </p>
                      </div>

                      {/* UTR Input */}
                      <div className="space-y-1">
                        <Label htmlFor="upi_utr" className="text-xs">
                          12-digit UPI Reference / UTR No. <span className="text-muted-foreground">(Optional for instant placement)</span>
                        </Label>
                        <Input
                          id="upi_utr"
                          placeholder="e.g. 431289123456 (from payment receipt)"
                          maxLength={16}
                          value={upiUtr}
                          onChange={(e) => setUpiUtr(e.target.value.replace(/\D/g, ""))}
                          className="h-10 bg-background font-mono text-sm"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          You can find this 12-digit number on your Google Pay, PhonePe, or Paytm receipt.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cards & Netbanking Option (Razorpay) */}
            <label className={`flex items-start gap-3.5 rounded-xl border p-4 transition-all ${
              online?.available ? "cursor-pointer hover:border-gold" : "opacity-60 cursor-not-allowed"
            } ${method === "online" ? "border-gold bg-gold/5 shadow-sm" : "border-border"}`}>
              <RadioGroupItem value="online" disabled={!online?.available} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-gold" />
                  <span className="font-medium text-foreground">Credit / Debit Card & Netbanking</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Visa, Mastercard, RuPay, Maestro & Indian banks (via Razorpay)
                </p>
                {!online?.available && (
                  <span className="mt-1 block text-xs text-muted-foreground">Coming soon (requires Razorpay keys)</span>
                )}
              </div>
            </label>

            {/* Cash on Delivery Option */}
            <label className={`flex items-start gap-3.5 rounded-xl border p-4 transition-all cursor-pointer hover:border-gold ${
              method === "cod" ? "border-gold bg-gold/5 shadow-sm" : "border-border"
            }`}>
              <RadioGroupItem value="cod" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Banknote className="size-4 text-gold" />
                  <span className="font-medium text-foreground">Cash on delivery</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pay cash upon delivery of your jewellery or ethnic wear order
                </p>
              </div>
            </label>
          </RadioGroup>
        </div>
        <aside className="h-fit rounded-2xl border border-gold/50 bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lines.map((l) => (
              <li key={l.id} className="flex justify-between gap-2">
                <span>{l.product.name} × {l.quantity}</span>
                <span>{formatINR(l.product.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 text-lg font-semibold">
            <span>Total</span><span className="text-primary">{formatINR(total)}</span>
          </div>
          <Button type="submit" variant="royal" disabled={busy} className="mt-6 w-full rounded-full">
            {busy && <Loader2 className="animate-spin" />}
            {method === "cod"
              ? "Place order"
              : method === "upi"
                ? `Confirm UPI Order (${formatINR(total)})`
                : `Pay ${formatINR(total)} via Razorpay`}
          </Button>
        </aside>
      </form>
    </section>
  );
}
