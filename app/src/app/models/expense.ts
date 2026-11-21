export interface Expense {
  id?: string;
  amount: number;
  category: string;   // should match a budget category name
  date: string;       // 'YYYY-MM-DD'
  recurring?: boolean;
}