import { Headset } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#EAEAEA]">
      <div className="mx-auto max-w-[1200px] px-5 h-[68px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#C5002B] text-white shadow-[0_6px_16px_rgba(197,0,43,0.3)]">
            <Headset className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-[20px] font-extrabold tracking-tight text-[#111]">RicozServe</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#5A6470]">
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#workflow" className="hover:text-black transition-colors">How it works</a>
          <a href="#security" className="hover:text-black transition-colors">Security</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex rounded-[10px] border border-[#C5002B] text-[#C5002B] text-[15px] font-semibold px-5 py-2.5 hover:bg-red-50 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-[10px] bg-[#C5002B] hover:bg-[#A30024] text-white text-[15px] font-semibold px-5 py-2.5 shadow-[0_8px_20px_rgba(197,0,43,0.3)] transition-all"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
