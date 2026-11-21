export interface Goal {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;      // 'YYYY-MM-DD', which is simple to bind to a date input
  createdAt?: number;
}