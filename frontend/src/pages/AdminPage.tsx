import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api";
import { ethnicCategories, jewelleryCategories } from "@/lib/catalog";
import { formatINR } from "@/lib/pricing";
import { productImage, useProducts, type Section } from "@/lib/shop";
import type { Order } from "@/types";


const empty = { name: "", description: "", price: "", mrp: "" };

export default function AdminPage() {
  useDocumentTitle("Shop admin — Parika");
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <p className="py-20 text-center text-muted-foreground">This page is for the shop owner only.</p>;
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <h1 className="text-center font-display text-5xl font-semibold text-primary">Shop admin</h1>
      <ProductForm />
      <ProductList />
      <OrdersList />
    </section>
  );
}

function ProductForm() {
  const qc = useQueryClient();
  const [section, setSection] = useState<Section>("jewellery");
  const cats = section === "jewellery" ? jewelleryCategories : ethnicCategories;
  const [category, setCategory] = useState(cats[0]!.name);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    const mrp = form.mrp ? Number(form.mrp) : null;
    if (!form.name.trim() || !(price > 0)) return toast.error("Enter a name and price");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("section", section);
      fd.append("category", category);
      fd.append("price", String(price));
      fd.append("mrp", mrp ? String(mrp) : "");
      if (file) fd.append("image", file);
      await api("/products", { method: "POST", form: fd });
    } catch (err) {
      setBusy(false);
      return toast.error(err instanceof Error ? err.message : "Could not add product");
    }
    setBusy(false);
    toast.success("Product added");
    setForm(empty); setFile(null);
    qc.invalidateQueries({ queryKey: ["products"] });
    return undefined;
  }

  const select = "mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-gold/50 bg-card p-6 sm:grid-cols-2">
      <h2 className="font-display text-2xl font-semibold sm:col-span-2">Add a product</h2>
      <div><Label>Section</Label>
        <select className={select} value={section} onChange={(e) => {
          const s = e.target.value as Section; setSection(s);
          setCategory((s === "jewellery" ? jewelleryCategories : ethnicCategories)[0]!.name);
        }}>
          <option value="jewellery">Jewellery</option><option value="ethnic-wear">Ethnic Wear</option>
        </select></div>
      <div><Label>Category</Label>
        <select className={select} value={category} onChange={(e) => setCategory(e.target.value)}>
          {cats.map((c) => <option key={c.name}>{c.name}</option>)}
        </select></div>
      <div className="sm:col-span-2"><Label>Name</Label>
        <Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><Label>Price (₹)</Label>
        <Input className="mt-1.5" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
      <div><Label>MRP (₹, optional)</Label>
        <Input className="mt-1.5" type="number" min={1} value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Description</Label>
        <Textarea className="mt-1.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Photo</Label>
        <Input className="mt-1.5" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
      <Button type="submit" variant="royal" disabled={busy} className="rounded-full sm:col-span-2">
        {busy && <Loader2 className="animate-spin" />} Add product
      </Button>
    </form>
  );
}

function ProductList() {
  const qc = useQueryClient();
  const { data = [] } = useProducts();
  async function update(id: string, patch: { inStock?: boolean }) {
    await api(`/products/${id}`, { method: "PATCH", body: patch });
    qc.invalidateQueries({ queryKey: ["products"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await api(`/products/${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["products"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-semibold">Products ({data.length})</h2>
      <ul className="mt-4 divide-y">
        {data.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-3">
            <img src={productImage(p)} alt="" className="size-12 rounded-lg object-cover" />
            <div className="flex-1 text-sm">
              <p className="font-medium">{p.name}</p>
              <p className="text-muted-foreground">{p.category} · {formatINR(p.price)}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => update(p.id, { inStock: !p.inStock })}>
              {p.inStock ? "In stock" : "Out of stock"}
            </Button>
            <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(p.id)}><Trash2 /></Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrdersList() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: () => api<Order[]>("/orders") });
  async function setStatus(id: string, status: string) {
    try {
      await api(`/orders/${id}/status`, { method: "PATCH", body: { status } });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update order");
    }
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-semibold">Orders ({data.length})</h2>
      <ul className="mt-4 space-y-3">
        {data.map((o) => (
          <li key={o.id} className="rounded-xl border p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-medium">
                #{o.id.slice(0, 8).toUpperCase()} · {o.fullName} · {o.phone} · <span className="uppercase text-gold font-semibold">{o.paymentMethod}</span>
                {o.upiUtr ? <span className="ml-1 font-mono text-xs text-muted-foreground">(UTR: {o.upiUtr})</span> : null}
              </span>
              <span className="flex items-center gap-2 font-semibold text-primary">
                {formatINR(o.total)} ·
                <select
                  aria-label="Order status"
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs font-normal text-foreground"
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                >
                  {[...new Set([o.status, "confirmed", "shipped", "delivered", "cancelled"])].map((s) => (
                    <option key={s} value={s} disabled={!["confirmed", "shipped", "delivered", "cancelled"].includes(s)}>{s}</option>
                  ))}
                </select>
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">{o.addressLine}, {o.city}, {o.state} {o.pincode}</p>
            <p className="mt-1">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
