import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Github, Menu } from "lucide-react";
import { FounderAdminPanel } from "../components/founder-admin-panel";
import { FounderUpdates, type PublicUpdate } from "../components/founder-updates";
import { getPublicFounderUpdates } from "@/lib/founder-admin.functions";
import founderPortrait from "../assets/founder-silhouette.jpg";
import cloudDashboard from "../assets/zyraxon-cloud-dashboard.jpg";
import headquarters from "../assets/premium-ai-headquarters.jpg";
import brandMark from "../assets/onel-pawar-ai-mark.png";

export const Route = createFileRoute("/")({
  loader: () => getPublicFounderUpdates(),
  head: () => ({
    meta: [
      { title: "OneL Pawar AI | Founder & AI Architect" },
      {
        name: "description",
        content:
          "The official founder website of OneL Pawar AI, connecting Zyraxon Pro, Zyraxon AI, Myra Agent, and Zyraxon Code.",
      },
      { property: "og:title", content: "OneL Pawar AI | Founder & AI Architect" },
      {
        property: "og:description",
        content: "One founder. A connected ecosystem of cloud, desktop, mobile, and coding AI systems.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://zyraxon-uni-agent.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://zyraxon-uni-agent.lovable.app/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "OneL Pawar AI", url: "https://zyraxon-uni-agent.lovable.app/", founder: { "@type": "Person", name: "OneL Pawar", jobTitle: "Founder & Chief Architect" }, sameAs: [products.organization, products.cloud] }) }],
  }),
  errorComponent: () => <div className="grid min-h-screen place-items-center bg-background p-6 text-center"><div><h1 className="font-display text-2xl font-semibold">OneL Pawar AI</h1><p className="mt-2 text-muted-foreground">The website is temporarily unavailable. Please try again shortly.</p></div></div>,
  notFoundComponent: () => <div className="grid min-h-screen place-items-center bg-background p-6 text-center"><div><h1 className="font-display text-2xl font-semibold">Page not found</h1><a className="mt-4 inline-block text-primary" href="/">Return home</a></div></div>,
  component: Index,
});

const products = {
  cloud: "https://zyraxon-pro.ai.studio/",
  hub: "https://zyraxonai.lovable.app/",
  organization: "https://github.com/onelpawarai-X/ZYRAXON-AI",
  myra: "https://github.com/onelpawarai-X/Myra-Agent",
  code: "https://github.com/onelpawarai-X/Zyraxon-Code",
};

function ExternalArrow() {
  return <ArrowUpRight aria-hidden="true" className="size-4" />;
}

function Index() {
  const updates = Route.useLoaderData() as PublicUpdate[];
  return (
    <div className="site-shell relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${headquarters})` }} />
      <div aria-hidden="true" className="background-veil fixed inset-0 z-0" />
      <div aria-hidden="true" className="sweep-line sweep-a absolute inset-x-0 top-[12%] h-px opacity-40" />
      <div aria-hidden="true" className="sweep-line sweep-b absolute inset-x-0 top-[42%] h-px opacity-30" />
      <div aria-hidden="true" className="sweep-line sweep-c absolute inset-x-0 top-[70%] h-px opacity-25" />

      <header className="glass-panel sticky top-0 z-50 border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-6">
          <a href="#founder" className="flex items-center gap-2.5" aria-label="OneL Pawar AI home">
             <img src={brandMark} alt="OneL Pawar AI logo" width={1024} height={1024} className="size-9 object-contain" />
            <span className="font-display text-[15px] font-semibold">OneL Pawar AI</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex" aria-label="Primary navigation">
            <a className="line-sweep transition-colors hover:text-foreground" href="#founder">Founder</a>
            <a className="line-sweep transition-colors hover:text-foreground" href="#ecosystem">Ecosystem</a>
             <a className="line-sweep transition-colors hover:text-foreground" href="#updates">Updates</a>
             <a className="line-sweep transition-colors hover:text-foreground" href="#vision">Vision</a>
            <a className="line-sweep transition-colors hover:text-foreground" href="#github">GitHub</a>
          </nav>
          <a href="#ecosystem" className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex">Explore products</a>
          <a href="#ecosystem" className="grid size-9 place-items-center rounded-md border border-border md:hidden" aria-label="Open product menu"><Menu aria-hidden="true" className="size-4" /></a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1320px] px-5 md:px-6">
        <section id="founder" className="scroll-mt-20 pb-6 pt-8 md:pt-14">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="glass-card flex min-h-[430px] flex-col justify-between rounded-[20px] p-6 ring-1 ring-border/70 md:p-8 lg:col-span-7">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Founder-led AI organization</span>
              </div>
              <div>
                <h1 className="mt-8 max-w-[15ch] font-display text-4xl font-semibold leading-tight md:text-5xl">One mastermind. Four AI systems, engineered as one.</h1>
                <p className="mt-5 max-w-[48ch] text-base leading-7 text-muted-foreground md:text-lg">OneL Pawar builds a connected stack of AI agents across cloud, desktop, mobile, and code—under one precise vision.</p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4 md:gap-6">
                <a href="#ecosystem" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Explore the ecosystem <ExternalArrow /></a>
                <span className="text-sm text-muted-foreground">Four destinations · one operator</span>
              </div>
            </div>

            <aside className="glass-card flex min-h-[430px] flex-col rounded-[20px] p-6 ring-1 ring-border/70 md:p-8 lg:col-span-5">
              <div className="flex items-center gap-4">
                <img src={founderPortrait} alt="Abstract portrait representing founder OneL Pawar" width={816} height={816} className="size-24 shrink-0 rounded-full object-cover ring-1 ring-border" />
                <div>
                  <h2 className="font-display text-lg font-semibold">OneL Pawar</h2>
                  <p className="text-sm text-muted-foreground">Founder & Chief Architect</p>
                </div>
              </div>
              <p className="mt-6 max-w-[40ch] leading-7 text-muted-foreground">I design interconnected systems so one person can create, code, automate, and run an intelligent organization from anywhere.</p>
              <dl className="mt-auto flex flex-col gap-2 pt-8 text-sm text-muted-foreground">
                <div className="flex justify-between border-t border-border pt-3"><dt>Core systems</dt><dd className="font-medium text-foreground">4</dd></div>
                <div className="flex justify-between border-t border-border pt-3"><dt>Reach</dt><dd className="font-medium text-foreground">Cloud · Desktop · Mobile</dd></div>
              </dl>
            </aside>
          </div>
        </section>

        <section id="ecosystem" className="scroll-mt-20 pb-6 pt-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div><p className="section-kicker">Product network</p><h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">The connected ecosystem</h2></div>
            <span className="hidden text-sm text-muted-foreground sm:block">Select a product to enter</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-12">
            <a href={products.cloud} target="_blank" rel="noreferrer" className="glass-card line-sweep group flex flex-col justify-between rounded-[18px] p-5 ring-1 ring-border/70 transition-colors hover:bg-secondary/70 md:p-7 lg:col-span-7 lg:row-span-2">
              <div className="flex items-center justify-between"><span className="section-kicker text-primary">01 · Cloud agent</span><span className="flex items-center gap-1 text-sm text-muted-foreground">Launch <ExternalArrow /></span></div>
              <img src={cloudDashboard} alt="Zyraxon Pro cloud agent dashboard concept" width={1200} height={608} loading="lazy" className="my-6 aspect-[16/7] w-full rounded-lg object-cover ring-1 ring-border" />
              <div><h3 className="font-display text-3xl font-semibold">Zyraxon Pro</h3><p className="mt-3 max-w-[48ch] leading-7 text-muted-foreground">An all-in-one cloud agent for building applications, websites, and intelligent digital experiences online.</p></div>
            </a>

            <a href={products.hub} target="_blank" rel="noreferrer" className="glass-card line-sweep flex min-h-52 flex-col justify-between rounded-[18px] p-6 ring-1 ring-border/70 transition-colors hover:bg-secondary/70 lg:col-span-5">
              <div className="flex items-center justify-between"><span className="section-kicker text-primary">02 · Organization hub</span><ExternalArrow /></div>
              <div><h3 className="font-display text-2xl font-semibold">Zyraxon AI</h3><p className="mt-2 max-w-[38ch] text-sm leading-6 text-muted-foreground">The organization website where people can discover products, access documentation, and download applications.</p></div>
            </a>

            <a href={products.myra} target="_blank" rel="noreferrer" className="glass-card line-sweep flex min-h-52 flex-col justify-between rounded-[18px] p-6 ring-1 ring-border/70 transition-colors hover:bg-secondary/70 lg:col-span-5">
              <div className="flex items-center justify-between"><span className="section-kicker text-primary">03 · Desktop agent</span><ExternalArrow /></div>
              <div><h3 className="font-display text-2xl font-semibold">Myra Agent</h3><p className="mt-2 max-w-[38ch] text-sm leading-6 text-muted-foreground">An all-in-one desktop agent designed to work across Windows, Linux, and macOS.</p></div>
            </a>

            <a href={products.code} target="_blank" rel="noreferrer" className="glass-card line-sweep flex flex-col justify-between gap-8 rounded-[18px] p-6 ring-1 ring-border/70 transition-colors hover:bg-secondary/70 sm:flex-row sm:items-center md:p-7 lg:col-span-12">
              <div><span className="section-kicker text-primary">04 · Mobile agent + code editor</span><h3 className="mt-2 font-display text-2xl font-semibold">Zyraxon Code</h3><p className="mt-2 max-w-[54ch] text-sm leading-6 text-muted-foreground">A powerful all-in-one mobile agent and code editor built to take development beyond the desktop.</p></div>
              <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-primary/25 px-4 py-2 text-sm font-medium text-primary sm:self-auto">View repository <ExternalArrow /></span>
            </a>
          </div>
        </section>

        <FounderUpdates updates={updates} />

        <section id="vision" className="scroll-mt-20 py-12">
          <div className="glass-card mx-auto max-w-[70ch] rounded-[20px] px-6 py-10 text-center ring-1 ring-border/70 md:px-8">
            <p className="section-kicker">The vision</p>
            <p className="mt-4 font-display text-2xl font-semibold leading-tight md:text-3xl">We build autonomous systems the way a single mind thinks—deliberately, precisely, and always connected.</p>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">One vision and one connected ecosystem—uniting intelligent creation, action, and code.</p>
          </div>
        </section>

        <section id="github" className="scroll-mt-20 pb-14">
          <div className="glass-card flex flex-col justify-between gap-6 rounded-[18px] p-6 ring-1 ring-border/70 sm:flex-row sm:items-center md:p-7">
            <div><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Github aria-hidden="true" className="size-5" /> Open engineering on GitHub</h2><p className="mt-2 max-w-[52ch] text-sm leading-6 text-muted-foreground">Explore the organization source, public products, and the engineering behind the ecosystem.</p></div>
            <a href={products.organization} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:self-auto">onelpawarai-X <ExternalArrow /></a>
          </div>
        </section>
      </main>

      <footer className="glass-panel relative z-10 border-t border-border/70">
        <div className="mx-auto grid max-w-[1320px] gap-5 px-5 py-8 text-sm text-muted-foreground sm:grid-cols-3 sm:items-end md:px-6">
          <div><p className="font-display font-semibold text-foreground">OneL Pawar AI</p><p className="mt-1">Independent AI research and product organization.</p></div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-center"><a href={products.cloud} target="_blank" rel="noreferrer" className="hover:text-foreground">Cloud Agent</a><a href={products.hub} target="_blank" rel="noreferrer" className="hover:text-foreground">Downloads</a><a href={products.organization} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a></div>
          <div className="sm:text-right"><p>© 2026 OneL Pawar AI</p><p className="mt-1">All rights reserved.</p></div>
        </div>
      </footer>
      <FounderAdminPanel />
    </div>
  );
}