import { Headset } from "lucide-react";

const bars = [42, 68, 56, 82, 64, 96, 76, 104];
const nav = ["Overview", "Tickets", "Customers", "Knowledge", "Analytics"];

export default function LandingPreview() {
  return (
    <div className="w-full max-w-[880px] overflow-hidden rounded-2xl border border-[#E2E6EC] bg-white shadow-[0_32px_80px_-16px_rgba(15,29,51,0.25)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-[#E9EDF2] bg-[#F8FAFC] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C5002B]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D7DDE5]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D7DDE5]" />
        <span className="ml-3 text-[12.5px] font-medium text-[#5A6470]">RicozServe / Dashboard</span>
      </div>

      <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[210px_1fr]">
        {/* Sidebar */}
        <div className="bg-[#0F1D33] p-3 sm:p-4">
          <div className="flex items-center gap-2 px-1 py-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#C5002B] text-[10px] font-extrabold text-white">
              <Headset className="h-4 w-4" />
            </span>
            <span className="text-[13px] sm:text-[15px] font-bold text-white tracking-tight">RicozServe</span>
          </div>
          <div className="mt-3 space-y-2">
            {nav.map((n, i) => (
              <div
                key={n}
                className={`rounded-lg px-3 py-2 text-[12px] sm:text-[13.5px] font-medium ${
                  i === 0 ? "bg-[#C5002B] text-white" : "bg-white/[0.07] text-white/80"
                }`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="bg-[#FAFBFC] p-4 sm:p-6">
          <p className="text-[11px] font-medium text-[#7A8592]">Service overview</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h3 className="text-[18px] sm:text-[22px] font-bold tracking-tight text-[#0F1D33]">
              Good morning, Aarav.
            </h3>
            <span className="rounded-md bg-[#C5002B] px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-semibold text-white">
              + Create
            </span>
          </div>

          {/* KPI cards */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="rounded-xl border border-[#E7EBF0] bg-white p-3 sm:p-4">
              <span className="block h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-red-50" />
              <p className="mt-2.5 text-[10px] sm:text-[11.5px] font-medium text-[#7A8592]">Open tickets</p>
              <p className="mt-0.5 text-[16px] sm:text-[22px] font-extrabold tracking-tight text-[#0F1D33]">248</p>
              <p className="mt-0.5 text-[10px] sm:text-[11px] font-semibold text-[#C5002B]">-18% faster</p>
            </div>
            <div className="rounded-xl border border-[#E7EBF0] bg-white p-3 sm:p-4">
              <span className="block h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-100" />
              <p className="mt-2.5 text-[10px] sm:text-[11.5px] font-medium text-[#7A8592]">Avg first response</p>
              <p className="mt-0.5 text-[16px] sm:text-[22px] font-extrabold tracking-tight text-[#0F1D33]">18m</p>
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#7A8592]">This week</p>
            </div>
            <div className="rounded-xl border border-[#E7EBF0] bg-white p-3 sm:p-4">
              <span className="block h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-100" />
              <p className="mt-2.5 text-[10px] sm:text-[11.5px] font-medium text-[#7A8592]">CSAT score</p>
              <p className="mt-0.5 text-[16px] sm:text-[22px] font-extrabold tracking-tight text-[#0F1D33]">4.6/5</p>
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#7A8592]">1,204 ratings</p>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-2.5 sm:mt-3 grid grid-cols-[1.4fr_1fr] gap-2.5 sm:gap-3">
            <div className="rounded-xl border border-[#E7EBF0] bg-white p-3 sm:p-4">
              <p className="text-[11px] sm:text-[13px] font-bold text-[#0F1D33]">Ticket volume</p>
              <div className="mt-3 flex h-[90px] sm:h-[132px] items-end gap-1.5 sm:gap-2">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[4px] bg-[#D93A4B]"
                    style={{ height: `${(h / 104) * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#E7EBF0] bg-white p-3 sm:p-4 flex flex-col">
              <p className="text-[11px] sm:text-[13px] font-bold text-[#0F1D33]">SLA compliance</p>
              <div className="flex flex-1 items-center justify-center py-2">
                <div className="relative grid h-[72px] w-[72px] sm:h-[108px] sm:w-[108px] place-items-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#FDECEF" strokeWidth="12" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#C5002B"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${94 * 2.51} 251`}
                    />
                  </svg>
                  <span className="text-[14px] sm:text-[18px] font-extrabold text-[#0F1D33]">94%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
