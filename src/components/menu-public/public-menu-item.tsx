import { formatPrice } from "@/lib/money";
import type { OptionGroups } from "@/lib/option-groups";

export type PublicMenuItemData = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  optionGroups: OptionGroups | null;
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

export function PublicMenuItem({ item }: { item: PublicMenuItemData }) {
  const groups = item.optionGroups;
  if (groups && groups.length > 0) {
    const hasItemPrice = item.priceCents != null;
    return (
      <li className="border-b border-[var(--menu-border)] py-4 last:border-0">
        <div className="min-w-0">
          <div className="flex justify-between gap-3">
            <h3 className="font-semibold text-[var(--menu-fg)]">{item.name}</h3>
            {hasItemPrice ? (
              <span className="shrink-0 font-medium tabular-nums text-[var(--menu-accent)]">
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
                      className="flex justify-between gap-3 text-sm text-[var(--menu-muted)]"
                    >
                      <span>{choice.name}</span>
                      {choice.priceCents !== undefined ? (
                        <span className="shrink-0 font-medium tabular-nums text-[var(--menu-accent)]">
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
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--menu-fg)]">{item.name}</h3>
          {item.description ? (
            <p className="mt-0.5 text-sm text-[var(--menu-muted)]">{item.description}</p>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li className="border-b border-[var(--menu-border)] py-4 last:border-0">
      <div className="flex justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--menu-fg)]">{item.name}</h3>
          {item.description ? (
            <p className="mt-0.5 text-sm text-[var(--menu-muted)]">{item.description}</p>
          ) : null}
        </div>
        <span className="shrink-0 font-medium tabular-nums text-[var(--menu-accent)]">
          {formatPrice(price)}
        </span>
      </div>
    </li>
  );
}
