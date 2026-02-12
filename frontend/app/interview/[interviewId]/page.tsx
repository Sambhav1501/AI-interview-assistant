// // // // 'use client';

// // // // import { useState, useEffect, useRef } from 'react';
// // // // import { useAuth } from '@/lib/context/AuthContextDemo';
// // // // import ProtectedRoute from '@/components/shared/ProtectedRoute';
// // // // import { useParams, useRouter } from 'next/navigation';
// // // // import toast from 'react-hot-toast';

// // // // export default function InterviewPage() {
// // // //   const { user, userProfile } = useAuth();
// // // //   const params = useParams();
// // // //   const router = useRouter();
// // // //   const interviewId = params.interviewId as string;

// // // //   // WebSocket
// // // //   const wsRef = useRef<WebSocket | null>(null);
// // // //   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
// // // //   const audioContextRef = useRef<AudioContext | null>(null);

// // // //   // Interview state
// // // //   const [isRecording, setIsRecording] = useState(false);
// // // //   const [isSpeaking, setIsSpeaking] = useState(false);
// // // //   const [aiSpeaking, setAiSpeaking] = useState(false);
// // // //   const [currentQuestion, setCurrentQuestion] = useState('');
// // // //   const [userTranscript, setUserTranscript] = useState('');
// // // //   const [partialTranscript, setPartialTranscript] = useState('');
// // // //   const [interviewStarted, setInterviewStarted] = useState(false);
// // // //   const [wsConnected, setWsConnected] = useState(false);
// // // //   const [audioQueue, setAudioQueue] = useState<string[]>([]);
// // // //   const [isPlayingAudio, setIsPlayingAudio] = useState(false);

// // // //   // Get API keys from localStorage
// // // //   const getApiKeys = () => ({
// // // //     assemblyai: localStorage.getItem('assemblyai_key') || '',
// // // //     groq: localStorage.getItem('groq_key') || '',
// // // //     murf: localStorage.getItem('murf_key') || '',
// // // //     serpapi: localStorage.getItem('serpapi_key') || ''
// // // //   });

// // // //   // Initialize WebSocket
// // // //   const connectWebSocket = () => {
// // // //     const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// // // //     const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
// // // //     const ws = new WebSocket(`${wsUrl}/interview`);

// // // //     ws.onopen = () => {
// // // //       console.log('WebSocket connected');
// // // //       setWsConnected(true);
      
// // // //       // Send API keys
// // // //       ws.send(JSON.stringify({
// // // //         type: 'config',
// // // //         keys: getApiKeys()
// // // //       }));
// // // //     };

// // // //     ws.onmessage = (event) => {
// // // //       try {
// // // //         const data = JSON.parse(event.data);
        
// // // //         switch (data.type) {
// // // //           case 'transcript_partial':
// // // //             setPartialTranscript(data.text);
// // // //             setIsSpeaking(true);
// // // //             break;
            
// // // //           case 'transcript_final':
// // // //             setUserTranscript(data.text);
// // // //             setPartialTranscript('');
// // // //             setIsSpeaking(false);
// // // //             break;
            
// // // //           case 'ai_response':
// // // //             setCurrentQuestion(data.text);
// // // //             setAiSpeaking(true);
// // // //             setTimeout(() => setAiSpeaking(false), 3000);
// // // //             break;
            
// // // //           case 'ai_audio':
// // // //             setAudioQueue(prev => [...prev, data.audio]);
// // // //             break;
            
// // // //           case 'error':
// // // //             toast.error(data.message);
// // // //             break;
// // // //         }
// // // //       } catch (error) {
// // // //         console.error('Error parsing WebSocket message:', error);
// // // //       }
// // // //     };

// // // //     ws.onerror = (error) => {
// // // //       console.error('WebSocket error:', error);
// // // //       toast.error('Connection error');
// // // //       setWsConnected(false);
// // // //     };

// // // //     ws.onclose = () => {
// // // //       console.log('WebSocket closed');
// // // //       setWsConnected(false);
// // // //     };

// // // //     wsRef.current = ws;
// // // //   };

// // // //   // Play audio queue
// // // //   useEffect(() => {
// // // //     if (audioQueue.length > 0 && !isPlayingAudio) {
// // // //       playNextAudio();
// // // //     }
// // // //   }, [audioQueue, isPlayingAudio]);

// // // //   const playNextAudio = async () => {
// // // //     if (audioQueue.length === 0) return;
    
// // // //     setIsPlayingAudio(true);
// // // //     setAiSpeaking(true);
    
// // // //     const audioBase64 = audioQueue[0];
    
// // // //     try {
// // // //       // Convert base64 to audio
// // // //       const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
// // // //       const audioBlob = new Blob([audioData], { type: 'audio/wav' });
// // // //       const audioUrl = URL.createObjectURL(audioBlob);
// // // //       const audio = new Audio(audioUrl);
      
// // // //       audio.onended = () => {
// // // //         setAudioQueue(prev => prev.slice(1));
// // // //         setIsPlayingAudio(false);
// // // //         setAiSpeaking(false);
// // // //         URL.revokeObjectURL(audioUrl);
// // // //       };
      
// // // //       await audio.play();
// // // //     } catch (error) {
// // // //       console.error('Error playing audio:', error);
// // // //       setAudioQueue(prev => prev.slice(1));
// // // //       setIsPlayingAudio(false);
// // // //       setAiSpeaking(false);
// // // //     }
// // // //   };

// // // //   // Start recording
// // // //   const startRecording = async () => {
// // // //     try {
// // // //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
// // // //       // Create audio context
// // // //       const audioContext = new AudioContext({ sampleRate: 16000 });
// // // //       const source = audioContext.createMediaStreamSource(stream);
// // // //       const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
// // // //       source.connect(processor);
// // // //       processor.connect(audioContext.destination);
      
// // // //       processor.onaudioprocess = (e) => {
// // // //         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
// // // //           const inputData = e.inputBuffer.getChannelData(0);
// // // //           const pcmData = new Int16Array(inputData.length);
          
// // // //           for (let i = 0; i < inputData.length; i++) {
// // // //             pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
// // // //           }
          
// // // //           wsRef.current.send(pcmData.buffer);
// // // //         }
// // // //       };
      
// // // //       audioContextRef.current = audioContext;
// // // //       setIsRecording(true);
// // // //       toast.success('Recording started');
      
// // // //     } catch (error) {
// // // //       console.error('Error starting recording:', error);
// // // //       toast.error('Could not access microphone');
// // // //     }
// // // //   };

// // // //   // Stop recording
// // // //   const stopRecording = () => {
// // // //     if (audioContextRef.current) {
// // // //       audioContextRef.current.close();
// // // //       audioContextRef.current = null;
// // // //     }
    
// // // //     setIsRecording(false);
// // // //     setIsSpeaking(false);
// // // //     toast.success('Recording stopped');
// // // //   };

// // // //   // Toggle recording
// // // //   const handleToggleRecording = () => {
// // // //     if (isRecording) {
// // // //       stopRecording();
// // // //     } else {
// // // //       startRecording();
// // // //     }
// // // //   };

// // // //   // Start interview
// // // //   const handleStartInterview = () => {
// // // //     // Check API keys
// // // //     const keys = getApiKeys();
// // // //     if (!keys.assemblyai || !keys.groq || !keys.murf) {
// // // //       toast.error('Please configure API keys in settings first');
// // // //       router.push('/dashboard');
// // // //       return;
// // // //     }

// // // //     connectWebSocket();
// // // //     setInterviewStarted(true);

// // // //     // Backend will automatically send the first question with audio
// // // //   };

// // // //   // End interview
// // // //   const handleEndInterview = () => {
// // // //     if (wsRef.current) {
// // // //       wsRef.current.close();
// // // //     }
    
// // // //     stopRecording();
    
// // // //     toast.success('Interview ended');
// // // //     router.push('/dashboard');
// // // //   };

// // // //   // Cleanup on unmount
// // // //   useEffect(() => {
// // // //     return () => {
// // // //       if (wsRef.current) {
// // // //         wsRef.current.close();
// // // //       }
// // // //       if (audioContextRef.current) {
// // // //         audioContextRef.current.close();
// // // //       }
// // // //     };
// // // //   }, []);

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-gray-900 flex flex-col">
// // // //         {/* Header */}
// // // //         <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
// // // //           <div className="flex items-center justify-between max-w-7xl mx-auto">
// // // //             <div className="flex items-center gap-3">
// // // //               <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
// // // //                 <span className="text-lg">🎙️</span>
// // // //               </div>
// // // //               <div>
// // // //                 <h1 className="text-white font-semibold">Mock Interview Session</h1>
// // // //                 <div className="flex items-center gap-2">
// // // //                   <p className="text-gray-400 text-sm">Interview ID: {interviewId}</p>
// // // //                   {wsConnected && (
// // // //                     <span className="flex items-center gap-1 text-green-400 text-xs">
// // // //                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
// // // //                       Connected
// // // //                     </span>
// // // //                   )}
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //             <div className="flex items-center gap-4">
// // // //               <div className="text-right">
// // // //                 <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
// // // //                 <p className="text-gray-400 text-xs">{user?.email}</p>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         {/* Main Interview Area */}
// // // //         <div className="flex-1 flex items-center justify-center p-6">
// // // //           <div className="max-w-6xl w-full">
// // // //             {!interviewStarted ? (
// // // //               /* Pre-Interview Screen */
// // // //               <div className="text-center">
// // // //                 <div className="mb-8">
// // // //                   <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
// // // //                     <span className="text-4xl">🎯</span>
// // // //                   </div>
// // // //                   <h2 className="text-3xl font-bold text-white mb-2">Ready to start your interview?</h2>
// // // //                   <p className="text-gray-400 mb-4">Make sure your microphone is working and you're in a quiet place.</p>
// // // //                   <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto mb-6">
// // // //                     <p className="text-yellow-400 text-sm">
// // // //                       ⚠️ This will use your API keys for AssemblyAI, Groq, and Murf
// // // //                     </p>
// // // //                   </div>
// // // //                 </div>
// // // //                 <button
// // // //                   onClick={handleStartInterview}
// // // //                   className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
// // // //                 >
// // // //                   Start Interview
// // // //                 </button>
// // // //               </div>
// // // //             ) : (
// // // //               /* Active Interview Screen */
// // // //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// // // //                 {/* AI Interviewer Box */}
// // // //                 <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
// // // //                   aiSpeaking ? 'ring-4 ring-green-500 ring-opacity-70 shadow-lg shadow-green-500/50' : 'ring-2 ring-gray-700'
// // // //                 }`}>
// // // //                   <div className="aspect-video relative">
// // // //                     {/* AI Avatar */}
// // // //                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
// // // //                       <div className={`transition-all duration-300 ${aiSpeaking ? 'scale-110' : 'scale-100'}`}>
// // // //                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
// // // //                           <span className="text-6xl">🤖</span>
// // // //                         </div>
// // // //                       </div>
// // // //                     </div>

