import { useMemo, useState } from "react";

type Primitive = string | number | boolean | null;
type Json = Primitive | Json[] | { [k: string]: Json };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function labelize(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\./g, " · ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function getAtPath(root: any, path: (string | number)[]) {
  let cur = root;
  for (const p of path) cur = cur?.[p as any];
  return cur;
}

function setAtPath(root: any, path: (string | number)[], nextValue: any) {
  if (!path.length) return nextValue;
  const [head, ...rest] = path;
  const clone = Array.isArray(root) ? root.slice() : { ...(root ?? {}) };
  clone[head as any] = setAtPath(clone[head as any], rest, nextValue);
  return clone;
}

function deleteAtPath(root: any, path: (string | number)[]) {
  if (!path.length) return root;
  const [head, ...rest] = path;
  const clone = Array.isArray(root) ? root.slice() : { ...(root ?? {}) };
  if (rest.length === 0) {
    if (Array.isArray(clone)) clone.splice(head as number, 1);
    else delete clone[head as any];
    return clone;
  }
  clone[head as any] = deleteAtPath(clone[head as any], rest);
  return clone;
}

function moveArrayItem(root: any, pathToArray: (string | number)[], index: number, delta: -1 | 1) {
  const arr = getAtPath(root, pathToArray);
  if (!Array.isArray(arr)) return root;
  const next = arr.slice();
  const to = index + delta;
  if (to < 0 || to >= next.length) return root;
  const [item] = next.splice(index, 1);
  next.splice(to, 0, item);
  return setAtPath(root, pathToArray, next);
}

function guessNewItemTemplate(items: unknown[]) {
  const sample = items.find((x) => x !== null && x !== undefined);
  if (!sample) return {};
  if (typeof sample === "string") return "";
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  if (Array.isArray(sample)) return [];
  if (isPlainObject(sample)) {
    const obj: Record<string, unknown> = {};
    for (const key of Object.keys(sample)) {
      const v = (sample as any)[key];
      obj[key] = typeof v === "string" ? "" : typeof v === "number" ? 0 : typeof v === "boolean" ? false : isPlainObject(v) ? {} : Array.isArray(v) ? [] : null;
    }
    return obj;
  }
  return {};
}

