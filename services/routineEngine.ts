
import { poseStore } from './poseStore';
import { Pose, UserPreferences, Routine } from '../types';

// Helper to get ALL poses from store instead of constants
// Agora retorna Promise
const getAvailablePoses = async () => await poseStore.getAll();

export const generateRoutine = async (prefs: UserPreferences): Promise<Routine> => {
  const ALL_POSES = await getAvailablePoses();

  // Target duration in seconds
  const targetDuration = (prefs.duration || 15) * 60;

  // 1. Filter Poses based on Difficulty
  let availablePoses = ALL_POSES;

  if (prefs.level === 'Iniciante') {
    availablePoses = ALL_POSES.filter(p => p.difficulty === 'Iniciante');
  } else if (prefs.level === 'Intermediário') {
    availablePoses = ALL_POSES.filter(p => p.difficulty !== 'Avançado');
  }

  // 2. Score Poses
  const scoredPoses = availablePoses.map(pose => {
    let score = 0;
    score += 1; // Base

    // Goal Match
    const goalMap: Record<string, string[]> = {
      'Flexibilidade': ['Flexibilidade', 'Alongamento', 'Abertura'],
      'Força': ['Força', 'Core', 'Resistência', 'Energia'],
      'Relaxamento': ['Calma', 'Relaxamento', 'Paz', 'Restaurativa'],
      'Alívio de Dor': ['Alívio', 'Coluna', 'Pescoço']
    };
    const goalKeywords = goalMap[prefs.goal] || [];
    if (pose.benefits.some(b => goalKeywords.some(k => b.includes(k)))) score += 5;

    // Discomfort Match
    const discomfortMap: Record<string, string[]> = {
      'Lombar': ['Coluna', 'Costas', 'Alívio de Dor'],
      'Pescoço/Ombros': ['Pescoço', 'Ombros', 'Tensão'],
      'Joelhos': [],
      'Punhos': [],
      'Nenhum': []
    };
    if (prefs.discomforts) {
      prefs.discomforts.forEach(d => {
        const keys = discomfortMap[d];
        if (keys && pose.benefits.some(b => keys.some(k => b.includes(k)))) score += 3;
      });
    }

    return { pose, score };
  });

  // Sort candidates
  scoredPoses.sort((a, b) => b.score - a.score);

  // Helper to get poses by category
  const getCandidates = (cats: string[]) => scoredPoses.filter(sp => cats.includes(sp.pose.category)).map(sp => sp.pose);

  // Categorize
  const warmups = getCandidates(['Aquecimento']);
  const active = getCandidates(['Pé', 'Core', 'Inversão', 'Sentado']); // Main flow
  const cooldown = getCandidates(['Restaurativa', 'Sentado', 'Inversão']);
  const finalPose = ALL_POSES.find(p => p.category === 'Finalização' || p.sanskritName === 'Savasana')
    || scoredPoses[scoredPoses.length - 1]?.pose; // Fallback

  const routinePoses: Pose[] = [];
  let currentDuration = 0;

  // --- BUILDING THE ROUTINE ---

  // 1. Final Pose (Reserved)
  // We don't add it yet, but we account for its minimum duration (e.g. 5 min)
  const finalDurationBase = finalPose ? finalPose.durationDefault : 300;

  // 2. Warmup (Add top 2 or 3)
  const numWarmups = 2;
  for (let i = 0; i < Math.min(numWarmups, warmups.length); i++) {
    if (currentDuration + warmups[i].durationDefault + finalDurationBase < targetDuration) {
      routinePoses.push(warmups[i]);
      currentDuration += warmups[i].durationDefault;
    }
  }

  // 3. Cooldown (Reserve logic top 2)
  const selectedCooldowns: Pose[] = [];
  const numCooldowns = 2;
  for (let i = 0; i < Math.min(numCooldowns, cooldown.length); i++) {
    // Prevent duplicates if cooldown overlaps with warmup (rare due to category split but possible)
    if (!routinePoses.some(p => p.id === cooldown[i].id)) {
      selectedCooldowns.push(cooldown[i]);
    }
  }
  const cooldownDuration = selectedCooldowns.reduce((acc, p) => acc + p.durationDefault, 0);

  // 4. Fill the Middle (Active Cycle)
  // We need to fill up to: Target - Final - Cooldown
  // We can loop through 'active' list
  let activeIndex = 0;
  let safetyCounter = 0;

  while (currentDuration + cooldownDuration + finalDurationBase < targetDuration && safetyCounter < 100) {
    if (active.length === 0) break;

    // Cycle through active poses
    const originalPose = active[activeIndex % active.length];

    // Create a clone with unique ID to avoid React key collisions
    const poseToAdd = {
      ...originalPose,
      id: `${originalPose.id}_cycle_${activeIndex}`
    };

    routinePoses.push(poseToAdd);
    currentDuration += poseToAdd.durationDefault;

    activeIndex++;
    safetyCounter++;
  }

  // 5. Add Cooldown
  routinePoses.push(...selectedCooldowns);
  currentDuration += cooldownDuration;

  // 6. Add Final Pose & Adjust Time
  if (finalPose) {
    // Calculate how much time is left to reach EXACT target
    let remainingTime = targetDuration - currentDuration;

    // If remaining time is too small (e.g. negative or just seconds), we might need to remove the last active pose to make room for a decent Savasana
    // Ensure Savasana has at least 3 minutes (180s) or whatever fits appropriately
    const minSavasana = 180;

    while (remainingTime < minSavasana && routinePoses.length > 2) {
      // Remove last added pose (likely a cooldown or active) to make room
      const removed = routinePoses.pop();
      if (removed) currentDuration -= removed.durationDefault;
      remainingTime = targetDuration - currentDuration;
    }

    // Now we have enough room (or we stripped to bone). 
    // Create a modified final pose with the EXACT duration needed
    const adjustedFinalPose = {
      ...finalPose,
      id: `${finalPose.id}_final`, // Ensure unique ID for the final card
      durationDefault: Math.max(60, remainingTime) // At least 1 min, but usually matches remainder
    };

    routinePoses.push(adjustedFinalPose);
    currentDuration += adjustedFinalPose.durationDefault;
  }

  return {
    id: Date.now().toString(),
    name: `Fluxo de ${prefs.goal}`,
    poses: routinePoses,
    totalDuration: currentDuration,
    createdAt: new Date()
  };
};
