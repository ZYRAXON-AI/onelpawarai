import { createHash, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

type AdminSession = { unlocked?: boolean };

function sessionOptions() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "founder-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function matches(input: string, expected: string) {
  const left = createHash("sha256").update(input, "utf8").digest();
  const right = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(left, right);
}

async function requireAdmin() {
  const session = await useSession<AdminSession>(sessionOptions());
  if (!session.data.unlocked) throw new Error("Unauthorized");
}

export const unlockFounderAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => z.object({ password: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected || !matches(data.password, expected)) return { ok: false as const };
    const session = await useSession<AdminSession>(sessionOptions());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const getFounderAdminState = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionOptions());
  if (!session.data.unlocked) return { unlocked: false as const, updates: [] };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("founder_updates")
    .select("id,title,content,link_url,file_name,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load saved content");
  return { unlocked: true as const, updates: data ?? [] };
});

export const saveFounderUpdate = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Invalid form");
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const title = z.string().min(1).max(160).parse(data.get("title"));
    const content = z.string().min(1).max(10000).parse(data.get("content"));
    const rawLink = data.get("linkUrl");
    const linkUrl = typeof rawLink === "string" && rawLink.trim() ? z.string().url().parse(rawLink.trim()) : null;
    const file = data.get("file");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let filePath: string | null = null;
    let fileName: string | null = null;

    if (file instanceof File && file.size > 0) {
      if (file.size > 20 * 1024 * 1024) throw new Error("File must be 20 MB or smaller");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      filePath = `${crypto.randomUUID()}-${safeName}`;
      fileName = file.name;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { error: uploadError } = await supabaseAdmin.storage
        .from("founder-content")
        .upload(filePath, bytes, { contentType: file.type || "application/octet-stream" });
      if (uploadError) throw new Error("Could not store the file");
    }

    const { error } = await supabaseAdmin.from("founder_updates").insert({
      title,
      content,
      link_url: linkUrl,
      file_path: filePath,
      file_name: fileName,
    });
    if (error) throw new Error("Could not save the update");
    return { ok: true as const };
  });

export const lockFounderAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionOptions());
  await session.clear();
  return { ok: true as const };
});