// // // //                     {/* Speaking Indicator */}
// // // //                     {aiSpeaking && (
// // // //                       <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500 px-3 py-1.5 rounded-full">
// // // //                         <div className="flex gap-1">
// // // //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
// // // //                           <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
// // // //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
// // // //                         </div>
// // // //                         <span className="text-white text-sm font-medium">Speaking...</span>
// // // //                       </div>
// // // //                     )}

// // // //                     {/* Name Tag */}
// // // //                     <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
// // // //                       <p className="text-white text-sm font-medium">AI Interviewer</p>
// // // //                     </div>
// // // //                   </div>
// // // //                 </div>

// // // //                 {/* Your Video Box */}
// // // //                 <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
// // // //                   isSpeaking ? 'ring-4 ring-blue-500 ring-opacity-70 shadow-lg shadow-blue-500/50' : 'ring-2 ring-gray-700'
// // // //                 }`}>
// // // //                   <div className="aspect-video relative">
// // // //                     {/* User Avatar */}
// // // //                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
// // // //                       <div className={`transition-all duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
// // // //                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-5xl font-bold">
// // // //                           {userProfile?.displayName?.charAt(0).toUpperCase()}
// // // //                         </div>
// // // //                       </div>
// // // //                     </div>

// // // //                     {/* Speaking Indicator */}
// // // //                     {isSpeaking && (
// // // //                       <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500 px-3 py-1.5 rounded-full">
// // // //                         <div className="flex gap-1">
// // // //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
// // // //                           <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
// // // //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
// // // //                         </div>
// // // //                         <span className="text-white text-sm font-medium">Speaking...</span>
// // // //                       </div>
// // // //                     )}

// // // //                     {/* Name Tag */}
// // // //                     <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
// // // //                       <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
// // // //                     </div>

// // // //                     {/* Muted/Recording Indicator */}
// // // //                     {!isRecording && (
// // // //                       <div className="absolute top-4 right-4 bg-red-500 px-3 py-1.5 rounded-full">
// // // //                         <span className="text-white text-xs font-medium">🔇 Muted</span>
// // // //                       </div>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>

// // // //         {/* Question Display */}
// // // //         {interviewStarted && currentQuestion && (
// // // //           <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
// // // //             <div className="max-w-4xl mx-auto">
// // // //               <div className="bg-gray-700 rounded-xl p-4">
// // // //                 <p className="text-gray-400 text-sm mb-1">Current Question:</p>
// // // //                 <p className="text-white text-lg font-medium">{currentQuestion}</p>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         )}

// // // //         {/* Live Transcript Display */}
// // // //         {interviewStarted && (partialTranscript || userTranscript) && (
// // // //           <div className="bg-gray-800 px-6 py-3">
// // // //             <div className="max-w-4xl mx-auto">
// // // //               <div className="bg-gray-700 rounded-lg p-3">
// // // //                 <p className="text-gray-400 text-xs mb-1">
// // // //                   {partialTranscript ? 'Listening...' : 'Your Response:'}
// // // //                 </p>
// // // //                 <p className="text-white text-sm">
// // // //                   {partialTranscript || userTranscript}
// // // //                 </p>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         )}

// // // //         {/* Bottom Controls */}
// // // //         {interviewStarted && (
// // // //           <div className="bg-gray-800 border-t border-gray-700 px-6 py-6">
// // // //             <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
// // // //               {/* Microphone Button */}
// // // //               <button
// // // //                 onClick={handleToggleRecording}
// // // //                 disabled={!wsConnected}
// // // //                 className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
// // // //                   isRecording 
// // // //                     ? 'bg-red-500 hover:bg-red-600' 
// // // //                     : 'bg-gray-700 hover:bg-gray-600'
// // // //                 }`}
// // // //                 title={isRecording ? 'Stop Recording' : 'Start Recording'}
// // // //               >
// // // //                 {isRecording ? (
// // // //                   <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
// // // //                     <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
// // // //                   </svg>
// // // //                 ) : (
// // // //                   <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
// // // //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
// // // //                   </svg>
// // // //                 )}
// // // //               </button>

// // // //               {/* End Interview Button */}
// // // //               <button
// // // //                 onClick={handleEndInterview}
// // // //                 className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
// // // //               >
// // // //                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// // // //                 </svg>
// // // //                 End Interview
// // // //               </button>
// // // //             </div>
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }

// // // //////////////////////////////////////////////////////////////////////////////////////////////////////////

// // // 'use client';

// // // import { useState, useEffect, useRef } from 'react';
// // // import { useAuth } from '@/lib/context/AuthContextDemo';
// // // import ProtectedRoute from '@/components/shared/ProtectedRoute';
// // // import { useParams, useRouter } from 'next/navigation';
// // // import toast from 'react-hot-toast';

// // // export default function InterviewPage() {
// // //   const { user, userProfile } = useAuth();
// // //   const params = useParams();
// // //   const router = useRouter();
// // //   const interviewId = params.interviewId as string;

// // //   // WebSocket
// // //   const wsRef = useRef<WebSocket | null>(null);
// // //   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
// // //   const audioContextRef = useRef<AudioContext | null>(null);

// // //   // Interview state
// // //   const [isRecording, setIsRecording] = useState(false);
// // //   const [isSpeaking, setIsSpeaking] = useState(false);
// // //   const [aiSpeaking, setAiSpeaking] = useState(false);
// // //   const [currentQuestion, setCurrentQuestion] = useState('');
// // //   const [userTranscript, setUserTranscript] = useState('');
// // //   const [partialTranscript, setPartialTranscript] = useState('');
// // //   const [interviewStarted, setInterviewStarted] = useState(false);
// // //   const [wsConnected, setWsConnected] = useState(false);
// // //   const [audioQueue, setAudioQueue] = useState<string[]>([]);
// // //   const [isPlayingAudio, setIsPlayingAudio] = useState(false);

// // //   // Get API keys from localStorage
// // //   const getApiKeys = () => ({
// // //     assemblyai: localStorage.getItem('assemblyai_key') || '',
// // //     groq: localStorage.getItem('groq_key') || '',
// // //     murf: localStorage.getItem('murf_key') || '',
// // //     serpapi: localStorage.getItem('serpapi_key') || ''
// // //   });

// // //   // Initialize WebSocket
// // //   const connectWebSocket = () => {
// // //     const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// // //     const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
// // //     const ws = new WebSocket(`${wsUrl}/interview`);

// // //     ws.onopen = () => {
// // //       console.log('WebSocket connected');
// // //       setWsConnected(true);
      
// // //       // Send API keys
// // //       ws.send(JSON.stringify({
// // //         type: 'config',
// // //         keys: getApiKeys()
// // //       }));
// // //     };

// // //     ws.onmessage = (event) => {
// // //       try {
// // //         const data = JSON.parse(event.data);
        
// // //         switch (data.type) {
// // //           case 'transcript_partial':
// // //             setPartialTranscript(data.text);
// // //             setIsSpeaking(true);
// // //             break;
            
// // //           case 'transcript_final':
// // //             setUserTranscript(data.text);
// // //             setPartialTranscript('');
// // //             setIsSpeaking(false);
// // //             break;
            
// // //           case 'ai_response':
// // //             setCurrentQuestion(data.text);
// // //             setAiSpeaking(true);
// // //             setTimeout(() => setAiSpeaking(false), 3000);
// // //             break;
            
// // //           // Handle both "ai_audio" and "audio" types, and both .audio / .b64 fields
// // //           case 'ai_audio':
// // //           case 'audio': {
// // //             const audioPayload = data.audio || data.b64;
// // //             if (audioPayload) {
// // //               setAudioQueue(prev => [...prev, audioPayload]);
// // //             } else {
// // //               console.warn('Audio message received but payload missing:', data);
// // //             }
// // //             break;
// // //           }
            
// // //           case 'error':
// // //             toast.error(data.message);
// // //             break;

// // //           default:
// // //             console.log('Unhandled WebSocket message type:', data.type, '| full payload:', data);
// // //             break;
// // //         }
// // //       } catch (error) {
// // //         console.error('Error parsing WebSocket message:', error);
// // //       }
// // //     };

