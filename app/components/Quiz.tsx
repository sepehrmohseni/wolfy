'use client';

import { useState } from 'react';
import {
  Sword, Leaf, Eye, RefreshCw,
  TreePine, Mountain, CloudFog, Wheat,
  Zap, Moon, BatteryCharging, Sparkles,
  Crown, Shield, Telescope, Dog,
  Flame, Snowflake, Eclipse, CloudLightning,
} from 'lucide-react';

export interface QuizAnswers {
  danger: string;
  terrain: string;
  night: string;
  role: string;
  element: string;
}

const questions = [
  {
    key: 'danger',
    question: 'When facing danger, you…',
    options: [
      { value: 'fight', icon: Sword, iconColor: 'text-red-400', label: 'Fight', desc: 'Stand your ground and face it head-on' },
      { value: 'hide', icon: Leaf, iconColor: 'text-green-400', label: 'Hide', desc: 'Conceal yourself and wait for the right moment' },
      { value: 'observe', icon: Eye, iconColor: 'text-blue-400', label: 'Observe', desc: 'Study the threat before making a move' },
      { value: 'adapt', icon: RefreshCw, iconColor: 'text-purple-400', label: 'Adapt', desc: 'Change your approach to overcome it' },
    ],
  },
  {
    key: 'terrain',
    question: 'Your preferred terrain…',
    options: [
      { value: 'deep forest', icon: TreePine, iconColor: 'text-emerald-400', label: 'Deep Forest', desc: 'Ancient woods where light barely reaches' },
      { value: 'snowy mountain', icon: Mountain, iconColor: 'text-sky-400', label: 'Snowy Mountain', desc: 'Peaks where the air is thin and the view is endless' },
      { value: 'misty valley', icon: CloudFog, iconColor: 'text-gray-400', label: 'Misty Valley', desc: 'Shrouded lowlands full of mystery' },
      { value: 'open plains', icon: Wheat, iconColor: 'text-yellow-400', label: 'Open Plains', desc: 'Wide grasslands under endless sky' },
    ],
  },
  {
    key: 'night',
    question: 'At night, you feel…',
    options: [
      { value: 'powerful', icon: Zap, iconColor: 'text-amber-400', label: 'Powerful', desc: 'Darkness amplifies your strength' },
      { value: 'peaceful', icon: Moon, iconColor: 'text-indigo-400', label: 'Peaceful', desc: 'The moon brings you serenity' },
      { value: 'restless', icon: BatteryCharging, iconColor: 'text-yellow-400', label: 'Restless', desc: 'You have energy that demands release' },
      { value: 'curious', icon: Sparkles, iconColor: 'text-violet-400', label: 'Curious', desc: 'Night reveals what day conceals' },
    ],
  },
  {
    key: 'role',
    question: 'Your pack role…',
    options: [
      { value: 'leader', icon: Crown, iconColor: 'text-amber-400', label: 'Leader', desc: 'Guide the pack with wisdom and strength' },
      { value: 'guardian', icon: Shield, iconColor: 'text-cyan-400', label: 'Guardian', desc: 'Protect those who cannot protect themselves' },
      { value: 'scout', icon: Telescope, iconColor: 'text-teal-400', label: 'Scout', desc: 'Explore ahead and find the way' },
      { value: 'lone wolf', icon: Dog, iconColor: 'text-emerald-400', label: 'Lone Wolf', desc: 'Walk your own path, beholden to none' },
    ],
  },
  {
    key: 'element',
    question: 'Your spirit element…',
    options: [
      { value: 'fire', icon: Flame, iconColor: 'text-orange-400', label: 'Fire', desc: 'Burning passion and fierce determination' },
      { value: 'ice', icon: Snowflake, iconColor: 'text-sky-400', label: 'Ice', desc: 'Cool clarity and crystalline focus' },
      { value: 'shadow', icon: Eclipse, iconColor: 'text-gray-400', label: 'Shadow', desc: 'Stealth, mystery, and hidden power' },
      { value: 'storm', icon: CloudLightning, iconColor: 'text-violet-400', label: 'Storm', desc: 'Untamed energy and raw force' },
    ],
  },
];

interface Props {
  onComplete: (answers: QuizAnswers) => void;
}

export function Quiz({ onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});

  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [q.key]: value };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => onComplete(newAnswers as QuizAnswers), 400);
    }
  };

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>
            Question {currentQ + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
        {q.question}
      </h2>

      {/* Options */}
      <div className="grid gap-3">
        {q.options.map((opt) => {
          const selected = answers[q.key as keyof QuizAnswers] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                selected
                  ? 'bg-emerald-600/20 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-semibold text-white text-base flex items-center gap-2">
                {opt.icon && <opt.icon className={`w-5 h-5 ${opt.iconColor}`} />}
                {opt.label}
              </div>
              <div className="text-sm text-gray-400 mt-1">{opt.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Back */}
      {currentQ > 0 && (
        <button
          onClick={() => setCurrentQ(currentQ - 1)}
          className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Previous question
        </button>
      )}
    </div>
  );
}
