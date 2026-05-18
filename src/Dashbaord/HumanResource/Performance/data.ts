export type PendingEvaluation = {
  id: string;
  name: string;
  code: string;
  department: string;
  position: string;
  period: string;
  period_id?: string;
  dueDate: string;
  evaluator: string;
  cycle: "Quarterly" | "Annual";
  avatar?: string;
};

export type CompletedEvaluation = {
  id: string;
  name: string;
  department: string;
  position: string;
  date: string;
  evaluator: string;
  rating: number;
  status: "Reviewed" | "Completed";
};

export type EvaluationTemplate = {
  id: string;
  title: string;
  description: string;
  categories: number;
  lastModified: string;
  isActive?: boolean;
};
