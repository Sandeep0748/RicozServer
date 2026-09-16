import { Link } from "react-router-dom";

export default function Footer({ dark = false }) {
  if (dark) {
    return (
      <footer className="border-t border-white/10 bg-[#0C1A33]">
        <div className="mx-auto max-w-[1200px] px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13.5px]">
          <p className="text-white/60">© 2026 RicozServe. Service, clearly managed.</p>
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-white/60 hover:text-white transition-colors">Sign in</Link>
            <Link to="/signup" className="text-white/60 hover:text-white transition-colors">Create account</Link>
          </div>
        </div>
      </footer>
    );
  }
  return (
    <footer className="border-t border-[#EAEAEA] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 grid gap-8 sm:grid-cols-4 text-sm">
        <div>
          <p className="text-lg font-bold">RicozServe</p>
          <p className="mt-2 text-[#6F6F6F] leading-relaxed">Unified customer service operations across channels, teams, and functions.</p>
        </div>
        <div>
          <p className="font-semibold mb-3">Platform</p>
          <ul className="space-y-2 text-[#555]">
            <li>Omnichannel inbox</li>
            <li>Knowledge base</li>
            <li>Routing & SLAs</li>
            <li>Analytics</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Channels</p>
          <ul className="space-y-2 text-[#555]">
            <li>Email & Portal</li>
            <li>Chat & WhatsApp</li>
            <li>Voice & Social</li>
            <li>API & Webhooks</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Company</p>
          <ul className="space-y-2 text-[#555]">
            <li>Pricing</li>
            <li>Security</li>
            <li>Status</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#EFEFEF] py-4 text-center text-xs text-[#888]">
        © 2026 RicozServe · Prototype build with mock data
      </div>
    </footer>
  );
}
