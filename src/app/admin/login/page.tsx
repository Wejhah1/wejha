"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setStatus(error ? "error" : "sent");
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
        <Camera className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold">{t.admin.loginTitle}</h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">{t.admin.loginSubtitle}</p>

      {status === "sent" ? (
        <div className="mt-8 rounded-xl border border-border/60 bg-accent/40 px-6 py-4 text-center text-sm font-medium">
          {t.admin.checkEmail}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder={t.admin.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />
          <Button type="submit" disabled={status === "loading"} className="mt-2 gap-2">
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.admin.sendLink}
          </Button>
          {status === "error" && (
            <p className="text-sm text-destructive">Something went wrong. Try again.</p>
          )}
        </form>
      )}
    </div>
  );
}
