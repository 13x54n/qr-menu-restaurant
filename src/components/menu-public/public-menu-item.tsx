import { formatPrice } from "@/lib/money";
import type { OptionGroups } from "@/lib/option-groups";

export type PublicMenuItemData = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  optionGroups: OptionGroups | null;
  outOfStock: boolean;
};

function choicePriceLabel(
  choice: { name: string; priceCents?: number },
  group: { modifier?: boolean },
): string | null {
  if (choice.priceCents === undefined) return null;
  if (group.modifier) {
    if (choice.priceCents === 0) return "included";
    return `+${formatPrice(choice.priceCents)}`;
  }
  return formatPrice(choice.priceCents);
}

function OutOfStockBadge() {
  return (
    <span className="ml-2 inline-block rounded border border-amber-900/70 bg-amber-950/50 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-amber-200/95">
      Out of stock
    </span>
  );
}

function mutedPriceClass(oos: boolean) {
  return oos ? "opacity-45 line-through" : "";
}

export function PublicMenuItem({ item }: { item: PublicMenuItemData }) {
  const oos = item.outOfStock;
  const groups = item.optionGroups;
  if (groups && groups.length > 0) {
    const hasItemPrice = item.priceCents != null;
    return (
      <li className="border-b border-[var(--menu-border)] py-4 last:border-0">
        <div className={`min-w-0 ${oos ? "opacity-90" : ""}`}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h3 className="min-w-0 font-semibold text-[var(--menu-fg)]">
              {item.name}
              {oos ? <OutOfStockBadge /> : null}
            </h3>
            {hasItemPrice ? (
              <span
                className={`shrink-0 font-medium tabular-nums text-[var(--menu-accent)] sm:text-right ${mutedPriceClass(oos)}`}
              >
                {formatPrice(item.priceCents!)}
              </span>
            ) : null}
          </div>
          {item.description ? (
            <p className="mt-0.5 text-sm text-[var(--menu-muted)]">{item.description}</p>
          ) : null}
          <div className="mt-3 space-y-3">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--menu-accent)]">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.choices.map((choice) => (
                    <li
                      key={choice.name}
                      className="flex flex-col gap-0.5 text-sm text-[var(--menu-muted)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
                    >
                      <span className="min-w-0">{choice.name}</span>
                      {choice.priceCents !== undefined ? (
                        <span
                          className={`shrink-0 font-medium tabular-nums text-[var(--menu-accent)] sm:text-right ${mutedPriceClass(oos)}`}
                        >
                          {choicePriceLabel(choice, group)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </li>
    );
  }

  const price = item.priceCents;
  if (price == null) {
    return (
      <li className="border-b border-[var(--menu-border)] py-4 last:border-0">
        <div className={oos ? "opacity-90" : ""}>
          <h3 className="font-semibold text-[var(--menu-fg)]">
            {item.name}
            {oos ? <OutOfStockBadge /> : null}
          </h3>
          {item.description ? (
            <p className="mt-0.5 text-sm text-[var(--menu-muted)]">{item.description}</p>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li className="border-b border-[var(--menu-border)] py-4 last:border-0">
      <div
        className={`flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3 ${oos ? "opacity-90" : ""}`}
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--menu-fg)]">
            {item.name}
            {oos ? <OutOfStockBadge /> : null}
          </h3>
          {item.description ? (
            <p className="mt-0.5 text-sm text-[var(--menu-muted)]">{item.description}</p>
          ) : null}
        </div>
        <span
          className={`shrink-0 font-medium tabular-nums text-[var(--menu-accent)] sm:text-right ${mutedPriceClass(oos)}`}
        >
          {formatPrice(price)}
        </span>
      </div>
    </li>
  );
}
