


import React, { useState, useEffect } from 'react';
import { Button } from './ui';
import { X, ChevronRight, Check } from 'lucide-react';
import { FeedbackRecord, StoryType } from '../types';

interface StoriesOverlayProps {
  type: StoryType;
  onComplete: (feedback: FeedbackRecord) => void;
  onClose: () => void;
}

interface QuestionStep {
  id: number;
  question: string;
  options: { label: string; value: string; adaptationValue?: number }[]; // adaptationValue: -1 (too hard/bad), 0 (neutral), 1 (good/easy)
  bgGradient: string;
}

export const StoriesOverlay: React.FC<StoriesOverlayProps> = ({ type, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{question: string, answer: string, score?: number}[]>([]);
  const [animating, setAnimating] = useState(false);

  // Define content based on Type
  let steps: QuestionStep[] = [];

  if (type === 'POST_PRACTICE') {
      steps = [
        {
          id: 1,
          question: "Como você sentiu a intensidade da prática hoje?",
          bgGradient: "from-indigo-500 via-purple-500 to-pink-500",
          options: [
            { label: "Muito Fácil", value: "Too Easy", adaptationValue: 1 },
            { label: "Perfeita", value: "Perfect", adaptationValue: 0 },
            { label: "Desafiadora", value: "Challenging", adaptationValue: 0 },
            { label: "Muito Difícil", value: "Too Hard", adaptationValue: -1 }
          ]
        },
        {
          id: 2,
          question: "Como está seu corpo agora?",
          bgGradient: "from-orange-400 via-red-400 to-pink-500",
          options: [
            { label: "Energizado", value: "Energized" },
            { label: "Relaxado", value: "Relaxed" },
            { label: "Leve", value: "Light" },
            { label: "Cansado", value: "Tired" }
          ]
        },
        {
          id: 3,
          question: "Sentiu algum desconforto específico?",
          bgGradient: "from-blue-400 via-teal-400 to-emerald-500",
          options: [
            { label: "Não, me sinto bem", value: "None" },
            { label: "Lombar", value: "Lower Back" },
            { label: "Joelhos", value: "Knees" },
            { label: "Punhos/Ombros", value: "Wrists/Shoulders" }
          ]
        }
      ];
  } else if (type === 'WEEKLY_CHECKIN') {
      steps = [
        {
          id: 1,
          question: "Como você descreveria sua energia para começar esta semana?",
          bgGradient: "from-yellow-400 via-orange-500 to-red-500",
          options: [
            { label: "🔥 Alta e Motivada", value: "High" },
            { label: "⚖️ Equilibrada", value: "Balanced" },
            { label: "🐢 Baixa / Preciso de calma", value: "Low" }
          ]
        },
        {
          id: 2,
          question: "Qual é sua intenção principal para os próximos dias?",
          bgGradient: "from-green-400 via-emerald-500 to-teal-600",
          options: [
            { label: "Consistência (Praticar todo dia)", value: "Consistency" },
            { label: "Superação (Avançar posturas)", value: "Growth" },
            { label: "Autocuidado (Respeitar limites)", value: "Self-care" }
          ]
        },
        {
          id: 3,
          question: "Como foi seu sono na última semana?",
          bgGradient: "from-blue-600 via-indigo-600 to-purple-700",
          options: [
            { label: "Restaurador", value: "Great" },
            { label: "Normal", value: "Okay" },
            { label: "Agitado", value: "Poor" }
          ]
        }
      ];
  } else if (type === 'WEEKLY_REVIEW') {
      steps = [
        {
          id: 1,
          question: "Olhando para trás, como você sente que foi sua semana?",
          bgGradient: "from-violet-500 via-purple-600 to-fuchsia-600",
          options: [
            { label: "Produtiva", value: "Productive" },
            { label: "Equilibrada", value: "Balanced" },
            { label: "Difícil", value: "Hard" }
          ]
        },
        {
          id: 2,
          question: "Você conseguiu cumprir sua intenção inicial?",
          bgGradient: "from-sky-400 via-blue-500 to-indigo-600",
          options: [
            { label: "Sim, totalmente", value: "Yes" },
            { label: "Parcialmente", value: "Partially" },
            { label: "Não, mudei de foco", value: "No" }
          ]
        },
        {
          id: 3,
          question: "Qual sentimento predomina agora?",
          bgGradient: "from-emerald-400 via-green-500 to-teal-600",
          options: [
            { label: "Gratidão", value: "Gratitude" },
            { label: "Força", value: "Strength" },
            { label: "Paz", value: "Peace" }
          ]
        }
      ];
  }

  const handleSelectOption = (option: { label: string, value: string, adaptationValue?: number }) => {
    if (animating) return;
    
    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentStep] = {
      question: steps[currentStep].question,
      answer: option.label,
      score: option.adaptationValue
    };
    setAnswers(newAnswers);

    // Animate & Advance
    setAnimating(true);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setAnimating(false);
      } else {
        finish(newAnswers);
      }
    }, 400); // Short delay for visual feedback
  };

  const finish = (finalAnswers: typeof answers) => {
    onComplete({
      type,
      date: new Date().toISOString(),
      responses: finalAnswers
    });
  };

  const activeStep = steps[currentStep];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-gradient-to-br ${activeStep.bgGradient} transition-all duration-700 ease-in-out text-white overflow-hidden`}>
      
      {/* Top Progress Bars */}
      <div className="flex gap-1 p-2 pt-4 safe-top">
        {steps.map((step, idx) => (
          <div key={step.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-300 ease-linear ${
                idx < currentStep ? 'w-full' : 
                idx === currentStep ? 'w-full animate-progress-fill origin-left' : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Header Controls */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center gap-2 opacity-80">
           <div className={`w-2 h-2 bg-white rounded-full ${type !== 'POST_PRACTICE' ? 'animate-pulse' : ''}`}/>
           <span className="text-xs font-bold uppercase tracking-widest">
             {type === 'POST_PRACTICE' ? 'Pós-Prática' : type === 'WEEKLY_CHECKIN' ? 'Check-in Inicial' : 'Review Final'}
           </span>
        </div>
        <button onClick={onClose} className="p-2 bg-black/10 rounded-full hover:bg-black/20 backdrop-blur-sm">
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-8 animate-fade-in">
         <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-12 drop-shadow-md">
            {activeStep.question}
         </h2>

         <div className="space-y-4 max-w-md w-full mx-auto">
            {activeStep.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelectOption(opt)}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-left text-lg font-medium transition-all active:scale-95 flex justify-between items-center group"
              >
                {opt.label}
                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </button>
            ))}
         </div>
      </div>

      {/* Footer Branding */}
      <div className="p-8 text-center opacity-40 text-sm font-medium tracking-widest">
        YOGAFLOW
      </div>
    </div>
  );
};