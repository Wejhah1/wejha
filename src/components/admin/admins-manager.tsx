"use client";

import { useTransition } from "react";
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

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold">{t.admin.admins}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.superAdminOnly}</p>
      </div>

      <form action={createAdmin} className="flex flex-col gap-3 rounded-2xl border border-border/60 p-5">
        <Label htmlFor="new-admin-email">{t.admin.inviteAdmin}</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
          <Input
            id="new-admin-email"
            name="email"
            type="email"
            required
            dir="ltr"
            placeholder="admin@example.com"
          />
          <Input
            name="password"
            type="password"
            required
            minLength={6}
            dir="ltr"
            placeholder={t.admin.passwordPlaceholder}
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
          <Button type="submit">{t.admin.inviteAdmin}</Button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-lg font-bold">Admins</h2>
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
