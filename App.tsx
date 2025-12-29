
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { AudioState, Message, Scheme } from './types';
import { SCHEMES, SYSTEM_INSTRUCTION } from './constants';
import { Visualizer } from './components/Visualizer';
import { SchemeDetails } from './components/SchemeDetails';
import { createPcmBlob, decode, decodeAudioData } from './services/audioUtils';

// Constants for audio
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

const displaySchemeFunction: FunctionDeclaration = {
  name: 'display_scheme',
  parameters: {
    type: Type.OBJECT,
    description: 'Call this function to display a government scheme card with localized translations.',
    properties: {
      schemeId: {
        type: Type.STRING,
        description: 'The ID of the scheme from the database.',
      },
      translatedName: {
        type: Type.STRING,
        description: 'The name of the scheme translated into the user\'s language.',
      },
      translatedExplanation: {
        type: Type.STRING,
        description: 'A simple explanation of the scheme translated into the user\'s language.',
      },
      translatedEligibility: {
        type: Type.STRING,
        description: 'Analysis of user eligibility translated into the user\'s language.',
      },
      translatedChecklist: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'The document checklist translated into the user\'s language.',
      },
    },
    required: ['schemeId', 'translatedName', 'translatedExplanation', 'translatedEligibility', 'translatedChecklist'],
  },
};

const App: React.FC = () => {
  const [audioState, setAudioState] = useState<AudioState>(AudioState.IDLE);
  const [currentScheme, setCurrentScheme] = useState<(Scheme & { translatedName?: string; translatedExplanation?: string; translatedEligibility?: string; translatedChecklist?: string[] }) | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const outputNodeRef = useRef<GainNode | null>(null);

  const startSession = async () => {
    try {
      setError(null);
      setAudioState(AudioState.CONNECTING);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!inputAudioContextRef.current) {
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
        outputNodeRef.current = outputAudioContextRef.current.createGain();
        outputNodeRef.current.connect(outputAudioContextRef.current.destination);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          tools: [{ functionDeclarations: [displaySchemeFunction] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setAudioState(AudioState.LISTENING);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setAudioState(AudioState.SPEAKING);
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, OUTPUT_SAMPLE_RATE, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setAudioState(AudioState.LISTENING);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => prev + " " + message.serverContent?.inputTranscription?.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription('');
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'display_scheme') {
                  const { schemeId, translatedName, translatedExplanation, translatedEligibility, translatedChecklist } = fc.args as any;
                  const matched = SCHEMES.find(s => s.id === schemeId);
                  if (matched) {
                    setCurrentScheme({
                      ...matched,
                      translatedName,
                      translatedExplanation,
                      translatedEligibility,
                      translatedChecklist
                    });
                  }
                  sessionPromise.then((session) => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Scheme card with eligibility details displayed successfully." },
                      }
                    });
                  });
                }
              }
            }
          },
          onerror: (e) => {
            console.error('Session Error:', e);
            setError('Connection error. Please try again.');
            setAudioState(AudioState.ERROR);
          },
          onclose: () => {
            setAudioState(AudioState.IDLE);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start session');
      setAudioState(AudioState.ERROR);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setAudioState(AudioState.IDLE);
    setCurrentScheme(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 md:p-8 bg-slate-50">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Lingo</h1>
            <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest">Citizen's Companion</p>
          </div>
        </div>
        
        {audioState !== AudioState.IDLE && (
          <button 
            onClick={stopSession}
            className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-full text-sm font-bold hover:bg-red-50 transition-all shadow-sm flex items-center"
          >
            <div className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2.5 animate-pulse"></div>
            End Call
          </button>
        )}
      </header>

      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center space-y-10">
        
        {currentScheme ? (
          <div className="w-full animate-in zoom-in-95 duration-300">
            <SchemeDetails scheme={currentScheme} />
            <button 
              onClick={() => setCurrentScheme(null)}
              className="mt-8 text-indigo-600 font-black hover:text-indigo-800 flex items-center justify-center w-full transition-colors uppercase tracking-widest text-xs"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Go back / Ask about another need
            </button>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-5xl font-black text-slate-900 font-outfit leading-tight tracking-tight">
                How can I support your future?
              </h2>
              <p className="text-slate-600 text-xl font-medium leading-relaxed">
                Tell me what you're facing. Health needs, building a house, starting a business, or your child's education—I'm here to find the right help for you.
              </p>
            </div>
            
            <div className="py-4">
              <Visualizer state={audioState} />
            </div>

            {audioState === AudioState.IDLE && (
              <button
                onClick={startSession}
                className="group relative inline-flex items-center justify-center px-12 py-6 font-bold text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-2xl hover:shadow-indigo-200 active:scale-95"
              >
                <span className="relative flex items-center text-lg">
                   <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                   Talk to Lingo
                </span>
              </button>
            )}

            {audioState === AudioState.LISTENING && (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                </div>
                <p className="text-indigo-800 font-bold text-lg tracking-wide uppercase opacity-75">Lingo is Listening...</p>
              </div>
            )}
            
            {transcription && (
              <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 italic text-indigo-900 text-lg">
                "{transcription}"
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full max-w-4xl mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm font-medium">
        <p>© 2024 Lingo. Supporting every citizen's journey.</p>
        <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0 text-xs">
          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Hindi</span>
          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Marathi</span>
          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Bengali</span>
          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Tamil</span>
          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Telugu</span>
          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">English</span>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-in fade-in slide-in-from-bottom-10">
          <div className="p-1 bg-red-500 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <span className="font-bold">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-slate-400 hover:text-white font-bold underline">Retry</button>
        </div>
      )}
    </div>
  );
};

export default App;
