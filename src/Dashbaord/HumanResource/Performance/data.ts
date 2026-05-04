export type PendingEvaluation = {
  id: string;
  name: string;
  code: string;
  department: string;
  position: string;
  period: string;
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
};

export const pendingEvaluations: PendingEvaluation[] = [
  {
    id: "1",
    name: "Ateh Gael",
    code: "EMP001",
    department: "Engineering",
    position: "Senior Software Developer",
    period: "Q4 2025",
    dueDate: "2025-10-25",
    evaluator: "Mrs. Egbe",
    cycle: "Quarterly",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=160&h=160&fit=crop&crop=faces",
  },
  {
    id: "2",
    name: "Mbongo Elvis",
    code: "EMP002",
    department: "Engineering",
    position: "Lead Software Developer",
    period: "Q5 2025",
    dueDate: "2025-12-25",
    evaluator: "Mrs. Egbe",
    cycle: "Annual",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
  },
];

export const completedEvaluations: CompletedEvaluation[] = [
  {
    id: "1",
    name: "Mr Gael A.",
    department: "Development",
    position: "Senior Developer",
    date: "2025-11-15",
    evaluator: "Ebeh Priscille",
    rating: 4.5,
    status: "Reviewed",
  },
  {
    id: "2",
    name: "Miss Marinette",
    department: "Marketing",
    position: "Marketer",
    date: "2025-12-20",
    evaluator: "Ebeh Priscille",
    rating: 4.5,
    status: "Reviewed",
  },
];

export const evaluationTemplates: EvaluationTemplate[] = [
  {
    id: "1",
    title: "Average Rating per department",
    description: "Regular quarterly performance review template",
    categories: 5,
    lastModified: "2025-11-10",
  },
  {
    id: "2",
    title: "Annual Comprehensive Review",
    description: "Detailed annual performance assessment",
    categories: 5,
    lastModified: "2025-11-10",
  },
];

export const analyticsDepartments = [
  { name: "Development", score: 4.2, width: "85%" },
  { name: "HR", score: 4.2, width: "82%" },
  { name: "Marketing", score: 4.1, width: "78%" },
  { name: "Finance", score: 4.0, width: "72%" },
];

export const ratingDistribution = [
  { label: "Excellent(4.5-5.0)", count: 5, color: "bg-green-500" },
  { label: "Good(3.5-4.4)", count: 7, color: "bg-indigo-500" },
  { label: "Satisfactory(2.5-3.4)", count: 2, color: "bg-orange-400" },
  { label: "Needs Improvement(<2.5)", count: 0, color: "bg-red-500" },
];