export function CmsFormEditor({
  value,
  onChange,
}: {
  value: Json;
  onChange: (next: any) => void;
}) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  async function uploadImage(file: File, pathToValue: (string | number)[]) {
    const k = pathToValue.join(".");
    setUploading((m) => ({ ...m, [k]: true }));
    setUploadError((m) => ({ ...m, [k]: "" }));
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/assets", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? "Upload failed");
      onChange(setAtPath(value, pathToValue, String(json.url ?? "")));
    } catch (e) {
      setUploadError((m) => ({ ...m, [k]: e instanceof Error ? e.message : "Upload failed" }));
    } finally {
      setUploading((m) => ({ ...m, [k]: false }));
    }
  }

  function renderNode(path: (string | number)[], node: any, depth: number) {
    const key = path.length ? path.join(".") : "root";
    const padding = depth ? "pl-4" : "";

    if (node === null || node === undefined) {
      return (
        <div key={key} className={`rounded-lg border p-3 ${padding}`}>
          <p className="text-sm text-[#5C4033]">Empty</p>
        </div>
      );
    }

    if (typeof node === "string") {
      const isLong = node.length > 80 || node.includes("\n");
      const leaf = String(path[path.length - 1] ?? "").toLowerCase();
      const looksLikeImage =
        leaf.includes("image") ||
        leaf.includes("src") ||
        /\.(png|jpe?g|webp)(\?|$)/i.test(node) ||
        node.startsWith("/images/") ||
        node.startsWith("/api/images/");
      if (looksLikeImage) {
        const uploadKey = [...path].join(".");
        return (
          <div key={key} className={`${padding}`}>
            <div className="mt-1 grid gap-3 sm:grid-cols-[160px,1fr]">
              <div className="rounded-lg border bg-white/40 p-2">
                <div className="img-frame aspect-[4/3]">
                  <img src={node || "/images/hero-alt.jpg"} alt="" />
                </div>
              </div>
              <div>
                <input
                  className="w-full rounded-lg border p-3 text-sm"
                  value={node}
                  onChange={(e) => onChange(setAtPath(value, path, e.target.value))}
                  placeholder="Image URL"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="rounded-lg border px-3 py-2 text-sm cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        void uploadImage(f, path);
                        e.currentTarget.value = "";
                      }}
                      disabled={Boolean(uploading[uploadKey])}
                    />
                    {uploading[uploadKey] ? "Uploading…" : "Upload image"}
                  </label>
                  {uploadError[uploadKey] ? <span className="text-sm text-red-700">{uploadError[uploadKey]}</span> : null}
                </div>
              </div>
            </div>
          </div>
        );
      }
      return (
        <div key={key} className={`${padding}`}>
          {isLong ? (
            <textarea
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              rows={4}
              value={node}
              onChange={(e) => onChange(setAtPath(value, path, e.target.value))}
            />
          ) : (
            <input
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              value={node}
              onChange={(e) => onChange(setAtPath(value, path, e.target.value))}
            />
          )}
        </div>
      );
    }

    if (typeof node === "number") {
      return (
        <div key={key} className={`${padding}`}>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border p-3 text-sm"
            value={Number.isFinite(node) ? node : 0}
            onChange={(e) => onChange(setAtPath(value, path, Number(e.target.value)))}
          />
        </div>
      );
    }

    if (typeof node === "boolean") {
      return (
        <div key={key} className={`${padding} mt-2 flex items-center gap-2`}>
          <input
            type="checkbox"
            checked={node}
            onChange={(e) => onChange(setAtPath(value, path, e.target.checked))}
          />
          <span className="text-sm text-[#2B2B2B]">Enabled</span>
        </div>
      );
    }

    if (Array.isArray(node)) {
      const items = node as any[];
      const template = guessNewItemTemplate(items);
      return (
        <div key={key} className={`${padding} mt-3 rounded-xl border bg-[#F2EAD8] p-3`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{labelize(String(path[path.length - 1] ?? "Items"))}</p>
            <button
              type="button"
              className="rounded-lg bg-[#2F3E34] px-3 py-2 text-sm text-white"
              onClick={() => onChange(setAtPath(value, path, [...items, template]))}
            >
              Add
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {items.length === 0 ? (
              <p className="text-xs text-[#5C4033]">No items.</p>
            ) : (
              items.map((item, idx) => {
                const itemPath = [...path, idx];
                const title =
                  isPlainObject(item) && typeof (item as any).title === "string"
                    ? (item as any).title
                    : isPlainObject(item) && typeof (item as any).label === "string"
                      ? (item as any).label
                      : `Item ${idx + 1}`;
                return (
                  <div key={`${key}.${idx}`} className="rounded-xl border bg-[#F2EAD8] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{title}</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg border px-2 py-1 text-xs"
                          onClick={() => onChange(moveArrayItem(value, path, idx, -1))}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border px-2 py-1 text-xs"
                          onClick={() => onChange(moveArrayItem(value, path, idx, 1))}
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border px-2 py-1 text-xs text-red-700"
                          onClick={() => onChange(deleteAtPath(value, itemPath))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">{renderNode(itemPath, item, depth + 1)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    if (isPlainObject(node)) {
      const obj = node as Record<string, any>;
      const keys = Object.keys(obj);
      const isImage = keys.includes("src") && keys.includes("alt") && keys.length <= 3;
      if (isImage) {
        const srcPath = [...path, "src"];
        const uploadKey = srcPath.join(".");
        const src = String(obj.src ?? "");
        return (
          <div key={key} className={`${padding} mt-3 rounded-xl border bg-[#F2EAD8] p-3`}>
            <p className="text-sm font-medium">{labelize(String(path[path.length - 1] ?? "Image"))}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[160px,1fr]">
              <div className="rounded-lg border bg-white/40 p-2">
                <div className="img-frame aspect-[4/3]">
                  <img src={src || "/images/hero-alt.jpg"} alt={String(obj.alt ?? "")} />
                </div>
              </div>
              <label className="text-xs text-[#5C4033]">
                URL
                <input
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                  value={src}
                  onChange={(e) => onChange(setAtPath(value, [...path, "src"], e.target.value))}
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="rounded-lg border px-3 py-2 text-sm text-[#2B2B2B] cursor-pointer bg-white/40">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        void uploadImage(f, srcPath);
                        e.currentTarget.value = "";
                      }}
                      disabled={Boolean(uploading[uploadKey])}
                    />
                    {uploading[uploadKey] ? "Uploading…" : "Upload image"}
                  </label>
                  {uploadError[uploadKey] ? <span className="text-sm text-red-700">{uploadError[uploadKey]}</span> : null}
                </div>
              </label>
              <label className="text-xs text-[#5C4033]">
                Alt text
                <input
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                  value={String(obj.alt ?? "")}
                  onChange={(e) => onChange(setAtPath(value, [...path, "alt"], e.target.value))}
                />
              </label>
            </div>
          </div>
        );
      }

      return (
        <div key={key} className={`${padding} mt-3 rounded-xl border bg-[#F2EAD8] p-3`}>
          <p className="text-sm font-medium">{labelize(String(path[path.length - 1] ?? "Section"))}</p>
          <div className="mt-3 grid gap-3">
            {Object.entries(obj).map(([k, v]) => (
              <div key={`${key}.${k}`}>
                <p className="text-xs font-medium text-[#5C4033]">{labelize(k)}</p>
                {renderNode([...path, k], v, depth + 1)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className={`${padding} rounded-lg border p-3`}>
        <p className="text-sm text-[#5C4033]">Unsupported field type</p>
      </div>
    );
  }

  const rootIsObject = isPlainObject(value);
  const entries = useMemo(() => (rootIsObject ? Object.entries(value as any) : []), [rootIsObject, value]);

  if (!rootIsObject) {
    return (
      <div className="rounded-xl border bg-[#F2EAD8] p-4">
        <div className="grid gap-3">{renderNode([], value, 0)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([k, v]) => (
        <div key={k}>
          <p className="text-xs font-medium text-[#5C4033]">{labelize(k)}</p>
          {renderNode([k], v, 0)}
        </div>
      ))}
    </div>
  );
}