// // //     ws.onerror = (error) => {
// // //       console.error('WebSocket error:', error);
// // //       toast.error('Connection error');
// // //       setWsConnected(false);
// // //     };

// // //     ws.onclose = () => {
// // //       console.log('WebSocket closed');
// // //       setWsConnected(false);
// // //     };

// // //     wsRef.current = ws;
// // //   };

// // //   // Play audio queue
// // //   useEffect(() => {
// // //     if (audioQueue.length > 0 && !isPlayingAudio) {
// // //       playNextAudio();
// // //     }
// // //   }, [audioQueue, isPlayingAudio]);

// // //   const playNextAudio = async () => {
// // //     if (audioQueue.length === 0) return;
    
// // //     setIsPlayingAudio(true);
// // //     setAiSpeaking(true);
    
// // //     const audioBase64 = audioQueue[0];
    
// // //     try {
// // //       // Convert base64 to audio
// // //       const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
// // //       const audioBlob = new Blob([audioData], { type: 'audio/wav' });
// // //       const audioUrl = URL.createObjectURL(audioBlob);
// // //       const audio = new Audio(audioUrl);
      
// // //       audio.onended = () => {
// // //         setAudioQueue(prev => prev.slice(1));
// // //         setIsPlayingAudio(false);
// // //         setAiSpeaking(false);
// // //         URL.revokeObjectURL(audioUrl);
// // //       };
      
// // //       await audio.play();
// // //     } catch (error) {
// // //       console.error('Error playing audio:', error);
// // //       setAudioQueue(prev => prev.slice(1));
// // //       setIsPlayingAudio(false);
// // //       setAiSpeaking(false);
// // //     }
// // //   };

// // //   // Start recording
// // //   const startRecording = async () => {
// // //     try {
// // //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
// // //       // Create audio context
// // //       const audioContext = new AudioContext({ sampleRate: 16000 });
// // //       const source = audioContext.createMediaStreamSource(stream);
// // //       const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
// // //       source.connect(processor);
// // //       processor.connect(audioContext.destination);
      
// // //       processor.onaudioprocess = (e) => {
// // //         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
// // //           const inputData = e.inputBuffer.getChannelData(0);
// // //           const pcmData = new Int16Array(inputData.length);
          
// // //           for (let i = 0; i < inputData.length; i++) {
// // //             pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
// // //           }
          
// // //           wsRef.current.send(pcmData.buffer);
// // //         }
// // //       };
      
// // //       audioContextRef.current = audioContext;
// // //       setIsRecording(true);
// // //       toast.success('Recording started');
      
// // //     } catch (error) {
// // //       console.error('Error starting recording:', error);
// // //       toast.error('Could not access microphone');
// // //     }
// // //   };

// // //   // Stop recording
// // //   const stopRecording = () => {
// // //     if (audioContextRef.current) {
// // //       audioContextRef.current.close();
// // //       audioContextRef.current = null;
// // //     }
    
// // //     setIsRecording(false);
// // //     setIsSpeaking(false);
// // //     toast.success('Recording stopped');
// // //   };

// // //   // Toggle recording
// // //   const handleToggleRecording = () => {
// // //     if (isRecording) {
// // //       stopRecording();
// // //     } else {
// // //       startRecording();
// // //     }
// // //   };

// // //   // Start interview
// // //   const handleStartInterview = () => {
// // //     // Check API keys
// // //     const keys = getApiKeys();
// // //     if (!keys.assemblyai || !keys.groq || !keys.murf) {
// // //       toast.error('Please configure API keys in settings first');
// // //       router.push('/dashboard');
// // //       return;
// // //     }

// // //     connectWebSocket();
// // //     setInterviewStarted(true);

// // //     // Backend will automatically send the first question with audio
// // //   };

// // //   // End interview
// // //   const handleEndInterview = () => {
// // //     if (wsRef.current) {
// // //       wsRef.current.close();
// // //     }
    
// // //     stopRecording();
    
// // //     toast.success('Interview ended');
// // //     router.push('/dashboard');
// // //   };

// // //   // Cleanup on unmount
// // //   useEffect(() => {
// // //     return () => {
// // //       if (wsRef.current) {
// // //         wsRef.current.close();
// // //       }
// // //       if (audioContextRef.current) {
// // //         audioContextRef.current.close();
// // //       }
// // //     };
// // //   }, []);

// // //   return (
// // //     <ProtectedRoute>
// // //       <div className="min-h-screen bg-gray-900 flex flex-col">
// // //         {/* Header */}
// // //         <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
// // //           <div className="flex items-center justify-between max-w-7xl mx-auto">
// // //             <div className="flex items-center gap-3">
// // //               <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
// // //                 <span className="text-lg">🎙️</span>
// // //               </div>
// // //               <div>
// // //                 <h1 className="text-white font-semibold">Mock Interview Session</h1>
// // //                 <div className="flex items-center gap-2">
// // //                   <p className="text-gray-400 text-sm">Interview ID: {interviewId}</p>
// // //                   {wsConnected && (
// // //                     <span className="flex items-center gap-1 text-green-400 text-xs">
// // //                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
// // //                       Connected
// // //                     </span>
// // //                   )}
// // //                 </div>
// // //               </div>
// // //             </div>
// // //             <div className="flex items-center gap-4">
// // //               <div className="text-right">
// // //                 <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
// // //                 <p className="text-gray-400 text-xs">{user?.email}</p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Main Interview Area */}
// // //         <div className="flex-1 flex items-center justify-center p-6">
// // //           <div className="max-w-6xl w-full">
// // //             {!interviewStarted ? (
// // //               /* Pre-Interview Screen */
// // //               <div className="text-center">
// // //                 <div className="mb-8">
// // //                   <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
// // //                     <span className="text-4xl">🎯</span>
// // //                   </div>
// // //                   <h2 className="text-3xl font-bold text-white mb-2">Ready to start your interview?</h2>
// // //                   <p className="text-gray-400 mb-4">Make sure your microphone is working and you're in a quiet place.</p>
// // //                   <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto mb-6">
// // //                     <p className="text-yellow-400 text-sm">
// // //                       ⚠️ This will use your API keys for AssemblyAI, Groq, and Murf
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //                 <button
// // //                   onClick={handleStartInterview}
// // //                   className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
// // //                 >
// // //                   Start Interview
// // //                 </button>
// // //               </div>
// // //             ) : (
// // //               /* Active Interview Screen */
// // //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// // //                 {/* AI Interviewer Box */}
// // //                 <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
// // //                   aiSpeaking ? 'ring-4 ring-green-500 ring-opacity-70 shadow-lg shadow-green-500/50' : 'ring-2 ring-gray-700'
// // //                 }`}>
// // //                   <div className="aspect-video relative">
// // //                     {/* AI Avatar */}
// // //                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
// // //                       <div className={`transition-all duration-300 ${aiSpeaking ? 'scale-110' : 'scale-100'}`}>
// // //                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
// // //                           <span className="text-6xl">🤖</span>
// // //                         </div>
// // //                       </div>
// // //                     </div>

// // //                     {/* Speaking Indicator */}
// // //                     {aiSpeaking && (
// // //                       <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500 px-3 py-1.5 rounded-full">
// // //                         <div className="flex gap-1">
// // //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
// // //                           <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
// // //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
// // //                         </div>
// // //                         <span className="text-white text-sm font-medium">Speaking...</span>
// // //                       </div>
// // //                     )}

// // //                     {/* Name Tag */}
// // //                     <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
// // //                       <p className="text-white text-sm font-medium">AI Interviewer</p>
// // //                     </div>
// // //                   </div>
// // //                 </div>

// // //                 {/* Your Video Box */}
// // //                 <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
// // //                   isSpeaking ? 'ring-4 ring-blue-500 ring-opacity-70 shadow-lg shadow-blue-500/50' : 'ring-2 ring-gray-700'
// // //                 }`}>
// // //                   <div className="aspect-video relative">
// // //                     {/* User Avatar */}
// // //                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
// // //                       <div className={`transition-all duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
// // //                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-5xl font-bold">
// // //                           {userProfile?.displayName?.charAt(0).toUpperCase()}
// // //                         </div>
// // //                       </div>
// // //                     </div>

// // //                     {/* Speaking Indicator */}
// // //                     {isSpeaking && (
// // //                       <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500 px-3 py-1.5 rounded-full">
// // //                         <div className="flex gap-1">
// // //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
// // //                           <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
// // //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
// // //                         </div>
// // //                         <span className="text-white text-sm font-medium">Speaking...</span>
// // //                       </div>
// // //                     )}

// // //                     {/* Name Tag */}
// // //                     <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
// // //                       <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
// // //                     </div>

// // //                     {/* Muted/Recording Indicator */}
// // //                     {!isRecording && (
// // //                       <div className="absolute top-4 right-4 bg-red-500 px-3 py-1.5 rounded-full">
// // //                         <span className="text-white text-xs font-medium">🔇 Muted</span>
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>

