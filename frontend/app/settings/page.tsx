'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContextDemo';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const { userProfile } = useAuth();
  
  const [apiKeys, setApiKeys] = useState({
    assemblyai_key: '',
    groq_key: '',
    murf_key: '',
    serpapi_key: ''
  });

  const [showKeys, setShowKeys] = useState({
    assemblyai_key: false,
    groq_key: false,
    murf_key: false,
    serpapi_key: false
  });

  useEffect(() => {
    // Load saved keys
    setApiKeys({
      assemblyai_key: localStorage.getItem('assemblyai_key') || '',
      groq_key: localStorage.getItem('groq_key') || '',
      murf_key: localStorage.getItem('murf_key') || '',
      serpapi_key: localStorage.getItem('serpapi_key') || ''
    });
  }, []);

  const handleSave = () => {
    // Save to localStorage
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(key, value);
      }
    });
    
    toast.success('API keys saved successfully!');
  };

  const handleChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <Link
                href="/dashboard"
                className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">API Configuration</h2>
              <p className="text-gray-600 text-sm">
                Configure your AI service API keys. These are stored locally in your browser.
              </p>
            </div>

            <div className="space-y-6">
              {/* AssemblyAI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AssemblyAI API Key (Speech-to-Text)
                </label>
                <div className="relative">
                  <input
                    type={showKeys.assemblyai_key ? 'text' : 'password'}
                    value={apiKeys.assemblyai_key}
                    onChange={(e) => handleChange('assemblyai_key', e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your AssemblyAI API key"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('assemblyai_key')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.assemblyai_key ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your key at: <a href="https://www.assemblyai.com/" target="_blank" className="text-primary-600 hover:underline">assemblyai.com</a>
                </p>
              </div>

              {/* Groq */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groq API Key (AI Language Model)
                </label>
                <div className="relative">
                  <input
                    type={showKeys.groq_key ? 'text' : 'password'}
                    value={apiKeys.groq_key}
                    onChange={(e) => handleChange('groq_key', e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your Groq API key"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('groq_key')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.groq_key ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your key at: <a href="https://console.groq.com/" target="_blank" className="text-primary-600 hover:underline">console.groq.com</a>
                </p>
              </div>

              {/* Murf */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Murf API Key (Text-to-Speech)
                </label>
                <div className="relative">
                  <input
                    type={showKeys.murf_key ? 'text' : 'password'}
                    value={apiKeys.murf_key}
                    onChange={(e) => handleChange('murf_key', e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your Murf API key"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('murf_key')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.murf_key ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your key at: <a href="https://murf.ai/" target="_blank" className="text-primary-600 hover:underline">murf.ai</a>
                </p>
              </div>

              {/* SerpAPI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SerpAPI Key (Web Search)
                </label>
                <div className="relative">
                  <input
                    type={showKeys.serpapi_key ? 'text' : 'password'}
                    value={apiKeys.serpapi_key}
                    onChange={(e) => handleChange('serpapi_key', e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your SerpAPI key"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('serpapi_key')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.serpapi_key ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your key at: <a href="https://serpapi.com/" target="_blank" className="text-primary-600 hover:underline">serpapi.com</a>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
              >
                Save API Keys
              </button>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">Security Notice</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your API keys are stored locally in your browser and are never sent to our servers. 
                    They are only used to connect directly to the AI services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
