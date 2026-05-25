export interface PindanBudgetFields {
  budgetMin?: number;
  budgetMax?: number;
  budgetRangeLabel?: string;
  price?: number;
  originalPrice?: number;
}

/** Ensures a budget range string includes ¥ without doubling existing symbols. */
export function ensureBudgetLabelHasYuan(label: string): string {
  const trimmed = label.trim();
  if (!trimmed || /[¥￥]/.test(trimmed)) return label;
  if (/^约/.test(trimmed)) {
    return trimmed.replace(/^约(?=[\d])/u, "约¥");
  }
  if (/^[\d]/.test(trimmed)) {
    return `¥${trimmed}`;
  }
  return label;
}

export function formatPindanBudgetRangeLabel(fields: {
  budgetMin?: number;
  budgetMax?: number;
  budget?: number;
}): string | undefined {
  const { budgetMin, budgetMax, budget } = fields;
  if (budgetMin != null && budgetMax != null) {
    if (budgetMin === budgetMax) {
      return `约¥${budgetMin}/人`;
    }
    return `¥${budgetMin}-${budgetMax}/人`;
  }
  if (budget != null && budget > 0) {
    return `约¥${budget}/人`;
  }
  return undefined;
}

export function isBudgetModePindan(item: PindanBudgetFields): boolean {
  if (item.budgetRangeLabel) return true;
  return item.budgetMin != null && item.budgetMax != null;
}

export function resolvePindanBudgetRangeLabel(item: PindanBudgetFields): string | undefined {
  if (item.budgetRangeLabel) {
    return ensureBudgetLabelHasYuan(item.budgetRangeLabel);
  }
  if (!isBudgetModePindan(item)) return undefined;
  return formatPindanBudgetRangeLabel({
    budgetMin: item.budgetMin,
    budgetMax: item.budgetMax,
    budget: item.price,
  });
}
