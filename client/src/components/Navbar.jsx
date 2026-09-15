import { Headset } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#EAEAEA]">
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C5002B] text-white">
            <Headset className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">RicozServe</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-[15px] text-[#444]">
          <a href="#platform" className="hover:text-black">Platform</a>
          <a href="#channels" className="hover:text-black">Channels</a>
          <Link to="/app" className="hover:text-black">Live demo</Link>
          <a href="#pricing" className="hover:text-black">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline text-[15px] font-medium text-[#333] hover:text-black px-3 py-2">
            Sign in
          </Link>
          <Link to="/signup" className="rounded-lg bg-[#C5002B] hover:bg-[#A30024] text-white text-[15px] font-semibold px-4 py-2.5">
            Try free
          </Link>
        </div>
      </div>
    </header>
  );
}
