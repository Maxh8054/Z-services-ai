import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InspectionData, PhotoData, AdditionalPart } from '@/types/report';

// Função auxiliar para fazer merge de fotos
function mergePhotos(localPhotos: PhotoData[], serverPhotos: PhotoData[]): PhotoData[] {
  if (!serverPhotos || serverPhotos.length === 0) return localPhotos;
  if (!localPhotos || localPhotos.length === 0) return serverPhotos;
  
  const merged: PhotoData[] = [];
  const maxLen = Math.max(localPhotos.length, serverPhotos.length);
  
  for (let i = 0; i < maxLen; i++) {
    const local = localPhotos[i];
    const server = serverPhotos[i];
    
    if (!local && server) {
      merged.push(server);
    } else if (local && !server) {
      merged.push(local);
    } else if (local && server) {
      // Merge campo por campo - servidor tem prioridade se tiver dados
      merged.push({
        id: server.id || local.id,
        description: server.description || local.description || '',
        pn: server.pn || local.pn || '',
        serialNumber: server.serialNumber || local.serialNumber || '',
        partName: server.partName || local.partName || '',
        quantity: server.quantity || local.quantity || '',
        criticality: server.criticality || local.criticality || '',
        imageData: server.imageData || local.imageData,
        editedImageData: server.editedImageData || local.editedImageData,
        embeddedPhotos: server.embeddedPhotos?.length ? server.embeddedPhotos : local.embeddedPhotos || [],
        hasAdditionalParts: server.hasAdditionalParts || local.hasAdditionalParts,
      });
    }
  }
  
  return merged;
}

interface ReportState {
  // Inspection Data
  inspection: InspectionData;
  
  // Photos
  photos: PhotoData[];
  photoCount: number;
  
  // Additional Parts
  additionalParts: AdditionalPart[];
  
  // Conclusion
  conclusion: string;
  
  // Translation
  translation: {
    sourceLang: string;
    targetLang: string;
    translations: Record<string, string>;
  } | null;
  
  // Timestamp da última edição local
  lastLocalEdit: number;
  
  // Actions
  updateInspection: (data: Partial<InspectionData>) => void;
  setPhotos: (photos: PhotoData[]) => void;
  addPhoto: () => void;
  removePhoto: (id: string) => void;
  updatePhoto: (id: string, data: Partial<PhotoData>) => void;
  setPhotoCount: (count: number) => void;
  addAdditionalPart: (part: AdditionalPart) => void;
  removeAdditionalPart: (id: string) => void;
  updateAdditionalPart: (id: string, data: Partial<AdditionalPart>) => void;
  setAdditionalParts: (parts: AdditionalPart[]) => void;
  setConclusion: (text: string) => void;
  setTranslation: (translation: ReportState['translation']) => void;
  clearAll: () => void;
  
  // External data loading
  loadFromData: (data: { inspection?: Partial<InspectionData>; photos?: PhotoData[]; conclusion?: string }) => void;
  mergeFromData: (data: { inspection?: Partial<InspectionData>; photos?: PhotoData[]; conclusion?: string }, serverTimestamp?: number) => void;
  getAllData: () => { inspection: InspectionData; photos: PhotoData[]; conclusion: string };
  setLastLocalEdit: (timestamp: number) => void;
}

const initialInspection: InspectionData = {
  tag: '',
  modelo: '',
  sn: '',
  entrega: '',
  cliente: '',
  descricao: '',
  machineDown: '',
  data: '',
  dataFinal: '',
  osExecucao: '',
  inspetor: '',
  horimetro: '',
  machinePhoto: null,
  horimetroPhoto: null,
  serialPhoto: null,
};

