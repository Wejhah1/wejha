import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { LogoutButton } from "@/components/admin/logout-button";

export default function AdminAccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <ChangePasswordForm />
      <LogoutButton className="w-fit border border-border/60 lg:hidden" />
    </div>
  );
}
