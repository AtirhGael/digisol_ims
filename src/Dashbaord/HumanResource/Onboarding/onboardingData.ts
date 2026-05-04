export type OnboardingType = "employee" | "intern";

export interface OnboardingRecord {
  id: string;
  name: string;
  role: string;
  workflow: string;
  startDate: string;
  progress: number;
  avatar: string;
  onboardingType: OnboardingType;
}

export const onboardingRecords: OnboardingRecord[] = [
  {
    id: "1",
    name: "Lisa Wang",
    role: "Design",
    workflow: "Hybrid",
    startDate: "2025-02-01",
    progress: 78,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop&crop=faces",
    onboardingType: "employee",
  },
  {
    id: "2",
    name: "Samirah",
    role: "Developer",
    workflow: "Onsite",
    startDate: "2025-12-05",
    progress: 45,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=faces",
    onboardingType: "intern",
  },
  {
    id: "3",
    name: "Samirah",
    role: "Developer",
    workflow: "Remote",
    startDate: "2025-12-05",
    progress: 35,
    avatar:
      "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=200&h=200&fit=crop&crop=faces",
    onboardingType: "employee",
  },
];
