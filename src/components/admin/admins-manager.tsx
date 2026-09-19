"use client";

import { useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdmin, removeAdmin } from "@/app/admin/(protected)/actions";
import type { Admin } from "@/lib/types";

export function AdminsManager({
  admins,
  currentAdminId,
}: {
  admins: Admin[];
  currentAdminId: string;
}) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      await createAdmin(formData);
      formRef.current?.reset();
    });
  };

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold">{t.admin.admins}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.superAdminOnly}</p>
      </div>

      <form
        ref={formRef}
        action={handleCreate}
        className="flex flex-col gap-3 rounded-2xl border border-border/60 p-5"
      >
        <Label htmlFor="email">{t.admin.addAdmin}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="email"
            name="email"
            type="email"
            required
            dir="ltr"
            placeholder={t.admin.newAdminEmail}
          />
          <Input
            id="password"
            name="password"
            type="text"
            required
            minLength={8}
            dir="ltr"
            placeholder={t.admin.newAdminPassword}
          />
          <Select name="role" defaultValue="admin">
            <SelectTrigger className="w-40">
              <SelectValue>
                {(v: string) => ({ admin: "Admin", super_admin: "Super admin" })[v] ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super admin</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isPending}>
            {t.admin.addAdmin}
          </Button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-lg font-bold">{t.admin.admins}</h2>
        <div className="flex flex-col gap-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
            >
              <div>
                <p className="font-medium">{admin.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {admin.role}
                </Badge>
              </div>
              {admin.id !== currentAdminId && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => startTransition(() => removeAdmin(admin.id))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
