
import React, { useState } from 'react';
import { Routine, Pose } from '../types';
import { poseStore } from '../services/poseStore';
import { Button, Card } from './ui';
import { Play, ArrowUp, ArrowDown, Trash2, Plus, X, GripVertical, Minus } from 'lucide-react';

interface RoutineEditorProps {
  routine: Routine;
  onSaveAndPlay: (routine: Routine) => void;
  onCancel: () => void;
}

export const RoutineEditor: React.FC<RoutineEditorProps> = ({ routine, onSaveAndPlay, onCancel }) => {
  const [poses, setPoses] = useState<Pose[]>(routine.poses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [selectedPoseIndex, setSelectedPoseIndex] = useState<number | null>(null);

  const [libraryPoses, setLibraryPoses] = useState<Pose[]>([]);

  // Load poses when modal opens
  React.useEffect(() => {
    if (isAddModalOpen && libraryPoses.length === 0) {
      poseStore.getAll().then(setLibraryPoses);
    }
  }, [isAddModalOpen]);

  const totalDuration = poses.reduce((acc, curr) => acc + curr.durationDefault, 0);

  const movePose = (index: number, direction: 'up' | 'down') => {
    const newPoses = [...poses];
    if (direction === 'up' && index > 0) {
      [newPoses[index], newPoses[index - 1]] = [newPoses[index - 1], newPoses[index]];
    } else if (direction === 'down' && index < newPoses.length - 1) {
      [newPoses[index], newPoses[index + 1]] = [newPoses[index + 1], newPoses[index]];
    }
    setPoses(newPoses);
    // Maintain selection if moving the selected item
    if (selectedPoseIndex === index) {
      setSelectedPoseIndex(direction === 'up' ? index - 1 : index + 1);
    }
  };

  const removePose = (index: number) => {
    setPoses(poses.filter((_, i) => i !== index));
    if (selectedPoseIndex === index) setSelectedPoseIndex(null);
  };

  const addPose = (pose: Pose) => {
    setPoses([...poses, pose]);
    setIsAddModalOpen(false);
  };

  const updateDuration = (index: number, newDuration: number) => {
    // Permitir ajustes de 15s até 300s (5 min)
    if (newDuration < 15 || newDuration > 300) return;
    const newPoses = [...poses];
    newPoses[index] = { ...newPoses[index], durationDefault: newDuration };
    setPoses(newPoses);
  };

  const toggleSelection = (index: number) => {
    if (selectedPoseIndex === index) {
      setSelectedPoseIndex(null);
    } else {
      setSelectedPoseIndex(index);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
    setSelectedPoseIndex(index); // Auto select on drag start
  };

  const handleDragEnter = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newPoses = [...poses];
    const draggedItem = newPoses[draggedItemIndex];

    // Remove from old position
    newPoses.splice(draggedItemIndex, 1);
    // Insert at new position
    newPoses.splice(index, 0, draggedItem);

    setPoses(newPoses);
    setDraggedItemIndex(index);
    setSelectedPoseIndex(index); // Keep selection following the drag
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    // Note: We keep selectedPoseIndex active so the user sees where it landed,
    // but they can click again to deselect.
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-3xl mx-auto animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-light text-sage-900">Personalizar Fluxo</h1>
          <p className="text-stone-500">Ajuste as posturas e duração antes de começar.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={() => onSaveAndPlay({ ...routine, poses, totalDuration })}>
            <Play size={18} fill="currentColor" /> Praticar ({Math.floor(totalDuration / 60)} min)
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {poses.map((pose, index) => {
          const isDragged = draggedItemIndex === index;
          const isSelected = selectedPoseIndex === index;

          return (
            <div
              key={`${pose.id}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => toggleSelection(index)}
              className={`
                bg-white p-3 rounded-xl border shadow-sm flex items-center gap-4 group transition-all cursor-pointer
                ${isDragged
                  ? 'border-dashed border-sage-500 opacity-50 bg-sage-50 scale-[1.02] shadow-lg z-10'
                  : isSelected
                    ? 'border-sage-500 bg-sage-50 shadow-md ring-1 ring-sage-500'
                    : 'border-stone-200 hover:border-sage-300'
                }
              `}
            >
              {/* Drag Handle */}
              <div className="text-stone-300 cursor-grab active:cursor-grabbing hidden sm:block p-2 -ml-2 hover:text-sage-600 transition-colors">
                <GripVertical size={20} />
              </div>

              <img src={pose.media.thumbnailUrl} alt={pose.portugueseName} className="w-16 h-16 rounded-lg object-cover bg-stone-100 hidden xs:block pointer-events-none" />

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sage-900 truncate">{pose.portugueseName}</h4>

                {/* Duration Control */}
                <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => updateDuration(index, pose.durationDefault - 15)}
                    disabled={pose.durationDefault <= 15}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-600 hover:bg-sage-100 disabled:opacity-30 disabled:hover:bg-stone-100 transition-colors"
                    aria-label="Diminuir tempo"
                  >
                    <Minus size={12} />
                  </button>

                  <span className="text-xs font-bold text-sage-700 w-8 text-center tabular-nums">
                    {pose.durationDefault}s
                  </span>

                  <button
                    onClick={() => updateDuration(index, pose.durationDefault + 15)}
                    disabled={pose.durationDefault >= 300}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-600 hover:bg-sage-100 disabled:opacity-30 disabled:hover:bg-stone-100 transition-colors"
                    aria-label="Aumentar tempo"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col sm:flex-row gap-1">
                  <button
                    onClick={() => movePose(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-stone-400 hover:text-sage-600 disabled:opacity-30 hover:bg-stone-50 rounded-full"
                    title="Mover para cima"
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => movePose(index, 'down')}
                    disabled={index === poses.length - 1}
                    className="p-2 text-stone-400 hover:text-sage-600 disabled:opacity-30 hover:bg-stone-50 rounded-full"
                    title="Mover para baixo"
                  >
                    <ArrowDown size={18} />
                  </button>
                </div>
                <div className="w-px h-8 bg-stone-100 mx-1"></div>
                <button
                  onClick={() => removePose(index)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  title="Remover postura"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {poses.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl text-stone-400">
            Sua rotina está vazia. Adicione posturas abaixo.
          </div>
        )}

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-4 border-2 border-dashed border-sage-300 rounded-xl text-sage-600 font-medium hover:bg-sage-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Adicionar Postura
        </button>
      </div>

      {/* Add Pose Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-sage-900">Selecionar Postura</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {libraryPoses.map(pose => (
                <button
                  key={pose.id}
                  onClick={() => addPose(pose)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 text-left border border-transparent hover:border-stone-200 transition-all"
                >
                  <img src={pose.media.thumbnailUrl} className="w-12 h-12 rounded object-cover bg-stone-200" />
                  <div>
                    <p className="font-medium text-sm text-stone-800">{pose.portugueseName}</p>
                    <p className="text-xs text-stone-500">{pose.difficulty}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
