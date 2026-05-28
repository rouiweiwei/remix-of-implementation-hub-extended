// Auto-generated from Plexa Excel — Training Schedule tab
export type SchedItem = { n: number; text: string };
export type SchedSub = { title: string; items: SchedItem[] };
export type SchedModule = { title: string; subs: SchedSub[]; holdpoint: string | null; email: string | null };

type ApiRecordLike = {
  fields?: Record<string, unknown>;
  [key: string]: unknown;
};

const readField = (record: ApiRecordLike | undefined, keys: string[]) => {
  const source = record?.fields && typeof record.fields === "object" ? record.fields : (record ?? {});
  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
};

export function normalizeTrainingScheduleRecords(records: ApiRecordLike[]): SchedModule[] {
  const modules = new Map<string, { title: string; holdpoint: string | null; email: string | null; subs: Map<string, SchedSub>; moduleOrder: number }>();

  records.forEach((record) => {
    const fields = (record?.fields && typeof record.fields === "object" ? record.fields : record) as Record<string, unknown>;
    const moduleTitle = String(readField(record, ["moduleTitle", "Module Title", "title", "Title"]) || "Training Module");
    const subTitle = String(readField(record, ["subTitle", "Sub Title"]) || moduleTitle);
    const itemNumber = Number(readField(record, ["itemNumber", "Item Number", "n"]) || 0);
    const itemText = String(readField(record, ["itemText", "Item Text", "text"]) || "");
    const moduleOrder = Number(fields.moduleOrder ?? fields["moduleOrder"] ?? 0);
    const subOrder = Number(fields.subOrder ?? fields["subOrder"] ?? 0);

    if (!modules.has(moduleTitle)) {
      modules.set(moduleTitle, {
        title: moduleTitle,
        holdpoint: String(readField(record, ["holdpoint", "Holdpoint"]) || "") || null,
        email: String(readField(record, ["email", "Email"]) || "") || null,
        subs: new Map(),
        moduleOrder,
      });
    }

    const module = modules.get(moduleTitle)!;
    if (!module.subs.has(subTitle)) {
      module.subs.set(subTitle, { title: subTitle, items: [] });
    }

    const sub = module.subs.get(subTitle)!;
    if (itemNumber > 0 && itemText) {
      sub.items.push({ n: itemNumber, text: itemText });
    }

    // preserve the first holdpoint/email seen for the module
    module.holdpoint = module.holdpoint || String(readField(record, ["holdpoint", "Holdpoint"]) || "") || null;
    module.email = module.email || String(readField(record, ["email", "Email"]) || "") || null;
    module.moduleOrder = module.moduleOrder || moduleOrder;

    // sort item lists by number for predictable UI rendering
    sub.items.sort((a, b) => a.n - b.n);
  });

  return Array.from(modules.values())
    .sort((a, b) => a.moduleOrder - b.moduleOrder)
    .map((module) => ({
      title: module.title,
      holdpoint: module.holdpoint,
      email: module.email,
      subs: Array.from(module.subs.values()).sort((a, b) => a.title.localeCompare(b.title)),
    }));
}