// // //         {/* Question Display */}
// // //         {interviewStarted && currentQuestion && (
// // //           <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
// // //             <div className="max-w-4xl mx-auto">
// // //               <div className="bg-gray-700 rounded-xl p-4">
// // //                 <p className="text-gray-400 text-sm mb-1">Current Question:</p>
// // //                 <p className="text-white text-lg font-medium">{currentQuestion}</p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* Live Transcript Display */}
// // //         {interviewStarted && (partialTranscript || userTranscript) && (
// // //           <div className="bg-gray-800 px-6 py-3">
// // //             <div className="max-w-4xl mx-auto">
// // //               <div className="bg-gray-700 rounded-lg p-3">
// // //                 <p className="text-gray-400 text-xs mb-1">
// // //                   {partialTranscript ? 'Listening...' : 'Your Response:'}
// // //                 </p>
// // //                 <p className="text-white text-sm">
// // //                   {partialTranscript || userTranscript}
// // //                 </p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* Bottom Controls */}
// // //         {interviewStarted && (
// // //           <div className="bg-gray-800 border-t border-gray-700 px-6 py-6">
// // //             <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
// // //               {/* Microphone Button */}
// // //               <button
// // //                 onClick={handleToggleRecording}
// // //                 disabled={!wsConnected}
// // //                 className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
// // //                   isRecording 
// // //                     ? 'bg-red-500 hover:bg-red-600' 
// // //                     : 'bg-gray-700 hover:bg-gray-600'
// // //                 }`}
// // //                 title={isRecording ? 'Stop Recording' : 'Start Recording'}
// // //               >
// // //                 {isRecording ? (
// // //                   <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
// // //                     <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
// // //                   </svg>
// // //                 ) : (
// // //                   <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
// // //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
// // //                   </svg>
// // //                 )}
// // //               </button>

// // //               {/* End Interview Button */}
// // //               <button
// // //                 onClick={handleEndInterview}
// // //                 className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
// // //               >
// // //                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// // //                 </svg>
// // //                 End Interview
// // //               </button>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>
// // //     </ProtectedRoute>
// // //   );
// // // }


// // // //////////////////////////////////////////////////////////////////////////////////////////////////////////

// // 'use client';

// // import { useState, useEffect, useRef } from 'react';
// // import { useAuth } from '@/lib/context/AuthContextDemo';
// // import ProtectedRoute from '@/components/shared/ProtectedRoute';
// // import { useParams, useRouter } from 'next/navigation';
// // import toast from 'react-hot-toast';

// // export default function InterviewPage() {
// //   const { user, userProfile } = useAuth();
// //   const params = useParams();
// //   const router = useRouter();
// //   const interviewId = params.interviewId as string;

// //   // WebSocket
// //   const wsRef = useRef<WebSocket | null>(null);
// //   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
// //   const audioContextRef = useRef<AudioContext | null>(null);

// //   // Interview state
// //   const [isRecording, setIsRecording] = useState(false);
// //   const [isSpeaking, setIsSpeaking] = useState(false);
// //   const [aiSpeaking, setAiSpeaking] = useState(false);
// //   const [currentQuestion, setCurrentQuestion] = useState('');
// //   const [userTranscript, setUserTranscript] = useState('');
// //   const [partialTranscript, setPartialTranscript] = useState('');
// //   const [interviewStarted, setInterviewStarted] = useState(false);
// //   const [wsConnected, setWsConnected] = useState(false);
// //   const [audioQueue, setAudioQueue] = useState<string[]>([]);
// //   const [isPlayingAudio, setIsPlayingAudio] = useState(false);

// //   // Report state
// //   const [interviewReport, setInterviewReport] = useState<string | null>(null);
// //   const [isGeneratingReport, setIsGeneratingReport] = useState(false);

// //   // Get API keys from localStorage
// //   const getApiKeys = () => ({
// //     assemblyai: localStorage.getItem('assemblyai_key') || '',
// //     groq: localStorage.getItem('groq_key') || '',
// //     murf: localStorage.getItem('murf_key') || '',
// //     serpapi: localStorage.getItem('serpapi_key') || ''
// //   });

// //   // Initialize WebSocket
// //   const connectWebSocket = () => {
// //     const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
// //     const ws = new WebSocket(`${wsUrl}/interview`);

// //     ws.onopen = () => {
// //       console.log('WebSocket connected');
// //       setWsConnected(true);
// //       ws.send(JSON.stringify({ type: 'config', keys: getApiKeys() }));
// //     };

// //     ws.onmessage = (event) => {
// //       try {
// //         const data = JSON.parse(event.data);

// //         switch (data.type) {
// //           case 'transcript_partial':
// //             setPartialTranscript(data.text);
// //             setIsSpeaking(true);
// //             break;

// //           case 'transcript_final':
// //             setUserTranscript(data.text);
// //             setPartialTranscript('');
// //             setIsSpeaking(false);
// //             break;

// //           case 'ai_response':
// //             setCurrentQuestion(data.text);
// //             setAiSpeaking(true);
// //             setTimeout(() => setAiSpeaking(false), 3000);
// //             break;

// //           // Handle both "ai_audio" and "audio" types, and both .audio / .b64 fields
// //           case 'ai_audio':
// //           case 'audio': {
// //             const audioPayload = data.audio || data.b64;
// //             if (audioPayload) {
// //               setAudioQueue(prev => [...prev, audioPayload]);
// //             } else {
// //               console.warn('Audio message received but payload missing:', data);
// //             }
// //             break;
// //           }

// //           // Backend finished — report is ready
// //           case 'interview_report':
// //             setIsGeneratingReport(false);
// //             setInterviewReport(data.report);
// //             // Stop recording & close socket cleanly
// //             stopRecording();
// //             if (wsRef.current) {
// //               wsRef.current.close();
// //             }
// //             break;

// //           case 'error':
// //             toast.error(data.message);
// //             break;

// //           default:
// //             console.log('Unhandled WebSocket message type:', data.type, '| full payload:', data);
// //             break;
// //         }
// //       } catch (error) {
// //         console.error('Error parsing WebSocket message:', error);
// //       }
// //     };

// //     ws.onerror = (error) => {
// //       console.error('WebSocket error:', error);
// //       toast.error('Connection error');
// //       setWsConnected(false);
// //     };

// //     ws.onclose = () => {
// //       console.log('WebSocket closed');
// //       setWsConnected(false);
// //     };

// //     wsRef.current = ws;
// //   };

// //   // Play audio queue
// //   useEffect(() => {
// //     if (audioQueue.length > 0 && !isPlayingAudio) {
// //       playNextAudio();
// //     }
// //   }, [audioQueue, isPlayingAudio]);

// //   const playNextAudio = async () => {
// //     if (audioQueue.length === 0) return;
// //     setIsPlayingAudio(true);
// //     setAiSpeaking(true);

// //     const audioBase64 = audioQueue[0];
// //     try {
// //       const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
// //       const audioBlob = new Blob([audioData], { type: 'audio/wav' });
// //       const audioUrl = URL.createObjectURL(audioBlob);
// //       const audio = new Audio(audioUrl);

// //       audio.onended = () => {
// //         setAudioQueue(prev => prev.slice(1));
// //         setIsPlayingAudio(false);
// //         setAiSpeaking(false);
// //         URL.revokeObjectURL(audioUrl);
// //       };

// //       await audio.play();
// //     } catch (error) {
// //       console.error('Error playing audio:', error);
// //       setAudioQueue(prev => prev.slice(1));
// //       setIsPlayingAudio(false);
// //       setAiSpeaking(false);
// //     }
// //   };

// //   // Start recording
// //   const startRecording = async () => {
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //       const audioContext = new AudioContext({ sampleRate: 16000 });
// //       const source = audioContext.createMediaStreamSource(stream);
// //       const processor = audioContext.createScriptProcessor(4096, 1, 1);

// //       source.connect(processor);
// //       processor.connect(audioContext.destination);

// //       processor.onaudioprocess = (e) => {
// //         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
// //           const inputData = e.inputBuffer.getChannelData(0);
// //           const pcmData = new Int16Array(inputData.length);
// //           for (let i = 0; i < inputData.length; i++) {
// //             pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
// //           }
// //           wsRef.current.send(pcmData.buffer);
// //         }
// //       };

// //       audioContextRef.current = audioContext;
// //       setIsRecording(true);
// //       toast.success('Recording started');
// //     } catch (error) {
// //       console.error('Error starting recording:', error);
// //       toast.error('Could not access microphone');
// //     }
// //   };

// //   // Stop recording
// //   const stopRecording = () => {
// //     if (audioContextRef.current) {
// //       audioContextRef.current.close();
// //       audioContextRef.current = null;
// //     }
// //     setIsRecording(false);
// //     setIsSpeaking(false);
// //   };

// //   // Toggle recording
// //   const handleToggleRecording = () => {
// //     if (isRecording) {
// //       stopRecording();
// //     } else {
// //       startRecording();
// //     }
// //   };

// //   // Start interview
// //   const handleStartInterview = () => {
// //     const keys = getApiKeys();
// //     if (!keys.assemblyai || !keys.groq || !keys.murf) {
// //       toast.error('Please configure API keys in settings first');
// //       router.push('/dashboard');
// //       return;
// //     }
// //     connectWebSocket();
// //     setInterviewStarted(true);
// //   };

// //   // End interview (button click) — tell the backend to generate the report
// //   const handleEndInterview = () => {
// //     setIsGeneratingReport(true);
// //     // The backend will detect disconnect or we can just close;
// //     // but to get the report we should let the backend finish naturally.
// //     // For the button, just close — backend will still send the report if it already started.
// //     // A cleaner path: close the socket and show a manual "ended" state.
// //     stopRecording();
// //     if (wsRef.current) {
// //       wsRef.current.close();
// //     }
// //     // If no report came back, show a fallback after a moment
// //     setTimeout(() => {
// //       if (!interviewReport) {
// //         setIsGeneratingReport(false);
// //         //toast.info('Interview ended. No report was generated.');
// //         toast('Interview ended. No report was generated.');
// //       }
// //     }, 3000);
// //   };

// //   // Cleanup on unmount
// //   useEffect(() => {
// //     return () => {
// //       if (wsRef.current) wsRef.current.close();
// //       if (audioContextRef.current) audioContextRef.current.close();
// //     };
// //   }, []);

