export type TaskStatus =
  | "TO DO"
  | "IN PROGRESS"
  | "IN REVIEW"
  | "COMPLETED";

export interface Task {
  id: string | number;
  title: string;
  assignee: string;
  projectName: string;
  progress: number;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  description?: string;
  status: "todo" | "in_progress" | "in_review" | "completed";
}


export interface SimpleTask {
  id: string ;
  title: string;
  status: string;
}


export const SOME_CONSTANT = "value";

