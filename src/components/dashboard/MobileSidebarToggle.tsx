"use client";

export function MobileSidebarToggle() {
  function toggle() {
    document.getElementById("dashboard-sidebar")?.classList.toggle("-translate-x-full");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle sidebar"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      </svg>
    </button>
  );
}
