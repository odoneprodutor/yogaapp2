
import React, { useState, useMemo, useEffect } from 'react';
import { UserPreferences, SessionRecord, TrainingPlan, PlanDay, Memory, Goal, Difficulty, Duration } from '../types';
import { createPersonalizedPlan } from '../services/planEngine';
import { Calendar } from './Calendar';
import { Card, Badge, Button } from './ui';
import { Calendar as CalendarIcon, Target, Trophy, Clock, Check, Edit3, Repeat, Coffee, Zap, X, Activity, Play, CheckCircle, Lightbulb, Info, Trash2, CalendarRange, List, Plus, Flame, Heart, Droplets, Wind, Mountain, Award, ChevronRight } from 'lucide-react';

interface JourneyProps {
    preferences: UserPreferences;
    history: SessionRecord[];
    customPlan: TrainingPlan | null; // Currently active plan
    plans?: TrainingPlan[]; // All available plans (optional for backward compatibility)
    activePlanId?: string | null;
    onSwitchPlan?: (planId: string) => void;
    onCreateNewPlan?: (prefs?: UserPreferences) => void;
    onDeletePlan?: (planId: string) => void;
    onStartRoutine: () => void;
    onEditPlan: () => void; // Trigger for editing whole plan
    onUpdateDay: (weekIndex: number, dayIndex: number, day: PlanDay) => void; // Updated to support weekIndex
    onMarkComplete: (dateStr: string, planDay: PlanDay) => void;
    onStartCheckin: (type: 'WEEKLY_CHECKIN' | 'WEEKLY_REVIEW') => void; // Trigger for weekly stories
}

const STORAGE_KEY_MEMORIES = 'yogaflow_memories';

