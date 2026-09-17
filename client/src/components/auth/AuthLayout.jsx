/**
 * Shared auth shell for /login + /signup.
 * Design system taken from the Ricoz Invoice reference (eyebrow, card, tall
 * inputs, brand-red CTA) applied to RicozServe branding + palette.
 */
export const AUTH_INPUT =
  "mt-1.5 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-3 text-[14px] text-[#111827] outline-none transition placeholder:text-[#9AA3B0] focus:border-[#C4122F] focus:ring-2 focus:ring-[#C4122F]/10";

export const AUTH_LABEL = "block text-[13px] font-semibold text-[#475569]";

export const AUTH_BUTTON =
  "mt-5 w-full rounded-xl bg-[#C4122F] hover:bg-[#A50E27] text-white font-semibold py-3 shadow-[0_8px_20px_rgba(196,18,47,0.30)] transition disabled:opacity-60";

export default function AuthLayout({ eyebrow, title, sub, children, footer }) {
  return (
    <div className="min-h-screen grid place-items-center bg-[#EEF2F7] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#E6EAF0] bg-white p-8 shadow-[0_20px_60px_rgba(17,24,39,0.10)]">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C4122F] text-white font-extrabold">R</span>
          <span className="text-xl font-extrabold text-[#111827]">
            Ricoz<span className="text-[#6B7280] font-semibold">Serve</span>
          </span>
        </div>
        <p className="mt-6 text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-[#C4122F]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight text-[#111827]">
          {title}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#687385]">{sub}</p>
        {children}
        {footer && (
          <div className="mt-5 text-center text-sm text-[#687385]">{footer}</div>
        )}
      </div>
    </div>
  );
}
