import { Pose } from '../types';
import { apiClient } from './apiClient';
import { POSES } from '../constants'; // Fallback connection

export const poseStore = {
  // Agora é Async!
  getAll: async (): Promise<Pose[]> => {
    try {
      // Tenta buscar do servidor
      const serverPoses = await apiClient.get<Pose[]>('poses.php');

      // Se vier vazio (banco novo), retorna constantes como fallback para não quebrar UI
      if (!serverPoses || serverPoses.length === 0) {
        console.warn("API retornou 0 poses. Usando fallback local.");
        return POSES;
      }
      return serverPoses;
    } catch (e) {
      console.error("Erro ao conectar na API de Poses. Usando offline.", e);
      return POSES; // Fallback robusto
    }
  },

  addPose: async (newPose: Pose) => {
    try {
      await apiClient.post('poses.php', newPose);
      return true;
    } catch (e) {
      console.error("Erro ao salvar pose no servidor", e);
      throw e;
    }
  },

  // Update Video (Admin)
  updateVideoUrl: async (poseId: string, newUrl: string) => {
    // TODO: Implementar endpoint específico de update se necessário, 
    // ou apenas não suportar isso na v1 da migração sem login de admin real no backend
    console.warn("Update Video via API not fully implemented yet");
    return newUrl;
  }
};
