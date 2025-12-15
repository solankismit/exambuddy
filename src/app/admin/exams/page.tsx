"use client";

import { useState } from "react";
import ExamAdminPanel from "./components/ExamAdminPanel";

export default function ExamsPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Exam Management</h2>
        <p className="mt-2 text-sm text-gray-600">
          Manage exams, subjects, chapters, quizzes, and questions
        </p>
      </div>

      <ExamAdminPanel />
    </div>
  );
}
