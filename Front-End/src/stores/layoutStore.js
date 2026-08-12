import { useCallback, useState } from "react";

const SIDEBAR_KEY = "edutrack_sidebar_collapsed";

function initialCollapsed() {
  const saved = localStorage.getItem(SIDEBAR_KEY);
  if (saved !== null) return saved === "true";
  return window.innerWidth < 1024;
}

export function useLayoutStore() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialCollapsed);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  return { sidebarCollapsed, toggleSidebar };
}
