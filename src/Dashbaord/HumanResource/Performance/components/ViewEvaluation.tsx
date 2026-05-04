import React from "react";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  User,
  Star,
  ClipboardCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompletedEvaluation } from "../data";

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Reviewed: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function RatingStars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(rating)
              ? "text-yellow-500 fill-yellow-400"
              : i < rating
              ? "text-yellow-500 fill-yellow-400/50"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-800">{rating}</span>
    </div>
  );
}

interface ViewEvaluationProps {
  evaluation: CompletedEvaluation;
  onBack: () => void;
}

export const ViewEvaluation: React.FC<ViewEvaluationProps> = ({
  evaluation,
  onBack,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Evaluations
      </button>

      {/* Header Card */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
              {evaluation.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{evaluation.name}</h1>
                <StatusBadge status={evaluation.status} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{evaluation.position}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {evaluation.department} · Evaluated by {evaluation.evaluator}
              </p>
            </div>
          </div>
          <Button variant="outline">Download Report</Button>
        </div>
      </SectionCard>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Star size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Overall Rating</p>
              <RatingStars rating={evaluation.rating} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Evaluation Date</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(evaluation.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <ClipboardCheck size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <StatusBadge status={evaluation.status} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Info */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Employee Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={User} label="Full Name" value={evaluation.name} />
              <InfoRow icon={Briefcase} label="Position" value={evaluation.position} />
              <InfoRow icon={Briefcase} label="Department" value={evaluation.department} />
              <InfoRow icon={User} label="Evaluator" value={evaluation.evaluator} />
            </div>
          </SectionCard>

          {/* Performance Categories */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Performance Categories</h2>
            </div>
            <div className="space-y-4">
              {[
                { name: "Task Completion Rate", score: 4.0 },
                { name: "Quality of Work", score: 4.5 },
                { name: "Punctuality & Attendance", score: 5.0 },
                { name: "Conduct & Behaviour", score: 4.0 },
                { name: "Productivity", score: 4.5 },
              ].map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{cat.name}</span>
                    <span className="text-sm font-semibold text-gray-800">{cat.score}/5</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${(cat.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SectionCard>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <h3 className="text-sm font-semibold text-gray-800">Strengths & Achievements</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  Consistently delivers high-quality work
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  Strong team collaboration skills
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  Excellent problem-solving abilities
                </li>
              </ul>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-semibold text-gray-800">Areas for Improvement</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  Time management on complex projects
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  Documentation practices
                </li>
              </ul>
            </SectionCard>
          </div>
        </div>

        {/* Right Sidebar — 1/3 */}
        <div className="space-y-6">
          {/* Rating Summary */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Rating Summary
              </h3>
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{evaluation.rating}</span>
                </div>
                <RatingStars rating={evaluation.rating} />
                <p className="text-xs text-gray-400">out of 5.0</p>
              </div>
            </div>
          </SectionCard>

          {/* Evaluation Details */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Evaluation Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <StatusBadge status={evaluation.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(evaluation.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Evaluator</span>
                  <span className="font-medium text-gray-800">{evaluation.evaluator}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium text-gray-800">{evaluation.department}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Goals */}
          <SectionCard>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Goals for Next Period
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <TrendingUp size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">Improve project delivery timelines</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">Enhance technical documentation</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">Mentor junior team members</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
