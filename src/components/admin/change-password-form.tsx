"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setErrorMessage(t.admin.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage(t.admin.passwordMismatch);
      return;
    }

    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setStatus("success");
  };

  return (
    <div className="max-w-md rounded-2xl border border-border/60 p-5">
      <h2 className="text-lg font-bold">{t.admin.changePassword}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.admin.changePasswordHint}</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <Label htmlFor="new-password">{t.admin.newPasswordPlaceholder}</Label>
        <Input
          id="new-password"
          type="password"
          required
          minLength={8}
          dir="ltr"
          placeholder={t.admin.newPasswordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Label htmlFor="confirm-password">{t.admin.confirmPasswordPlaceholder}</Label>
        <Input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          dir="ltr"
          placeholder={t.admin.confirmPasswordPlaceholder}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" disabled={status === "loading"} className="mt-2 gap-2">
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.admin.save}
        </Button>
        {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
        {status === "success" && (
          <p className="text-sm text-emerald-600">{t.admin.passwordUpdated}</p>
        )}
      </form>
    </div>
  );
}
