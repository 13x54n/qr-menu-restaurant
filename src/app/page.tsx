import Link from "next/link";
import { formatGuestMenuUrlExample } from "@/lib/public-url";
import { Button } from "@/components/ui/button";

export default function Home() {
  const exampleMenu = formatGuestMenuUrlExample("corner-bistro");
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gradient-to-b from-background via-muted/25 to-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/75 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <Button
            variant="ghost"
            className="h-auto justify-start p-0 text-lg font-semibold tracking-tight hover:bg-transparent"
            render={<Link href="/" />}
          >
            QR Menu
          </Button>
          <nav className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-2">
            <Button size="sm" className="rounded-full px-4" render={<Link href="/login" />}>
              Owner login
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Your menu on its own subdomain
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Build your menu and share a clean link
          {exampleMenu ? (
            <>
              {" "}
              like{" "}
              <span className="whitespace-nowrap font-medium text-primary">{exampleMenu}</span>
            </>
          ) : null}{" "}
          — perfect for QR codes on tables. Restaurant owners sign in to manage menus and branding.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="rounded-full px-8" render={<Link href="/login" />}>
            Owner login
          </Button>
        </div>
      </main>
    </div>
  );
}
