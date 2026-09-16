import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Image, Link2, Lock, LogOut, Trash2, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import adminBackground from "@/assets/premium-ai-headquarters.jpg";
import {
  deleteFounderUpdate,
  getFounderAdminState,
  lockFounderAdmin,
  saveFounderUpdate,
  unlockFounderAdmin,
} from "@/lib/founder-admin.functions";

type SavedUpdate = {
  id: string;
  title: string;
  content: string;
  link_url: string | null;
  file_name: string | null;
  file_size: number | null;
  media_type: string | null;
  is_published: boolean;
  created_at: string;
};

export function FounderAdminPanel() {
  const unlock = useServerFn(unlockFounderAdmin);
  const loadState = useServerFn(getFounderAdminState);
  const save = useServerFn(saveFounderUpdate);
  const lock = useServerFn(lockFounderAdmin);
  const remove = useServerFn(deleteFounderUpdate);
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [updates, setUpdates] = useState<SavedUpdate[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function openPanel() {
    setOpen(true);
    setError("");
    try {
      const state = await loadState();
      setUnlocked(state.unlocked);
      setUpdates(state.updates as SavedUpdate[]);
    } catch {
      setUnlocked(false);
    }
  }

  async function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    try {
      const result = await unlock({ data: { password: String(password ?? "") } });
      if (!result.ok) setError("Incorrect password.");
      else {
        const state = await loadState();
        setUnlocked(true);
        setUpdates(state.updates as SavedUpdate[]);
      }
    } catch {
      setError("The private panel could not be opened.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await save({ data: new FormData(form) });
      form.reset();
      const state = await loadState();
      setUpdates(state.updates as SavedUpdate[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The update could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLock() {
    await lock();
    setUnlocked(false);
    setUpdates([]);
    setOpen(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this update and its uploaded file?")) return;
    setBusy(true);
    setError("");
    try {
      await remove({ data: { id } });
      const state = await loadState();
      setUpdates(state.updates as SavedUpdate[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The update could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={openPanel} className="secret-trigger fixed bottom-5 right-5 z-50 size-11 rounded-full bg-foreground p-0 font-display font-semibold text-background shadow-xl transition-transform hover:scale-105 hover:bg-foreground" aria-label="Open private founder panel" title="Private founder panel">Z</Button>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-overlay p-4" role="dialog" aria-modal="true" aria-label="Private founder panel">
          <div className="admin-surface relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border border-border shadow-2xl">
            <img src={adminBackground} alt="" aria-hidden="true" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-20" />
            <div className="relative max-h-[92vh] overflow-y-auto p-5 md:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div><p className="section-kicker">Private workspace</p><h2 className="mt-2 font-display text-2xl font-semibold">Founder Control Room</h2></div>
              <Button type="button" variant="outline" size="icon" onClick={() => setOpen(false)} aria-label="Close panel"><X /></Button>
            </div>

            {!unlocked ? (
              <form onSubmit={handleUnlock} className="mx-auto max-w-md py-12">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary"><Lock className="size-5" /></span>
                <h3 className="mt-5 text-center font-display text-xl font-semibold">Enter your private access key</h3>
                <label className="mt-6 block text-sm font-medium" htmlFor="admin-password">Password</label>
                <input id="admin-password" name="password" type="password" required autoFocus autoComplete="current-password" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                 <Button disabled={busy} type="submit" className="mt-5 h-11 w-full">{busy ? "Checking…" : "Enter control room"}</Button>
              </form>
            ) : (
               <div className="grid gap-7 py-6 lg:grid-cols-[1fr_1.15fr]">
                 <form onSubmit={handleSave} className="rounded-lg border border-border bg-background/75 p-5 backdrop-blur-xl">
                   <div className="mb-5"><p className="section-kicker">Create & publish</p><h3 className="mt-2 font-display text-lg font-semibold">New website update</h3></div>
                  <div><label className="text-sm font-medium" htmlFor="update-title">Title</label><input id="update-title" name="title" required maxLength={160} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" /></div>
                  <div><label className="text-sm font-medium" htmlFor="update-content">Information</label><textarea id="update-content" name="content" required maxLength={10000} rows={6} className="mt-2 w-full resize-y rounded-lg border border-input bg-background p-3 outline-none focus:ring-2 focus:ring-ring" /></div>
                  <div><label className="text-sm font-medium" htmlFor="update-link">Reference link <span className="text-muted-foreground">(optional)</span></label><input id="update-link" name="linkUrl" type="url" placeholder="https://" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" /></div>
                   <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input p-4 text-sm text-muted-foreground hover:bg-secondary"><Upload className="size-4 text-primary" /><span>Image, video, audio, document or file · up to 100 MB</span><input name="file" type="file" className="sr-only" /></label>
                   <label className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-background/70 p-3 text-sm font-medium"><span>Publish on the website now</span><input name="isPublished" type="checkbox" defaultChecked className="size-4 accent-primary" /></label>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                   <Button disabled={busy} type="submit" className="mt-4 h-11 w-full">{busy ? "Saving…" : "Publish to website"}</Button>
                </form>

                <div>
                   <div className="flex items-center justify-between"><div><p className="section-kicker">Content library</p><h3 className="mt-2 font-display font-semibold">Saved information</h3></div><Button type="button" onClick={handleLock} size="sm" variant="ghost"><LogOut /> Lock</Button></div>
                  <div className="mt-4 space-y-3">
                    {updates.length === 0 && <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">Nothing has been saved yet.</p>}
                    {updates.map((item) => (
                       <article key={item.id} className="rounded-lg border border-border bg-background/80 p-4 backdrop-blur-xl">
                         <div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase text-primary">{item.is_published ? "Published" : "Draft"}</span><h4 className="mt-1 font-display font-semibold">{item.title}</h4></div><time className="shrink-0 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString("en-GB")}</time></div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.content}</p>
                         <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-primary">{item.link_url && <a className="inline-flex items-center gap-1" href={item.link_url} target="_blank" rel="noreferrer"><Link2 className="size-3" /> Open link</a>}{item.file_name && <span className="inline-flex items-center gap-1">{item.media_type === "image" ? <Image className="size-3" /> : item.media_type === "video" ? <Video className="size-3" /> : <FileText className="size-3" />}{item.file_name}</span>}<Button disabled={busy} type="button" variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 /> Delete</Button></div>
                      </article>
                    ))}
                  </div>
                </div>
               </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}