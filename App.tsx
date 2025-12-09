
import React, { useState, useEffect } from 'react';
import { UserPreferences, Routine, ViewState, Difficulty, Goal, Duration, SessionRecord, TrainingPlan, Discomfort, PlanDay, User, FeedbackRecord, StoryType, PlanPathway, Pose } from './types';
import { generateRoutine } from './services/routineEngine';
import { createPersonalizedPlan, calculatePlanProgress } from './services/planEngine';
import { authService } from './services/auth';
import { PoseLibrary } from './components/PoseLibrary';
import { PoseDetail } from './components/PoseDetail';
import { RoutinePlayer } from './components/RoutinePlayer';
import { Journey } from './components/Journey';
import { PlanEditor } from './components/PlanEditor';
import { RoutineEditor } from './components/RoutineEditor';
import { AuthScreen } from './components/AuthScreen';
import { LearningHub } from './components/LearningHub';
import { StoriesOverlay } from './components/StoriesOverlay';
import { Button, Card, Badge } from './components/ui';
import {
  LayoutDashboard,
  Grid,
  Map,
  Play,
  Clock,
  Zap,
  Activity,
  Smile,
  Edit2,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
  Check,
  LogOut,
  BookOpen,
  X,
  Save,
  Star,
  Coffee,
  Target,
  Flame,
  Heart,
  Droplets,
  Wind,
  Mountain,
  CalendarDays,
  Trophy,
  ArrowUpCircle,
  GitBranch
} from 'lucide-react';

