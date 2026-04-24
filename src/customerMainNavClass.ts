export function customerMainNavClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-full px-3 py-1.5 text-sm font-medium transition outline-none",
    isActive
      ? "bg-gradient-to-r from-pink-600/55 to-pink-500/45 font-semibold text-white shadow-md shadow-pink-900/25 ring-1 ring-pink-400/50"
      : "text-pink-200/90 hover:bg-white/5 hover:text-white",
  ].join(" ");
}
