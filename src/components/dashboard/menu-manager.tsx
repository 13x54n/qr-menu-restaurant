"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/actions/menu";
import { formatPrice } from "@/lib/money";
import { OptionGroupsField } from "@/components/option-groups-field";
import type { MenuItem } from "@prisma/client";

const field =
  "mt-1 w-full rounded-lg border border-stone-600 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40";

function priceSummary(item: MenuItem): string {
  const hasGroups =
    item.optionGroups != null &&
    typeof item.optionGroups === "object" &&
    Array.isArray(item.optionGroups) &&
    item.optionGroups.length > 0;
  if (item.priceCents != null) return formatPrice(item.priceCents);
  if (hasGroups) return "Options";
  return "—";
}

function matchesSearch(item: MenuItem, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const blob = [item.name, item.description ?? "", item.category].join(" ").toLowerCase();
  return blob.includes(s);
}

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

function SideDrawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-stone-800 bg-[#0c0a09] shadow-2xl transition-transform duration-200 ease-out ${
          open ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
          <h2 className="text-lg font-medium text-stone-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}

type Props = { items: MenuItem[] };

export function MenuManager({ items }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  const filtered = useMemo(
    () => items.filter((item) => matchesSearch(item, query)),
    [items, query],
  );

  const [addState, addAction, addPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const r = await createMenuItem(_prev, formData);
      if (r.ok) {
        setAddOpen(false);
        router.refresh();
      }
      return r;
    },
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <label htmlFor="menu-search" className="sr-only">
            Search menu
          </label>
          <input
            id="menu-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, description…"
            className="w-full rounded-lg border border-stone-600 bg-stone-950 py-2 pl-3 pr-3 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="shrink-0 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-stone-950 hover:bg-amber-400"
        >
          Add item
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-700/90 bg-stone-900/40 shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-700 bg-stone-950/80">
                <th className="px-4 py-3 font-medium text-stone-400">Name</th>
                <th className="px-4 py-3 font-medium text-stone-400">Category</th>
                <th className="px-4 py-3 font-medium text-stone-400">Price</th>
                <th className="px-4 py-3 text-right font-medium text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-stone-500">
                    {items.length === 0
                      ? "No menu items yet. Use Add item to create one."
                      : "No matches for your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-stone-800/80 transition-colors hover:bg-stone-800/30"
                  >
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="font-medium text-stone-100">{item.name}</p>
                      {item.description ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{item.description}</p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-300">{item.category}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-amber-400/90">
                      {priceSummary(item)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditItem(item)}
                          className="rounded-lg border border-stone-600 px-3 py-1.5 text-xs font-medium text-stone-300 hover:bg-stone-800"
                        >
                          Edit
                        </button>
                        <form
                          action={async (fd) => {
                            const id = fd.get("id") as string;
                            await deleteMenuItem(id);
                            router.refresh();
                          }}
                        >
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SideDrawer open={addOpen} onClose={() => setAddOpen(false)} title="Add menu item">
        <form action={addAction} className="grid gap-3">
          {addState && "ok" in addState && !addState.ok ? (
            <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {addState.error}
            </p>
          ) : null}
          <label className="block">
            <span className="text-xs font-medium text-stone-400">Name</span>
            <input name="name" required className={field} placeholder="Margherita pizza" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-400">Description</span>
            <textarea name="description" rows={2} className={field} placeholder="Optional" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-400">Category (section)</span>
            <input name="category" defaultValue="Mains" className={field} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-400">Base price (CAD)</span>
            <input
              name="price"
              inputMode="decimal"
              placeholder="12.99 or leave empty with options"
              className={field}
            />
          </label>
          <p className="text-xs text-stone-500">
            Required if there are no option groups. Optional when you add groups.
          </p>
          <OptionGroupsField />
          <button
            type="submit"
            disabled={addPending}
            className="mt-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-60"
          >
            {addPending ? "Adding…" : "Add to menu"}
          </button>
        </form>
      </SideDrawer>

      <SideDrawer
        open={editItem != null}
        onClose={() => setEditItem(null)}
        title="Edit menu item"
      >
        {editItem ? (
          <MenuItemEditForm
            item={editItem}
            onClose={() => setEditItem(null)}
            onSaved={() => {
              setEditItem(null);
              router.refresh();
            }}
          />
        ) : null}
      </SideDrawer>
    </div>
  );
}

function MenuItemEditForm({
  item,
  onClose,
  onSaved,
}: {
  item: MenuItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const priceStr = item.priceCents != null ? (item.priceCents / 100).toFixed(2) : "";

  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const r = await updateMenuItem(item.id, _prev, formData);
      if (r.ok) onSaved();
      return r;
    },
    null,
  );

  return (
    <form action={action} className="grid gap-3">
      {state && "ok" in state && !state.ok ? (
        <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <label className="block">
        <span className="text-xs font-medium text-stone-400">Name</span>
        <input name="name" required defaultValue={item.name} className={field} />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-400">Description</span>
        <textarea
          name="description"
          rows={2}
          defaultValue={item.description ?? ""}
          className={field}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-400">Category</span>
        <input name="category" defaultValue={item.category} className={field} />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-400">Base price (CAD)</span>
        <input
          name="price"
          inputMode="decimal"
          defaultValue={priceStr}
          placeholder="Optional with option groups"
          className={field}
        />
      </label>
      <OptionGroupsField key={item.id} initialJson={item.optionGroups} />
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-stone-600 px-4 py-2.5 text-sm text-stone-300 hover:bg-stone-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