// //   // -----------------------------------------------------------------------
// //   // REPORT SCREEN
// //   // -----------------------------------------------------------------------
// //   if (interviewReport) {
// //     // Parse sections from the report for styled rendering
// //     const sections = interviewReport.split(/\n(?=\d+\.|#{1,3}\s)/);

// //     return (
// //       <ProtectedRoute>
// //         <div className="min-h-screen bg-gray-900 text-white">
// //           {/* Header */}
// //           <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
// //             <div className="max-w-4xl mx-auto flex items-center justify-between">
// //               <div className="flex items-center gap-3">
// //                 <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
// //                   <span className="text-lg">📊</span>
// //                 </div>
// //                 <h1 className="text-white font-semibold text-lg">Interview Feedback Report</h1>
// //               </div>
// //               <button
// //                 onClick={() => router.push('/dashboard')}
// //                 className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
// //               >
// //                 Back to Dashboard
// //               </button>
// //             </div>
// //           </div>

// //           {/* Report Body */}
// //           <div className="max-w-4xl mx-auto px-6 py-8">
// //             {/* Score card — extract and highlight if present */}
// //             {interviewReport.match(/OVERALL SCORE[:\s]*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i) && (
// //               <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 mb-8 text-center">
// //                 <p className="text-purple-200 text-sm uppercase tracking-widest mb-1">Overall Score</p>
// //                 <p className="text-6xl font-bold text-white">
// //                   {interviewReport.match(/OVERALL SCORE[:\s]*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i)![1]}
// //                   <span className="text-2xl text-purple-300 ml-1">/ 10</span>
// //                 </p>
// //               </div>
// //             )}

// //             {/* Full report as formatted text */}
// //             <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
// //               <div className="prose prose-invert prose-sm max-w-none">
// //                 {interviewReport.split('\n').map((line, idx) => {
// //                   const trimmed = line.trim();
// //                   // Section headers (numbered like "1. STRENGTHS" or "## STRENGTHS")
// //                   if (/^(\d+\.|#{1,3})\s/.test(trimmed)) {
// //                     return (
// //                       <h3 key={idx} className="text-purple-400 font-semibold text-base mt-6 mb-2 border-b border-gray-700 pb-1">
// //                         {trimmed.replace(/^(\d+\.\s*|#{1,3}\s*)/, '')}
// //                       </h3>
// //                     );
// //                   }
// //                   // Bullet points
// //                   if (/^[-•*]\s/.test(trimmed)) {
// //                     return (
// //                       <p key={idx} className="text-gray-300 text-sm ml-4 mb-1 flex gap-2">
// //                         <span className="text-purple-400 mt-0.5">●</span>
// //                         <span>{trimmed.replace(/^[-•*]\s*/, '')}</span>
// //                       </p>
// //                     );
// //                   }
// //                   // Empty line
// //                   if (!trimmed) return <div key={idx} className="h-2" />;
// //                   // Normal paragraph
// //                   return (
// //                     <p key={idx} className="text-gray-300 text-sm mb-2">{trimmed}</p>
// //                   );
// //                 })}
// //               </div>
// //             </div>

// //             {/* Actions */}
// //             <div className="flex gap-4 mt-8 justify-center">
// //               <button
// //                 onClick={() => router.push('/dashboard')}
// //                 className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium hover:from-primary-700 hover:to-purple-700 transition-all"
// //               >
// //                 Back to Dashboard
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </ProtectedRoute>
// //     );
// //   }

// //   // -----------------------------------------------------------------------
// //   // GENERATING REPORT SCREEN (loading state)
// //   // -----------------------------------------------------------------------
// //   if (isGeneratingReport) {
// //     return (
// //       <ProtectedRoute>
// //         <div className="min-h-screen bg-gray-900 flex items-center justify-center">
// //           <div className="text-center">
// //             <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
// //               <span className="text-4xl">📝</span>
// //             </div>
// //             <h2 className="text-white text-2xl font-bold mb-2">Generating Your Report…</h2>
// //             <p className="text-gray-400 text-sm">Analyzing your interview performance…</p>
// //             <div className="flex justify-center gap-2 mt-6">
// //               <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
// //               <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
// //               <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
// //             </div>
// //           </div>
// //         </div>
// //       </ProtectedRoute>
// //     );
// //   }

// //   // -----------------------------------------------------------------------
// //   // MAIN INTERVIEW SCREEN (unchanged layout, same as before)
// //   // -----------------------------------------------------------------------
// //   return (
// //     <ProtectedRoute>
// //       <div className="min-h-screen bg-gray-900 flex flex-col">
// //         {/* Header */}
// //         <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
// //           <div className="flex items-center justify-between max-w-7xl mx-auto">
// //             <div className="flex items-center gap-3">
// //               <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
// //                 <span className="text-lg">🎙️</span>
// //               </div>
// //               <div>
// //                 <h1 className="text-white font-semibold">Mock Interview Session</h1>
// //                 <div className="flex items-center gap-2">
// //                   <p className="text-gray-400 text-sm">Interview ID: {interviewId}</p>
// //                   {wsConnected && (
// //                     <span className="flex items-center gap-1 text-green-400 text-xs">
// //                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
// //                       Connected
// //                     </span>
// //                   )}
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="flex items-center gap-4">
// //               <div className="text-right">
// //                 <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
// //                 <p className="text-gray-400 text-xs">{user?.email}</p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Main Interview Area */}
// //         <div className="flex-1 flex items-center justify-center p-6">
// //           <div className="max-w-6xl w-full">
// //             {!interviewStarted ? (
// //               /* Pre-Interview Screen */
// //               <div className="text-center">
// //                 <div className="mb-8">
// //                   <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
// //                     <span className="text-4xl">🎯</span>
// //                   </div>
// //                   <h2 className="text-3xl font-bold text-white mb-2">Ready to start your interview?</h2>
// //                   <p className="text-gray-400 mb-4">Make sure your microphone is working and you're in a quiet place.</p>
// //                   <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto mb-6">
// //                     <p className="text-yellow-400 text-sm">
// //                       ⚠️ This will use your API keys for AssemblyAI, Groq, and Murf
// //                     </p>
// //                   </div>
// //                 </div>
// //                 <button
// //                   onClick={handleStartInterview}
// //                   className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
// //                 >
// //                   Start Interview
// //                 </button>
// //               </div>
// //             ) : (
// //               /* Active Interview Screen */
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 {/* AI Interviewer Box */}
// //                 <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
// //                   aiSpeaking ? 'ring-4 ring-green-500 ring-opacity-70 shadow-lg shadow-green-500/50' : 'ring-2 ring-gray-700'
// //                 }`}>
// //                   <div className="aspect-video relative">
// //                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
// //                       <div className={`transition-all duration-300 ${aiSpeaking ? 'scale-110' : 'scale-100'}`}>
// //                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
// //                           <span className="text-6xl">🤖</span>
// //                         </div>
// //                       </div>
// //                     </div>
// //                     {aiSpeaking && (
// //                       <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500 px-3 py-1.5 rounded-full">
// //                         <div className="flex gap-1">
// //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
// //                           <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
// //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
// //                         </div>
// //                         <span className="text-white text-sm font-medium">Speaking...</span>
// //                       </div>
// //                     )}
// //                     <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
// //                       <p className="text-white text-sm font-medium">AI Interviewer</p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Your Video Box */}
// //                 <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
// //                   isSpeaking ? 'ring-4 ring-blue-500 ring-opacity-70 shadow-lg shadow-blue-500/50' : 'ring-2 ring-gray-700'
// //                 }`}>
// //                   <div className="aspect-video relative">
// //                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
// //                       <div className={`transition-all duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
// //                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-5xl font-bold">
// //                           {userProfile?.displayName?.charAt(0).toUpperCase()}
// //                         </div>
// //                       </div>
// //                     </div>
// //                     {isSpeaking && (
// //                       <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500 px-3 py-1.5 rounded-full">
// //                         <div className="flex gap-1">
// //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
// //                           <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
// //                           <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
// //                         </div>
// //                         <span className="text-white text-sm font-medium">Speaking...</span>
// //                       </div>
// //                     )}
// //                     <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
// //                       <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
// //                     </div>
// //                     {!isRecording && (
// //                       <div className="absolute top-4 right-4 bg-red-500 px-3 py-1.5 rounded-full">
// //                         <span className="text-white text-xs font-medium">🔇 Muted</span>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Question Display */}
// //         {interviewStarted && currentQuestion && (
// //           <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
// //             <div className="max-w-4xl mx-auto">
// //               <div className="bg-gray-700 rounded-xl p-4">
// //                 <p className="text-gray-400 text-sm mb-1">Current Question:</p>
// //                 <p className="text-white text-lg font-medium">{currentQuestion}</p>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Live Transcript Display */}
// //         {interviewStarted && (partialTranscript || userTranscript) && (
// //           <div className="bg-gray-800 px-6 py-3">
// //             <div className="max-w-4xl mx-auto">
// //               <div className="bg-gray-700 rounded-lg p-3">
// //                 <p className="text-gray-400 text-xs mb-1">
// //                   {partialTranscript ? 'Listening...' : 'Your Response:'}
// //                 </p>
// //                 <p className="text-white text-sm">
// //                   {partialTranscript || userTranscript}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Bottom Controls */}
// //         {interviewStarted && (
// //           <div className="bg-gray-800 border-t border-gray-700 px-6 py-6">
// //             <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
// //               {/* Microphone Button */}
// //               <button
// //                 onClick={handleToggleRecording}
// //                 disabled={!wsConnected}
// //                 className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
// //                   isRecording
// //                     ? 'bg-red-500 hover:bg-red-600'
// //                     : 'bg-gray-700 hover:bg-gray-600'
// //                 }`}
// //                 title={isRecording ? 'Stop Recording' : 'Start Recording'}
// //               >
// //                 {isRecording ? (
// //                   <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
// //                   </svg>
// //                 ) : (
// //                   <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
// //                   </svg>
// //                 )}
// //               </button>