export const Journey: React.FC<JourneyProps> = ({
    preferences,
    history,
    customPlan,
    plans = [],
    activePlanId,
    onSwitchPlan,
    onCreateNewPlan,
    onDeletePlan,
    onStartRoutine,
    onEditPlan,
    onUpdateDay,
    onMarkComplete,
    onStartCheckin
}) => {
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(new Date().toISOString().split('T')[0]);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [isManagePlansModalOpen, setIsManagePlansModalOpen] = useState(false);

    // New Plan Wizard State
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [creatorStep, setCreatorStep] = useState(0);
    const [creatorPrefs, setCreatorPrefs] = useState<UserPreferences>(preferences);

    const [showInsights, setShowInsights] = useState(true);

    // Week Selector State
    const [activeWeekTab, setActiveWeekTab] = useState(0);

    // Use custom plan if available, otherwise derive from goals
    const plan = useMemo(() => {
        return customPlan || createPersonalizedPlan(preferences);
    }, [preferences, customPlan]);

    // Calculate progress for stats
    const totalSessions = history.length;
    const totalMinutes = history.reduce((acc, curr) => acc + curr.duration, 0);

    // Get selected day details
    const selectedDayHistory = selectedDateStr
        ? history.filter(h => h.date === selectedDateStr)
        : [];

    const getWeekIndexForDate = (dateStr: string) => {
        if (!preferences.startDate || !plan.weeks) return 0;

        // Helper to get integer day count from epoch (UTC)
        const getDayCount = (dStr: string) => {
            const cleanDate = dStr.split('T')[0];
            const [y, m, d] = cleanDate.split('-').map(Number);
            const utc = Date.UTC(y, m - 1, d, 12, 0, 0);
            return Math.floor(utc / (1000 * 60 * 60 * 24));
        };

        const startDayCount = getDayCount(preferences.startDate);
        const currentDayCount = getDayCount(dateStr);

        // Calculate Day of Week for start date based on exact UTC date
        // Reference: can just use getUTCDay() on a definitive noon-UTC date object
        const [sy, sm, sd] = preferences.startDate.split('T')[0].split('-').map(Number);
        const startDow = new Date(Date.UTC(sy, sm - 1, sd, 12, 0, 0)).getUTCDay();

        // Effective Start Day Count (The Sunday of the start week)
        const effectiveStartDayCount = startDayCount - startDow;

        const diffDays = currentDayCount - effectiveStartDayCount;

        if (diffDays < 0) return 0;

        return Math.floor(diffDays / 7) % plan.weeks.length;
    };

    const getDayPlan = (dateStr: string) => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getUTCDay(); // 0-6 - Use UTC to match YYYY-MM-DD string
        const weekIndex = getWeekIndexForDate(dateStr);

        if (plan.weeks && plan.weeks.length > weekIndex) {
            return {
                ...plan.weeks[weekIndex][dayOfWeek],
                weekLabel: weekIndex + 1
            };
        }
        return plan.schedule[dayOfWeek];
    };

    const selectedDayPlan: (PlanDay & { weekLabel?: number }) | null = selectedDateStr ? getDayPlan(selectedDateStr) : null;
    const isToday = selectedDateStr === new Date().toISOString().split('T')[0];

    // Sync active week tab with selected date if user clicks calendar
    useEffect(() => {
        if (selectedDateStr) {
            const weekIdx = getWeekIndexForDate(selectedDateStr);
            setActiveWeekTab(weekIdx);
        }
    }, [selectedDateStr]);

    const handleSwapPractice = (type: 'Active' | 'Rest', practice?: { label: string, desc: string }) => {
        if (!selectedDateStr) return;
        const date = new Date(selectedDateStr);
        const dayIndex = date.getUTCDay(); // Use UTC to match dateStr
        const weekIndex = getWeekIndexForDate(selectedDateStr);

        let newDay: PlanDay;

        if (type === 'Rest') {
            newDay = {
                dayOfWeek: dayIndex,
                activityType: 'Rest',
                practiceName: 'Descanso',
                focus: 'Recuperação',
                description: 'Dia de recuperação escolhido por você.'
            };
        } else {
            const name = practice?.label || 'Prática Livre';
            const desc = practice?.desc || 'Sessão personalizada.';
            newDay = {
                dayOfWeek: dayIndex,
                activityType: 'Active',
                practiceName: name,
                focus: 'Personalizado',
                description: `Sessão trocada manualmente: ${desc}`
            };
        }

        // IMPORTANT: Pass weekIndex to ensure we update the specific week
        onUpdateDay(weekIndex, dayIndex, newDay);
        setIsSwapModalOpen(false);
    };

    const handleOpenCreator = () => {
        setCreatorPrefs(preferences); // Reset to current defaults but user can change
        setCreatorStep(0);
        setIsManagePlansModalOpen(false);
        setIsCreatorOpen(true);
    };

    const handleFinishCreator = () => {
        if (onCreateNewPlan) {
            onCreateNewPlan(creatorPrefs);
            setIsCreatorOpen(false);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Tem certeza que deseja apagar este plano? O histórico de sessões será mantido.")) {
            if (onDeletePlan) onDeletePlan(id);
        }
    };

    // Expanded swap options as requested (5 new ones added)
    const swapOptions = [
        { label: 'Flexibilidade', icon: <Activity size={18} />, desc: 'Focar em alongamento' },
        { label: 'Força', icon: <Zap size={18} />, desc: 'Focar em tonificação' },
        { label: 'Relaxamento', icon: <Coffee size={18} />, desc: 'Focar em desestressar' },
        { label: 'Alívio de Dor', icon: <Target size={18} />, desc: 'Focar em recuperação' },
        // 5 New Options below
        { label: 'Core Blast', icon: <Flame size={18} />, desc: 'Foco abdominal intenso' },
        { label: 'Cardio Yoga', icon: <Heart size={18} />, desc: 'Fluxo rápido para suar' },
        { label: 'Detox Twist', icon: <Droplets size={18} />, desc: 'Torções para digestão' },
        { label: 'Respiração Profunda', icon: <Wind size={18} />, desc: 'Pranayamas e calma' },
        { label: 'Equilíbrio & Foco', icon: <Mountain size={18} />, desc: 'Posturas de pé e concentração' },
    ];

    const completionPercent = plan.progress || 0;

    return (
        <div className="pb-24 pt-8 px-4 max-w-5xl mx-auto animate-fade-in relative">
            <div className="mb-6">
                <h1 className="text-3xl font-light text-sage-900">Sua Jornada</h1>
                <p className="text-stone-500">Acompanhe seu progresso e siga seu plano.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Calendar & History - Sticky on Desktop */}
                <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-8 lg:h-[calc(100vh-6rem)] lg:flex lg:flex-col lg:overflow-hidden">
                    <div className="flex-shrink-0">
                        <Calendar
                            history={history}
                            currentDate={currentCalendarDate}
                            onMonthChange={setCurrentCalendarDate}
                            onDateSelect={setSelectedDateStr}
                            selectedDateStr={selectedDateStr}
                            activePlanId={plan.id}
                        />
                    </div>

                    {/* Details for Selected Date - Scrollable on Desktop */}
                    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 lg:flex-1 lg:overflow-y-auto custom-scrollbar flex flex-col">
                        <h4 className="font-medium text-stone-700 mb-4 flex items-center gap-2 flex-shrink-0">
                            <CalendarIcon size={18} />
                            {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecione uma data'}
                        </h4>

                        {selectedDayHistory.length > 0 ? (
                            <div className="space-y-3">
                                {selectedDayHistory.map(session => (
                                    <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-sage-900">{session.routineName}</p>
                                                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                                                    <Check size={12} className="text-green-500" /> Completado
                                                </p>
                                            </div>
                                            <Badge color="green">{session.duration} min</Badge>
                                        </div>

                                        {/* Show feedback summary if available */}
                                        {session.feedback && (
                                            <div className="mt-2 pt-2 border-t border-stone-50 flex gap-2 overflow-x-auto no-scrollbar">
                                                {session.feedback.responses.map((r, i) => (
                                                    <span key={i} className="text-[10px] bg-stone-100 px-2 py-1 rounded-md text-stone-600 whitespace-nowrap">
                                                        {r.answer}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-stone-400">
                                <p>Nenhuma prática registrada neste dia.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: The Plan & Stats - Scrolls with page */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 flex flex-col items-center justify-center text-center py-6">
                            <Trophy size={24} className="text-yellow-500 mb-2" />
                            <span className="text-2xl font-bold text-sage-800">{totalSessions}</span>
                            <span className="text-xs text-stone-500 uppercase tracking-wide">Sessões</span>
                        </Card>
                        <Card className="p-4 flex flex-col items-center justify-center text-center py-6">
                            <Clock size={24} className="text-blue-400 mb-2" />
                            <span className="text-2xl font-bold text-sage-800">{totalMinutes}</span>
                            <span className="text-xs text-stone-500 uppercase tracking-wide">Minutos</span>
                        </Card>
                    </div>

                    {/* The Plan Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-sage-100/50 border border-sage-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sage-50 rounded-full translate-x-1/2 -translate-y-1/2" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <Badge color={plan.status === 'completed' ? 'green' : 'blue'}>
                                    {plan.status === 'completed' ? 'Concluído' : 'Plano Atual'}
                                </Badge>
                                <div className="flex gap-2">
                                    {/* Switch Plan Button */}
                                    <button
                                        onClick={() => setIsManagePlansModalOpen(true)}
                                        className="text-stone-400 hover:text-sage-600 transition-colors bg-white/50 p-2 rounded-full hover:bg-white"
                                        title="Trocar Jornada"
                                    >
                                        <List size={16} />
                                    </button>
                                    {/* Edit Current Plan Button */}
                                    <button
                                        onClick={onEditPlan}
                                        className="text-stone-400 hover:text-sage-600 transition-colors bg-white/50 p-2 rounded-full hover:bg-white"
                                        title="Editar Plano Completo"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-2xl font-light text-sage-900 mb-1">{plan.name}</h3>
                            <p className="text-sm text-stone-500 mb-4 line-clamp-2">{plan.description}</p>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-medium text-stone-500 mb-1">
                                    <span>Progresso</span>
                                    <span>{completionPercent}%</span>
                                </div>
                                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sage-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>
                            </div>

                            {plan.status === 'completed' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center animate-fade-in">
                                    <div className="flex justify-center mb-2">
                                        <Award className="text-yellow-600" size={24} />
                                    </div>
                                    <p className="font-bold text-yellow-800 text-sm">Jornada Completa!</p>
                                    <p className="text-xs text-yellow-700">Você finalizou este plano. Hora de criar um novo desafio?</p>
                                    <Button onClick={() => setIsManagePlansModalOpen(true)} className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 border-0 text-white shadow-none">
                                        Ver Próxima Evolução
                                    </Button>
                                </div>
                            )}

                            <div className="bg-sage-50 rounded-xl p-5 mb-6 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-sage-400 uppercase tracking-wider flex items-center gap-2">
                                        {isToday ? 'Foco de Hoje' : 'Foco deste dia'}
                                        {selectedDayPlan?.weekLabel && <span className="text-sage-300 text-[10px] bg-white px-1.5 py-0.5 rounded-full border border-sage-100">Semana {selectedDayPlan.weekLabel}</span>}
                                    </p>
                                    {/* Swap Button */}
                                    {selectedDateStr && (
                                        <button
                                            onClick={() => setIsSwapModalOpen(true)}
                                            className="text-sage-600 hover:text-sage-800 bg-white hover:bg-sage-100 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium shadow-sm"
                                        >
                                            <Repeat size={14} /> Trocar
                                        </button>
                                    )}
                                </div>

                                {selectedDayPlan?.activityType === 'Rest' ? (
                                    <div className="flex items-center gap-3 text-stone-500">
                                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                                            <span className="text-lg">☕</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-stone-700">Descanso</p>
                                            <p className="text-xs">Recupere suas energias.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-sage-800">
                                        <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center">
                                            <Target size={20} className="text-sage-700" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{selectedDayPlan?.practiceName || selectedDayPlan?.focus}</p>
                                            <p className="text-xs text-stone-500 line-clamp-1">
                                                {selectedDayPlan?.practiceName && selectedDayPlan.focus ? selectedDayPlan.focus : selectedDayPlan?.description}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedDayPlan?.activityType === 'Active' && (
                                <div className="flex flex-col gap-3">
                                    {isToday && (
                                        <Button onClick={onStartRoutine} className="w-full justify-center">
                                            <Play size={20} fill="currentColor" /> Iniciar Agora
                                        </Button>
                                    )}

                                    {/* Calculated outside loop for the single button */}
                                    {(() => {
                                        let alreadyCompleted = false;
                                        if (selectedDateStr && plan) {
                                            alreadyCompleted = history.some(h => h.date === selectedDateStr && h.planId === plan.id);
                                        }

                                        return (
                                            <Button
                                                variant={isToday && !alreadyCompleted ? "outline" : "primary"}
                                                onClick={() => {
                                                    if (selectedDateStr && selectedDayPlan) {
                                                        if (alreadyCompleted) {
                                                            if (window.confirm("Você já concluiu uma prática hoje. Deseja adicionar outra sessão ao seu histórico?")) {
                                                                onMarkComplete(selectedDateStr, selectedDayPlan);
                                                            }
                                                        } else {
                                                            onMarkComplete(selectedDateStr, selectedDayPlan);
                                                        }
                                                    }
                                                }}
                                                className={`w-full justify-center ${!isToday ? 'mt-2' : ''}`}
                                            >
                                                <CheckCircle size={20} />
                                                {isToday && !alreadyCompleted ? "Já fiz hoje" : (alreadyCompleted ? "Praticar Novamente" : "Marcar como Concluído")}
                                            </Button>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Plan Insights / Reasoning Section */}
                    {plan.reasoning && plan.reasoning.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                            <button
                                onClick={() => setShowInsights(!showInsights)}
                                className="flex items-center justify-between w-full text-left mb-2"
                            >
                                <div className="flex items-center gap-2 text-sage-800 font-medium">
                                    <Lightbulb size={20} className="text-yellow-500" />
                                    Entenda seu Plano
                                </div>
                            </button>

                            {showInsights && (
                                <div className="animate-fade-in mt-3 space-y-3">
                                    {plan.reasoning.map((reason, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm text-stone-600 bg-sage-50/50 p-3 rounded-lg">
                                            <Info size={16} className="text-sage-500 flex-shrink-0 mt-0.5" />
                                            <p>{reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Weekly Schedule with Tabs */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center overflow-x-auto pb-2 no-scrollbar gap-2">
                            {plan.weeks && plan.weeks.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveWeekTab(idx)}
                                    className={`
                            px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors
                            ${activeWeekTab === idx
                                            ? 'bg-sage-600 text-white'
                                            : 'bg-white border border-stone-200 text-stone-400 hover:text-stone-600'}
                        `}
                                >
                                    Semana {idx + 1}
                                </button>
                            ))}
                            {!plan.weeks && (
                                <span className="text-sm font-bold text-stone-400 uppercase tracking-wider ml-1">Semana Atual</span>
                            )}
                        </div>

                        {/* Render Weekly Items */}
                        {(plan.weeks ? plan.weeks[activeWeekTab] : plan.schedule).map((day, idx) => {
                            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                            const isRest = day.activityType === 'Rest';

                            // Calculate specific date for this item
                            let cellDateStr = '';
                            let dayNumber = '';

                            if (preferences.startDate) {
                                const start = new Date(preferences.startDate);
                                const startDayOfWeek = start.getDay(); // 0-6
                                const cellDate = new Date(start);
                                // Calculate the specific date for this cell (Week X, Day Y) relative to Start Date's week
                                cellDate.setDate(cellDate.getDate() - startDayOfWeek + (activeWeekTab * 7) + idx);
                                cellDateStr = cellDate.toISOString().split('T')[0];
                                dayNumber = cellDate.getDate().toString();
                            }

                            // Highlight selected day if it matches current viewed week view
                            const isSelected = selectedDateStr === cellDateStr;

                            // Check completion status
                            const isCompleted = history.some(h => h.date === cellDateStr && h.planId === plan.id);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => cellDateStr && setSelectedDateStr(cellDateStr)}
                                    className={`w-full flex items-center gap-4 text-sm p-3 rounded-xl transition-all border border-transparent ${isSelected ? 'bg-sage-50 border-sage-200 shadow-sm' : 'hover:bg-stone-50'}`}
                                >
                                    <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg shrink-0 ${isSelected ? 'bg-sage-200 text-sage-800' : (isRest ? 'bg-stone-100 text-stone-400' : 'bg-sage-50 text-sage-600')}`}>
                                        <span className="text-[9px] font-bold uppercase tracking-tighter">{dayNames[idx]}</span>
                                        {dayNumber && <span className="text-sm font-bold leading-none">{dayNumber}</span>}
                                    </div>

                                    <div className="flex-1 text-left">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${isRest ? 'text-stone-400' : 'text-stone-700'}`}>
                                                {isRest ? 'Descanso' : (day.practiceName || day.focus)}
                                            </span>
                                            {isCompleted && !isRest && (
                                                <CheckCircle size={16} className="text-green-500" fill="currentColor" color="white" />
                                            )}
                                        </div>
                                        <p className="text-xs text-stone-400 line-clamp-1">
                                            {isRest ? 'Recuperação' : day.description}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                </div>
            </div>

            {/* Swap Practice Modal */}
            {isSwapModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-sage-900">Trocar Prática do Dia</h3>
                            <button onClick={() => setIsSwapModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <p className="text-stone-500 text-sm mb-4">Escolha o que você gostaria de fazer hoje em vez da programação original.</p>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => handleSwapPractice('Rest')}
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
                                        onClick={() => handleSwapPractice('Active', opt)}
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
            )}

            {/* MANAGE PLANS MODAL */}
            {isManagePlansModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-sage-900">Minhas Jornadas</h3>
                            <button onClick={() => setIsManagePlansModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            <p className="text-sm text-stone-500 mb-4">
                                Gerencie seus planos salvos. Você pode ter múltiplas jornadas com focos diferentes.
                            </p>

                            <div className="space-y-3">
                                {plans.map(p => {
                                    const isActive = p.id === activePlanId;
                                    const isCompleted = p.status === 'completed';
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => onSwitchPlan && onSwitchPlan(p.id)}
                                            className={`
                                        relative p-4 rounded-xl border-2 transition-all cursor-pointer group
                                        ${isActive
                                                    ? 'border-sage-500 bg-sage-50 shadow-sm'
                                                    : 'border-stone-100 bg-white hover:border-sage-300'
                                                }
                                        ${isCompleted ? 'opacity-80' : ''}
                                    `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className={`font-medium flex items-center gap-2 ${isActive ? 'text-sage-900' : 'text-stone-700'}`}>
                                                        {p.name}
                                                        {isCompleted && <Badge color="green">Concluído</Badge>}
                                                    </h4>
                                                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">{p.description}</p>
                                                </div>
                                                {isActive && (
                                                    <div className="bg-sage-200 text-sage-800 p-1 rounded-full">
                                                        <Check size={14} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mini Progress Bar in List */}
                                            <div className="mt-3 w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-sage-400" style={{ width: `${p.progress || 0}%` }}></div>
                                            </div>

                                            <button
                                                onClick={(e) => handleDelete(p.id, e)}
                                                className="absolute bottom-2 right-2 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                title="Excluir Plano"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
                            <Button onClick={handleOpenCreator} className="w-full justify-center">
                                <Plus size={18} /> Criar Nova Jornada
                            </Button>
                            <p className="text-[10px] text-stone-400 text-center mt-2">
                                Defina um novo foco para sua próxima aventura.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW PLAN CREATOR WIZARD */}
            {isCreatorOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-3xl">
                            <h3 className="text-xl font-light text-sage-900">Nova Jornada Personalizada</h3>
                            <button onClick={() => setIsCreatorOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {creatorStep === 0 && (
                                <div className="space-y-4 animate-fade-in">
                                    <h4 className="text-lg font-medium text-center mb-6">Qual será o foco principal?</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(['Flexibilidade', 'Força', 'Relaxamento', 'Alívio de Dor'] as Goal[]).map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setCreatorPrefs({ ...creatorPrefs, goal: g })}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left group
                                              ${creatorPrefs.goal === g
                                                        ? 'border-sage-500 bg-sage-50 shadow-sm'
                                                        : 'border-stone-100 hover:border-sage-200'
                                                    }
                                          `}
                                            >
                                                <span className={`block font-bold text-lg mb-1 ${creatorPrefs.goal === g ? 'text-sage-900' : 'text-stone-700'}`}>{g}</span>
                                                <span className="text-xs text-stone-400">
                                                    {g === 'Flexibilidade' && 'Alongar e soltar.'}
                                                    {g === 'Força' && 'Tonificar e firmar.'}
                                                    {g === 'Relaxamento' && 'Desestressar a mente.'}
                                                    {g === 'Alívio de Dor' && 'Cuidar e restaurar.'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {creatorStep === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h4 className="text-sm font-bold text-stone-400 uppercase mb-3">Nível de Experiência</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['Iniciante', 'Intermediário', 'Avançado'] as Difficulty[]).map((l) => (
                                                <button
                                                    key={l}
                                                    onClick={() => setCreatorPrefs({ ...creatorPrefs, level: l })}
                                                    className={`p-3 rounded-xl border-2 transition-all text-sm font-medium
                                                  ${creatorPrefs.level === l
                                                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                                                            : 'border-stone-100 hover:border-sage-200'
                                                        }
                                              `}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-stone-400 uppercase mb-3">Duração por Sessão</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {([15, 30, 45] as Duration[]).map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => setCreatorPrefs({ ...creatorPrefs, duration: d })}
                                                    className={`p-3 rounded-xl border-2 transition-all text-sm font-medium
                                                  ${creatorPrefs.duration === d
                                                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                                                            : 'border-stone-100 hover:border-sage-200'
                                                        }
                                              `}
                                                >
                                                    {d} min
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {creatorStep === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h4 className="text-lg font-medium text-center mb-2">Quantos dias por semana?</h4>
                                    <p className="text-center text-stone-400 text-sm mb-6">A consistência é mais importante que a intensidade.</p>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[2, 3, 4, 5, 6, 7].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setCreatorPrefs({ ...creatorPrefs, frequency: d })}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1
                                              ${creatorPrefs.frequency === d
                                                        ? 'border-sage-500 bg-sage-50 text-sage-800'
                                                        : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200'
                                                    }
                                          `}
                                            >
                                                <span className="text-2xl font-bold">{d}</span>
                                                <span className="text-xs font-medium">Dias</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-stone-100 flex justify-between gap-3 rounded-b-3xl bg-white">
                            {creatorStep > 0 ? (
                                <Button variant="ghost" onClick={() => setCreatorStep(prev => prev - 1)}>Voltar</Button>
                            ) : (
                                <Button variant="ghost" onClick={() => setIsCreatorOpen(false)}>Cancelar</Button>
                            )}

                            {creatorStep < 2 ? (
                                <Button onClick={() => setCreatorStep(prev => prev + 1)}>
                                    Próximo <ChevronRight size={18} />
                                </Button>
                            ) : (
                                <Button onClick={handleFinishCreator} className="flex-1 justify-center">
                                    <Play size={18} fill="currentColor" /> Gerar Jornada
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
