

import { Goal, TrainingPlan, PlanDay, UserPreferences, Discomfort, Difficulty, SessionRecord, PlanPathway } from '../types';

// Constants for Roman Numerals
const ROMAN_STAGES = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// Banco de Focos por Objetivo
const FOCUS_POOLS: Record<Goal, { active: string[], restoration: string[] }> = {
  'Flexibilidade': {
    active: [
      'Abertura de Quadril', 'Mobilidade de Ombros', 'Espacate (Hanumanasana)', 
      'Flexão para Frente', 'Torções Detox', 'Abertura de Peito', 
      'Mobilidade da Coluna', 'Isquiotibiais Profundos', 'Fluxo de Água', 'Saudação à Lua'
    ],
    restoration: ['Yin Yoga', 'Yoga para Fáscia', 'Soltura Articular', 'Alongamento Passivo']
  },
  'Força': {
    active: [
      'Core de Aço', 'Guerreiros Poderosos', 'Fortalecimento de Braços', 
      'Pernas e Glúteos', 'Equilíbrio e Foco', 'Power Vinyasa', 
      'Transições Fortes', 'Pranchas e Isometria', 'Resistência Total', 'Desafio de Inversão'
    ],
    restoration: ['Alongamento Ativo', 'Liberação Miofascial', 'Mobilidade Pós-Treino', 'Yoga para Atletas']
  },
  'Relaxamento': {
    active: [
      'Flow Suave (Gentle)', 'Respiração e Movimento', 'Saudação ao Sol Lenta', 
      'Yoga Anti-Stress', 'Conexão Mente-Corpo', 'Movimento Consciente', 
      'Equilíbrio Emocional', 'Yoga para Ansiedade', 'Grounding (Aterramento)', 'Fluxo de Gratidão'
    ],
    restoration: ['Yoga Nidra', 'Restaurativa (Props)', 'Meditação em Movimento', 'Sono Profundo']
  },
  'Alívio de Dor': {
    active: [
      'Saúde da Coluna', 'Postura Correta', 'Alívio de Pescoço', 
      'Quadril Sem Dor', 'Mobilidade de Tornozelos', 'Fortalecimento Lombar', 
      'Abertura de Ombros', 'Caminhada do Yoga', 'Alinhamento Pélvico', 'Yoga na Cadeira'
    ],
    restoration: ['Relaxamento Progressivo', 'Respiração Curativa', 'Alívio de Tensão', 'Suavidade Articular']
  }
};

const WEEK_THEMES = [
  'Fundação e Despertar',
  'Construção e Estabilidade',
  'Aprofundamento e Desafio',
  'Integração e Fluidez'
];