// //               {/* End Interview Button */}
// //               <button
// //                 onClick={handleEndInterview}
// //                 className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
// //               >
// //                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// //                 </svg>
// //                 End Interview
// //               </button>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </ProtectedRoute>
// //   );
// // }





















// ///////////////////////////////////////////////////////////////////


// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useAuth } from '@/lib/context/AuthContextDemo';
// import ProtectedRoute from '@/components/shared/ProtectedRoute';
// import { useParams, useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';

// // Shape of each Q&A pair the backend sends alongside the report
// interface QAEntry {
//   question: string;
//   answer: string;
// }

// export default function InterviewPage() {
//   const { user, userProfile } = useAuth();
//   const params = useParams();
//   const router = useRouter();
//   const interviewId = params.interviewId as string;

//   // WebSocket
//   const wsRef = useRef<WebSocket | null>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);

//   // Interview state
//   const [isRecording, setIsRecording] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [aiSpeaking, setAiSpeaking] = useState(false);
//   const [currentQuestion, setCurrentQuestion] = useState('');
//   const [userTranscript, setUserTranscript] = useState('');
//   const [partialTranscript, setPartialTranscript] = useState('');
//   const [interviewStarted, setInterviewStarted] = useState(false);
//   const [wsConnected, setWsConnected] = useState(false);
//   const [audioQueue, setAudioQueue] = useState<string[]>([]);
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false);

//   // Report state
//   const [interviewReport, setInterviewReport] = useState<string | null>(null);
//   const [interviewTranscript, setInterviewTranscript] = useState<QAEntry[]>([]);
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false);
//   // Active tab on the report page: "report" | "transcript"
//   const [reportTab, setReportTab] = useState<'report' | 'transcript'>('report');

//   // Get API keys from localStorage
//   const getApiKeys = () => ({
//     assemblyai: localStorage.getItem('assemblyai_key') || '',
//     groq: localStorage.getItem('groq_key') || '',
//     murf: localStorage.getItem('murf_key') || '',
//     serpapi: localStorage.getItem('serpapi_key') || ''
//   });

//   // Initialize WebSocket
//   const connectWebSocket = () => {
//     const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
//     const ws = new WebSocket(`${wsUrl}/interview`);

//     ws.onopen = () => {
//       console.log('WebSocket connected');
//       setWsConnected(true);
//       ws.send(JSON.stringify({ type: 'config', keys: getApiKeys() }));
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);

//         switch (data.type) {
//           case 'transcript_partial':
//             setPartialTranscript(data.text);
//             setIsSpeaking(true);
//             break;

//           case 'transcript_final':
//             setUserTranscript(data.text);
//             setPartialTranscript('');
//             setIsSpeaking(false);
//             break;

//           case 'ai_response':
//             setCurrentQuestion(data.text);
//             setAiSpeaking(true);
//             setTimeout(() => setAiSpeaking(false), 3000);
//             break;

//           case 'ai_audio':
//           case 'audio': {
//             const audioPayload = data.audio || data.b64;
//             if (audioPayload) {
//               setAudioQueue(prev => [...prev, audioPayload]);
//             }
//             break;
//           }

//           // Backend finished — report + full transcript are ready
//           case 'interview_report':
//             setIsGeneratingReport(false);
//             setInterviewReport(data.report);
//             setInterviewTranscript(data.transcript || []);
//             stopRecording();
//             if (wsRef.current) wsRef.current.close();
//             break;

//           case 'error':
//             toast.error(data.message);
//             break;

//           default:
//             console.log('Unhandled WebSocket message type:', data.type, data);
//             break;
//         }
//       } catch (error) {
//         console.error('Error parsing WebSocket message:', error);
//       }
//     };

//     ws.onerror = () => {
//       toast.error('Connection error');
//       setWsConnected(false);
//     };

//     ws.onclose = () => {
//       console.log('WebSocket closed');
//       setWsConnected(false);
//     };

//     wsRef.current = ws;
//   };

//   // Play audio queue
//   useEffect(() => {
//     if (audioQueue.length > 0 && !isPlayingAudio) {
//       playNextAudio();
//     }
//   }, [audioQueue, isPlayingAudio]);

//   const playNextAudio = async () => {
//     if (audioQueue.length === 0) return;
//     setIsPlayingAudio(true);
//     setAiSpeaking(true);

//     const audioBase64 = audioQueue[0];
//     try {
//       const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
//       const audioBlob = new Blob([audioData], { type: 'audio/wav' });
//       const audioUrl = URL.createObjectURL(audioBlob);
//       const audio = new Audio(audioUrl);

//       audio.onended = () => {
//         setAudioQueue(prev => prev.slice(1));
//         setIsPlayingAudio(false);
//         setAiSpeaking(false);
//         URL.revokeObjectURL(audioUrl);
//       };

//       await audio.play();
//     } catch (error) {
//       console.error('Error playing audio:', error);
//       setAudioQueue(prev => prev.slice(1));
//       setIsPlayingAudio(false);
//       setAiSpeaking(false);
//     }
//   };

//   // Start recording
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const audioContext = new AudioContext({ sampleRate: 16000 });
//       const source = audioContext.createMediaStreamSource(stream);
//       const processor = audioContext.createScriptProcessor(4096, 1, 1);

//       source.connect(processor);
//       processor.connect(audioContext.destination);

//       processor.onaudioprocess = (e) => {
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//           const inputData = e.inputBuffer.getChannelData(0);
//           const pcmData = new Int16Array(inputData.length);
//           for (let i = 0; i < inputData.length; i++) {
//             pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
//           }
//           wsRef.current.send(pcmData.buffer);
//         }
//       };

//       audioContextRef.current = audioContext;
//       setIsRecording(true);
//       toast.success('Recording started');
//     } catch (error) {
//       console.error('Error starting recording:', error);
//       toast.error('Could not access microphone');
//     }
//   };

//   // Stop recording
//   const stopRecording = () => {
//     if (audioContextRef.current) {
//       audioContextRef.current.close();
//       audioContextRef.current = null;
//     }
//     setIsRecording(false);
//     setIsSpeaking(false);
//   };

//   const handleToggleRecording = () => {
//     isRecording ? stopRecording() : startRecording();
//   };

//   const handleStartInterview = () => {
//     const keys = getApiKeys();
//     if (!keys.assemblyai || !keys.groq || !keys.murf) {
//       toast.error('Please configure API keys in settings first');
//       router.push('/dashboard');
//       return;
//     }
//     connectWebSocket();
//     setInterviewStarted(true);
//   };

//   const handleEndInterview = () => {
//     setIsGeneratingReport(true);
//     stopRecording();
//     if (wsRef.current) wsRef.current.close();
//     setTimeout(() => {
//       if (!interviewReport) {
//         setIsGeneratingReport(false);
//         toast('Interview ended. No report was generated.');
//       }
//     }, 3000);
//   };

//   useEffect(() => {
//     return () => {
//       if (wsRef.current) wsRef.current.close();
//       if (audioContextRef.current) audioContextRef.current.close();
//     };
//   }, []);

//   // -----------------------------------------------------------------------
//   // REPORT SCREEN (with tabbed Report / Transcript)
//   // -----------------------------------------------------------------------
//   if (interviewReport) {
//     return (
//       <ProtectedRoute>
//         <div className="min-h-screen bg-gray-900 text-white flex flex-col">
//           {/* Header */}
//           <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
//             <div className="max-w-4xl mx-auto flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
//                   <span className="text-lg">📊</span>
//                 </div>
//                 <h1 className="text-white font-semibold text-lg">Interview Feedback Report</h1>
//               </div>
//               <button
//                 onClick={() => router.push('/dashboard')}
//                 className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
//               >
//                 Back to Dashboard
//               </button>
//             </div>
//           </div>

//           {/* Score card */}
//           <div className="max-w-4xl mx-auto w-full px-6 pt-8">
//             {interviewReport.match(/OVERALL SCORE[:\s]*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i) && (
//               <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 mb-6 text-center">
//                 <p className="text-purple-200 text-sm uppercase tracking-widest mb-1">Overall Score</p>
//                 <p className="text-6xl font-bold text-white">
//                   {interviewReport.match(/OVERALL SCORE[:\s]*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i)![1]}
//                   <span className="text-2xl text-purple-300 ml-1">/ 10</span>
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Tabs */}
//           <div className="max-w-4xl mx-auto w-full px-6">
//             <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
//               <button
//                 onClick={() => setReportTab('report')}
//                 className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
//                   reportTab === 'report'
//                     ? 'bg-purple-600 text-white'
//                     : 'text-gray-400 hover:text-white'
//                 }`}
//               >
//                 📋 Feedback Report
//               </button>
//               <button
//                 onClick={() => setReportTab('transcript')}
//                 className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
//                   reportTab === 'transcript'
//                     ? 'bg-purple-600 text-white'
//                     : 'text-gray-400 hover:text-white'
//                 }`}
//               >
//                 💬 Full Transcript ({interviewTranscript.length} Q&As)
//               </button>
//             </div>
//           </div>

