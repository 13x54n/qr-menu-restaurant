"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/login";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const emailUpdated = searchParams.get("updated") === "email";
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <Card className="mx-auto w-full max-w-md border-border shadow-lg">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {emailUpdated ? (
            <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
              Your email was updated. Sign in with your new email address.
            </p>
          ) : null}
          {state && "ok" in state && !state.ok ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-xs text-muted-foreground">
              Email
            </Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-xs text-muted-foreground">
              Password
            </Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-10"
            />
          </div>
          <Button type="submit" disabled={pending} className="h-10 w-full">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Button variant="link" className="h-auto p-0 text-primary" render={<Link href="/register" />}>
              Register your restaurant
            </Button>
          </p>
        </CardContent>
      </form>
    </Card>
  );
}
