import Link from "next/link";
import { formatGuestMenuUrlExample } from "@/lib/public-url";

export default function Home() {
  const exampleMenu = formatGuestMenuUrlExample("corner-bistro");
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
      <header className="border-b border-amber-200/60 bg-white/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-serif text-lg font-semibold text-amber-950">QR Menu</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Your menu on its own subdomain
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600">
          Register your restaurant, build your menu, and share a clean link
          {exampleMenu ? (
            <>
              {" "}
              like{" "}
              <span className="whitespace-nowrap font-medium text-amber-900">{exampleMenu}</span>
            </>
          ) : null}{" "}
          — perfect for QR codes on tables.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-amber-700 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-amber-800"
          >
            Register restaurant
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-amber-300 bg-white px-8 py-3 text-base font-medium text-amber-950 hover:bg-amber-50"
          >
            Owner login
          </Link>
        </div>
      </main>
    </div>
  );
}