//           {/* Tab content */}
//           <div className="max-w-4xl mx-auto w-full px-6 py-6 flex-1">

//             {/* --- REPORT TAB --- */}
//             {reportTab === 'report' && (
//               <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
//                 {interviewReport.split('\n').map((line, idx) => {
//                   const trimmed = line.trim();
//                   if (/^(\d+\.|#{1,3})\s/.test(trimmed)) {
//                     return (
//                       <h3 key={idx} className="text-purple-400 font-semibold text-base mt-6 mb-2 border-b border-gray-700 pb-1">
//                         {trimmed.replace(/^(\d+\.\s*|#{1,3}\s*)/, '')}
//                       </h3>
//                     );
//                   }
//                   if (/^[-•*]\s/.test(trimmed)) {
//                     return (
//                       <p key={idx} className="text-gray-300 text-sm ml-4 mb-1 flex gap-2">
//                         <span className="text-purple-400 mt-0.5">●</span>
//                         <span>{trimmed.replace(/^[-•*]\s*/, '')}</span>
//                       </p>
//                     );
//                   }
//                   if (!trimmed) return <div key={idx} className="h-2" />;
//                   return <p key={idx} className="text-gray-300 text-sm mb-2">{trimmed}</p>;
//                 })}
//               </div>
//             )}

//             {/* --- TRANSCRIPT TAB --- */}
//             {reportTab === 'transcript' && (
//               <div className="flex flex-col gap-4">
//                 {interviewTranscript.length === 0 && (
//                   <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
//                     <p className="text-gray-500 text-sm">No transcript data available.</p>
//                   </div>
//                 )}
//                 {interviewTranscript.map((entry, idx) => (
//                   <div key={idx} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
//                     {/* Question */}
//                     <div className="flex items-start gap-3 p-4 border-b border-gray-700 bg-gray-800">
//                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
//                         <span className="text-sm">🤖</span>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-0.5">
//                           Question {idx + 1}
//                         </p>
//                         <p className="text-white text-sm font-medium">{entry.question}</p>
//                       </div>
//                     </div>
//                     {/* Answer */}
//                     <div className="flex items-start gap-3 p-4 bg-gray-850">
//                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
//                         <span className="text-sm text-white font-bold">
//                           {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
//                         </span>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-0.5">
//                           Your Answer
//                         </p>
//                         <p className="text-gray-300 text-sm">{entry.answer}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Footer actions */}
//           <div className="max-w-4xl mx-auto w-full px-6 pb-8">
//             <div className="flex gap-4 justify-center">
//               <button
//                 onClick={() => router.push('/dashboard')}
//                 className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium hover:from-primary-700 hover:to-purple-700 transition-all"
//               >
//                 Back to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   // -----------------------------------------------------------------------
//   // GENERATING REPORT SCREEN
//   // -----------------------------------------------------------------------
//   if (isGeneratingReport) {
//     return (
//       <ProtectedRoute>
//         <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
//               <span className="text-4xl">📝</span>
//             </div>
//             <h2 className="text-white text-2xl font-bold mb-2">Generating Your Report…</h2>
//             <p className="text-gray-400 text-sm">Analyzing your interview performance…</p>
//             <div className="flex justify-center gap-2 mt-6">
//               <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//               <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//               <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//             </div>
//           </div>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   // -----------------------------------------------------------------------
//   // MAIN INTERVIEW SCREEN
//   // -----------------------------------------------------------------------
//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-gray-900 flex flex-col">
//         {/* Header */}
//         <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
//           <div className="flex items-center justify-between max-w-7xl mx-auto">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
//                 <span className="text-lg">🎙️</span>
//               </div>
//               <div>
//                 <h1 className="text-white font-semibold">Mock Interview Session</h1>
//                 <div className="flex items-center gap-2">
//                   <p className="text-gray-400 text-sm">Interview ID: {interviewId}</p>
//                   {wsConnected && (
//                     <span className="flex items-center gap-1 text-green-400 text-xs">
//                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
//                       Connected
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="text-right">
//                 <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
//                 <p className="text-gray-400 text-xs">{user?.email}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Interview Area */}
//         <div className="flex-1 flex items-center justify-center p-6">
//           <div className="max-w-6xl w-full">
//             {!interviewStarted ? (
//               <div className="text-center">
//                 <div className="mb-8">
//                   <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <span className="text-4xl">🎯</span>
//                   </div>
//                   <h2 className="text-3xl font-bold text-white mb-2">Ready to start your interview?</h2>
//                   <p className="text-gray-400 mb-4">Make sure your microphone is working and you're in a quiet place.</p>
//                   <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto mb-6">
//                     <p className="text-yellow-400 text-sm">
//                       ⚠️ This will use your API keys for AssemblyAI, Groq, and Murf
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleStartInterview}
//                   className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
//                 >
//                   Start Interview
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* AI Interviewer Box */}
//                 <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
//                   aiSpeaking ? 'ring-4 ring-green-500 ring-opacity-70 shadow-lg shadow-green-500/50' : 'ring-2 ring-gray-700'
//                 }`}>
//                   <div className="aspect-video relative">
//                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
//                       <div className={`transition-all duration-300 ${aiSpeaking ? 'scale-110' : 'scale-100'}`}>
//                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
//                           <span className="text-6xl">🤖</span>
//                         </div>
//                       </div>
//                     </div>
//                     {aiSpeaking && (
//                       <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500 px-3 py-1.5 rounded-full">
//                         <div className="flex gap-1">
//                           <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
//                           <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
//                           <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
//                         </div>
//                         <span className="text-white text-sm font-medium">Speaking...</span>
//                       </div>
//                     )}
//                     <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
//                       <p className="text-white text-sm font-medium">AI Interviewer</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Your Video Box */}
//                 <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
//                   isSpeaking ? 'ring-4 ring-blue-500 ring-opacity-70 shadow-lg shadow-blue-500/50' : 'ring-2 ring-gray-700'
//                 }`}>
//                   <div className="aspect-video relative">
//                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
//                       <div className={`transition-all duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
//                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-5xl font-bold">
//                           {userProfile?.displayName?.charAt(0).toUpperCase()}
//                         </div>
//                       </div>
//                     </div>
//                     {isSpeaking && (
//                       <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500 px-3 py-1.5 rounded-full">
//                         <div className="flex gap-1">
//                           <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
//                           <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
//                           <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
//                         </div>
//                         <span className="text-white text-sm font-medium">Speaking...</span>
//                       </div>
//                     )}
//                     <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
//                       <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
//                     </div>
//                     {!isRecording && (
//                       <div className="absolute top-4 right-4 bg-red-500 px-3 py-1.5 rounded-full">
//                         <span className="text-white text-xs font-medium">🔇 Muted</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Question Display */}
//         {interviewStarted && currentQuestion && (
//           <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-700 rounded-xl p-4">
//                 <p className="text-gray-400 text-sm mb-1">Current Question:</p>
//                 <p className="text-white text-lg font-medium">{currentQuestion}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Live Transcript Display */}
//         {interviewStarted && (partialTranscript || userTranscript) && (
//           <div className="bg-gray-800 px-6 py-3">
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-700 rounded-lg p-3">
//                 <p className="text-gray-400 text-xs mb-1">
//                   {partialTranscript ? 'Listening...' : 'Your Response:'}
//                 </p>
//                 <p className="text-white text-sm">
//                   {partialTranscript || userTranscript}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Bottom Controls */}
//         {interviewStarted && (
//           <div className="bg-gray-800 border-t border-gray-700 px-6 py-6">
//             <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
//               <button
//                 onClick={handleToggleRecording}
//                 disabled={!wsConnected}
//                 className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
//                   isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
//                 }`}
//                 title={isRecording ? 'Stop Recording' : 'Start Recording'}
//               >
//                 {isRecording ? (
//                   <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
//                   </svg>
//                 ) : (
//                   <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
//                   </svg>
//                 )}
//               </button>

//               <button
//                 onClick={handleEndInterview}
//                 className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//                 End Interview
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// }




/////////////////////////////////////////////////////////////////////////////////////////////////


'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContextDemo';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Shape of each Q&A pair the backend sends alongside the report
interface QAEntry {
  question: string;
  answer: string;
}

