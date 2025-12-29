
import React from 'react';
import { Scheme } from '../types';

interface SchemeDetailsProps {
  scheme: Scheme & {
    translatedName?: string;
    translatedExplanation?: string;
    translatedEligibility?: string;
    translatedChecklist?: string[];
  };
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Health': return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'Business': return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'Housing': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Education': return 'bg-violet-100 text-violet-800 border-violet-200';
    case 'Agriculture': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Finance': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const SchemeDetails: React.FC<SchemeDetailsProps> = ({ scheme }) => {
  const displayName = scheme.translatedName || scheme.name;
  const displayExplanation = scheme.translatedExplanation || scheme.explanation;
  const displayEligibility = scheme.translatedEligibility || scheme.eligibility;
  const displayChecklist = scheme.translatedChecklist || scheme.checklist;

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 border border-indigo-50 max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(scheme.category)}`}>
            {scheme.category}
          </span>
          <span className="text-indigo-200 text-xs font-bold">EST. {scheme.year}</span>
        </div>
        <h2 className="text-3xl font-black font-outfit leading-tight mb-2">{displayName}</h2>
        <p className="text-indigo-100/80 text-sm font-medium">{scheme.ministry}</p>
      </div>
      
      <div className="p-8 space-y-8">
        {/* Overview Section */}
        <section>
          <div className="flex items-center text-indigo-900 font-bold mb-3 uppercase tracking-wider text-xs">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Scheme Overview
          </div>
          <p className="text-slate-700 text-lg leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
            "{displayExplanation}"
          </p>
        </section>

        {/* Eligibility Section */}
        <section>
          <div className="flex items-center text-indigo-900 font-bold mb-3 uppercase tracking-wider text-xs">
            <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Who can apply? (Eligibility)
          </div>
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-amber-900 font-semibold leading-relaxed">
            {displayEligibility}
          </div>
        </section>

        {/* Checklist Section */}
        <section>
          <div className="flex items-center text-indigo-900 font-bold mb-4 uppercase tracking-wider text-xs">
            <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Required Documents
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 shrink-0"></div>
                <span className="text-slate-700 text-sm font-bold">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-4 border-t border-slate-100 text-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            Visit your nearest Common Service Centre (CSC) or Jan Seva Kendra with these documents to begin your application.
           </p>
        </footer>
      </div>
    </div>
  );
};
