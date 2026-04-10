import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-16">
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
