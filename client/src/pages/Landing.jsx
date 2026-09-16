import { ArrowRight, Zap, Ticket, MessagesSquare, BarChart3, Users, Inbox, Clock, ShieldCheck, Check, Headset } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LandingPreview from "../components/LandingPreview";
import Reveal from "../components/Reveal";

const pillars = [
  {
    icon: Ticket,
    title: "Tickets that move faster",
    desc: "Create polished ticket views, follow every reply, and keep customer balances clear from one workspace.",
  },
  {
    icon: MessagesSquare,
    title: "Channels under control",
    desc: "Capture email, chat, voice, WhatsApp and social without losing the details that matter.",
  },
  {
    icon: BarChart3,
    title: "Reports you can act on",
    desc: "See volume, CSAT, first response, SLA and team performance in reports built for daily decisions.",
  },
];

const workflowCards = [
  { icon: Users, title: "Customers", sub: "Organized" },
  { icon: Inbox, title: "Tickets", sub: "On time" },
  { icon: Clock, title: "SLAs", sub: "Tracked" },
  { icon: BarChart3, title: "Reports", sub: "Ready" },
];

const checks = [
  "Create and triage omnichannel tickets",
  "Record replies, macros and knowledge base answers",
  "Review CSAT, SLA and workload reports",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-[#111]">
      <Navbar />

      {/* HERO — centered like RicozInvoice reference */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-[860px] px-5 pt-14 sm:pt-20 pb-8 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-[#FFF1F2] px-4 py-1.5 text-[13px] font-semibold text-[#C5002B]">
              <Zap className="h-3.5 w-3.5 fill-[#C5002B]" /> Service, without the chaos
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-[42px] leading-[1.02] sm:text-[72px] font-extrabold tracking-[-0.03em] text-[#14213A]">
              RicozServe keeps
              <br />
              every conversation
              <br className="hidden sm:block" /> in focus.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-[640px] text-[16px] sm:text-[19px] leading-[1.6] text-[#687385]">
              Send replies, track SLAs, route tickets, and understand service health from one calm, connected workspace.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#C5002B] hover:bg-[#A30024] text-white font-semibold px-7 py-3.5 text-[16px] shadow-[0_12px_28px_rgba(197,0,43,0.32)] transition-all"
              >
                Create your workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-[10px] border border-[#D9DEE5] bg-white font-semibold px-7 py-3.5 text-[16px] text-[#14213A] hover:border-[#14213A] transition-colors"
              >
                Go to dashboard
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Live product preview */}
        <Reveal delay={120} className="relative mx-auto max-w-[960px] px-4 sm:px-6 pb-16">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#F1F3F6] pointer-events-none" />
          <div className="relative flex justify-center">
            <LandingPreview />
          </div>
        </Reveal>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-[#ECEFF3] bg-[#F7F8FA]">
        <div className="mx-auto max-w-[1200px] px-5 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[13.5px] font-medium text-[#5A6470]">
          <span className="inline-flex items-center gap-2"><Headset className="h-4 w-4 text-[#C5002B]" /> 6 channels in one inbox</span>
          <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-[#C5002B]" /> 4h median resolution</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#C5002B]" /> RBAC + audit log</span>
          <span className="hidden md:inline text-[#9AA3B0]">Zoho Desk · Zendesk · Freshdesk alternative</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-[1200px] px-5 pt-16 sm:pt-24 pb-10">
          <Reveal>
            <p className="text-[12.5px] font-extrabold uppercase tracking-[0.22em] text-[#C5002B]">Built for daily support</p>
            <h2 className="mt-3 max-w-[560px] text-[32px] sm:text-[48px] leading-[1.05] font-extrabold tracking-[-0.02em] text-[#14213A]">
              Everything between hello and resolved.
            </h2>
          </Reveal>
        </div>
        <div className="mx-auto max-w-[1200px] px-5 pb-16 sm:pb-24">
          <div className="grid md:grid-cols-3 border-y border-[#E7EBF0]">
            {pillars.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 90} className={i > 0 ? "md:border-l md:border-[#E7EBF0]" : ""}>
                <div className="h-full p-7 sm:p-9">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FFF0F1]">
                    <Icon className="h-5 w-5 text-[#C5002B]" />
                  </span>
                  <h3 className="mt-6 text-[19px] font-bold tracking-tight text-[#14213A]">{title}</h3>
                  <p className="mt-3 text-[15.5px] leading-[1.65] text-[#687385]">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="bg-[#F4F5F7] border-y border-[#E7EBF0] scroll-mt-20">
        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:py-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <Reveal>
            <p className="text-[12.5px] font-extrabold uppercase tracking-[0.22em] text-[#C5002B]">One connected workflow</p>
            <h2 className="mt-3 text-[32px] sm:text-[48px] leading-[1.05] font-extrabold tracking-[-0.02em] text-[#14213A]">
              From first message to final report.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.65] text-[#687385] max-w-[460px]">
              RicozServe connects the work your team already does, so tickets, replies, SLAs, and reports always tell the same story.
            </p>
            <ul className="mt-8 space-y-5">
              {checks.map((c) => (
                <li key={c} className="flex items-center gap-3 text-[15.5px] font-semibold text-[#14213A]">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#C5002B]">
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {workflowCards.map(({ icon: Icon, title, sub }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="border-t-2 border-t-[#C5002B] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] min-h-[150px]">
                  <Icon className="h-6 w-6 text-[#C5002B]" strokeWidth={1.8} />
                  <p className="mt-8 text-[15px] font-bold text-[#14213A]">{title}</p>
                  <p className="mt-1 text-[13.5px] text-[#687385]">{sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="bg-[#0C1A33] scroll-mt-20">
        <div className="mx-auto max-w-[1200px] px-5 py-14 sm:py-20 flex flex-col lg:flex-row lg:items-center gap-8">
          <Reveal className="flex-1">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-9 w-9 shrink-0 text-[#FF6B7A]" strokeWidth={1.8} />
              <div>
                <h2 className="text-[24px] sm:text-[32px] font-extrabold tracking-tight text-white leading-tight">
                  Your service workspace stays yours.
                </h2>
                <p className="mt-3 max-w-[640px] text-[15px] sm:text-[16px] leading-[1.65] text-white/70">
                  Organization-scoped access, secure sessions, role-based permissions, and protected customer conversation flows come built in.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-6 py-3.5 font-semibold text-[#0C1A33] hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <Footer dark />
      </section>
    </div>
  );
}
