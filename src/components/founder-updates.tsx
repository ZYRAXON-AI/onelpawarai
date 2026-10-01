import { ArrowUpRight, Download, FileText, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PublicUpdate = {
  id: string;
  title: string;
  content: string;
  link_url: string | null;
  file_name: string | null;
  file_size: number | null;
  media_type: string | null;
  media_url: string | null;
  created_at: string;
};

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FounderUpdates({ updates }: { updates: PublicUpdate[] }) {
  if (updates.length === 0) return null;

  return (
    <section id="updates" className="scroll-mt-20 py-12" aria-labelledby="updates-title">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">From the founder</p>
          <h2 id="updates-title" className="mt-2 font-display text-2xl font-semibold md:text-3xl">Latest releases & updates</h2>
        </div>
        <span className="hidden text-sm text-muted-foreground sm:block">Published directly from the private workspace</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {updates.map((item, index) => (
          <article key={item.id} className={`glass-card overflow-hidden rounded-lg border border-border/70 ${index === 0 ? "md:col-span-2" : ""}`}>
            {item.media_url && item.media_type === "image" && (
              <img src={item.media_url} alt={item.title} width={1200} height={675} loading="lazy" className="aspect-video w-full object-cover" />
            )}
            {item.media_url && item.media_type === "video" && (
              <video controls preload="metadata" className="aspect-video w-full bg-foreground object-cover" aria-label={`${item.title} video`}>
                <source src={item.media_url} />
                Your browser does not support video playback.
              </video>
            )}
            {item.media_url && item.media_type === "audio" && (
              <div className="flex items-center gap-3 border-b border-border/70 p-5">
                <Volume2 aria-hidden="true" className="size-5 text-primary" />
                <audio controls preload="metadata" className="h-10 min-w-0 flex-1" src={item.media_url} />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <time className="section-kicker" dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time>
                {item.media_type && <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase text-muted-foreground">{item.media_type}</span>}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.content}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.link_url && (
                  <Button asChild size="sm">
                    <a href={item.link_url} target="_blank" rel="noreferrer">Open link <ArrowUpRight /></a>
                  </Button>
                )}
                {item.media_url && item.media_type !== "image" && item.media_type !== "video" && item.media_type !== "audio" && (
                  <Button asChild size="sm" variant="outline">
                    <a href={item.media_url} download={item.file_name ?? undefined}><Download /> Download {formatSize(item.file_size)}</a>
                  </Button>
                )}
                {item.file_name && !item.media_url && <span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><FileText className="size-4" />{item.file_name}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}