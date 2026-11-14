import type { BankFilters } from "@/types/lms/questionBank";

export const initialBankQuery: BankFilters & { page: number } = {
  q: "",
  difficulty: "",
  bloom: "",
  source: "",
  month: "",
  sort: "created_at",
  order: "desc",
  page: 1,
};

type QueryAction =
  | { type: "filter"; filters: Partial<BankFilters> }
  | { type: "page"; page: number | ((previous: number) => number) };

/** A filter and its page reset are one transition, so no old-page request is issued. */
export function bankQueryReducer(
  state: typeof initialBankQuery,
  action: QueryAction,
) {
  if (action.type === "page")
    return {
      ...state,
      page: Math.max(
        1,
        typeof action.page === "function"
          ? action.page(state.page)
          : action.page,
      ),
    };
  if (
    Object.entries(action.filters).every(
      ([key, value]) => state[key as keyof BankFilters] === value,
    )
  )
    return state;
  return { ...state, ...action.filters, page: 1 };
}
