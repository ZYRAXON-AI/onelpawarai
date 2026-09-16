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
  .validator((data: { password: string }) => z.object({ password: z.string().min(1).max(200) }).parse(data))
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
    .select("id,title,content,link_url,file_path,file_name,file_size,media_type,is_published,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load saved content");
  return { unlocked: true as const, updates: data ?? [] };
});

export const saveFounderUpdate = createServerFn({ method: "POST" })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Invalid form");
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const title = z.string().min(1).max(160).parse(data.get("title"));
    const content = z.string().min(1).max(10000).parse(data.get("content"));
    const rawLink = data.get("linkUrl");
    const linkUrl = typeof rawLink === "string" && rawLink.trim() ? z.string().url().parse(rawLink.trim()) : null;
    const isPublished = data.get("isPublished") === "on";
    const file = data.get("file");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let filePath: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let mediaType: "image" | "video" | "document" | "audio" | "other" | null = null;

    if (file instanceof File && file.size > 0) {
      if (file.size > 100 * 1024 * 1024) throw new Error("File must be 100 MB or smaller");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      filePath = `${crypto.randomUUID()}-${safeName}`;
      fileName = file.name;
      fileSize = file.size;
      mediaType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : file.type === "application/pdf" || file.type.includes("document") || file.type.includes("sheet") || file.type.includes("presentation") || file.type.startsWith("text/") ? "document" : "other";
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
      file_size: fileSize,
      media_type: mediaType,
      is_published: isPublished,
    });
    if (error) {
      if (filePath) await supabaseAdmin.storage.from("founder-content").remove([filePath]);
      throw new Error("Could not save the update");
    }
    return { ok: true as const };
  });

export const deleteFounderUpdate = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: item, error: readError } = await supabaseAdmin.from("founder_updates").select("file_path").eq("id", data.id).single();
    if (readError) throw new Error("Could not find the update");
    const { error } = await supabaseAdmin.from("founder_updates").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete the update");
    if (item.file_path) await supabaseAdmin.storage.from("founder-content").remove([item.file_path]);
    return { ok: true as const };
  });

export const getPublicFounderUpdates = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("founder_updates")
    .select("id,title,content,link_url,file_path,file_name,file_size,media_type,created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(24);
  if (error) throw new Error("Could not load published updates");
  return Promise.all((data ?? []).map(async (item) => {
    if (!item.file_path) return { ...item, media_url: null };
    const { data: signed } = await supabaseAdmin.storage.from("founder-content").createSignedUrl(item.file_path, 60 * 60);
    return { ...item, media_url: signed?.signedUrl ?? null };
  }));
});

export const lockFounderAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionOptions());
  await session.clear();
  return { ok: true as const };
});