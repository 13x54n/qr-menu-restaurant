"use client";

import { useState } from "react";
import type { OptionChoice, OptionGroups } from "@/lib/option-groups";
import { parseOptionGroupsJson } from "@/lib/option-groups";
import { parsePriceToCents } from "@/lib/money";

type ChoiceDraft = { name: string; price: string };
type GroupDraft = { label: string; modifier: boolean; choices: ChoiceDraft[] };

function groupsToDrafts(groups: OptionGroups | null): GroupDraft[] {
  if (!groups?.length) return [];
  return groups.map((g) => ({
    label: g.label,
    modifier: Boolean(g.modifier),
    choices: g.choices.map((c) => ({
      name: c.name,
      price:
        c.priceCents === undefined
          ? ""
          : c.priceCents === 0
            ? "0"
            : (c.priceCents / 100).toFixed(2),
    })),
  }));
}

function draftsToJson(drafts: GroupDraft[]): string {
  const built: OptionGroups = [];
  for (const g of drafts) {
    const label = g.label.trim();
    if (!label) continue;
    const choices: OptionChoice[] = [];
    for (const c of g.choices) {
      const name = c.name.trim();
      if (!name) continue;
      const p = c.price.trim();
      if (p === "") {
        choices.push({ name });
      } else {
        const cents = parsePriceToCents(p);
        if (cents === null) continue;
        choices.push({ name, priceCents: cents });
      }
    }
    if (choices.length === 0) continue;
    built.push({
      label,
      modifier: g.modifier || undefined,
      choices,
    });
  }
  return JSON.stringify(built);
}

type Props = {
  initialJson?: unknown;
};

export function OptionGroupsField({ initialJson }: Props) {
  const [drafts, setDrafts] = useState<GroupDraft[]>(() =>
    groupsToDrafts(parseOptionGroupsJson(initialJson)),
  );

  const json = draftsToJson(drafts);

  function addGroup() {
    setDrafts((d) => [...d, { label: "", modifier: false, choices: [{ name: "", price: "" }] }]);
  }

  function updateGroup(i: number, patch: Partial<GroupDraft>) {
    setDrafts((d) => d.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  }

  function removeGroup(i: number) {
    setDrafts((d) => d.filter((_, j) => j !== i));
  }

  function addChoice(gi: number) {
    setDrafts((d) =>
      d.map((g, j) =>
        j === gi ? { ...g, choices: [...g.choices, { name: "", price: "" }] } : g,
      ),
    );
  }

  function updateChoice(gi: number, ci: number, patch: Partial<ChoiceDraft>) {
    setDrafts((d) =>
      d.map((g, j) => {
        if (j !== gi) return g;
        const choices = g.choices.map((c, k) => (k === ci ? { ...c, ...patch } : c));
        return { ...g, choices };
      }),
    );
  }

  function removeChoice(gi: number, ci: number) {
    setDrafts((d) =>
      d.map((g, j) => {
        if (j !== gi) return g;
        const choices = g.choices.filter((_, k) => k !== ci);
        return { ...g, choices: choices.length ? choices : [{ name: "", price: "" }] };
      }),
    );
  }

  const innerInput =
    "mt-0.5 w-full rounded border border-stone-600 bg-stone-950 px-2 py-1.5 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40";

  return (
    <div className="sm:col-span-2 space-y-3 rounded-lg border border-dashed border-stone-600 bg-stone-950/40 p-3">
      <input type="hidden" name="optionGroupsJson" value={json} readOnly aria-hidden />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-400">Option groups (optional)</span>
        <button
          type="button"
          onClick={addGroup}
          className="text-xs font-medium text-amber-400 hover:text-amber-300 hover:underline"
        >
          + Add group
        </button>
      </div>
      <p className="text-xs text-stone-500">
        For items like spice level or protein choice. Leave prices blank for labels only. Use 0 for
        &quot;included&quot; with modifier pricing.
      </p>
      {drafts.map((g, gi) => (
        <div key={gi} className="space-y-2 rounded-md border border-stone-700 bg-stone-900/60 p-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-[120px] flex-1">
              <span className="text-xs text-stone-400">Group label</span>
              <input
                value={g.label}
                onChange={(e) => updateGroup(gi, { label: e.target.value })}
                className={innerInput}
                placeholder="e.g. Spice level"
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-stone-400">
              <input
                type="checkbox"
                checked={g.modifier}
                onChange={(e) => updateGroup(gi, { modifier: e.target.checked })}
                className="rounded border-stone-500 text-amber-500 focus:ring-amber-500/40"
              />
              Modifier pricing (+$ / included)
            </label>
            <button
              type="button"
              onClick={() => removeGroup(gi)}
              className="text-xs text-red-400 hover:underline"
            >
              Remove group
            </button>
          </div>
          <div className="space-y-2">
            {g.choices.map((c, ci) => (
              <div key={ci} className="flex flex-wrap items-end gap-2">
                <label className="min-w-[140px] flex-1">
                  <span className="text-xs text-stone-400">Choice</span>
                  <input
                    value={c.name}
                    onChange={(e) => updateChoice(gi, ci, { name: e.target.value })}
                    className={innerInput}
                    placeholder="Name"
                  />
                </label>
                <label className="w-28">
                  <span className="text-xs text-stone-400">Price (CAD)</span>
                  <input
                    value={c.price}
                    onChange={(e) => updateChoice(gi, ci, { price: e.target.value })}
                    inputMode="decimal"
                    className={innerInput}
                    placeholder="—"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeChoice(gi, ci)}
                  className="mb-1 text-xs text-stone-500 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addChoice(gi)}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 hover:underline"
            >
              + Add choice
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
