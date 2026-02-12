'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Link from 'next/link';

export default function FeedbackReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  // Mock data (replace with real API call)
  const report = {
    overallScore: 72,
    date: 'January 28, 2026',
    questionCount: 8,
    categoryScores: {
      technical: 75,
      communication: 68,
      behavioral: 73
    },
    strengths: [
      'Clear and structured responses',
      'Good use of technical terminology',
      'Confident delivery'
    ],
    improvements: [
      'Reduce filler words (um, uh)',
      'Provide more specific examples',
      'Improve STAR method usage'
    ],
    fillerWords: 12,
    avgResponseTime: 45
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
                <p className="text-gray-500 text-sm mt-1">{report.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
                <Link href="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overall Score Card */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium opacity-90 mb-2">Overall Performance</h2>
                <p className="text-5xl font-bold">{report.overallScore}/100</p>
                <p className="mt-2 opacity-90">{report.questionCount} questions answered</p>
              </div>
              <div className="text-right">
                <div className="text-6xl mb-2">
                  {report.overallScore >= 80 ? '🌟' : report.overallScore >= 60 ? '👍' : '💪'}
                </div>
                <p className="text-lg font-medium">
                  {report.overallScore >= 80 ? 'Excellent!' : report.overallScore >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                </p>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm mb-2">Technical</p>
              <p className="text-3xl font-bold text-gray-900">{report.categoryScores.technical}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm mb-2">Communication</p>
              <p className="text-3xl font-bold text-gray-900">{report.categoryScores.communication}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm mb-2">Behavioral</p>
              <p className="text-3xl font-bold text-gray-900">{report.categoryScores.behavioral}%</p>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">✓</span> Strengths
              </h3>
              <ul className="space-y-3">
                {report.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">●</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-orange-600">↑</span> Areas to Improve
              </h3>
              <ul className="space-y-3">
                {report.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">●</span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
