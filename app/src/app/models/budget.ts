export interface BudgetCategory {
  name: string;
  limit: number;
}

export interface Budget {
  id?: string;
  month: string;            // 'YYYY-MM'
  totalIncome: number;
  categories: BudgetCategory[];
  createdAt?: number;
}