'use client';

import { useAuth } from '@/lib/context/AuthContextDemo';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userProfile, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎙️</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">AI Interview Assistant</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/settings"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userProfile?.displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userProfile?.displayName}! 👋
            </h2>
            <p className="text-gray-600">
              Ready to ace your next interview? Choose an option below to get started.
            </p>
          </div>

          {/* Three Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Create Interview */}
            <Link href="/interview/create">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎙️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create & Practice Interview</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Start a mock interview session tailored to your needs with AI-powered questions.
                </p>
                <div className="text-primary-600 font-medium text-sm hover:text-primary-700 flex items-center gap-2">
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Card 2: Resume Analysis */}
            <Link href="/resume/analysis">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Resume Analysis</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Get ATS score, skill gap analysis, and personalized improvement suggestions.
                </p>
                <div className="text-primary-600 font-medium text-sm hover:text-primary-700 flex items-center gap-2">
                  Analyze Resume
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Card 3: View Reports */}
            <Link href="/feedback/demo-report">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Feedback & Reports</h3>
                <p className="text-gray-600 text-sm mb-4">
                  View detailed feedback, performance metrics, and track your progress over time.
                </p>
                <div className="text-primary-600 font-medium text-sm hover:text-primary-700 flex items-center gap-2">
                  View Reports
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{userProfile?.stats?.totalInterviews || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userProfile?.stats?.averageScore || 0}
                  <span className="text-lg text-gray-500">/100</span>
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Last Interview</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userProfile?.stats?.lastInterviewDate ? 'Recent' : 'None'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}