"use client";

import { useActionState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { updateAccountEmail, updateAccountPassword } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordState = { ok: true } | { ok: false; error: string } | null;
type EmailState = { ok: true; reauth: true } | { ok: false; error: string } | null;

type Props = { initialEmail: string };

export function AccountSettingsForm({ initialEmail }: Props) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updateAccountPassword,
    null as PasswordState,
  );
  const [emailState, emailAction, emailPending] = useActionState(updateAccountEmail, null as EmailState);

  useEffect(() => {
    if (emailState?.ok === true && emailState.reauth) {
      void signOut({ callbackUrl: "/login?updated=email" });
    }
  }, [emailState]);

  return (
    <Card className="border-stone-700/90 bg-stone-900/60 shadow-lg shadow-black/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-stone-50">Account</CardTitle>
        <p className="text-sm text-stone-400">
          Signed in as <span className="font-medium text-stone-200">{initialEmail}</span>. After you change your
          email, you will be signed out and need to sign in with the new address.
        </p>
      </CardHeader>
      <CardContent className="space-y-8 pt-0">
        <form action={passwordAction} className="space-y-4">
          <h3 className="text-sm font-medium text-stone-200">Change password</h3>
          {passwordState?.ok === false ? (
            <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {passwordState.error}
            </p>
          ) : null}
          {passwordState?.ok === true ? (
            <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
              Password updated.
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="acct-current-password" className="text-xs text-stone-400">
              Current password
            </Label>
            <Input
              id="acct-current-password"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="h-10 border-stone-600 bg-stone-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acct-new-password" className="text-xs text-stone-400">
              New password
            </Label>
            <Input
              id="acct-new-password"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-10 border-stone-600 bg-stone-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acct-confirm-password" className="text-xs text-stone-400">
              Confirm new password
            </Label>
            <Input
              id="acct-confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-10 border-stone-600 bg-stone-950"
            />
          </div>
          <Button type="submit" disabled={passwordPending} className="h-9">
            {passwordPending ? "Saving…" : "Update password"}
          </Button>
        </form>

        <div className="border-t border-stone-700/80 pt-6">
          <form action={emailAction} className="space-y-4">
            <h3 className="text-sm font-medium text-stone-200">Change email</h3>
            {emailState?.ok === false ? (
              <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {emailState.error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="acct-new-email" className="text-xs text-stone-400">
                New email
              </Label>
              <Input
                id="acct-new-email"
                name="newEmail"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-10 border-stone-600 bg-stone-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acct-email-password" className="text-xs text-stone-400">
                Current password (to confirm)
              </Label>
              <Input
                id="acct-email-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-10 border-stone-600 bg-stone-950"
              />
            </div>
            <Button type="submit" disabled={emailPending} variant="secondary" className="h-9">
              {emailPending ? "Updating…" : "Update email"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