// Função auxiliar para selecionar itens sem repetição imediata
const pickUnique = (pool: string[], used: Set<string>, count: number): string[] => {
  const available = pool.filter(item => !used.has(item));
  // Se acabarem as opções, reseta (ou pega do pool total)
  const source = available.length >= count ? available : pool;
  
  // Shuffle simples
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getWeeklySchedulePattern = (frequency: number) => {
    // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sab
    const safeFreq = Math.max(2, Math.min(7, frequency));
    
    switch (safeFreq) {
        case 2: return [false, true, false, false, true, false, false];
        case 3: return [false, true, false, true, false, true, false];
        case 4: return [false, true, true, false, true, true, false];
        case 5: return [false, true, true, true, true, true, false];
        case 6: return [false, true, true, true, true, true, true];
        case 7: return [true, true, true, true, true, true, true];
        default: return [false, true, false, true, false, true, false];
    }
};

// Generates dynamic practice names based on Stage
const getPracticeNamePrefix = (stage: number) => {
    if (stage === 1) return ['Fundamentos de', 'Básico de', 'Introdução ao', 'Início:'];
    if (stage === 2) return ['Explorando', 'Prática de', 'Sequência de', 'Fluxo:'];
    if (stage === 3) return ['Aprofundando', 'Desafio:', 'Intensivo de', 'Poder do'];
    if (stage === 4) return ['Avançado:', 'Complexo de', 'Integração:', 'Fluxo Mestre:'];
    if (stage >= 5) return ['Mestria em', 'Arte de', 'Flow Total:', 'Transcendendo'];
    return ['Prática de'];
};

const getRandomPrefix = (stage: number) => {
    const prefixes = getPracticeNamePrefix(stage);
    return prefixes[Math.floor(Math.random() * prefixes.length)];
};

const generateVariedWeek = (
  weekIndex: number,
  goal: Goal, 
  discomforts: Discomfort[], 
  level: Difficulty,
  frequency: number,
  stage: number, // 1, 2, 3...
  usedFocuses: Set<string>
): PlanDay[] => {
  const days: PlanDay[] = new Array(7).fill(null);
  const theme = WEEK_THEMES[weekIndex];
  
  let intensity = '';
  if (level === 'Iniciante') intensity = weekIndex === 2 ? 'Moderada' : 'Suave';
  if (level === 'Intermediário') intensity = weekIndex === 2 ? 'Alta' : 'Moderada';
  if (level === 'Avançado') intensity = weekIndex === 3 ? 'Flow' : 'Intensa';

  const pool = FOCUS_POOLS[goal];
  const schedulePattern = getWeeklySchedulePattern(frequency);
  const activeDaysCount = schedulePattern.filter(Boolean).length;
  
  const activePicks = pickUnique(pool.active, usedFocuses, activeDaysCount);
  activePicks.forEach(p => usedFocuses.add(p));

  const avoidWrists = discomforts.includes('Punhos');
  const avoidKnees = discomforts.includes('Joelhos');

  let activePickIndex = 0;

  days.forEach((_, i) => {
    const isActive = schedulePattern[i];
    
    if (isActive) {
        let focusBase = activePicks[activePickIndex % activePicks.length];
        activePickIndex++;

        // Create Dynamic Name based on Stage
        const prefix = getRandomPrefix(stage);
        let practiceName = `${prefix} ${focusBase.split(' ')[0]}`; // e.g., "Fundamentos de Abertura"
        
        // Sometimes just use the full focus name if prefix doesn't fit well
        if (Math.random() > 0.6) practiceName = focusBase;

        let desc = `Sessão de ${intensity.toLowerCase()} focada em ${focusBase.toLowerCase()}.`;

        if (avoidWrists && (focusBase.includes('Braço') || focusBase.includes('Plank'))) {
            practiceName += ' (Adaptado)';
            desc += ' Foco reduzido nos punhos.';
        }
        if (avoidKnees && (focusBase.includes('Guerreiro') || focusBase.includes('Perna'))) {
            desc += ' Com suporte para os joelhos.';
        }

        days[i] = {
            dayOfWeek: i,
            activityType: 'Active',
            practiceName: practiceName,
            focus: focusBase,
            description: desc
        };
    } else {
        let restName = "Recuperação";
        let restFocus = "Descanso";
        let restDesc = "Dia livre para recuperação.";

        if (i === 0) {
             restName = "Intenção Semanal";
             restFocus = "Mentalidade";
             restDesc = `Defina sua intenção para a fase de ${theme}.`;
        }
        else if (i === 3) {
            restName = "Movimento Livre";
            restFocus = "Descanso Ativo";
            restDesc = "Caminhada leve ou alongamento livre.";
        }

        days[i] = {
            dayOfWeek: i,
            activityType: 'Rest',
            practiceName: restName,
            focus: restFocus,
            description: restDesc
        };
    }
  });

  return days;
};

// Generates the Evolution Pathways (100+ Combinations Logic)
const generateNextPathways = (currentPlan: TrainingPlan): PlanPathway[] => {
    // 1. Identify Current State robustly using metadata or fallback parsing
    let currentGoal: Goal = 'Relaxamento';
    let currentLevel: Difficulty = 'Iniciante';
    
    if (currentPlan.metadata) {
        currentGoal = currentPlan.metadata.goal;
        currentLevel = currentPlan.metadata.level;
    } else {
        // Fallback for legacy plans without metadata
        if (currentPlan.name.includes('Flexibilidade')) currentGoal = 'Flexibilidade';
        else if (currentPlan.name.includes('Força')) currentGoal = 'Força';
        else if (currentPlan.name.includes('Alívio')) currentGoal = 'Alívio de Dor';
        
        if (currentPlan.name.includes('Intermediário')) currentLevel = 'Intermediário';
        else if (currentPlan.name.includes('Avançado')) currentLevel = 'Avançado';
    }

    const currentStage = currentPlan.stage || 1;

    const pathways: PlanPathway[] = [];

    // PATH 1: Linear Progression (Same Goal, Next Stage)
    // IMPORTANT: Explicitly increment stage
    if (currentStage < 5) {
        const nextStage = currentStage + 1;
        const nextStageRoman = ROMAN_STAGES[nextStage - 1];
        
        pathways.push({
            id: `path-linear-${Date.now()}`,
            title: `Avançar para Fase ${nextStageRoman}`,
            description: `Aprofunde sua prática de ${currentGoal} com novos desafios e intensidade ajustada.`,
            reason: "Continuidade é a chave para a evolução.",
            targetGoal: currentGoal,
            targetLevel: currentLevel,
            targetStage: nextStage // Explicit increment
        });
    } else {
        // Stage 5 -> Next Level (Level Up)
        let nextLevel: Difficulty = currentLevel;
        if (currentLevel === 'Iniciante') nextLevel = 'Intermediário';
        else if (currentLevel === 'Intermediário') nextLevel = 'Avançado';
        
        if (nextLevel !== currentLevel) {
            pathways.push({
                id: `path-levelup-${Date.now()}`,
                title: `Graduação para ${nextLevel}`,
                description: `Você completou o ciclo ${currentLevel}. Hora de subir de nível!`,
                reason: "Seu corpo está pronto para novos desafios.",
                targetGoal: currentGoal,
                targetLevel: nextLevel,
                targetStage: 1
            });
        }
    }

    // PATH 2: Cross Training (Different Goal, Same Level)
    // Map complementary goals
    const complementaryMap: Record<Goal, Goal> = {
        'Força': 'Flexibilidade',
        'Flexibilidade': 'Força',
        'Relaxamento': 'Alívio de Dor',
        'Alívio de Dor': 'Relaxamento'
    };
    const compGoal = complementaryMap[currentGoal] || 'Relaxamento';
    
    pathways.push({
        id: `path-cross-${Date.now()}`,
        title: `Novo Foco: ${compGoal}`,
        description: `Mude o estímulo do corpo focando em ${compGoal}. Ótimo para equilíbrio.`,
        reason: "Variedade evita platôs e lesões.",
        targetGoal: compGoal,
        targetLevel: currentLevel,
        targetStage: 1 // Start fresh on new goal
    });

    // PATH 3: Specialization (If advanced enough) or Recovery
    if (currentStage >= 2) {
         // Generate a random different goal for variety
         const allGoals: Goal[] = ['Flexibilidade', 'Força', 'Relaxamento', 'Alívio de Dor'];
         const otherGoal = allGoals.find(g => g !== currentGoal && g !== compGoal) || 'Relaxamento';
         
         pathways.push({
            id: `path-explore-${Date.now()}`,
            title: `Explorar ${otherGoal}`,
            description: `Experimente uma jornada focada em ${otherGoal}.`,
            reason: "Descubra novas capacidades do seu corpo.",
            targetGoal: otherGoal,
            targetLevel: currentLevel,
            targetStage: 1
        });
    }

    return pathways;
};

export const createPersonalizedPlan = (prefs: UserPreferences, stage: number = 1): TrainingPlan => {
  const { goal, level, discomforts, frequency } = prefs;
  const stageRoman = ROMAN_STAGES[stage - 1] || "I";
  
  let description = `Plano ${goal} (${level}) - Fase ${stageRoman}.`;
  if (discomforts.length > 0 && !discomforts.includes('Nenhum')) {
    description += ` Adaptado para: ${discomforts.join(', ')}.`;
  }
  
  const reasoning: string[] = [
    `Fase ${stageRoman}: Foco progressivo em ${goal}.`,
    `Frequência: ${frequency || 3} dias por semana.`,
    `Nível: ${level} - Ajustado para sua evolução.`,
  ];

  const usedFocuses = new Set<string>();
  const weeks: PlanDay[][] = [];
  const freq = frequency || 3;

  for (let i = 0; i < 4; i++) {
    weeks.push(generateVariedWeek(i, goal, discomforts, level, freq, stage, usedFocuses));
  }

  const totalActive = weeks.reduce((total, week) => {
      return total + week.filter(d => d.activityType === 'Active').length;
  }, 0);

  return {
    id: `plan-${goal.toLowerCase()}-${stage}-${Date.now()}`,
    name: `${goal} ${level} ${stageRoman}`,
    description,
    durationWeeks: 4,
    schedule: weeks[0],
    weeks: weeks,
    reasoning: reasoning,
    stage: stage,
    status: 'active',
    progress: 0,
    totalPlannedSessions: totalActive,
    completedSessions: 0,
    // IMPORTANT: Save explicit metadata to ensure evolution logic works correctly
    metadata: {
        goal: goal,
        level: level
    }
  };
};

export const calculatePlanProgress = (plan: TrainingPlan, history: SessionRecord[]): TrainingPlan => {
    if (!plan.weeks) return plan;

    const planSessions = history.filter(h => h.planId === plan.id);
    
    let totalPlanned = 0;
    plan.weeks.forEach(week => {
        totalPlanned += week.filter(d => d.activityType === 'Active').length;
    });

    const completed = planSessions.length;
    const progress = Math.min(100, Math.round((completed / (totalPlanned || 1)) * 100));

    // Generate next paths if completing
    let nextPaths = plan.nextPaths;
    if (progress >= 100 && !nextPaths) {
        nextPaths = generateNextPathways(plan);
    }

    return {
        ...plan,
        progress,
        completedSessions: completed,
        totalPlannedSessions: totalPlanned,
        status: progress >= 100 ? 'completed' : (plan.status === 'archived' ? 'archived' : 'active'),
        nextPaths
    };
};

// Legacy support wrapper
export const createEvolutionPlan = (currentPlan: TrainingPlan, prefs: UserPreferences): TrainingPlan => {
    return createPersonalizedPlan(prefs, (currentPlan.stage || 1) + 1);
};