export default function InterviewPage() {
  const { user, userProfile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;

  // WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Interview state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Report state
  const [interviewReport, setInterviewReport] = useState<string | null>(null);
  const [interviewTranscript, setInterviewTranscript] = useState<QAEntry[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  // Active tab on the report page: "report" | "transcript"
  const [reportTab, setReportTab] = useState<'report' | 'transcript'>('report');

  // Interview config (difficulty, type) saved by the creation page
  const [interviewConfig, setInterviewConfig] = useState<{
    type?: string;
    difficulty?: string;
  }>({});

  // Load the interview config once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(interviewId);
      if (raw) {
        const parsed = JSON.parse(raw);
        setInterviewConfig({ type: parsed.type, difficulty: parsed.difficulty });
      }
    } catch {
      console.warn('Could not parse interview config from localStorage');
    }
  }, [interviewId]);

  // Get API keys from localStorage
  const getApiKeys = () => ({
    assemblyai: localStorage.getItem('assemblyai_key') || '',
    groq: localStorage.getItem('groq_key') || '',
    murf: localStorage.getItem('murf_key') || '',
    serpapi: localStorage.getItem('serpapi_key') || ''
  });

  // Initialize WebSocket
  const connectWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/interview`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      ws.send(JSON.stringify({
        type: 'config',
        keys: getApiKeys(),
        difficulty: interviewConfig.difficulty || 'easy',
        interviewType: interviewConfig.type || 'technical',
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'transcript_partial':
            setPartialTranscript(data.text);
            setIsSpeaking(true);
            break;

          case 'transcript_final':
            setUserTranscript(data.text);
            setPartialTranscript('');
            setIsSpeaking(false);
            break;

          case 'ai_response':
            setCurrentQuestion(data.text);
            setAiSpeaking(true);
            setTimeout(() => setAiSpeaking(false), 3000);
            break;

          case 'ai_audio':
          case 'audio': {
            const audioPayload = data.audio || data.b64;
            if (audioPayload) {
              setAudioQueue(prev => [...prev, audioPayload]);
            }
            break;
          }

          // Backend finished — report + full transcript are ready
          case 'interview_report':
            setIsGeneratingReport(false);
            setInterviewReport(data.report);
            setInterviewTranscript(data.transcript || []);
            stopRecording();
            if (wsRef.current) wsRef.current.close();
            break;

          case 'error':
            toast.error(data.message);
            break;

          default:
            console.log('Unhandled WebSocket message type:', data.type, data);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = () => {
      toast.error('Connection error');
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setWsConnected(false);
    };

    wsRef.current = ws;
  };

  // Play audio queue
  useEffect(() => {
    if (audioQueue.length > 0 && !isPlayingAudio) {
      playNextAudio();
    }
  }, [audioQueue, isPlayingAudio]);

  const playNextAudio = async () => {
    if (audioQueue.length === 0) return;
    setIsPlayingAudio(true);
    setAiSpeaking(true);

    const audioBase64 = audioQueue[0];
    try {
      const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioData], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setAudioQueue(prev => prev.slice(1));
        setIsPlayingAudio(false);
        setAiSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioQueue(prev => prev.slice(1));
      setIsPlayingAudio(false);
      setAiSpeaking(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
          }
          wsRef.current.send(pcmData.buffer);
        }
      };

      audioContextRef.current = audioContext;
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    setIsSpeaking(false);
  };

  const handleToggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };

  const handleStartInterview = () => {
    const keys = getApiKeys();
    if (!keys.assemblyai || !keys.groq || !keys.murf) {
      toast.error('Please configure API keys in settings first');
      router.push('/dashboard');
      return;
    }
    connectWebSocket();
    setInterviewStarted(true);
  };

  const handleEndInterview = () => {
    setIsGeneratingReport(true);
    stopRecording();
    if (wsRef.current) wsRef.current.close();
    setTimeout(() => {
      if (!interviewReport) {
        setIsGeneratingReport(false);
        toast('Interview ended. No report was generated.');
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // -----------------------------------------------------------------------
  // REPORT SCREEN (with tabbed Report / Transcript)
  // -----------------------------------------------------------------------
  if (interviewReport) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <h1 className="text-white font-semibold text-lg">Interview Feedback Report</h1>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Score card */}
          <div className="max-w-4xl mx-auto w-full px-6 pt-8">
            {interviewReport.match(/OVERALL SCORE[:\s]*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i) && (
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 mb-6 text-center">
                <p className="text-purple-200 text-sm uppercase tracking-widest mb-1">Overall Score</p>
                <p className="text-6xl font-bold text-white">
                  {interviewReport.match(/OVERALL SCORE[:\s]*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i)![1]}
                  <span className="text-2xl text-purple-300 ml-1">/ 10</span>
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="max-w-4xl mx-auto w-full px-6">
            <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setReportTab('report')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  reportTab === 'report'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📋 Feedback Report
              </button>
              <button
                onClick={() => setReportTab('transcript')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  reportTab === 'transcript'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                💬 Full Transcript ({interviewTranscript.length} Q&As)
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="max-w-4xl mx-auto w-full px-6 py-6 flex-1">

            {/* --- REPORT TAB --- */}
            {reportTab === 'report' && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                {interviewReport.split('\n').map((line, idx) => {
                  const trimmed = line.trim();
                  if (/^(\d+\.|#{1,3})\s/.test(trimmed)) {
                    return (
                      <h3 key={idx} className="text-purple-400 font-semibold text-base mt-6 mb-2 border-b border-gray-700 pb-1">
                        {trimmed.replace(/^(\d+\.\s*|#{1,3}\s*)/, '')}
                      </h3>
                    );
                  }
                  if (/^[-•*]\s/.test(trimmed)) {
                    return (
                      <p key={idx} className="text-gray-300 text-sm ml-4 mb-1 flex gap-2">
                        <span className="text-purple-400 mt-0.5">●</span>
                        <span>{trimmed.replace(/^[-•*]\s*/, '')}</span>
                      </p>
                    );
                  }
                  if (!trimmed) return <div key={idx} className="h-2" />;
                  return <p key={idx} className="text-gray-300 text-sm mb-2">{trimmed}</p>;
                })}
              </div>
            )}

            {/* --- TRANSCRIPT TAB --- */}
            {reportTab === 'transcript' && (
              <div className="flex flex-col gap-4">
                {interviewTranscript.length === 0 && (
                  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
                    <p className="text-gray-500 text-sm">No transcript data available.</p>
                  </div>
                )}
                {interviewTranscript.map((entry, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    {/* Question */}
                    <div className="flex items-start gap-3 p-4 border-b border-gray-700 bg-gray-800">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-0.5">
                          Question {idx + 1}
                        </p>
                        <p className="text-white text-sm font-medium">{entry.question}</p>
                      </div>
                    </div>
                    {/* Answer */}
                    <div className="flex items-start gap-3 p-4 bg-gray-850">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <span className="text-sm text-white font-bold">
                          {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-0.5">
                          Your Answer
                        </p>
                        <p className="text-gray-300 text-sm">{entry.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="max-w-4xl mx-auto w-full px-6 pb-8">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium hover:from-primary-700 hover:to-purple-700 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // -----------------------------------------------------------------------
  // GENERATING REPORT SCREEN
  // -----------------------------------------------------------------------
  if (isGeneratingReport) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Generating Your Report…</h2>
            <p className="text-gray-400 text-sm">Analyzing your interview performance…</p>
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // -----------------------------------------------------------------------
  // MAIN INTERVIEW SCREEN
  // -----------------------------------------------------------------------
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎙️</span>
              </div>
              <div>
                <h1 className="text-white font-semibold">Mock Interview Session</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-gray-400 text-sm">Interview ID: {interviewId}</p>
                  {interviewConfig.difficulty && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      interviewConfig.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
                      interviewConfig.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                      interviewConfig.difficulty === 'hard' ? 'bg-orange-900 text-orange-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {interviewConfig.difficulty.charAt(0).toUpperCase() + interviewConfig.difficulty.slice(1)}
                    </span>
                  )}
                  {interviewConfig.type && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-900 text-purple-300">
                      {interviewConfig.type.charAt(0).toUpperCase() + interviewConfig.type.slice(1)}
                    </span>
                  )}
                  {wsConnected && (
                    <span className="flex items-center gap-1 text-green-400 text-xs">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Connected
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interview Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-6xl w-full">
            {!interviewStarted ? (
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Ready to start your interview?</h2>
                  <p className="text-gray-400 mb-4">Make sure your microphone is working and you're in a quiet place.</p>
                  {/* <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto mb-6">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ This will use your API keys for AssemblyAI, Groq, and Murf
                    </p>
                  </div> */}
                </div>
                <button
                  onClick={handleStartInterview}
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Start Interview
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Interviewer Box */}
                <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
                  aiSpeaking ? 'ring-4 ring-green-500 ring-opacity-70 shadow-lg shadow-green-500/50' : 'ring-2 ring-gray-700'
                }`}>
                  <div className="aspect-video relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                      <div className={`transition-all duration-300 ${aiSpeaking ? 'scale-110' : 'scale-100'}`}>
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                          <span className="text-6xl">🤖</span>
                        </div>
                      </div>
                    </div>
                    {aiSpeaking && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500 px-3 py-1.5 rounded-full">
                        <div className="flex gap-1">
                          <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
                          <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                        <span className="text-white text-sm font-medium">Speaking...</span>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
                      <p className="text-white text-sm font-medium">AI Interviewer</p>
                    </div>
                  </div>
                </div>

                {/* Your Video Box */}
                <div className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
                  isSpeaking ? 'ring-4 ring-blue-500 ring-opacity-70 shadow-lg shadow-blue-500/50' : 'ring-2 ring-gray-700'
                }`}>
                  <div className="aspect-video relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                      <div className={`transition-all duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-5xl font-bold">
                          {userProfile?.displayName?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {isSpeaking && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500 px-3 py-1.5 rounded-full">
                        <div className="flex gap-1">
                          <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
                          <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                        <span className="text-white text-sm font-medium">Speaking...</span>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 px-3 py-1.5 rounded-lg">
                      <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
                    </div>
                    {!isRecording && (
                      <div className="absolute top-4 right-4 bg-red-500 px-3 py-1.5 rounded-full">
                        <span className="text-white text-xs font-medium">🔇 Muted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question Display */}
        {interviewStarted && currentQuestion && (
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Current Question:</p>
                <p className="text-white text-lg font-medium">{currentQuestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Transcript Display */}
        {interviewStarted && (partialTranscript || userTranscript) && (
          <div className="bg-gray-800 px-6 py-3">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">
                  {partialTranscript ? 'Listening...' : 'Your Response:'}
                </p>
                <p className="text-white text-sm">
                  {partialTranscript || userTranscript}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        {interviewStarted && (
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-6">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
              <button
                onClick={handleToggleRecording}
                disabled={!wsConnected}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleEndInterview}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                End Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
