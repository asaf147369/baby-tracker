import { Link, useRouterState } from "@tanstack/react-router";

function getTabFromSearch(search: unknown): string | undefined {
  if (search && typeof search === "object" && "tab" in search)
    return (search as { tab?: string }).tab;
  if (typeof search === "string")
    return new URLSearchParams(search).get("tab") ?? undefined;
  return undefined;
}

const navLink =
  "flex flex-1 items-center justify-center rounded-xl px-2 py-3 text-[0.95rem] no-underline transition-[background,color] duration-150";
const navLinkInactive = "text-muted hover:bg-surface-hover hover:text-white";
const navLinkActive = "bg-border font-semibold text-white";

export function BottomNav() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const tabParam = getTabFromSearch(location.search);
  const isAdd = pathname === "/" && tabParam !== "info";
  const isInfo = pathname === "/" && tabParam === "info";
  const isHistory = pathname === "/history";
  const isChart = pathname === "/sleep-chart";

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-[100] flex w-full max-w-[480px] -translate-x-1/2 rounded-t-[20px] border border-b-0 border-border bg-surface p-2.5 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
      role="navigation"
      aria-label="ניווט ראשי"
    >
      <Link
        to="/"
        search={{ tab: undefined }}
        className={`${navLink} ${isAdd ? navLinkActive : navLinkInactive}`}
      >
        <span className="text-inherit">הוסף</span>
      </Link>
      <Link
        to="/"
        search={{ tab: "info" }}
        className={`${navLink} ${isInfo ? navLinkActive : navLinkInactive}`}
      >
        <span className="text-inherit">מידע</span>
      </Link>
      <Link
        to="/history"
        className={`${navLink} ${isHistory ? navLinkActive : navLinkInactive}`}
      >
        <span className="text-inherit">היסטוריה</span>
      </Link>
      <Link
        to="/sleep-chart"
        className={`${navLink} ${isChart ? navLinkActive : navLinkInactive}`}
      >
        <span className="text-inherit">גרף</span>
      </Link>
    </nav>
  );
}