// Storage keys helper
const getPrefsKey = (userId: string) => `yogaflow_prefs_${userId}`;
const getPlansKey = (userId: string) => `yogaflow_plans_v2_${userId}`;
const getActivePlanIdKey = (userId: string) => `yogaflow_active_plan_id_${userId}`;
const getHistoryKey = (userId: string) => `yogaflow_history_${userId}`;
const getWeeklyContextKey = (userId: string) => `yogaflow_weekly_ctx_${userId}`;

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App State
  const [view, setView] = useState<ViewState>('AUTH');
  const [preferences, setPreferences] = useState<UserPreferences>({
    level: 'Iniciante',
    goal: 'Relaxamento',
    duration: 15,
    frequency: 3,
    age: 30,
    weight: undefined,
    discomforts: [],
    hasOnboarded: false
  });

  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const [editingPrefs, setEditingPrefs] = useState<UserPreferences | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const [storyType, setStoryType] = useState<StoryType>('POST_PRACTICE');
  const [weeklyContext, setWeeklyContext] = useState<FeedbackRecord | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<{ intention: string, result: string, insight: string } | null>(null);

  const [showGraduation, setShowGraduation] = useState(false);
  const [selectedPose, setSelectedPose] = useState<Pose | null>(null);

  // Derived Active Plan
  const activePlan = plans.find(p => p.id === activePlanId) || plans[0] || null;

  const swapOptions = [
    { label: 'Flexibilidade', icon: <Activity size={18} />, desc: 'Focar em alongamento' },
    { label: 'Força', icon: <Zap size={18} />, desc: 'Focar em tonificação' },
    { label: 'Relaxamento', icon: <Coffee size={18} />, desc: 'Focar em desestressar' },
    { label: 'Alívio de Dor', icon: <Target size={18} />, desc: 'Focar em recuperação' },
    { label: 'Core Blast', icon: <Flame size={18} />, desc: 'Foco abdominal intenso' },
    { label: 'Cardio Yoga', icon: <Heart size={18} />, desc: 'Fluxo rápido para suar' },
    { label: 'Detox Twist', icon: <Droplets size={18} />, desc: 'Torções para digestão' },
    { label: 'Respiração Profunda', icon: <Wind size={18} />, desc: 'Pranayamas e calma' },
    { label: 'Equilíbrio & Foco', icon: <Mountain size={18} />, desc: 'Posturas de pé e concentração' },
  ];

  // --- Auth & Data Loading Effects ---

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = authService.getCurrentUser();
      if (savedUser) {
        handleUserAuthenticated(savedUser);
      } else {
        setView('AUTH');
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleUserAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);

    const prefsStr = localStorage.getItem(getPrefsKey(authenticatedUser.id));
    const plansStr = localStorage.getItem(getPlansKey(authenticatedUser.id));
    const activePlanIdStr = localStorage.getItem(getActivePlanIdKey(authenticatedUser.id));
    const historyStr = localStorage.getItem(getHistoryKey(authenticatedUser.id));
    const weeklyCtxStr = localStorage.getItem(getWeeklyContextKey(authenticatedUser.id));

    if (prefsStr) {
      const loadedPrefs = JSON.parse(prefsStr);
      if (!loadedPrefs.frequency) loadedPrefs.frequency = 3;
      setPreferences(loadedPrefs);

      if (loadedPrefs.hasOnboarded) {
        setView('DASHBOARD');
      } else {
        setView('ONBOARDING');
      }
    } else {
      setPreferences({ ...preferences, userId: authenticatedUser.id, hasOnboarded: false });
      setView('ONBOARDING');
    }

    if (plansStr) {
      let loadedPlans: TrainingPlan[] = JSON.parse(plansStr);
      const loadedHistory = historyStr ? JSON.parse(historyStr) : [];
      loadedPlans = loadedPlans.map(p => calculatePlanProgress(p, loadedHistory));
      setPlans(loadedPlans);

      if (activePlanIdStr) setActivePlanId(activePlanIdStr);
    } else {
      const legacyPlanStr = localStorage.getItem(`yogaflow_plan_${authenticatedUser.id}`);
      if (legacyPlanStr) {
        const legacyPlan = JSON.parse(legacyPlanStr);
        setPlans([legacyPlan]);
        setActivePlanId(legacyPlan.id);
        localStorage.setItem(getPlansKey(authenticatedUser.id), JSON.stringify([legacyPlan]));
        localStorage.setItem(getActivePlanIdKey(authenticatedUser.id), legacyPlan.id);
      }
    }

    if (historyStr) {
      setHistory(JSON.parse(historyStr));
    } else {
      setHistory([]);
    }

    if (weeklyCtxStr) {
      setWeeklyContext(JSON.parse(weeklyCtxStr));
    }

    setIsAuthChecking(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setPreferences({
      level: 'Iniciante',
      goal: 'Relaxamento',
      duration: 15,
      frequency: 3,
      discomforts: [],
      hasOnboarded: false
    });
    setHistory([]);
    setPlans([]);
    setActivePlanId(null);
    setView('AUTH');
  };

  // --- Persistence Helpers ---

  const savePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    if (user) {
      localStorage.setItem(getPrefsKey(user.id), JSON.stringify(newPrefs));
    }
  };

  const savePlans = (newPlans: TrainingPlan[], newActiveId?: string) => {
    setPlans(newPlans);
    if (newActiveId) setActivePlanId(newActiveId);

    if (user) {
      localStorage.setItem(getPlansKey(user.id), JSON.stringify(newPlans));
      if (newActiveId) localStorage.setItem(getActivePlanIdKey(user.id), newActiveId);
    }
  };

  const saveHistory = (newHistory: SessionRecord[]) => {
    setHistory(newHistory);

    const updatedPlans = plans.map(p => calculatePlanProgress(p, newHistory));
    savePlans(updatedPlans);

    if (user) {
      localStorage.setItem(getHistoryKey(user.id), JSON.stringify(newHistory));
    }
  };

  const saveWeeklyContext = (context: FeedbackRecord | null) => {
    setWeeklyContext(context);
    if (user) {
      if (context) localStorage.setItem(getWeeklyContextKey(user.id), JSON.stringify(context));
      else localStorage.removeItem(getWeeklyContextKey(user.id));
    }
  };

  // --- Handlers ---

  const handleOnboardingComplete = () => {
    const generatedPlan = createPersonalizedPlan(preferences, 1);
    savePlans([generatedPlan], generatedPlan.id);

    const finalPrefs = {
      ...preferences,
      hasOnboarded: true,
      startDate: new Date().toISOString()
    };
    savePreferences(finalPrefs);
    setView('DASHBOARD');
  };

  const handleOpenPrefsEditor = () => {
    setEditingPrefs({ ...preferences });
  };

  const handleSavePrefsEditor = () => {
    if (!editingPrefs) return;

    savePreferences(editingPrefs);

    if (activePlan) {
      const newPlan = createPersonalizedPlan(editingPrefs, activePlan.stage || 1);
      const updatedPlan = {
        ...newPlan,
        id: activePlan.id,
        name: activePlan.name,
        progress: activePlan.progress,
        completedSessions: activePlan.completedSessions
      };
      const updatedPlans = plans.map(p => p.id === activePlan.id ? updatedPlan : p);
      savePlans(updatedPlans);
    }

    setEditingPrefs(null);
  };

  // Updated to accept custom preferences
  const handleCreateNewPlan = (customPrefs?: UserPreferences) => {
    const prefsToUse = customPrefs || preferences;
    const newPlan = createPersonalizedPlan(prefsToUse, 1);

    // Check if duplicate name exists, append suffix
    const existingCount = plans.filter(p => p.name.startsWith(newPlan.name)).length;
    if (existingCount > 0) {
      newPlan.name = `${newPlan.name} (${existingCount + 1})`;
    }

    // Ensure unique ID
    newPlan.id = `plan-${Date.now()}`;

    const updatedPlans = [...plans, newPlan];
    savePlans(updatedPlans, newPlan.id);
  };

  // --- PATHWAY SELECTION HANDLER ---
  const handleSelectPathway = (path: PlanPathway) => {
    if (!activePlan) return;

    // 1. Mark current as completed
    const archivedPlan = { ...activePlan, status: 'completed' as const };

    // 2. Create Next Level Plan based on Selection
    const newPrefs = {
      ...preferences,
      level: path.targetLevel,
      goal: path.targetGoal
    };

    const nextPlan = createPersonalizedPlan(newPrefs, path.targetStage);

    // Update Name/Reason based on path
    nextPlan.name = path.title; // e.g. "Continuar Flexibilidade II"
    nextPlan.reasoning = [path.reason, ...nextPlan.reasoning!];

    // 3. Update State
    const updatedPlans = plans.map(p => p.id === activePlan.id ? archivedPlan : p);
    updatedPlans.push(nextPlan);

    savePlans(updatedPlans, nextPlan.id);
    savePreferences({ ...newPrefs, startDate: new Date().toISOString() });

    setShowGraduation(false);
    setWeeklyReport(null);
    setView('JOURNEY');
  };

  const handleDeletePlan = (planId: string) => {
    const updatedPlans = plans.filter(p => p.id !== planId);
    let newActiveId = activePlanId;

    if (activePlanId === planId) {
      newActiveId = updatedPlans.length > 0 ? updatedPlans[0].id : undefined;
    }

    if (activePlanId === planId && newActiveId) {
      savePlans(updatedPlans, newActiveId);
    } else if (updatedPlans.length === 0) {
      setPlans([]);
      setActivePlanId(null);
      if (user) {
        localStorage.setItem(getPlansKey(user.id), JSON.stringify([]));
        localStorage.removeItem(getActivePlanIdKey(user.id));
      }
    } else {
      savePlans(updatedPlans);
    }
  };

  const handleGenerate = async () => {
    try {
      const routine = await generateRoutine(preferences);
      setCurrentRoutine(routine);
      setView('ROUTINE_EDITOR');
    } catch (err) {
      console.error("Erro ao gerar rotina:", err);
    }
  };

  const handleRoutineComplete = () => {
    setStoryType('POST_PRACTICE');
    setView('STORIES');
  };

  const handleMarkDayComplete = (dateStr: string, planDay: PlanDay) => {
    const newRecord: SessionRecord = {
      id: Date.now().toString(),
      userId: user?.id,
      planId: activePlan?.id,
      date: dateStr,
      routineName: planDay.practiceName || planDay.focus || `Prática de ${preferences.goal}`,
      duration: preferences.duration
    };
    saveHistory([newRecord, ...history]);
  };

  const handleUpdateDay = (weekIndex: number, dayIndex: number, newDayData: PlanDay) => {
    if (!activePlan) return;

    let newWeeks = activePlan.weeks ? [...activePlan.weeks] : [];

    if (newWeeks.length === 0) {
      newWeeks = [activePlan.schedule, activePlan.schedule, activePlan.schedule, activePlan.schedule];
    }

    const targetWeek = [...newWeeks[weekIndex]];
    targetWeek[dayIndex] = newDayData;
    newWeeks[weekIndex] = targetWeek;

    const updatedPlan = {
      ...activePlan,
      weeks: newWeeks,
      schedule: weekIndex === 0 ? targetWeek : activePlan.schedule
    };

    const updatedPlans = plans.map(p => p.id === activePlan.id ? updatedPlan : p);

    savePlans(updatedPlans);
  };

  const handleDashboardSwap = (type: 'Active' | 'Rest', practice?: { label: string, desc: string }) => {
    const todayCtx = getTodayContext();
    if (!todayCtx) return;

    let newDay: PlanDay;
    if (type === 'Rest') {
      newDay = {
        dayOfWeek: todayCtx.dayIndex,
        activityType: 'Rest',
        practiceName: 'Descanso',
        focus: 'Recuperação',
        description: 'Dia de recuperação escolhido por você.'
      };
    } else {
      const name = practice?.label || 'Prática Livre';
      const desc = practice?.desc || 'Sessão personalizada.';
      newDay = {
        dayOfWeek: todayCtx.dayIndex,
        activityType: 'Active',
        practiceName: name,
        focus: 'Personalizado',
        description: `Sessão trocada manualmente: ${desc}`
      };
    }

    handleUpdateDay(todayCtx.weekIndex, todayCtx.dayIndex, newDay);
    setIsSwapModalOpen(false);
  };

  const handleStoriesComplete = (feedback: FeedbackRecord) => {
    if (feedback.type === 'POST_PRACTICE' && currentRoutine) {
      const newRecord: SessionRecord = {
        id: Date.now().toString(),
        userId: user?.id,
        planId: activePlan?.id,
        date: new Date().toISOString().split('T')[0],
        routineName: currentRoutine.name,
        duration: Math.round(currentRoutine.totalDuration / 60),
        feedback: feedback
      };
      saveHistory([newRecord, ...history]);

      const difficultyResponse = feedback.responses.find(r => r.question.includes("intensidade"));
      if (difficultyResponse && difficultyResponse.score !== undefined) {
        if (difficultyResponse.score === -1) {
          if (preferences.level === 'Avançado') savePreferences({ ...preferences, level: 'Intermediário' });
          else if (preferences.level === 'Intermediário') savePreferences({ ...preferences, level: 'Iniciante' });
        } else if (difficultyResponse.score === 1) {
          if (preferences.level === 'Iniciante') savePreferences({ ...preferences, level: 'Intermediário' });
          else if (preferences.level === 'Intermediário') savePreferences({ ...preferences, level: 'Avançado' });
        }
      }
    }
    else if (feedback.type === 'WEEKLY_CHECKIN') {
      saveWeeklyContext(feedback);
    }
    else if (feedback.type === 'WEEKLY_REVIEW') {
      const intention = weeklyContext?.responses.find(r => r.question.includes('intenção'))?.answer || "Não definida";
      const reality = feedback.responses.find(r => r.question.includes('intenção'))?.answer || "Não informado";
      const feeling = feedback.responses.find(r => r.question.includes('sentimento'))?.answer || "Neutro";

      let insight = "";
      if (reality.includes("Sim")) {
        insight = "Sua dedicação foi recompensada! Você conseguiu alinhar sua mente com suas ações. Mantenha esse foco para a próxima semana.";
      } else if (reality.includes("Parcialmente")) {
        insight = "Progresso não é linear. Você deu passos importantes, mesmo que o caminho tenha mudado. O importante é a constância.";
      } else {
        insight = "Tudo bem mudar de rota. Escutar o que o corpo precisa é mais valioso do que seguir um plano rígido. Recomece com gentileza.";
      }

      setWeeklyReport({
        intention,
        result: `${reality} - ${feeling}`,
        insight
      });

      const ctx = getTodayContext();
      if (ctx && ctx.weekIndex >= 3) {
        setShowGraduation(true);
      }

      saveWeeklyContext(null);
    }

    setView('JOURNEY');
  };

  const handleStartCheckin = (type: 'WEEKLY_CHECKIN' | 'WEEKLY_REVIEW') => {
    setStoryType(type);
    setView('STORIES');
  };

  const handlePoseSelect = (pose: Pose) => {
    setSelectedPose(pose);
    setView('POSE_DETAIL');
  };

  const getTodayContext = () => {
    if (!activePlan) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();

    let weekIndex = 0;
    if (activePlan.weeks && preferences.startDate) {
      const start = new Date(preferences.startDate);
      start.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        weekIndex = Math.floor(diffDays / 7) % activePlan.weeks.length;
      }
    }

    const week = activePlan.weeks ? activePlan.weeks[weekIndex] : activePlan.schedule;
    const dayPlan = week ? week[dayOfWeek] : activePlan.schedule[dayOfWeek];

    return { weekIndex, dayIndex: dayOfWeek, dayPlan };
  };

  const renderOnboarding = () => {
    const totalSteps = 6;
    const nextStep = () => setOnboardingStep(prev => prev + 1);
    const prevStep = () => setOnboardingStep(prev => Math.max(0, prev - 1));
    const progress = ((onboardingStep + 1) / totalSteps) * 100;

    const updatePrefs = (updates: Partial<UserPreferences>) => {
      setPreferences(prev => ({ ...prev, ...updates }));
    };

    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-sage-100">
            <div className="h-full bg-sage-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-4">
            {onboardingStep === 0 && (
              <div className="animate-fade-in">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
                    <UserIcon size={32} className="text-sage-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-medium text-center text-sage-900 mb-2">Sobre Você</h2>
                <p className="text-center text-stone-500 mb-8">Olá {user?.name.split(' ')[0]}, precisamos conhecer um pouco sobre seu corpo.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Sua Idade</label>
                    <input
                      type="number"
                      value={preferences.age || ''}
                      onChange={(e) => updatePrefs({ age: parseInt(e.target.value) || undefined })}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:outline-none text-lg"
                      placeholder="Ex: 30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Peso (kg) <span className="text-stone-400 font-normal">(Opcional)</span></label>
                    <input
                      type="number"
                      value={preferences.weight || ''}
                      onChange={(e) => updatePrefs({ weight: parseInt(e.target.value) || undefined })}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:outline-none text-lg"
                      placeholder="Ex: 70"
                    />
                  </div>
                </div>

                <Button onClick={nextStep} disabled={!preferences.age} className="w-full mt-8">
                  Continuar <ArrowRight size={18} />
                </Button>

                <div className="mt-4 text-center">
                  <button onClick={handleLogout} className="text-sm text-stone-400 hover:text-stone-600">Sair da conta</button>
                </div>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="animate-fade-in">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-orange-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-medium text-center text-sage-900 mb-2">Áreas de Atenção</h2>
                <p className="text-center text-stone-500 mb-8">Você sente desconforto em alguma dessas áreas? Vamos adaptar as posturas para você.</p>

                <div className="grid grid-cols-2 gap-3">
                  {(['Lombar', 'Joelhos', 'Pescoço/Ombros', 'Punhos', 'Nenhum'] as Discomfort[]).map((option) => {
                    const isSelected = preferences.discomforts.includes(option);
                    const isNone = option === 'Nenhum';

                    return (
                      <button
                        key={option}
                        onClick={() => {
                          if (isNone) {
                            updatePrefs({ discomforts: ['Nenhum'] });
                          } else {
                            const current = preferences.discomforts.filter(d => d !== 'Nenhum');
                            const newDiscomforts = current.includes(option)
                              ? current.filter(d => d !== option)
                              : [...current, option];
                            updatePrefs({ discomforts: newDiscomforts });
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-sm font-medium h-24
                          ${isSelected
                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                            : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200'
                          }
                        `}
                      >
                        {isSelected && <Check size={16} className="text-sage-600" />}
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-8">
                  <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                  <Button onClick={nextStep} className="flex-1">
                    Continuar <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="animate-fade-in">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity size={32} className="text-blue-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-medium text-center text-sage-900 mb-2">Nível de Experiência</h2>
                <p className="text-center text-stone-500 mb-8">Como você descreveria sua prática atual?</p>

                <div className="space-y-3">
                  {(['Iniciante', 'Intermediário', 'Avançado'] as Difficulty[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        updatePrefs({ level: opt });
                        nextStep();
                      }}
                      className="w-full p-4 bg-white rounded-xl shadow-sm border border-stone-200 hover:border-sage-400 hover:shadow-md transition-all text-left flex justify-between items-center group"
                    >
                      <span className="text-lg text-stone-700 font-medium group-hover:text-sage-700">{opt}</span>
                      <div className={`w-6 h-6 rounded-full border-2 ${preferences.level === opt ? 'bg-sage-600 border-sage-600' : 'border-stone-200'} group-hover:border-sage-500`} />
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="ghost" onClick={prevStep} className="w-full">Voltar</Button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="animate-fade-in">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <CalendarDays size={32} className="text-pink-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-medium text-center text-sage-900 mb-2">Frequência</h2>
                <p className="text-center text-stone-500 mb-8">Quantos dias por semana você gostaria de praticar?</p>

                <div className="grid grid-cols-3 gap-3">
                  {[2, 3, 4, 5, 6, 7].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        updatePrefs({ frequency: days });
                        nextStep();
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1
                        ${preferences.frequency === days
                          ? 'border-sage-500 bg-sage-50 text-sage-800'
                          : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200'
                        }
                      `}
                    >
                      <span className="text-2xl font-bold">{days}</span>
                      <span className="text-xs font-medium">Dias</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="ghost" onClick={prevStep} className="w-full">Voltar</Button>
                </div>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="animate-fade-in">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Zap size={32} className="text-yellow-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-medium text-center text-sage-900 mb-2">Objetivo Principal</h2>
                <p className="text-center text-stone-500 mb-8">O que você busca alcançar com o YogaFlow?</p>

                <div className="space-y-3">
                  {(['Flexibilidade', 'Força', 'Relaxamento', 'Alívio de Dor'] as Goal[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        updatePrefs({ goal: opt });
                        nextStep();
                      }}
                      className="w-full p-4 bg-white rounded-xl shadow-sm border border-stone-200 hover:border-sage-400 hover:shadow-md transition-all text-left flex justify-between items-center group"
                    >
                      <span className="text-lg text-stone-700 font-medium group-hover:text-sage-700">{opt}</span>
                      <div className={`w-6 h-6 rounded-full border-2 ${preferences.goal === opt ? 'bg-sage-600 border-sage-600' : 'border-stone-200'} group-hover:border-sage-500`} />
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="ghost" onClick={prevStep} className="w-full">Voltar</Button>
                </div>
              </div>
            )}

            {onboardingStep === 5 && (
              <div className="animate-fade-in">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock size={32} className="text-purple-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-medium text-center text-sage-900 mb-2">Tempo Disponível</h2>
                <p className="text-center text-stone-500 mb-8">Quanto tempo você gostaria de dedicar por sessão?</p>

                <div className="space-y-3">
                  {([15, 30, 45] as Duration[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        const newPrefs = { ...preferences, duration: opt };
                        setPreferences(newPrefs);
                        setTimeout(() => handleOnboardingComplete(), 50);
                      }}
                      className={`w-full p-4 bg-white rounded-xl shadow-sm border transition-all text-left flex justify-between items-center group
                        ${preferences.duration === opt ? 'border-sage-500 ring-1 ring-sage-500' : 'border-stone-200 hover:border-sage-400'}
                      `}
                    >
                      <span className="text-lg text-stone-700 font-medium group-hover:text-sage-700">{opt} minutos</span>
                      <div className={`w-6 h-6 rounded-full border-2 ${preferences.duration === opt ? 'bg-sage-600 border-sage-600' : 'border-stone-200'} group-hover:border-sage-500`} />
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-8">
                  <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                  <Button onClick={handleOnboardingComplete} className="flex-1">
                    Criar Meu Plano
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const todayCtx = getTodayContext();
    const isRestDay = todayCtx?.dayPlan?.activityType === 'Rest';
    const todayPracticeName = todayCtx?.dayPlan?.practiceName || todayCtx?.dayPlan?.focus || `Fluxo de ${preferences.goal}`;
    const todayFocus = isRestDay ? "Recuperação" : (todayCtx?.dayPlan?.focus || preferences.goal);

    const todayDesc = todayCtx?.dayPlan?.description || (isRestDay ? "Aproveite para recarregar suas energias." : `Uma sequência de ${preferences.duration} minutos adaptada para você.`);

    return (
      <div className="pb-24 pt-8 px-6 max-w-4xl mx-auto animate-fade-in">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light text-sage-900 mb-2">Olá, {user?.name.split(' ')[0]}</h1>
            <p className="text-stone-500">Pronto para encontrar seu centro hoje?</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
              <Smile size={20} className="text-orange-400" />
              <span className="text-sm font-medium text-stone-600">{history.length} Sessões Completadas</span>
            </div>
            <button onClick={handleLogout} className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1">
              <LogOut size={12} /> Sair
            </button>
          </div>
        </header>

        <section className="mb-10">
          <div className={`rounded-3xl p-8 text-white shadow-xl relative overflow-hidden ${isRestDay ? 'bg-gradient-to-br from-stone-500 to-stone-700' : 'bg-gradient-to-br from-sage-600 to-sage-800'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-white/80">
                {isRestDay ? <Coffee size={18} /> : <Zap size={18} />}
                <span className="text-sm font-medium tracking-wide uppercase">{isRestDay ? "Dia de Descanso" : "Prática de Hoje"}</span>
              </div>

              <h2 className="text-3xl font-semibold mb-2">{todayPracticeName}</h2>
              <div className="mb-6 flex items-center gap-2">
                <Badge color={isRestDay ? "green" : "blue"}>{todayFocus}</Badge>
              </div>

              <p className="text-white/80 mb-8 max-w-md line-clamp-2">
                {todayDesc}
              </p>

              <div className="flex gap-4">
                {!isRestDay ? (
                  <Button onClick={handleGenerate} className="bg-white text-sage-800 hover:bg-sage-50 shadow-none border-0">
                    <Play size={20} fill="currentColor" />
                    Iniciar Prática
                  </Button>
                ) : (
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10 cursor-default">
                    <Check size={20} /> Recuperação Ativa
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsSwapModalOpen(true)} className="border-white/30 text-white hover:bg-white/10" title="Trocar Prática de Hoje">
                  <Edit2 size={20} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-medium text-stone-700 mb-4">Ajustar Preferências</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between cursor-pointer hover:border-sage-300 transition-colors" onClick={handleOpenPrefsEditor}>
              <div>
                <p className="text-xs text-stone-400 uppercase font-bold">Objetivo</p>
                <p className="text-sage-800 font-medium">{preferences.goal}</p>
              </div>
              <Zap size={20} className="text-stone-300" />
            </Card>
            <Card className="p-4 flex items-center justify-between cursor-pointer hover:border-sage-300 transition-colors" onClick={handleOpenPrefsEditor}>
              <div>
                <p className="text-xs text-stone-400 uppercase font-bold">Duração</p>
                <p className="text-sage-800 font-medium">{preferences.duration} Min</p>
              </div>
              <Clock size={20} className="text-stone-300" />
            </Card>
            <Card className="p-4 flex items-center justify-between cursor-pointer hover:border-sage-300 transition-colors" onClick={handleOpenPrefsEditor}>
              <div>
                <p className="text-xs text-stone-400 uppercase font-bold">Frequência</p>
                <p className="text-sage-800 font-medium">{preferences.frequency || 3}x Semana</p>
              </div>
              <CalendarDays size={20} className="text-stone-300" />
            </Card>
          </div>
        </section>

        {editingPrefs && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-3xl">
                <h3 className="text-xl font-light text-sage-900 flex items-center gap-2">
                  <Edit2 size={20} /> Editar Preferências do Plano
                </h3>
                <button onClick={() => setEditingPrefs(null)} className="text-stone-400 hover:text-stone-600">
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-6 flex-1 space-y-8">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-stone-500 uppercase">Objetivo Principal</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Flexibilidade', 'Força', 'Relaxamento', 'Alívio de Dor'] as Goal[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setEditingPrefs({ ...editingPrefs, goal: g })}
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium
                                 ${editingPrefs.goal === g
                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                            : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200'
                          }
                               `}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-stone-500 uppercase">Nível de Experiência</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Iniciante', 'Intermediário', 'Avançado'] as Difficulty[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => setEditingPrefs({ ...editingPrefs, level: l })}
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium
                                 ${editingPrefs.level === l
                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                            : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200'
                          }
                               `}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-stone-500 uppercase">Frequência Semanal</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[2, 3, 4, 5, 6, 7].map((d) => (
                      <button
                        key={d}
                        onClick={() => setEditingPrefs({ ...editingPrefs, frequency: d })}
                        className={`p-3 min-w-[3rem] rounded-xl border-2 transition-all text-sm font-medium
                                 ${editingPrefs.frequency === d
                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                            : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200'
                          }
                               `}
                      >
                        {d}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-stone-500 uppercase">Duração (Minutos)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {([15, 30, 45] as Duration[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setEditingPrefs({ ...editingPrefs, duration: d })}
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium
                                 ${editingPrefs.duration === d
                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                            : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200'
                          }
                               `}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-stone-500 uppercase">Áreas de Atenção</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Lombar', 'Joelhos', 'Pescoço/Ombros', 'Punhos', 'Nenhum'] as Discomfort[]).map((option) => {
                      const isSelected = editingPrefs.discomforts.includes(option);
                      const isNone = option === 'Nenhum';
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            if (isNone) {
                              setEditingPrefs({ ...editingPrefs, discomforts: ['Nenhum'] });
                            } else {
                              const current = editingPrefs.discomforts.filter(d => d !== 'Nenhum');
                              const newDiscomforts = current.includes(option)
                                ? current.filter(d => d !== option)
                                : [...current, option];
                              setEditingPrefs({ ...editingPrefs, discomforts: newDiscomforts });
                            }
                          }}
                          className={`p-3 rounded-xl border-2 transition-all text-sm font-medium flex items-center justify-center gap-2
                                   ${isSelected
                              ? 'border-sage-500 bg-sage-50 text-sage-800'
                              : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200'
                            }
                                 `}
                        >
                          {isSelected && <Check size={14} className="text-sage-600" />}
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Idade</label>
                    <input
                      type="number"
                      value={editingPrefs.age || ''}
                      onChange={(e) => setEditingPrefs({ ...editingPrefs, age: parseInt(e.target.value) || undefined })}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Peso (kg)</label>
                    <input
                      type="number"
                      value={editingPrefs.weight || ''}
                      onChange={(e) => setEditingPrefs({ ...editingPrefs, weight: parseInt(e.target.value) || undefined })}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300"
                    />
                  </div>
                </div>


                <div className="bg-stone-50 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-stone-700">Reprodução Automática</p>
                    <p className="text-xs text-stone-500 max-w-[200px]">Avançar para a próxima postura automaticamente quando o tempo acabar.</p>
                  </div>
                  <button
                    onClick={() => setEditingPrefs({ ...editingPrefs, autoAdvance: !editingPrefs.autoAdvance })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${editingPrefs.autoAdvance ? 'bg-sage-600' : 'bg-stone-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editingPrefs.autoAdvance ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

              </div>



              <div className="p-6 border-t border-stone-100 flex justify-end gap-3 rounded-b-3xl bg-white">
                <Button variant="ghost" onClick={() => setEditingPrefs(null)}>Cancelar</Button>
                <Button onClick={handleSavePrefsEditor}>
                  <Save size={18} /> Salvar & Atualizar Plano
                </Button>
              </div>
            </div>
          </div>
        )}

        {
          isSwapModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-sage-900">Trocar Prática de Hoje</h3>
                  <button onClick={() => setIsSwapModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <p className="text-stone-500 text-sm mb-4">Escolha o que você gostaria de fazer hoje em vez da programação original.</p>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleDashboardSwap('Rest')}
                      className="flex items-center gap-4 p-4 rounded-xl border border-stone-200 hover:border-sage-400 hover:bg-stone-50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 group-hover:bg-white group-hover:text-stone-700">
                        <Coffee size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">Tirar o Dia de Folga</p>
                        <p className="text-xs text-stone-400">Marcar como dia de descanso</p>
                      </div>
                    </button>

                    <div className="my-2 border-t border-stone-100"></div>

                    {swapOptions.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => handleDashboardSwap('Active', opt)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-sage-50 transition-all text-left group"
                      >
                        <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 group-hover:bg-sage-200">
                          {opt.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sage-900">{opt.label}</p>
                          <p className="text-xs text-stone-500">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >
    );
  };

  if (view === 'AUTH') {
    return <AuthScreen onSuccess={handleUserAuthenticated} />;
  }

  if (!user && view !== 'AUTH') {
    setView('AUTH');
    return null;
  }

  if (view === 'STORIES') {
    return (
      <StoriesOverlay
        type={storyType}
        onComplete={handleStoriesComplete}
        onClose={() => setView('JOURNEY')}
      />
    );
  }

  if (view === 'PLAYER' && currentRoutine) {
    return (
      <RoutinePlayer
        routine={currentRoutine}
        onExit={() => setView('DASHBOARD')}
        onComplete={handleRoutineComplete}
        autoAdvance={preferences.autoAdvance || false}
        onToggleAutoAdvance={() => setPreferences(prev => ({ ...prev, autoAdvance: !prev.autoAdvance }))}
      />
    );
  }

  if (view === 'ROUTINE_EDITOR' && currentRoutine) {
    return (
      <RoutineEditor
        routine={currentRoutine}
        onCancel={() => setView('DASHBOARD')}
        onSaveAndPlay={(updatedRoutine) => {
          setCurrentRoutine(updatedRoutine);
          setView('PLAYER');
        }}
      />
    );
  }

  if (view === 'PLAN_EDITOR' && activePlan) {
    return (
      <PlanEditor
        initialPlan={activePlan}
        onCancel={() => setView('JOURNEY')}
        onSave={(updatedPlan) => {
          const updatedPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
          savePlans(updatedPlans);
          setView('JOURNEY');
        }}
      />
    );
  }

  if (view === 'ONBOARDING') {
    return renderOnboarding();
  }

  return (
    <div className="min-h-screen bg-zen-offwhite text-stone-800 font-sans relative">
      <main className="min-h-screen">
        {view === 'DASHBOARD' && renderDashboard()}
        {view === 'LIBRARY' && <PoseLibrary onPoseSelect={handlePoseSelect} />}
        {view === 'POSE_DETAIL' && selectedPose && (
          <PoseDetail
            pose={selectedPose}
            onBack={() => setView('LIBRARY')}
          />
        )}
        {view === 'LEARNING' && <LearningHub />}
        {view === 'JOURNEY' && (
          <Journey
            preferences={preferences}
            history={history}
            customPlan={activePlan}
            plans={plans}
            activePlanId={activePlanId}
            onSwitchPlan={(id) => savePlans(plans, id)}
            onCreateNewPlan={handleCreateNewPlan}
            onDeletePlan={handleDeletePlan}
            onStartRoutine={handleGenerate}
            onEditPlan={() => setView('PLAN_EDITOR')}
            onUpdateDay={handleUpdateDay}
            onMarkComplete={handleMarkDayComplete}
            onStartCheckin={handleStartCheckin}
          />
        )}
      </main>

      {weeklyReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in text-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star size={32} className="text-purple-500" fill="currentColor" />
            </div>

            <h2 className="text-2xl font-bold text-sage-900 mb-2">Sua Semana em Resumo</h2>
            <p className="text-stone-500 mb-8">Conectando sua intenção com sua realidade.</p>

            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-stone-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-stone-400 uppercase">Intenção Inicial</p>
                <p className="text-lg font-medium text-sage-800">{weeklyReport.intention}</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-stone-400 uppercase">Resultado Real</p>
                <p className="text-lg font-medium text-sage-800">{weeklyReport.result}</p>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl text-indigo-900 italic mb-8 relative">
              <span className="absolute top-2 left-2 text-4xl text-indigo-200 font-serif leading-none">"</span>
              {weeklyReport.insight}
              <span className="absolute bottom-[-10px] right-4 text-4xl text-indigo-200 font-serif leading-none">"</span>
            </div>

            <Button onClick={() => setWeeklyReport(null)} className="w-full">
              {showGraduation ? "Ver Próximo Passo" : "Iniciar Nova Semana"}
            </Button>
          </div>
        </div>
      )}

      {!weeklyReport && showGraduation && activePlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,113,108,0.1),transparent)] pointer-events-none"></div>

            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                <Trophy size={48} className="text-yellow-500" />
              </div>
              <h2 className="text-3xl font-light text-sage-900 mb-2">Jornada Concluída!</h2>
              <p className="text-stone-500">
                Você completou <strong>{activePlan.name}</strong>. Escolha seu próximo caminho.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mb-4">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Caminhos Disponíveis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePlan.nextPaths?.map((path) => (
                  <button
                    key={path.id}
                    onClick={() => handleSelectPathway(path)}
                    className="text-left bg-white border-2 border-stone-100 hover:border-sage-400 hover:shadow-lg p-5 rounded-2xl transition-all group flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge color={path.targetLevel === 'Avançado' ? 'orange' : path.targetLevel === 'Intermediário' ? 'blue' : 'green'}>
                        {path.targetLevel}
                      </Badge>
                      <div className="bg-sage-100 text-sage-700 p-1.5 rounded-full group-hover:bg-sage-600 group-hover:text-white transition-colors">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-sage-900 mb-1">{path.title}</h4>
                    <p className="text-sm text-stone-500 mb-3 flex-1">{path.description}</p>
                    <div className="flex items-center gap-2 text-xs text-sage-600 bg-sage-50 p-2 rounded-lg">
                      <GitBranch size={14} />
                      {path.reason}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={() => setShowGraduation(false)} className="text-stone-400 hover:text-stone-600">
                Decidir Depois
              </Button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-2 py-4 flex justify-between items-center z-40 md:justify-center md:gap-8">
        <button
          onClick={() => setView('DASHBOARD')}
          className={`flex flex-col items-center gap-1 w-16 ${view === 'DASHBOARD' ? 'text-sage-600' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium tracking-wide">Hoje</span>
        </button>

        <button
          onClick={() => setView('JOURNEY')}
          className={`flex flex-col items-center gap-1 w-16 ${view === 'JOURNEY' ? 'text-sage-600' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Map size={24} />
          <span className="text-[10px] font-medium tracking-wide">Jornada</span>
        </button>

        <button
          onClick={handleGenerate}
          className="bg-sage-600 text-white p-4 rounded-full -mt-10 shadow-lg shadow-sage-200 border-4 border-zen-offwhite hover:scale-105 transition-transform"
        >
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>

        <button
          onClick={() => setView('LIBRARY')}
          className={`flex flex-col items-center gap-1 min-w-[4rem] px-1 ${view === 'LIBRARY' ? 'text-sage-600' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Grid size={24} />
          <span className="text-[10px] font-medium tracking-wide whitespace-nowrap">Biblioteca</span>
        </button>

        <button
          onClick={() => setView('LEARNING')}
          className={`flex flex-col items-center gap-1 min-w-[4rem] px-1 ${view === 'LEARNING' ? 'text-sage-600' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <BookOpen size={24} />
          <span className="text-[10px] font-medium tracking-wide whitespace-nowrap">Aprender</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
