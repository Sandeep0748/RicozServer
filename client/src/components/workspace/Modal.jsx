import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button aria-label="close" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className={`relative w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b border-[#F0F0F3] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-[16px]">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#F3F4F6] text-lg leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
