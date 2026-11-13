import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api";
import type { AuthResponse } from "@/types";


export default function ResetPassword() {
  useDocumentTitle("Set a new password — Parika");
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    try {
      const res = await api<AuthResponse>("/auth/reset-password", { method: "POST", body: { token, password } });
      signIn(res);
      toast.success("Password updated");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-ivory px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gold/40 bg-card p-8 shadow-card">
        <h1 className="text-center font-display text-4xl font-semibold text-primary">
          New password
        </h1>
        {!token ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Open this page from the link in your password reset email, or{" "}
            <Link to="/auth?mode=forgot" className="text-primary hover:underline">request a new one</Link>.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw">New password</Label>
              <Input
                id="pw"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw2">Confirm password</Label>
              <Input
                id="pw2"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11 bg-background"
              />
            </div>
            <Button type="submit" variant="royal" size="xl" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Save password
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
