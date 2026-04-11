"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/register";
import { formatGuestMenuUrlExample, menuPublicDomainSuffix, ownerDashboardUrlHint } from "@/lib/public-url";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, null);
  const ownerAppUrl = ownerDashboardUrlHint();

  return (
    <Card className="mx-auto w-full max-w-md border-border shadow-lg">
      <form action={action} className="flex flex-col gap-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl">Create your restaurant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {state && "ok" in state && !state.ok ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="reg-name" className="text-xs text-muted-foreground">
              Your name
            </Label>
            <Input id="reg-name" name="name" required autoComplete="name" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-xs text-muted-foreground">
              Email
            </Label>
            <Input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-xs text-muted-foreground">
              Password (min 8 characters)
            </Label>
            <Input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-restaurant" className="text-xs text-muted-foreground">
              Restaurant name
            </Label>
            <Input
              id="reg-restaurant"
              name="restaurantName"
              required
              className="h-10"
              placeholder="The Corner Bistro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-slug" className="text-xs text-muted-foreground">
              Subdomain (your public URL)
            </Label>
            <div className="flex overflow-hidden rounded-lg border border-input bg-muted/40 text-sm shadow-sm focus-within:ring-2 focus-within:ring-ring/50">
              <Input
                id="reg-slug"
                name="slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Lowercase letters, numbers, and hyphens only"
                className="h-10 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                placeholder="corner-bistro"
              />
              <span className="flex shrink-0 items-center border-l border-border bg-muted/60 px-3 text-xs text-muted-foreground">
                {menuPublicDomainSuffix()}
              </span>
            </div>
            <span className="mt-1 block space-y-1 text-xs text-muted-foreground">
              <span className="block">
                Guests open your menu at{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem] text-foreground">
                  {formatGuestMenuUrlExample("yourslug") || "— set AUTH_URL and NEXT_PUBLIC_ROOT_DOMAIN"}
                </code>
                {ownerAppUrl ? (
                  <>
                    {" "}
                    · manage the app at{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem] text-foreground">
                      {ownerAppUrl}
                    </code>
                  </>
                ) : null}
              </span>
              <span className="block">
                Local dev:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem] text-foreground">
                  yourslug.localhost:3000
                </code>
              </span>
            </span>
          </div>
          <Button type="submit" disabled={pending} className="h-10 w-full">
            {pending ? "Creating…" : "Register"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="h-auto p-0 text-primary" render={<Link href="/login" />}>
              Sign in
            </Button>
          </p>
        </CardContent>
      </form>
    </Card>
  );
}
