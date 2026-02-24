import { createRoute } from "@tanstack/react-router";
import { authenticatedRoute } from "../_authenticated";
import { HistoryPage } from "../../pages/HistoryPage";

export const historyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/history",
  validateSearch: (s: Record<string, unknown>) => ({
    filter: (s?.filter as string) || "all",
  }),
  component: HistoryPage,
});
