'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContextDemo';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import toast from 'react-hot-toast';

type InterviewType = 'technical' | 'behavioral' | 'both';
type Basis = 'resume' | 'jd' | 'both' | null;
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
type Timing = 'now' | 'later';

export default function CreateInterviewPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  
  const [step, setStep] = useState(1);
  const [interviewType, setInterviewType] = useState<InterviewType | null>(null);
  const [basis, setBasis] = useState<Basis>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [timing, setTiming] = useState<Timing | null>(null);
  const [saveForDays, setSaveForDays] = useState<'7days' | '30days' | 'forever'>('7days');
  
  // File uploads
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingJD, setUploadingJD] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (step === 1 && !interviewType) {
      toast.error('Please select an interview type');
      return;
    }
    if (step === 2 && !basis) {
      toast.error('Please select what to base the interview on');
      return;
    }
    // Check for required file uploads
    if (step === 2) {
      if ((basis === 'resume' || basis === 'both') && !resumeFile) {
        toast.error('Please upload your resume');
        return;
      }
      if ((basis === 'jd' || basis === 'both') && !jdFile) {
        toast.error('Please upload the job description');
        return;
      }
    }
    if (step === 3 && !difficulty) {
      toast.error('Please select a difficulty level');
      return;
    }
    if (step === 4 && !timing) {
      toast.error('Please select a timing option');
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleCreateInterview();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateInterview = () => {
    const interviewId = `interview_${Date.now()}`;
    
    const interviewConfig = {
      type: interviewType,
      basis,
      difficulty,
      timing,
      saveForDays: timing === 'later' ? saveForDays : null,
      resumeFileName: resumeFile?.name,
      jdFileName: jdFile?.name
    };

    localStorage.setItem(interviewId, JSON.stringify(interviewConfig));

    if (timing === 'now') {
      toast.success('Starting your interview...');
      router.push(`/interview/${interviewId}`);
    } else {
      toast.success('Interview saved! You can start it from your dashboard.');
      router.push('/dashboard');
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      toast.success('Resume uploaded successfully!');
    }
  };

  const handleJDUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
        toast.error('Please upload a PDF or TXT file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setJdFile(file);
      toast.success('Job description uploaded successfully!');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Interview</h1>
            <p className="text-gray-600">Let's customize your interview experience</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    s <= step 
                      ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                      s < step ? 'bg-gradient-to-r from-primary-500 to-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Type</span>
              <span>Basis</span>
              <span>Difficulty</span>
              <span>Timing</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Step 1: Interview Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Interview Type</h2>
                  <p className="text-gray-600">What type of interview would you like to practice?</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Technical */}
                  <div
                    onClick={() => setInterviewType('technical')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      interviewType === 'technical'
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💻</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Technical Interview</h3>
                        <p className="text-sm text-gray-600">
                          Coding concepts, algorithms, system design, debugging, and technical problem-solving
                        </p>
                      </div>
                      {interviewType === 'technical' && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Behavioral */}
                  <div
                    onClick={() => setInterviewType('behavioral')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      interviewType === 'behavioral'
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🤝</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Behavioral Interview</h3>
                        <p className="text-sm text-gray-600">
                          STAR method, soft skills, teamwork, conflict resolution, and situational scenarios
                        </p>
                      </div>
                      {interviewType === 'behavioral' && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Both */}
                  <div
                    onClick={() => setInterviewType('both')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      interviewType === 'both'
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Combined Interview</h3>
                        <p className="text-sm text-gray-600">
                          Mix of technical and behavioral questions (70% technical, 30% behavioral)
                        </p>
                      </div>
                      {interviewType === 'both' && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Basis */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Basis</h2>
                  <p className="text-gray-600">What should the questions be based on?</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Resume */}
                  <div
                    onClick={() => setBasis('resume')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      basis === 'resume'
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Based on Resume</h3>
                        <p className="text-sm text-gray-600 mb-3">Questions tailored to your experience and skills</p>
                        
                        {basis === 'resume' && (
                          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                            <label className="block">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={handleResumeUpload}
                                className="hidden"
                                id="resume-upload"
                              />
                              <div className="flex items-center gap-3">
                                {resumeFile ? (
                                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">{resumeFile.name}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setResumeFile(null);
                                      }}
                                      className="ml-2 text-green-600 hover:text-green-800"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor="resume-upload"
                                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer transition"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm font-medium">Upload Resume (PDF)</span>
                                  </label>
                                )}
                              </div>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Max file size: 5MB</p>
                          </div>
                        )}
                      </div>
                      {basis === 'resume' && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Description */}
                  <div
                    onClick={() => setBasis('jd')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      basis === 'jd'
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Based on Job Description</h3>
                        <p className="text-sm text-gray-600 mb-3">Questions aligned with specific role requirements</p>
                        
                        {basis === 'jd' && (
                          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                            <label className="block">
                              <input
                                type="file"
                                accept=".pdf,.txt"
                                onChange={handleJDUpload}
                                className="hidden"
                                id="jd-upload"
                              />
                              <div className="flex items-center gap-3">
                                {jdFile ? (
                                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">{jdFile.name}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setJdFile(null);
                                      }}
                                      className="ml-2 text-green-600 hover:text-green-800"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor="jd-upload"
                                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer transition"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm font-medium">Upload JD (PDF/TXT)</span>
                                  </label>
                                )}
                              </div>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Max file size: 2MB</p>
                          </div>
                        )}
                      </div>
                      {basis === 'jd' && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Both */}
                  <div
                    onClick={() => setBasis('both')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      basis === 'both'
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Based on Both</h3>
                        <p className="text-sm text-gray-600 mb-3">Comprehensive questions from resume and job description</p>
                        
                        {basis === 'both' && (
                          <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                            {/* Resume Upload */}
                            <div>
                              <label className="block">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handleResumeUpload}
                                  className="hidden"
                                  id="resume-upload-both"
                                />
                                <div className="flex items-center gap-3">
                                  {resumeFile ? (
                                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg flex-1">
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm font-medium">{resumeFile.name}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setResumeFile(null);
                                        }}
                                        className="ml-auto text-green-600 hover:text-green-800"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>
                                  ) : (
                                    <label
                                      htmlFor="resume-upload-both"
                                      className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer transition flex-1 justify-center"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                      <span className="text-sm font-medium">Upload Resume</span>
                                    </label>
                                  )}
                                </div>
                              </label>
                            </div>

                            {/* JD Upload */}
                            <div>
                              <label className="block">
                                <input
                                  type="file"
                                  accept=".pdf,.txt"
                                  onChange={handleJDUpload}
                                  className="hidden"
                                  id="jd-upload-both"
                                />
                                <div className="flex items-center gap-3">
                                  {jdFile ? (
                                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg flex-1">
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm font-medium">{jdFile.name}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setJdFile(null);
                                        }}
                                        className="ml-auto text-green-600 hover:text-green-800"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>
                                  ) : (
                                    <label
                                      htmlFor="jd-upload-both"
                                      className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer transition flex-1 justify-center"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                      <span className="text-sm font-medium">Upload Job Description</span>
                                    </label>
                                  )}
                                </div>
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">Resume: max 5MB (PDF) | JD: max 2MB (PDF/TXT)</p>
                          </div>
                        )}
                      </div>
                      {basis === 'both' && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Difficulty */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Difficulty</h2>
                  <p className="text-gray-600">Choose the challenge level for your interview</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Easy */}
                  <div
                    onClick={() => setDifficulty('easy')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      difficulty === 'easy'
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🌱</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Easy</h3>
                      <p className="text-sm text-gray-600 mb-2">5 questions</p>
                      <p className="text-xs text-gray-500">Basic concepts and fundamentals</p>
                    </div>
                  </div>

                  {/* Medium */}
                  <div
                    onClick={() => setDifficulty('medium')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      difficulty === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Medium</h3>
                      <p className="text-sm text-gray-600 mb-2">8 questions</p>
                      <p className="text-xs text-gray-500">Intermediate level challenges</p>
                    </div>
                  </div>

                  {/* Hard */}
                  <div
                    onClick={() => setDifficulty('hard')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      difficulty === 'hard'
                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🔥</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Hard</h3>
                      <p className="text-sm text-gray-600 mb-2">12 questions</p>
                      <p className="text-xs text-gray-500">Advanced topics and scenarios</p>
                    </div>
                  </div>

                  {/* Expert */}
                  <div
                    onClick={() => setDifficulty('expert')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      difficulty === 'expert'
                        ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">💎</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Expert</h3>
                      <p className="text-sm text-gray-600 mb-2">15 questions</p>
                      <p className="text-xs text-gray-500">Complex problems & deep dives</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Timing */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">When to Start?</h2>
                  <p className="text-gray-600">Start immediately or save for later</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Start Now */}
                  <div
                    onClick={() => setTiming('now')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      timing === 'now'
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">▶️</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Start Immediately</h3>
                        <p className="text-sm text-gray-600">Begin your interview right away</p>
                      </div>
                      {timing === 'now' && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save for Later */}
                  <div
                    onClick={() => setTiming('later')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      timing === 'later'
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💾</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Save for Later</h3>
                        <p className="text-sm text-gray-600 mb-3">Practice when you're ready</p>
                        
                        {timing === 'later' && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Save for:</p>
                            <select
                              value={saveForDays}
                              onChange={(e) => setSaveForDays(e.target.value as any)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="7days">7 Days</option>
                              <option value="30days">30 Days</option>
                              <option value="forever">Until I Delete</option>
                            </select>
                          </div>
                        )}
                      </div>
                      {timing === 'later' && (
                        <div className="text-primary-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all flex items-center gap-2 transform hover:scale-105"
              >
                {step === totalSteps ? (
                  <>
                    {timing === 'now' ? 'Start Interview' : 'Save Interview'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Continue
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}