import { z } from "zod";

export const optionChoiceSchema = z.object({
  name: z.string().min(1).max(200),
  priceCents: z.number().int().min(0).optional(),
});

export const optionGroupSchema = z.object({
  label: z.string().min(1).max(120),
  modifier: z.boolean().optional(),
  choices: z.array(optionChoiceSchema).min(1).max(50),
});

export const optionGroupsSchema = z.array(optionGroupSchema).max(20);

export type OptionChoice = z.infer<typeof optionChoiceSchema>;
export type OptionGroup = z.infer<typeof optionGroupSchema>;
export type OptionGroups = z.infer<typeof optionGroupsSchema>;

export function parseOptionGroupsJson(raw: unknown): OptionGroups | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw) as unknown;
      const p = optionGroupsSchema.safeParse(v);
      return p.success ? p.data : null;
    } catch {
      return null;
    }
  }
  const p = optionGroupsSchema.safeParse(raw);
  return p.success ? p.data : null;
}

export function parseOptionGroupsFromFormField(value: FormDataEntryValue | null): OptionGroups | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return null;
  return parseOptionGroupsJson(value);
}
