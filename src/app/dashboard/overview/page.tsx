import Link from "next/link";
import { menuPublicUrl } from "@/lib/public-url";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { VisitorAnalyticsCards } from "@/components/dashboard/visitor-analytics-cards";
import { PublicMenuQr } from "@/components/dashboard/public-menu-qr";
import { getVisitChartSeries } from "@/lib/analytics";

export default async function OverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { userId: session.user.id },
  });

  if (!restaurant) redirect("/dashboard");

  const publicUrl = menuPublicUrl(restaurant.slug);
  const visitSeries = await getVisitChartSeries(restaurant.id);

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
          Overview
        </h1>
        <p className="mt-1 text-sm text-stone-500">Quick snapshot of your QR menu.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-xl border border-stone-700/90 bg-stone-900/60 p-5 shadow-lg shadow-black/20">
          <PublicMenuQr url={publicUrl} slug={restaurant.slug} />
        </div>
        <div className="min-w-0">
          <VisitorAnalyticsCards series={visitSeries} />
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
            <code className="inline-block max-w-full break-all rounded border border-stone-700 bg-stone-950 px-1.5 py-0.5 text-xs text-stone-300 sm:text-sm">
              {publicUrl}
            </code>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}
