import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api";
import type { User } from "@/types";
import { OrderHistory } from "@/components/order-history";


const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d\s-]*$/, "Phone can only contain digits, spaces, + and -"),
  city: z.string().trim().max(60),
});

export default function ProfilePage() {
  useDocumentTitle("My profile — Parika");
  const { user, setUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ full_name: user?.fullName ?? "", phone: user?.phone ?? "", city: user?.city ?? "" });
  }, [user]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please check your details"); return; }
    setSaving(true);
    try {
      const res = await api<{ user: User }>("/users/me", {
        method: "PUT",
        body: { fullName: parsed.data.full_name, phone: parsed.data.phone, city: parsed.data.city },
      });
      setUser(res.user);
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const since = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;
  const isLoading = false;

  return (
    <section className="bg-gradient-ivory py-16">
      <div className="mx-auto max-w-2xl px-4">
        <div className="text-center animate-rise">
          <p className="font-script text-3xl text-gold">Namaste</p>
          <h1 className="mt-1 font-display text-5xl font-semibold text-primary">
            {form.full_name || "My profile"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user?.email}
            {since && <> · Member since {since}</>}
          </p>
        </div>

        <form
          onSubmit={save}
          className="mt-10 space-y-5 rounded-2xl border border-gold/40 bg-card p-6 shadow-card sm:p-8"
        >
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-gold" />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="h-11 bg-background"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-11 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="h-11 bg-background"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="gold"
                  size="xl"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  <LogOut /> Sign out
                </Button>
                <Button type="submit" variant="royal" size="xl" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />} Save changes
                </Button>
              </div>
            </>
          )}
        </form>
        <OrderHistory />
      </div>
    </section>
  );
}
