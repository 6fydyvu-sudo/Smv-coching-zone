"use client";

export function MobileSidebarToggle() {
  function toggle() {
    const sidebar = document.getElementById("dashboard-sidebar");
    const backdrop = document.getElementById("dashboard-backdrop");

    if (!sidebar || !backdrop) return;

    const isClosed = sidebar.classList.contains("-translate-x-full");

    if (isClosed) {
      sidebar.classList.remove("-translate-x-full");
      backdrop.classList.remove("hidden");
    } else {
      sidebar.classList.add("-translate-x-full");
      backdrop.classList.add("hidden");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle sidebar"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 lg:hidden"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M4 6h16M4 12h16M4 18h16"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
