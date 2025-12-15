"use client";

import { useState, useEffect } from "react";
import ExamList from "./ExamList";
import ExamForm from "./ExamForm";
import SubjectManager from "./SubjectManager";
import ChapterManager from "./ChapterManager";
import QuizManager from "./QuizManager";
import QuestionManager from "./QuestionManager";

interface Exam {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
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

interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  isActive: boolean;
  order: number;
}

export default function ExamManager() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const fetchExams = async () => {
    try {
      const { getAccessToken } = await import("@/lib/auth/storage");
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const response = await fetch("/api/exams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = () => {
    setEditingExam(null);
    setShowForm(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this exam? This will delete all associated subjects, chapters, quizzes, and questions."
      )
    ) {
      return;
    }

    try {
      const { getAccessToken } = await import("@/lib/auth/storage");
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const response = await fetch(`/api/admin/exams/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchExams();
        if (selectedExam?.id === id) {
          setSelectedExam(null);
          setSelectedSubject(null);
          setSelectedChapter(null);
          setSelectedQuiz(null);
        }
      } else {
        const error = await response.json();
        alert(error.error?.message || "Failed to delete exam");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExam(null);
    fetchExams();
  };

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedQuiz(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      {(selectedExam || selectedSubject || selectedChapter || selectedQuiz) && (
        <div className="bg-white shadow rounded-lg px-4 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <button
                  onClick={() => {
                    setSelectedExam(null);
                    setSelectedSubject(null);
                    setSelectedChapter(null);
                    setSelectedQuiz(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Exams
                </button>
              </li>
              {selectedExam && (
                <>
                  <li className="text-gray-400">/</li>
                  <li>
                    <button
                      onClick={() => {
                        setSelectedSubject(null);
                        setSelectedChapter(null);
                        setSelectedQuiz(null);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {selectedExam.name}
                    </button>
                  </li>
                </>
              )}
              {selectedSubject && (
                <>
                  <li className="text-gray-400">/</li>
                  <li>
                    <button
                      onClick={() => {
                        setSelectedChapter(null);
                        setSelectedQuiz(null);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {selectedSubject.name}
                    </button>
                  </li>
                </>
              )}
              {selectedChapter && (
                <>
                  <li className="text-gray-400">/</li>
                  <li>
                    <button
                      onClick={() => setSelectedQuiz(null)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {selectedChapter.name}
                    </button>
                  </li>
                </>
              )}
              {selectedQuiz && (
                <>
                  <li className="text-gray-400">/</li>
                  <li className="text-gray-700">{selectedQuiz.title}</li>
                </>
              )}
            </ol>
          </nav>
        </div>
      )}

      {/* Exams List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Exams</h3>
              <p className="text-sm text-gray-500 mt-1">
                {exams.length} {exams.length === 1 ? "exam" : "exams"} total
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Add Exam
            </button>
          </div>

          <ExamList
            exams={exams}
            selectedExam={selectedExam}
            onSelect={handleSelectExam}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Subject Manager */}
      {selectedExam && (
        <SubjectManager
          exam={selectedExam}
          selectedSubject={selectedSubject}
          onSelectSubject={(subject) => {
            setSelectedSubject(subject);
            setSelectedChapter(null);
            setSelectedQuiz(null);
          }}
          onRefresh={fetchExams}
        />
      )}

      {/* Chapter Manager */}
      {selectedSubject && (
        <ChapterManager
          subject={selectedSubject}
          selectedChapter={selectedChapter}
          onSelectChapter={(chapter) => {
            setSelectedChapter(chapter);
            setSelectedQuiz(null);
          }}
          onRefresh={fetchExams}
        />
      )}

      {/* Quiz Manager */}
      {selectedChapter && (
        <QuizManager
          chapter={selectedChapter}
          selectedQuiz={selectedQuiz}
          onSelectQuiz={(quiz) => setSelectedQuiz(quiz)}
          onRefresh={fetchExams}
        />
      )}

      {/* Question Manager */}
      {selectedQuiz && (
        <QuestionManager quiz={selectedQuiz} onRefresh={fetchExams} />
      )}

      {/* Exam Form Modal */}
      {showForm && (
        <ExamForm
          exam={editingExam}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  );
}
