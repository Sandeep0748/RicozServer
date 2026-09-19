import { useState } from "react";
import {
  ArrowRight, Zap, FileText, Users, BarChart3, Receipt, Check,
  Menu, X, Star, ShieldCheck, Clock, Phone, Mail, MapPin, ChevronDown,
  Building2, TrendingUp, Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const steps = [
  { n: "01", title: "Add customer", desc: "Contacts, companies and billing currency in one directory." },
  { n: "02", title: "Add items", desc: "Reusable products and services for faster invoicing." },
  { n: "03", title: "Estimate → Invoice", desc: "Propose, get accepted, convert to invoice in one click." },
  { n: "04", title: "Collect & report", desc: "Payments, expenses, time and taxes roll into reports." },
];

const features = [
  { icon: FileText, title: "Invoices + Estimates", desc: "Polished GST-ready docs. Accept, convert, send and track in one flow." },
  { icon: Receipt, title: "Recurring billing", desc: "Automate repeat invoices for retainers, AMCs and subscriptions." },
  { icon: Users, title: "Customers + Team", desc: "One directory for clients, roles for staff, activity for owners." },
  { icon: BarChart3, title: "Reports + Taxes", desc: "Revenue, receivables, expenses and tax summaries filtered by date." },
  { icon: Building2, title: "Projects + Time", desc: "Deliver work, log billable hours, convert time into invoices." },
  { icon: TrendingUp, title: "Cash-flow clarity", desc: "Billed vs collected vs outstanding with aging — always live." },
  { icon: ShieldCheck, title: "INR-first accuracy", desc: "Paise minor-units math, UPI/Card/Cash payments, audit trail." },
  { icon: Clock, title: "Expenses + Notes", desc: "Billable spend, credit/debit notes and shared notes included." },
];

const models = [
  {
    name: "Starter",
    tag: "Solo / Freelancer",
    price: "Free trial",
    points: ["1 workspace · 2 users", "50 invoices / month", "Estimates + payments", "Email support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    tag: "Most popular",
    price: "₹499 / mo",
    points: ["Unlimited invoices", "Recurring + expenses", "Projects + time tracking", "GST reports + priority support"],
    cta: "Create workspace",
    highlight: true,
  },
  {
    name: "Scale",
    tag: "Teams & multi-branch",
    price: "Custom",
    points: ["Roles + approvals", "Multi-workspace", "Dedicated onboarding", "Data migration help"],
    cta: "Talk to us",
    highlight: false,
  },
];

const testimonials = [
  { name: "Prince & Co.", role: "Trading, Delhi", text: "Estimates to payment used to take days. Now we convert and collect the same evening. Outstanding is finally visible." },
  { name: "Aarav Sharma", role: "Agency owner", text: "Recurring invoices + time tracking replaced three tools. The dashboard tells me what to chase every morning." },
  { name: "Meera Iyer", role: "CA, Bengaluru", text: "GST-ready reports in paise-accurate books. My clients send cleaner data, I close books faster." },
];

const faqs = [
  { q: "Is RicozServe GST-ready?", a: "Yes. Items carry GST %, invoices show tax splits, and Reports → Tax gives you period-wise summaries for filing." },
  { q: "How does the 14-day Pro trial work?", a: "Sign up, get full Growth features for 14 days. No card needed. Stay on Starter or upgrade — your data stays." },
  { q: "Can I take UPI / Card / Cash payments?", a: "Yes. Record UPI, card or cash against any invoice. Balances, receipts and dashboard update instantly." },
  { q: "Can I migrate from Tally / Excel / Zoho?", a: "Yes. Import customers and items via CSV, recreate opening invoices, and our Scale onboarding helps with cleanup." },
  { q: "Is my data safe?", a: "JWT-secured workspaces, role-based team access, and MongoDB persistence in production (memory-mode only for local demo)." },
  { q: "Do you help with setup?", a: "Yes — Growth gets priority email support, Scale gets dedicated onboarding and team training." },
];

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Plans", href: "#plans" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
];

export default function Landing() {
  const [open, setOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [lead, setLead] = useState({ name: "", phone: "", city: "" });
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  function submitLead(e) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => navigate("/signup"), 900);
  }

  return (
    <div className="min-h-screen bg-white text-[#111827] antialiased">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 border-b border-[#ECECF0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-2 px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C4122F] font-display text-[20px] text-white">R</span>
            <span className="text-[17px] font-extrabold">Ricoz<span className="font-semibold text-[#6B7280]">Serve</span></span>
          </Link>
          <nav className="ml-8 hidden items-center gap-6 text-[14px] font-semibold text-[#4B5563] lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition hover:text-[#C4122F]">{n.label}</a>
            ))}
          </nav>
          <span className="ml-auto hidden items-center gap-2 sm:flex">
            <Link to="/login" className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold transition hover:border-[#C4122F] hover:text-[#C4122F]">Sign in</Link>
            <Link to="/signup" className="inline-flex items-center gap-1.5 rounded-lg bg-[#C4122F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#A50E27]">
              Create workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </span>
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-[#E2E8F0] lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-[#ECECF0] bg-white px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-[#374151] hover:bg-[#FFF1F2] hover:text-[#C4122F]">{n.label}</a>
              ))}
              <div className="mt-2 flex gap-2">
                <Link to="/login" className="flex-1 rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-semibold">Sign in</Link>
                <Link to="/signup" className="flex-1 rounded-lg bg-[#C4122F] px-4 py-2.5 text-center text-sm font-semibold text-white">Create workspace</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_320px_at_50%_-60px,#FFE4E6,transparent)]" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-12 pt-12 lg:grid-cols-2 lg:pt-20">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-[#FFF1F2] px-4 py-1.5 text-[13px] font-semibold text-[#C4122F]">
              <Zap className="h-3.5 w-3.5" /> Billing, without the chaos · GST-ready
            </span>
            <h1 className="mt-6 font-display text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[60px]">
              RicozServe keeps<br />every rupee <em className="text-[#C4122F]">in focus.</em>
            </h1>
            <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.65] text-[#687385] lg:mx-0">
              Estimates, invoices, recurring billing, expenses, projects, time tracking and reports — one calm workspace for Prince &amp; Co. and teams like yours.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/signup" className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#C4122F] px-7 py-3.5 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(196,18,47,0.6)] transition hover:bg-[#A50E27] sm:w-auto">
                Create your workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex w-full items-center justify-center rounded-[10px] border border-[#D9DEE5] px-7 py-3.5 font-semibold transition hover:border-[#C4122F] hover:text-[#C4122F] sm:w-auto">
                Go to dashboard
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-semibold text-[#6B7280] lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> 14-day Pro trial</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> No card needed</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> INR paise-accurate</span>
            </div>
            {/* stats */}
            <dl className="mx-auto mt-8 grid max-w-[520px] grid-cols-3 gap-3 lg:mx-0">
              {[
                ["12+", "Billing modules"],
                ["100%", "GST-ready docs"],
                ["1-click", "Estimate → Invoice"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-[#ECECF0] bg-[#F7F8FA] px-3 py-4 text-center lg:text-left">
                  <dt className="font-display text-[22px] text-[#111827]">{v}</dt>
                  <dd className="mt-0.5 text-[12.5px] font-medium text-[#687385]">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Product mockup — CSS only */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-[#FFE4E6] via-white to-[#FFF1F2] blur-[1px]" />
            <div className="relative overflow-hidden rounded-3xl border border-[#ECECF0] bg-white shadow-[0_30px_80px_-30px_rgba(17,24,39,0.35)]">
              <div className="flex items-center gap-1.5 border-b border-[#ECECF0] bg-[#F7F8FA] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FCA5A5]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FCD34D]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#86EFAC]" />
                <span className="ml-3 rounded-md bg-white px-2.5 py-1 text-[12px] font-bold text-[#374151] ring-1 ring-[#ECECF0]">Overview · Prince &amp; Co.</span>
                <span className="ml-auto rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-100">● Live</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 p-4">
                {[
                  ["Billed", "₹4.86L", "+18%"],
                  ["Collected", "₹3.92L", "+12%"],
                  ["Overdue", "₹48.2K", "-6%"],
                ].map(([k, v, d]) => (
                  <div key={k} className="rounded-xl border border-[#ECECF0] bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA0AE]">{k}</p>
                    <p className="mt-1 text-[16px] font-extrabold">{v}</p>
                    <p className={`mt-0.5 text-[11px] font-bold ${d.startsWith("-") ? "text-green-600" : "text-[#C4122F]"}`}>{d} MoM</p>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-2">
                <div className="rounded-xl border border-[#ECECF0] bg-[#F7F8FA] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-bold">Cash flow · last 6 mo</p>
                    <p className="text-[11px] font-semibold text-[#6B7280]">UPI 62% · Card 25% · Cash 13%</p>
                  </div>
                  <div className="mt-3 flex h-20 items-end gap-1.5">
                    {[38, 55, 42, 68, 58, 82, 74, 95, 66, 88, 76, 98].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-md ${i >= 9 ? "bg-[#C4122F]" : "bg-[#F3B3BF]"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2 p-4">
                {[
                  ["INV-1042 · Sharma Traders", "₹28,400", "Paid"],
                  ["INV-1041 · Mehta Foods", "₹16,200", "Due in 3d"],
                  ["EST-089 · Accepted → Invoice", "₹52,000", "Convert"],
                ].map(([t, amt, st]) => (
                  <div key={t} className="flex items-center gap-3 rounded-xl border border-[#ECECF0] bg-white px-3 py-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FFF1F2] text-[#C4122F]"><FileText className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold">{t}</span>
                      <span className="block text-[12px] text-[#687385]">{amt}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${st === "Paid" ? "bg-green-50 text-green-700" : st === "Convert" ? "bg-[#C4122F] text-white" : "bg-amber-50 text-amber-700"}`}>{st}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 left-6 right-6 flex items-center gap-2 rounded-2xl border border-[#ECECF0] bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <Sparkles className="h-4 w-4 shrink-0 text-[#C4122F]" />
              <p className="text-[12.5px] font-medium text-[#4B5563]">Estimate accepted — converted to <b>INV-1043</b> in 1 click</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-y border-[#ECECF0] bg-[#F7F8FA]">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 text-[13.5px] font-semibold text-[#5A6470]">
          <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-[#C4122F]" /> Invoices + Estimates</span>
          <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#C4122F]" /> Customers + Team</span>
          <span className="inline-flex items-center gap-2"><Receipt className="h-4 w-4 text-[#C4122F]" /> Expenses + Time</span>
          <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#C4122F]" /> Reports + Taxes</span>
          <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#C4122F]" /> INR-first, GST-ready</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-[1100px] px-5 py-16">
        <p className="text-center text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#C4122F]">Everything in one place</p>
        <h2 className="mx-auto mt-3 max-w-[640px] text-center font-display text-[32px] leading-tight sm:text-[42px]">
          A calm workspace for chaotic billing
        </h2>
        <p className="mx-auto mt-3 max-w-[600px] text-center text-[15px] leading-relaxed text-[#687385]">
          Stop juggling Excel, WhatsApp reminders and Tally exports. RicozServe connects the full cycle.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-[#ECECF0] bg-white p-5 transition hover:-translate-y-1 hover:border-[#F3B3BF] hover:shadow-[0_20px_50px_-20px_rgba(196,18,47,0.35)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF1F2] text-[#C4122F] transition group-hover:bg-[#C4122F] group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-bold">{f.title}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#687385]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="bg-[#111827] py-16 text-white">
        <div className="mx-auto max-w-[1100px] px-5">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#F3B3BF]">How it works</p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="max-w-[520px] font-display text-[32px] leading-tight sm:text-[40px]">From customer to cash in four steps</h2>
            <Link to="/signup" className="inline-flex items-center gap-2 self-start rounded-[10px] bg-white px-5 py-3 text-[14px] font-bold text-[#111827] transition hover:bg-[#FFE4E6] sm:self-auto">
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <p className="font-display text-[26px] text-[#F3B3BF]">{s.n}</p>
                <p className="mt-2 font-bold">{s.title}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-white/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans / Models (franchise-style) ── */}
      <section id="plans" className="mx-auto max-w-[1100px] px-5 py-16">
        <p className="text-center text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#C4122F]">Plans · like choosing a format</p>
        <h2 className="mx-auto mt-3 max-w-[620px] text-center font-display text-[32px] leading-tight sm:text-[42px]">
          Pick the size that fits your shop
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-center text-[15px] text-[#687385]">
          Starter to test, Growth to run daily billing, Scale for teams — upgrade anytime, keep all data.
        </p>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {models.map((m) => (
            <div key={m.name} className={`relative rounded-3xl border p-7 ${m.highlight ? "border-[#C4122F] bg-[#FFF1F2]/60 shadow-[0_24px_60px_-24px_rgba(196,18,47,0.45)]" : "border-[#ECECF0] bg-white"}`}>
              {m.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#C4122F] px-4 py-1 text-[12px] font-bold text-white">MOST POPULAR</span>
              )}
              <p className="text-[13px] font-bold uppercase tracking-wide text-[#6B7280]">{m.tag}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="font-display text-[30px]">{m.name}</h3>
              </div>
              <p className="mt-1 text-[18px] font-extrabold text-[#C4122F]">{m.price}</p>
              <ul className="mt-5 space-y-2.5">
                {m.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[14px] font-medium text-[#374151]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> {p}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-6 flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 font-semibold transition ${m.highlight ? "bg-[#C4122F] text-white hover:bg-[#A50E27]" : "border border-[#D9DEE5] hover:border-[#C4122F] hover:text-[#C4122F]"}`}>
                {m.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-6 flex max-w-[760px] flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-dashed border-[#F3B3BF] bg-[#FFFBFB] px-6 py-4 text-[13.5px] font-semibold text-[#6B7280]">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#C4122F]" /> No royalty on your revenue</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#C4122F]" /> Setup in ~15 minutes</span>
          <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-[#C4122F]" /> Cancel anytime</span>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="border-y border-[#ECECF0] bg-[#F7F8FA] py-16">
        <div className="mx-auto max-w-[1100px] px-5">
          <p className="text-center text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#C4122F]">Loved by owners &amp; accountants</p>
          <h2 className="mx-auto mt-3 max-w-[560px] text-center font-display text-[32px] sm:text-[40px]">Teams collect faster with RicozServe</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-3xl border border-[#ECECF0] bg-white p-6">
                <div className="flex gap-1 text-[#C4122F]">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed text-[#374151]">“{t.text}”</blockquote>
                <figcaption className="mt-5 border-t border-[#ECECF0] pt-4">
                  <p className="text-[14px] font-extrabold">{t.name}</p>
                  <p className="text-[13px] text-[#687385]">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ + Lead ── */}
      <section id="faq" className="mx-auto grid max-w-[1100px] gap-10 px-5 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#C4122F]">FAQ</p>
          <h2 className="mt-3 font-display text-[32px] sm:text-[38px]">Questions, answered</h2>
          <div className="mt-6 divide-y divide-[#ECECF0] rounded-2xl border border-[#ECECF0] bg-white">
            {faqs.map((f, i) => (
              <div key={f.q}>
                <button onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-[15px] font-bold">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#C4122F] transition ${faqOpen === i ? "rotate-180" : ""}`} />
                </button>
                {faqOpen === i && <p className="px-5 pb-5 text-[14px] leading-relaxed text-[#687385]">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="h-fit rounded-3xl bg-[#111827] p-7 text-white lg:sticky lg:top-24">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-[#F3B3BF]"><Phone className="h-3.5 w-3.5" /> Get a callback</p>
          <h3 className="mt-4 font-display text-[28px] leading-tight">Want help setting up your billing?</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-white/70">Leave your details — we’ll call back and create your workspace with you.</p>
          {sent ? (
            <div className="mt-6 rounded-2xl border border-green-400/30 bg-green-500/10 p-5 text-center">
              <Check className="mx-auto h-8 w-8 text-green-400" />
              <p className="mt-2 font-bold">Thanks{lead.name ? `, ${lead.name.split(" ")[0]}` : ""}!</p>
              <p className="mt-1 text-[13.5px] text-white/70">Taking you to signup…</p>
            </div>
          ) : (
            <form onSubmit={submitLead} className="mt-6 space-y-3">
              <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} required placeholder="Your name" className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-[14px] font-medium placeholder:text-white/40 focus:border-[#F3B3BF] focus:outline-none" />
              <input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} required pattern="[0-9+ ]{10,15}" placeholder="Phone / WhatsApp" className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-[14px] font-medium placeholder:text-white/40 focus:border-[#F3B3BF] focus:outline-none" />
              <input value={lead.city} onChange={(e) => setLead({ ...lead, city: e.target.value })} placeholder="City (e.g. Delhi)" className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-[14px] font-medium placeholder:text-white/40 focus:border-[#F3B3BF] focus:outline-none" />
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C4122F] px-5 py-3.5 font-bold transition hover:bg-[#E11D48]">
                Request callback <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[12px] text-white/50">or <Link to="/signup" className="font-bold text-white underline">create workspace directly</Link></p>
            </form>
          )}
          <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-[13px] text-white/70">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#F3B3BF]" /> care@ricoz.in</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#F3B3BF]" /> Delhi · India · Dubai</p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-[1100px] px-5 pb-16">
        <div className="relative overflow-hidden rounded-[28px] bg-[#C4122F] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_260px_at_50%_0%,rgba(255,255,255,0.25),transparent)]" />
          <h2 className="relative mx-auto max-w-[620px] font-display text-[32px] leading-tight sm:text-[48px]">
            Send your first polished invoice today.
          </h2>
          <p className="relative mx-auto mt-4 max-w-[520px] text-[15px] leading-relaxed text-white/85">
            Join Prince &amp; Co. and 200+ businesses running billing, expenses and reports on RicozServe.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-7 py-3.5 font-bold text-[#C4122F] transition hover:bg-[#FFF1F2] sm:w-auto">
              Create workspace free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex w-full items-center justify-center rounded-[10px] border border-white/40 px-7 py-3.5 font-bold text-white transition hover:bg-white/10 sm:w-auto">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#ECECF0] bg-[#F7F8FA]">
        <div className="mx-auto grid max-w-[1100px] gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C4122F] font-display text-[20px] text-white">R</span>
              <span className="text-[16px] font-extrabold">Ricoz<span className="font-semibold text-[#6B7280]">Serve</span></span>
            </div>
            <p className="mt-3 max-w-[260px] text-[13.5px] leading-relaxed text-[#687385]">
              Billing, estimates, expenses and reports — one calm INR-first workspace.
            </p>
          </div>
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#9AA0AE]">Product</p>
            <div className="mt-3 flex flex-col gap-2 text-[14px] font-semibold text-[#374151]">
              <a href="#features" className="hover:text-[#C4122F]">Features</a>
              <a href="#how" className="hover:text-[#C4122F]">How it works</a>
              <a href="#plans" className="hover:text-[#C4122F]">Plans</a>
              <a href="#faq" className="hover:text-[#C4122F]">FAQ</a>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#9AA0AE]">Workspace</p>
            <div className="mt-3 flex flex-col gap-2 text-[14px] font-semibold text-[#374151]">
              <Link to="/signup" className="hover:text-[#C4122F]">Create workspace</Link>
              <Link to="/login" className="hover:text-[#C4122F]">Sign in</Link>
              <Link to="/dashboard" className="hover:text-[#C4122F]">Dashboard</Link>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#9AA0AE]">Contact</p>
            <div className="mt-3 space-y-2 text-[14px] font-medium text-[#374151]">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#C4122F]" /> care@ricoz.in</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#C4122F]" /> Delhi, India</p>
            </div>
          </div>
        </div>
        <div className="border-t border-[#ECECF0]">
          <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-2 px-5 py-5 text-[13px] text-[#9AA0AE] sm:flex-row">
            <p>© 2026 RicozServe. All rights reserved.</p>
            <p>Reference-inspired by <span className="font-semibold text-[#6B7280]">ricoz.in/franchise</span> · DM Serif + DM Sans</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