const createInitialPhotos = (count: number): PhotoData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `photo-init-${i}`,
    description: '',
    pn: '',
    serialNumber: '',
    partName: '',
    quantity: '',
    criticality: '',
    imageData: null,
    editedImageData: null,
    embeddedPhotos: [],
    hasAdditionalParts: false,
  }));
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      inspection: initialInspection,
      photos: createInitialPhotos(4),
      photoCount: 4,
      additionalParts: [],
      conclusion: '',
      translation: null,
      lastLocalEdit: 0,
      
      setLastLocalEdit: (timestamp) => set({ lastLocalEdit: timestamp }),
      
      updateInspection: (data) =>
        set((state) => ({
          inspection: { ...state.inspection, ...data },
          lastLocalEdit: Date.now(),
        })),
        
      setPhotos: (photos) => set({ photos, lastLocalEdit: Date.now() }),
      
      addPhoto: () =>
        set((state) => ({
          photos: [
            ...state.photos,
            {
              id: `photo-${Date.now()}`,
              description: '',
              pn: '',
              serialNumber: '',
              partName: '',
              quantity: '',
              criticality: '',
              imageData: null,
              editedImageData: null,
              embeddedPhotos: [],
              hasAdditionalParts: false,
            },
          ],
          photoCount: state.photoCount + 1,
          lastLocalEdit: Date.now(),
        })),
        
      removePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
          photoCount: state.photoCount - 1,
          lastLocalEdit: Date.now(),
        })),
        
      updatePhoto: (id, data) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
          lastLocalEdit: Date.now(),
        })),
        
      setPhotoCount: (count) =>
        set((state) => {
          const currentPhotos = state.photos;
          const newPhotos = createInitialPhotos(count);
          
          // Preserve existing photo data
          for (let i = 0; i < Math.min(currentPhotos.length, count); i++) {
            newPhotos[i] = currentPhotos[i];
          }
          
          return { photos: newPhotos, photoCount: count, lastLocalEdit: Date.now() };
        }),
        
      addAdditionalPart: (part) =>
        set((state) => ({
          additionalParts: [...state.additionalParts, part],
          lastLocalEdit: Date.now(),
        })),
        
      removeAdditionalPart: (id) =>
        set((state) => ({
          additionalParts: state.additionalParts.filter((p) => p.id !== id),
          lastLocalEdit: Date.now(),
        })),
        
      updateAdditionalPart: (id, data) =>
        set((state) => ({
          additionalParts: state.additionalParts.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
          lastLocalEdit: Date.now(),
        })),
        
      setAdditionalParts: (parts) => set({ additionalParts: parts, lastLocalEdit: Date.now() }),
      
      setConclusion: (text) => set({ conclusion: text, lastLocalEdit: Date.now() }),
      
      setTranslation: (translation) => set({ translation }),
      
      // Load from external data (shared session) - substitui tudo
      loadFromData: (data: { inspection?: Partial<InspectionData>; photos?: PhotoData[]; conclusion?: string }) =>
        set({
          inspection: data.inspection ? { ...initialInspection, ...data.inspection } : initialInspection,
          photos: data.photos || createInitialPhotos(4),
          conclusion: data.conclusion || '',
        }),
      
      // Merge inteligente - sempre aceita dados do servidor (campos preenchidos)
      // O sync local envia mudanças para o servidor logo em seguida
      mergeFromData: (data: { inspection?: Partial<InspectionData>; photos?: PhotoData[]; conclusion?: string }, serverTimestamp?: number) =>
        set((state) => {
          const newInspection = { ...state.inspection };
          let hasChanges = false;
          
          // Merge campo por campo da inspeção - servidor sempre ganha se tiver valor
          if (data.inspection) {
            Object.keys(data.inspection).forEach((key) => {
              const k = key as keyof InspectionData;
              const serverValue = data.inspection![k];
              
              // Se servidor tem valor, usa o do servidor
              if (serverValue !== null && serverValue !== undefined && serverValue !== '') {
                if ((newInspection as any)[k] !== serverValue) {
                  (newInspection as any)[k] = serverValue;
                  hasChanges = true;
                }
              }
            });
          }
          
          // Merge das fotos - sempre faz merge
          let newPhotos = state.photos;
          if (data.photos) {
            newPhotos = mergePhotos(state.photos, data.photos);
            hasChanges = true;
          }
          
          // Merge da conclusão - servidor sempre ganha se tiver valor
          let newConclusion = state.conclusion;
          if (data.conclusion && data.conclusion.trim() !== '') {
            if (newConclusion !== data.conclusion) {
              newConclusion = data.conclusion;
              hasChanges = true;
            }
          }
          
          if (hasChanges) {
            console.log('[Merge Inspecao] Applied server changes');
          }
          
          return {
            inspection: newInspection,
            photos: newPhotos,
            conclusion: newConclusion,
          };
        }),
      
      // Get all data for sharing
      getAllData: () => ({
        inspection: get().inspection,
        photos: get().photos,
        conclusion: get().conclusion,
      }),
      
      clearAll: () =>
        set({
          inspection: initialInspection,
          photos: createInitialPhotos(4),
          photoCount: 4,
          additionalParts: [],
          conclusion: '',
          translation: null,
          lastLocalEdit: 0,
        }),
    }),
    {
      name: 'report-storage',
      version: 2,
    }
  )
);
