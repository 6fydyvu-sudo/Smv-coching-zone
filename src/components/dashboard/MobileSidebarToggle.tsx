"use client";

import { useEffect } from "react";

function setOpen(open: boolean) {
  document.getElementById("dashboard-sidebar")?.classList.toggle("-translate-x-full", !open);
  document.getElementById("dashboard-backdrop")?.classList.toggle("hidden", !open);
}

export function MobileSidebarToggle() {
  // Clicking the backdrop closes the sidebar. Attached once on mount.
  useEffect(() => {
    const backdrop = document.getElementById("dashboard-backdrop");
    const close = () => setOpen(false);
    backdrop?.addEventListener("click", close);
    return () => backdrop?.removeEventListener("click", close);
  }, []);

  function toggle() {
    const sidebar = document.getElementById("dashboard-sidebar");
    const isOpen = sidebar ? !sidebar.classList.contains("-translate-x-full") : false;
    setOpen(!isOpen);
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
