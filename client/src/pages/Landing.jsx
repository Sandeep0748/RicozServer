import { Mail, MessageCircle, Phone, AtSign, Globe, ArrowRight, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RicozServeCard from "../components/RicozServeCard";

const channels = [
  { icon: Mail, label: "Email" },
  { icon: MessageCircle, label: "Live chat" },
  { icon: Phone, label: "Voice" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: AtSign, label: "Social" },
  { icon: Globe, label: "Portal" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      {/* Hero: Image 1 recreation centered like reference */}
      <section className="mx-auto max-w-7xl px-5 pt-10 pb-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#C5002B]">Zoho Desk alternative · Customer service platform</p>
          <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.02]">
            Every conversation.<br />One workspace.
          </h1>
          <p className="mt-4 text-lg text-[#555] leading-relaxed max-w-xl">
            RicozServe unifies tickets, chat, voice, and social with skill-based routing, SLA automation, and journey analytics — inspired by Zoho Desk, Zendesk, and Freshdesk, without the complexity.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app" className="rounded-xl bg-[#C5002B] hover:bg-[#A30024] text-white font-semibold px-6 py-3.5 inline-flex items-center gap-2">
              Open live demo <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#platform" className="rounded-xl border border-[#DDD] bg-white font-semibold px-6 py-3.5 hover:border-[#BBB]">
              Explore platform
            </a>
          </div>
          <div id="channels" className="mt-8 flex flex-wrap gap-2">
            {channels.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3.5 py-2 text-sm text-[#444]">
                <Icon className="h-4 w-4 text-[#C5002B]" /> {label}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-[#555]">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-600" /> 4h median resolution</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> Auto-triage + SLA</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-blue-600" /> RBAC + audit log</span>
          </div>
        </div>

        {/* Exact Image 1 card */}
        <div className="flex justify-center lg:justify-end">
          <RicozServeCard />
        </div>
      </section>

      {/* Platform pillars */}
      <section id="platform" className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Omnichannel case management", "Email, chat, voice, WhatsApp, social and portal converge into one ticket timeline."],
            ["Intelligent service routing", "Skill, workload, and priority-based assignment with round-robin fallback."],
            ["Knowledge base & guidance", "Help center, macros, and suggested replies to lift first-contact resolution."],
            ["Customer journey analytics", "Funnel, CSAT, FRT, and SLA dashboards to fix what slows teams down."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-[#E6E6E6] bg-white p-6">
              <span className="h-2 w-2 rounded-full bg-[#C5002B] inline-block" />
              <h3 className="mt-3 font-bold leading-snug">{t}</h3>
              <p className="mt-2 text-sm text-[#666] leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 pb-14">
        <div className="rounded-2xl bg-[#111] text-white p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Full-stack and demo-ready.</h2>
            <p className="mt-2 text-white/70">Landing + dashboard wired to a real Express + MongoDB API with JWT auth, ticket CRUD, replies, customers, knowledge base, and live analytics.</p>
          </div>
          <Link to="/signup" className="rounded-xl bg-[#C5002B] px-6 py-3.5 font-semibold hover:bg-[#A30024] text-center">
            Start free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
