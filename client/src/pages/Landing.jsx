import { ArrowRight, Zap, FileText, Users, BarChart3, Receipt, Check } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { n: "01", title: "Add customer", desc: "Contacts, companies and billing currency in one directory." },
  { n: "02", title: "Add items", desc: "Reusable products and services for faster invoicing." },
  { n: "03", title: "Estimate → Invoice", desc: "Propose, get accepted, convert to invoice in one click." },
  { n: "04", title: "Collect & report", desc: "Payments, expenses, time and taxes roll into reports." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <header className="border-b border-[#ECECF0]">
        <div className="mx-auto max-w-[1200px] px-5 h-16 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C4122F] text-white font-extrabold">R</span>
          <span className="font-extrabold text-[17px]">Ricoz<span className="text-[#6B7280] font-semibold">Invoice</span></span>
          <span className="ml-auto flex items-center gap-2">
            <Link to="/login" className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold">Sign in</Link>
            <Link to="/signup" className="rounded-lg bg-[#C4122F] text-white px-4 py-2 text-sm font-semibold">Create workspace</Link>
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-[860px] px-5 pt-14 pb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-[#FFF1F2] px-4 py-1.5 text-[13px] font-semibold text-[#C4122F]">
          <Zap className="h-3.5 w-3.5" /> Billing, without the chaos
        </span>
        <h1 className="mt-6 text-[42px] sm:text-[64px] leading-[1.02] font-extrabold tracking-[-0.03em]">
          RicozInvoice keeps<br />every rupee in focus.
        </h1>
        <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-[1.6] text-[#687385]">
          Estimates, invoices, recurring billing, expenses, projects, time tracking and reports — one calm workspace for Prince &amp; Co. and teams like yours.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-[10px] bg-[#C4122F] text-white font-semibold px-7 py-3.5">Create your workspace <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/dashboard" className="inline-flex items-center justify-center rounded-[10px] border border-[#D9DEE5] px-7 py-3.5 font-semibold">Go to dashboard</Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-5 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-[#ECECF0] bg-[#F7F8FA] p-5">
              <p className="text-[12px] font-extrabold text-[#C4122F]">{s.n}</p>
              <p className="mt-2 font-bold">{s.title}</p>
              <p className="mt-1 text-[13.5px] text-[#687385]">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-[#ECECF0] bg-white p-6 flex flex-wrap items-center gap-4 text-[13.5px] text-[#5A6470]">
          <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-[#C4122F]" /> Invoices + Estimates</span>
          <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#C4122F]" /> Customers + Team</span>
          <span className="inline-flex items-center gap-2"><Receipt className="h-4 w-4 text-[#C4122F]" /> Expenses + Time</span>
          <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#C4122F]" /> Reports + Taxes</span>
          <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#C4122F]" /> INR-first, GST-ready</span>
        </div>
      </section>
    </div>
  );
}
