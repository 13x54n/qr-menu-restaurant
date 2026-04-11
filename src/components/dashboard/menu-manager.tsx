"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemOutOfStock,
  updateRestaurantMenuCategories,
} from "@/actions/menu";
import { formatPrice } from "@/lib/money";
import { OptionGroupsField } from "@/components/option-groups-field";
import type { MenuItem } from "@prisma/client";

const field =
  "mt-1 w-full rounded-lg border border-stone-600 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40";

const descriptionField = `${field} min-h-[7.5rem] resize-y py-2.5 leading-relaxed`;

/** Dish form: sentinel for “type a new category” in the category `<select>`. */
const NEW_CATEGORY_OPTION = "__new_category__";
/** Owner list: sentinel in “add category” `<select>` to reveal the text field. */
const OWNER_ADD_TYPE_NEW = "__owner_type_new__";

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
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-full flex-col border-l border-stone-800 bg-[#0c0a09] shadow-2xl transition-transform duration-200 ease-out sm:max-w-lg ${
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

function DeleteConfirmModal({
  item,
  deleting,
  onCancel,
  onConfirm,
}: {
  item: MenuItem;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <button
        type="button"
        aria-hidden
        className="fixed inset-0 z-[80] bg-black/70"
        onClick={deleting ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-menu-item-title"
        className="fixed left-1/2 top-1/2 z-[90] w-[min(calc(100vw-2rem),24rem)] max-h-[min(90dvh,calc(100vh-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-stone-700 bg-stone-950 p-4 shadow-2xl sm:p-5"
      >
        <h2 id="delete-menu-item-title" className="text-lg font-medium text-stone-100">
          Delete menu item?
        </h2>
        <p className="mt-2 text-sm text-stone-400">
          <span className="font-medium text-stone-200">{item.name}</span> will be removed permanently. This
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-lg border border-stone-600 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

function CategorySelect({
  options,
  defaultValue,
  fieldId,
}: {
  options: string[];
  defaultValue: string;
  fieldId: string;
}) {
  const pickOptions = options.length > 0 ? options : ["General"];
  const inList = pickOptions.includes(defaultValue);
  const [mode, setMode] = useState<"pick" | "custom">(inList ? "pick" : "custom");
  const [pick, setPick] = useState(inList ? defaultValue : pickOptions[0]);
  const [custom, setCustom] = useState(inList ? "" : defaultValue);

  /** In “new category” mode, empty text fails server validation until the owner types a name. */
  const effective = mode === "pick" ? pick : custom.trim();

  return (
    <div className="space-y-2">
      <label className="block" htmlFor={`${fieldId}-select`}>
        <span className="text-xs font-medium text-stone-400">Category (section)</span>
        <p className="mt-0.5 text-[11px] text-stone-500">Choose from the list, or pick “New category…” to type one.</p>
        <select
          id={`${fieldId}-select`}
          className={field}
          value={mode === "pick" ? pick : NEW_CATEGORY_OPTION}
          onChange={(e) => {
            const v = e.target.value;
            if (v === NEW_CATEGORY_OPTION) {
              setMode("custom");
            } else {
              setMode("pick");
              setPick(v);
            }
          }}
        >
          {pickOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value={NEW_CATEGORY_OPTION}>New category…</option>
        </select>
      </label>
      {mode === "custom" ? (
        <div className="space-y-2">
          <label className="block" htmlFor={`${fieldId}-custom`}>
            <span className="text-xs font-medium text-stone-400">New category name</span>
            <input
              id={`${fieldId}-custom`}
              className={field}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Type the section name"
              autoFocus
            />
          </label>
          <button
            type="button"
            className="text-xs font-medium text-amber-400/90 hover:text-amber-300 hover:underline"
            onClick={() => {
              setMode("pick");
              setPick(pickOptions[0] ?? "General");
              setCustom("");
            }}
          >
            Use existing category instead
          </button>
        </div>
      ) : null}
      <input type="hidden" name="category" value={effective} />
    </div>
  );
}

type Props = {
  items: MenuItem[];
  categoryOptions: string[];
  initialMenuCategories: string[];
};

export function MenuManager({ items, categoryOptions, initialMenuCategories }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [stockPendingId, setStockPendingId] = useState<string | null>(null);
  const [ownerCategories, setOwnerCategories] = useState<string[]>(() => [...initialMenuCategories]);
  const [ownerAddSelect, setOwnerAddSelect] = useState("");
  const [ownerAddTyping, setOwnerAddTyping] = useState(false);
  const [typedOwnerNew, setTypedOwnerNew] = useState("");
  const [catSaveError, setCatSaveError] = useState<string | null>(null);
  const [isPendingCategories, startCategoriesTransition] = useTransition();

  const menuCategoriesKey = initialMenuCategories.join("\0");
  useEffect(() => {
    setOwnerCategories([...initialMenuCategories]);
    // initialMenuCategories content is tied to menuCategoriesKey; avoid syncing on every parent refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuCategoriesKey]);

  const filtered = useMemo(
    () => items.filter((item) => matchesSearch(item, query)),
    [items, query],
  );

  const categoriesPool = useMemo(
    () => categoryOptions.filter((c) => !ownerCategories.includes(c)),
    [categoryOptions, ownerCategories],
  );

  const defaultAddCategory = categoryOptions[0] ?? "General";

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

  async function handleConfirmDelete() {
    if (!itemToDelete) return;
    setDeletePending(true);
    try {
      const r = await deleteMenuItem(itemToDelete.id);
      if (r.ok) {
        setItemToDelete(null);
        router.refresh();
      }
    } finally {
      setDeletePending(false);
    }
  }

  async function handleToggleStock(id: string) {
    setStockPendingId(id);
    try {
      await toggleMenuItemOutOfStock(id);
      router.refresh();
    } finally {
      setStockPendingId(null);
    }
  }

  function saveCategories() {
    setCatSaveError(null);
    const cleaned = ownerCategories.map((s) => s.trim()).filter(Boolean);
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const t of cleaned) {
      if (seen.has(t)) continue;
      seen.add(t);
      deduped.push(t);
    }
    startCategoriesTransition(async () => {
      const r = await updateRestaurantMenuCategories(deduped);
      if (r.ok) {
        router.refresh();
      } else {
        setCatSaveError(r.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {itemToDelete ? (
        <DeleteConfirmModal
          item={itemToDelete}
          deleting={deletePending}
          onCancel={() => {
            if (!deletePending) setItemToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      <details className="group rounded-xl border border-stone-700/90 bg-stone-900/40 shadow-lg shadow-black/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-stone-200 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            Manage menu sections
            <span className="mt-0.5 block text-xs font-normal text-stone-500">
              Add or remove saved categories for item dropdowns.
            </span>
          </span>
          <span
            className="shrink-0 text-stone-500 transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          >
            ▼
          </span>
        </summary>
        <div className="border-t border-stone-700/50 px-5 pb-5 pt-4">
        <h2 className="text-sm font-semibold text-stone-200">Menu categories</h2>
        <p className="mt-1 text-xs text-stone-500">
          Used in the dropdown when you add or edit items. In-use categories from dishes are always shown in
          the dropdown even if not listed here.
        </p>
        {catSaveError ? (
          <p className="mt-2 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {catSaveError}
          </p>
        ) : null}
        <ul className="mt-4 flex flex-wrap gap-2">
          {ownerCategories.length === 0 ? (
            <li className="text-sm text-stone-500">No saved categories yet. Add from the list or type a new name.</li>
          ) : (
            ownerCategories.map((cat) => (
              <li
                key={cat}
                className="flex items-center gap-1 rounded-lg border border-stone-600 bg-stone-950 pl-3 pr-1 py-1"
              >
                <span className="max-w-[240px] truncate text-sm text-stone-200">{cat}</span>
                <button
                  type="button"
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                  onClick={() => setOwnerCategories(ownerCategories.filter((c) => c !== cat))}
                  aria-label={`Remove ${cat}`}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="mt-4 space-y-2">
          <label className="block" htmlFor="owner-add-category-select">
            <span className="text-xs font-medium text-stone-400">Add category</span>
            <p className="mt-0.5 text-[11px] text-stone-500">
              Pick an existing section from your menu, or choose “Type new category name…” to enter one.
            </p>
            <select
              id="owner-add-category-select"
              className={field}
              value={ownerAddTyping ? OWNER_ADD_TYPE_NEW : ownerAddSelect}
              onChange={(e) => {
                const v = e.target.value;
                if (v === OWNER_ADD_TYPE_NEW) {
                  setOwnerAddTyping(true);
                  setOwnerAddSelect("");
                  return;
                }
                if (!v) return;
                setOwnerAddTyping(false);
                if (!ownerCategories.includes(v)) {
                  setOwnerCategories([...ownerCategories, v]);
                }
                setOwnerAddSelect("");
              }}
            >
              <option value="" disabled>
                Add category…
              </option>
              {categoriesPool.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OWNER_ADD_TYPE_NEW}>Type new category name…</option>
            </select>
          </label>
          {ownerAddTyping ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block min-w-0 flex-1" htmlFor="owner-new-category-name">
                <span className="text-xs font-medium text-stone-400">New name</span>
                <input
                  id="owner-new-category-name"
                  className={field}
                  value={typedOwnerNew}
                  onChange={(e) => setTypedOwnerNew(e.target.value)}
                  placeholder="e.g. Shareables"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const t = typedOwnerNew.trim();
                      if (t && !ownerCategories.includes(t)) {
                        setOwnerCategories([...ownerCategories, t]);
                        setTypedOwnerNew("");
                        setOwnerAddTyping(false);
                        setOwnerAddSelect("");
                      }
                    }
                  }}
                />
              </label>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-stone-600 px-4 py-2.5 text-sm text-stone-300 hover:bg-stone-800"
                onClick={() => {
                  const t = typedOwnerNew.trim();
                  if (t && !ownerCategories.includes(t)) {
                    setOwnerCategories([...ownerCategories, t]);
                  }
                  setTypedOwnerNew("");
                  setOwnerAddTyping(false);
                  setOwnerAddSelect("");
                }}
              >
                Add name
              </button>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-stone-600 px-4 py-2.5 text-sm text-stone-400 hover:bg-stone-800"
                onClick={() => {
                  setTypedOwnerNew("");
                  setOwnerAddTyping(false);
                  setOwnerAddSelect("");
                }}
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          <button
            type="button"
            disabled={isPendingCategories}
            onClick={saveCategories}
            className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-60"
          >
            {isPendingCategories ? "Saving…" : "Save categories"}
          </button>
        </div>
        </div>
      </details>

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

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-stone-700/90 bg-stone-900/40 px-4 py-10 text-center text-sm text-stone-500 shadow-lg shadow-black/20">
          {items.length === 0
            ? "No menu items yet. Use Add item to create one."
            : "No matches for your search."}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-stone-700/90 bg-stone-900/40 shadow-lg shadow-black/20 md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm lg:min-w-[720px]">
                <thead>
                  <tr className="border-b border-stone-700 bg-stone-950/80">
                    <th className="px-4 py-3 font-medium text-stone-400">Name</th>
                    <th className="px-4 py-3 font-medium text-stone-400">Category</th>
                    <th className="px-4 py-3 font-medium text-stone-400">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-stone-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-stone-800/80 transition-colors hover:bg-stone-800/30 ${
                        item.outOfStock ? "opacity-75" : ""
                      }`}
                    >
                      <td className="max-w-[220px] px-4 py-3">
                        <p className="font-medium text-stone-100">
                          {item.name}
                          {item.outOfStock ? (
                            <span className="ml-2 inline-block rounded border border-amber-800/80 bg-amber-950/50 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                              Out of stock
                            </span>
                          ) : null}
                        </p>
                        {item.description ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{item.description}</p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-stone-300">{item.category}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-amber-400/90">
                        {priceSummary(item)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditItem(item)}
                            className="rounded-lg border border-stone-600 px-3 py-1.5 text-xs font-medium text-stone-300 hover:bg-stone-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={stockPendingId === item.id}
                            onClick={() => handleToggleStock(item.id)}
                            className="rounded-lg border border-amber-800/60 px-3 py-1.5 text-xs font-medium text-amber-200/90 hover:bg-amber-950/40 disabled:opacity-50"
                          >
                            {stockPendingId === item.id
                              ? "…"
                              : item.outOfStock
                                ? "Mark in stock"
                                : "Out of stock"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border border-stone-700/90 bg-stone-950/50 p-4 shadow-md ${
                  item.outOfStock ? "opacity-80" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-100">
                      {item.name}
                      {item.outOfStock ? (
                        <span className="ml-2 inline-block rounded border border-amber-800/80 bg-amber-950/50 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                          Out of stock
                        </span>
                      ) : null}
                    </p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-3 text-xs text-stone-500">{item.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-stone-400">{item.category}</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-amber-400/90">
                    {priceSummary(item)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditItem(item)}
                    className="rounded-lg border border-stone-600 px-3 py-2 text-xs font-medium text-stone-300 hover:bg-stone-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={stockPendingId === item.id}
                    onClick={() => handleToggleStock(item.id)}
                    className="rounded-lg border border-amber-800/60 px-3 py-2 text-xs font-medium text-amber-200/90 hover:bg-amber-950/40 disabled:opacity-50"
                  >
                    {stockPendingId === item.id
                      ? "…"
                      : item.outOfStock
                        ? "Mark in stock"
                        : "Out of stock"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="rounded-lg border border-red-900/60 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SideDrawer open={addOpen} onClose={() => setAddOpen(false)} title="Add menu item">
        <form action={addAction} className="flex flex-col gap-4">
          {addState && "ok" in addState && !addState.ok ? (
            <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {addState.error}
            </p>
          ) : null}
          <div className="w-full shrink-0">
            <label className="block">
              <span className="text-xs font-medium text-stone-400">Name</span>
              <input name="name" required className={field} placeholder="Margherita pizza" />
            </label>
          </div>
          <div className="w-full shrink-0">
            <label className="block">
              <span className="text-xs font-medium text-stone-400">Description</span>
              <textarea
                name="description"
                rows={4}
                className={descriptionField}
                placeholder="Optional — ingredients, dietary notes, etc."
              />
            </label>
          </div>
          <div className="w-full shrink-0">
            <CategorySelect
              key={`add-${categoryOptions.join("|")}`}
              fieldId="add"
              options={categoryOptions}
              defaultValue={defaultAddCategory}
            />
          </div>
          <div className="w-full shrink-0">
            <label className="block">
              <span className="text-xs font-medium text-stone-400">Base price (CAD)</span>
              <input
                name="price"
                inputMode="decimal"
                placeholder="12.99 or leave empty with options"
                className={field}
              />
            </label>
            <p className="mt-1 text-xs text-stone-500">
              Required if there are no option groups. Optional when you add groups.
            </p>
          </div>
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
            categoryOptions={categoryOptions}
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
  categoryOptions,
  onClose,
  onSaved,
}: {
  item: MenuItem;
  categoryOptions: string[];
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
    <form action={action} className="flex flex-col gap-4">
      {state && "ok" in state && !state.ok ? (
        <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <div className="w-full shrink-0">
        <label className="block">
          <span className="text-xs font-medium text-stone-400">Name</span>
          <input name="name" required defaultValue={item.name} className={field} />
        </label>
      </div>
      <div className="w-full shrink-0">
        <label className="block">
          <span className="text-xs font-medium text-stone-400">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={item.description ?? ""}
            className={descriptionField}
            placeholder="Optional — ingredients, dietary notes, etc."
          />
        </label>
      </div>
      <div className="w-full shrink-0">
        <CategorySelect
          key={`edit-${item.id}-${categoryOptions.join("|")}`}
          fieldId={`edit-${item.id}`}
          options={categoryOptions}
          defaultValue={item.category}
        />
      </div>
      <div className="w-full shrink-0">
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
      </div>
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
