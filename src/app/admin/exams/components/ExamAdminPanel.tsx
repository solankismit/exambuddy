"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/hooks/useApi";
import ExamSection from "./sections/ExamSection";
import SubjectSection from "./sections/SubjectSection";
import ChapterSection from "./sections/ChapterSection";
import QuizSection from "./sections/QuizSection";
import QuestionSection from "./sections/QuestionSection";

interface Exam {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface Subject {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface Chapter {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

export default function ExamAdminPanel() {
  const api = useApi();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [activeTab, setActiveTab] = useState<
    "exams" | "subjects" | "chapters" | "quizzes" | "questions"
  >("exams");

  // Load exams on mount
  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    const data = await api.get<{ exams: Exam[] }>("/api/exams");
    if (data?.exams) {
      setExams(data.exams);
    }
  };

  const handleExamSelect = (exam: Exam | null) => {
    setSelectedExam(exam);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedQuiz(null);
    if (exam) {
      setActiveTab("subjects");
    } else {
      setActiveTab("exams");
    }
  };

  const handleSubjectSelect = (subject: Subject | null) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
    setSelectedQuiz(null);
    if (subject) {
      setActiveTab("chapters");
    } else {
      setActiveTab("subjects");
    }
  };

  const handleChapterSelect = (chapter: Chapter | null) => {
    setSelectedChapter(chapter);
    setSelectedQuiz(null);
    if (chapter) {
      setActiveTab("quizzes");
    } else {
      setActiveTab("chapters");
    }
  };

  const handleQuizSelect = (quiz: Quiz | null) => {
    setSelectedQuiz(quiz);
    if (quiz) {
      setActiveTab("questions");
    } else {
      setActiveTab("quizzes");
    }
  };

  const handleRefresh = () => {
    loadExams();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Tabs">
          <button
            onClick={() => {
              setActiveTab("exams");
              handleExamSelect(null);
            }}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === "exams"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Exams
          </button>
          {selectedExam && (
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "subjects"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Subjects
            </button>
          )}
          {selectedSubject && (
            <button
              onClick={() => setActiveTab("chapters")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "chapters"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Chapters
            </button>
          )}
          {selectedChapter && (
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "quizzes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quizzes
            </button>
          )}
          {selectedQuiz && (
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "questions"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Questions
            </button>
          )}
        </nav>
      </div>

      {/* Content Area */}
      <div className="p-6 relative">
        {activeTab === "exams" && (
          <ExamSection
            exams={exams}
            selectedExam={selectedExam}
            onSelect={handleExamSelect}
            onRefresh={handleRefresh}
            api={api}
          />
        )}

        {activeTab === "subjects" && selectedExam && (
          <SubjectSection
            exam={selectedExam}
            selectedSubject={selectedSubject}
            onSelect={handleSubjectSelect}
            onRefresh={handleRefresh}
            api={api}
          />
        )}

        {activeTab === "chapters" && selectedSubject && (
          <ChapterSection
            subject={selectedSubject}
            selectedChapter={selectedChapter}
            onSelect={handleChapterSelect}
            onRefresh={handleRefresh}
            api={api}
          />
        )}

        {activeTab === "quizzes" && selectedChapter && (
          <QuizSection
            chapter={selectedChapter}
            selectedQuiz={selectedQuiz}
            onSelect={handleQuizSelect}
            onRefresh={handleRefresh}
            api={api}
          />
        )}

        {activeTab === "questions" && selectedQuiz && (
          <QuestionSection
            quiz={selectedQuiz}
            onRefresh={handleRefresh}
            api={api}
          />
        )}

        {activeTab !== "exams" && !selectedExam && (
          <div className="text-center py-12 text-gray-500">
            Please select an exam first
          </div>
        )}
      </div>

      {/* Global Loading Overlay */}
      {api.loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Global Error Display */}
      {api.error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span className="flex-1">{api.error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
