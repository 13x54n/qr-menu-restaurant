import Link from "next/link";
import { menuPublicUrl } from "@/lib/public-url";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function OverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { userId: session.user.id },
    include: {
      _count: { select: { menuItems: true } },
    },
  });

  if (!restaurant) redirect("/dashboard");

  const publicUrl = menuPublicUrl(restaurant.slug);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
          Overview
        </h1>
        <p className="mt-1 text-sm text-stone-500">Quick snapshot of your QR menu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-700/90 bg-stone-900/60 p-5 shadow-lg shadow-black/20">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Menu items</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-amber-400">
            {restaurant._count.menuItems}
          </p>
        </div>
        <div className="rounded-xl border border-stone-700/90 bg-stone-900/60 p-5 shadow-lg shadow-black/20">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Public URL</p>
          <p className="mt-2 truncate text-sm text-stone-300">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-400 underline decoration-amber-600/60 underline-offset-2 hover:text-amber-300"
            >
              {publicUrl}
            </a>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-700/90 bg-stone-900/40 p-5">
        <h2 className="text-sm font-medium text-stone-300">Next steps</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-stone-400">
          <li>
            Add dishes and categories in the{" "}
            <Link href="/dashboard/menu" className="text-amber-400 hover:underline">
              Menu
            </Link>{" "}
            tab.
          </li>
          <li>
            Upload a logo and social links under{" "}
            <Link href="/dashboard/profile" className="text-amber-400 hover:underline">
              Profile
            </Link>
            .
          </li>
          <li>
            Point your QR code to{" "}
            <code className="rounded border border-stone-700 bg-stone-950 px-1.5 py-0.5 text-stone-300">
              {restaurant.slug}.localhost:3000
            </code>{" "}
            (local) or your production subdomain.
          </li>
        </ul>
      </div>
    </div>
  );
}
