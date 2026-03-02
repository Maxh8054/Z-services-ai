import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InspectionData, PhotoData, AdditionalPart } from '@/types/report';

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
  getAllData: () => { inspection: InspectionData; photos: PhotoData[]; conclusion: string };
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
      
      updateInspection: (data) =>
        set((state) => ({
          inspection: { ...state.inspection, ...data },
        })),
        
      setPhotos: (photos) => set({ photos }),
      
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
        })),
        
      removePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
          photoCount: state.photoCount - 1,
        })),
        
      updatePhoto: (id, data) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
        
      setPhotoCount: (count) =>
        set((state) => {
          const currentPhotos = state.photos;
          const newPhotos = createInitialPhotos(count);
          
          // Preserve existing photo data
          for (let i = 0; i < Math.min(currentPhotos.length, count); i++) {
            newPhotos[i] = currentPhotos[i];
          }
          
          return { photos: newPhotos, photoCount: count };
        }),
        
      addAdditionalPart: (part) =>
        set((state) => ({
          additionalParts: [...state.additionalParts, part],
        })),
        
      removeAdditionalPart: (id) =>
        set((state) => ({
          additionalParts: state.additionalParts.filter((p) => p.id !== id),
        })),
        
      updateAdditionalPart: (id, data) =>
        set((state) => ({
          additionalParts: state.additionalParts.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
        
      setAdditionalParts: (parts) => set({ additionalParts: parts }),
      
      setConclusion: (text) => set({ conclusion: text }),
      
      setTranslation: (translation) => set({ translation }),
      
      // Load from external data (shared session)
      loadFromData: (data: { inspection?: Partial<InspectionData>; photos?: PhotoData[]; conclusion?: string }) =>
        set({
          inspection: data.inspection ? { ...initialInspection, ...data.inspection } : initialInspection,
          photos: data.photos || createInitialPhotos(4),
          conclusion: data.conclusion || '',
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
        }),
    }),
    {
      name: 'report-storage',
    }
  )
);
