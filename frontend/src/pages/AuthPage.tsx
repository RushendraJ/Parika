import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";

import heroEthnic from "@/assets/hero-ethnic.jpg";
import logo from "@/assets/parika-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api";
import type { AuthResponse } from "@/types";


const emailSchema = z.string().trim().email("Please enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

const GOOGLE_ENABLED = !!(import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined);

export default function AuthPage() {
  useDocumentTitle("Login or Sign up — Parika");
  const [params] = useSearchParams();
  const raw = params.get("mode");
  const mode = raw === "signup" || raw === "forgot" ? raw : "login";
  const navigate = useNavigate();
  const { user, signIn } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => setSentTo(null), [mode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const emailCheck = emailSchema.safeParse(email);
    if (!emailCheck.success) { toast.error(emailCheck.error.issues[0]?.message ?? "Please check your details"); return; }

    setBusy(true);
    try {
      if (mode === "forgot") {
        await api("/auth/forgot-password", { method: "POST", body: { email: emailCheck.data } });
        setSentTo(emailCheck.data);
        return;
      }

      const pw = passwordSchema.safeParse(password);
      if (!pw.success) { toast.error(pw.error.issues[0]?.message ?? "Please check your details"); return; }

      if (mode === "signup") {
        const name = fullName.trim();
        if (!name) { toast.error("Please enter your name"); return; }
        const res = await api<AuthResponse>("/auth/signup", {
          method: "POST",
          body: { fullName: name.slice(0, 100), email: emailCheck.data, password: pw.data },
        });
        signIn(res);
        toast.success("Welcome to Parika!");
      } else {
        const res = await api<AuthResponse>("/auth/login", {
          method: "POST",
          body: { email: emailCheck.data, password: pw.data },
        });
        signIn(res);
        toast.success("Welcome back!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle(credential: string) {
    try {
      signIn(await api<AuthResponse>("/auth/google", { method: "POST", body: { credential } }));
      toast.success("Welcome to Parika!");
    } catch (err) {
      console.error("Google sign-in error:", err);
      const message = err instanceof Error ? err.message : "Could not sign in. Please try again.";
      toast.error(message);
    }
  }

  const heading =
    mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back";
  const sub =
    mode === "signup"
      ? "Join Parika for a more personal shopping experience."
      : mode === "forgot"
        ? "We'll email you a link to set a new password."
        : "Sign in to continue to Parika.";

  return (
    <section className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={heroEthnic}
          alt=""
          width={1024}
          height={1280}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-veil" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-ivory">
          <p className="font-script text-4xl text-gold-soft">Style for Every Celebration</p>
          <p className="mt-2 font-display text-3xl">Jewels & Ethnic Wear</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-gradient-ivory px-4 py-14">
        <div className="w-full max-w-md animate-rise">
          <div className="text-center">
            <img src={logo} alt="" width={64} height={64} className="mx-auto size-16" />
            <h1 className="mt-4 font-display text-4xl font-semibold text-primary">{heading}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
          </div>

          {mode !== "forgot" && (
            <div className="mt-8 grid grid-cols-2 rounded-full border border-gold/50 bg-card p-1">
              {(["login", "signup"] as const).map((m) => (
                <Link
                  key={m}
                  to={`/auth?mode=${m}`}
                  className={
                    "rounded-full py-2 text-center text-sm transition-all " +
                    (mode === m
                      ? "bg-primary text-primary-foreground shadow-royal"
                      : "text-muted-foreground hover:text-primary")
                  }
                >
                  {m === "login" ? "Login" : "Sign up"}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-gold/40 bg-card p-6 shadow-card sm:p-8">
            {sentTo ? (
              <div className="py-4 text-center">
                <MailCheck className="mx-auto size-10 text-gold" />
                <p className="mt-4 font-display text-2xl text-primary">Check your email</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, a reset link is on its way.
                  Click it to set a new password.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="h-11 bg-background"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 bg-background"
                    />
                  </div>
                  {mode !== "forgot" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {mode === "login" && (
                          <Link
                            to="/auth?mode=forgot"
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </Link>
                        )}
                      </div>
                      <Input
                        id="password"
                        type="password"
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                        className="h-11 bg-background"
                      />
                    </div>
                  )}
                  <Button type="submit" variant="royal" size="xl" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="animate-spin" />}
                    {mode === "signup"
                      ? "Create account"
                      : mode === "forgot"
                        ? "Send reset link"
                        : "Login"}
                  </Button>
                </form>

                {mode !== "forgot" && (
                  <>
                    {GOOGLE_ENABLED && (
                      <div className="ornament my-6 text-xs">
                        <span className="eyebrow text-muted-foreground">or</span>
                      </div>
                    )}
                    <div className="space-y-3">
                      {GOOGLE_ENABLED && (
                        <div className="flex justify-center">
                          <GoogleLogin
                            onSuccess={(r) => {
                              if (r.credential) signInWithGoogle(r.credential);
                              else toast.error("Google did not return credentials.");
                            }}
                            onError={() => {
                              console.error("GoogleLogin failed / closed");
                              toast.error("Google sign-in popup failed. Please check browser console.");
                            }}
                            text="continue_with"
                            shape="pill"
                            width="320"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {mode === "forgot" && (
            <p className="mt-6 text-center text-sm">
              <Link to="/auth?mode=login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
