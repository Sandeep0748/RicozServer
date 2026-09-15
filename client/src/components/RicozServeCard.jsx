import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const bullets = [
  "Omnichannel case management",
  "Intelligent service routing",
  "Knowledge base and resolution guidance",
  "Customer journey analytics",
];

export default function RicozServeCard() {
  return (
    <div className="bg-white border border-[#E4E4E4] rounded-2xl px-8 py-10 sm:px-14 sm:py-14 max-w-[560px] w-full shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className="inline-block bg-[#EDEDED] text-[#6E6E6E] text-[15px] sm:text-[17px] font-medium tracking-[0.04em] uppercase rounded-lg px-5 py-2.5">
        Customer Experience
      </span>

      <h2 className="mt-8 text-[42px] sm:text-[48px] leading-[1.05] font-bold tracking-[-0.02em] text-black">
        RicozServe
      </h2>

      <p className="mt-5 text-[22px] sm:text-[26px] leading-[1.45] text-[#6F6F6F] font-normal">
        A unified platform for managing customer service operations across
        channels, teams, and functions.
      </p>

      <ul className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-[#6F6F6F] text-[19px] leading-[1.4]">
            <span className="mt-[11px] h-[7px] w-[7px] shrink-0 rounded-full bg-[#C5002B]" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/app"
        className="mt-10 inline-flex items-center gap-3 text-[#C5002B] text-[22px] font-medium hover:gap-4 transition-all"
      >
        Learn more
        <ArrowRight className="h-6 w-6" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
