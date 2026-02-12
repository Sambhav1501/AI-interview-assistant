'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContextDemo';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// In the component:
//const router = useRouter();

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (uploadedFile.size > 5 * 1024 * 1024) {
        toast.error('File must be less than 5MB');
        return;
      }
      setFile(uploadedFile);
      setResults(null);
      toast.success('Resume uploaded!');
    }
  };

  // const handleAnalyze = async () => {
  //   if (!file) {
  //     toast.error('Please upload a resume first');
  //     return;
  //   }

  //   setAnalyzing(true);
    
  //   // Simulate analysis (replace with real API call)
  //   setTimeout(() => {
  //     setResults({
  //       atsScore: 78,
  //       strengths: [
  //         'Strong technical skills section',
  //         'Clear work experience progression',
  //         'Quantified achievements with metrics'
  //       ],
  //       weaknesses: [
  //         'Missing keywords: cloud computing, Docker, Kubernetes',
  //         'Summary section could be more impactful',
  //         'Some bullet points lack action verbs'
  //       ],
  //       suggestions: [
  //         'Add a professional summary at the top',
  //         'Include more industry-specific keywords',
  //         'Quantify more achievements with numbers',
  //         'Reorganize skills by relevance to target role'
  //       ],
  //       skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
  //       missingKeywords: ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
  //     });
  //     setAnalyzing(false);
  //     toast.success('Analysis complete!');
  //   }, 3000);
  // };

  const handleAnalyze = async () => {
  if (!file) {
    toast.error('Please upload a resume first');
    return;
  }

  // Check for Groq API key
  const groqKey = localStorage.getItem('groq_key');
  if (!groqKey) {
    toast.error('Please configure your Groq API key in Settings');
    router.push('/settings');
    return;
  }

  setAnalyzing(true);
  
  try {
    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/resume/analyze?api_key=${groqKey}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const data = await response.json();
    setResults(data);
    toast.success('Analysis complete!');
    
  } catch (error) {
    console.error('Analysis error:', error);
    toast.error('Failed to analyze resume');
  } finally {
    setAnalyzing(false);
  }
};

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium mb-1">Click to upload</p>
                    <p className="text-gray-500 text-sm">PDF format, max 5MB</p>
                  </label>
                </div>

                {file && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!file || analyzing}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Resume'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2">
              {!results ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
                  <p className="text-gray-500">Upload your resume and click analyze to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* ATS Score */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ATS Score</h3>
                    <div className="flex items-center gap-6">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#3b82f6"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${results.atsScore * 3.51} 351`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-900">{results.atsScore}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-gray-900 mb-1">{results.atsScore}/100</p>
                        <p className="text-gray-600">Your resume has a {results.atsScore >= 75 ? 'good' : 'moderate'} ATS compatibility score</p>
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-green-600">✓</span> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {results.strengths.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <span className="text-green-500 mt-1">●</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-yellow-600">⚠</span> Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {results.weaknesses.map((weakness: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <span className="text-yellow-500 mt-1">●</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-blue-600">💡</span> Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {results.suggestions.map((suggestion: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <span className="text-blue-500 mt-1">●</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}