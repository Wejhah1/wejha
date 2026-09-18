"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettings() {
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("done");
    setMessage(t.admin.passwordUpdated);
    setPassword("");
  };

  return (
    <div className="max-w-md rounded-2xl border border-border/60 p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-muted-foreground">{t.admin.account}</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">{t.admin.accountSubtitle}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Label htmlFor="new-password">{t.admin.newPassword}</Label>
        <Input
          id="new-password"
          type="password"
          required
          minLength={6}
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={status === "loading"} className="w-fit gap-2">
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.admin.updatePassword}
        </Button>
        {status === "done" && <p className="text-sm text-emerald-600">{message}</p>}
        {status === "error" && <p className="text-sm text-destructive">{message}</p>}
      </form>
    </div>
  );
}
