"use client";

import { useTransition } from "react";
import { Trash2, Clock } from "lucide-react";
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
import { inviteAdmin, removeAdmin } from "@/app/admin/(protected)/actions";
import type { Admin, PendingAdminInvite } from "@/lib/types";

export function AdminsManager({
  admins,
  invites,
  currentAdminId,
}: {
  admins: Admin[];
  invites: PendingAdminInvite[];
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

      <form action={inviteAdmin} className="flex flex-col gap-3 rounded-2xl border border-border/60 p-5">
        <Label htmlFor="email">{t.admin.inviteAdmin}</Label>
        <div className="flex gap-2">
          <Input id="email" name="email" type="email" required dir="ltr" placeholder="admin@example.com" />
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

      {invites.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold">Pending invites</h2>
          <div className="flex flex-col gap-2">
            {invites.map((invite) => (
              <div
                key={invite.email}
                className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
              >
                <Clock className="h-4 w-4" />
                {invite.email} — waiting for first login ({invite.role})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
