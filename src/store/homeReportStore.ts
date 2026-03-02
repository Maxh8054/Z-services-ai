import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InspectionData, PhotoData, AdditionalPart, PhotoCategory } from '@/types/report';
import { DEFAULT_CATEGORIES } from '@/types/report';

// Versão do storage - incrementar quando mudar a estrutura das categorias
const STORAGE_VERSION = 2;

// Criar fotos iniciais para uma categoria (2 fotos por padrão)
const createInitialCategoryPhotos = (categoryId: string): PhotoData[] => {
  return Array.from({ length: 2 }, (_, i) => ({
    id: `photo-${categoryId}-init-${i}`,
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

// Criar categorias iniciais
const createInitialCategories = (): PhotoCategory[] => {
  return DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    photos: createInitialCategoryPhotos(cat.id),
    additionalParts: [],
  }));
};

// IDs válidos de categorias
const VALID_CATEGORY_IDS = DEFAULT_CATEGORIES.map(c => c.id);

interface HomeReportState {
  // Inspection Data
  inspection: InspectionData;
  
  // Categories with photos
  categories: PhotoCategory[];
  
  // Conclusion
  conclusion: string;
  
  // Actions
  updateInspection: (data: Partial<InspectionData>) => void;
  
  // Category actions
  setCategories: (categories: PhotoCategory[]) => void;
  addPhotoToCategory: (categoryId: string) => void;
  removePhotoFromCategory: (categoryId: string, photoId: string) => void;
  updatePhotoInCategory: (categoryId: string, photoId: string, data: Partial<PhotoData>) => void;
  
  // Additional parts for categories
  addAdditionalPartToCategory: (categoryId: string, part: AdditionalPart) => void;
  removeAdditionalPartFromCategory: (categoryId: string, partId: string) => void;
  
  setConclusion: (text: string) => void;
  clearAll: () => void;
  
  // External data loading
  loadFromData: (data: { inspection?: Partial<InspectionData>; categories?: PhotoCategory[]; conclusion?: string }) => void;
  getAllData: () => { inspection: InspectionData; categories: PhotoCategory[]; conclusion: string };
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

export const useHomeReportStore = create<HomeReportState>()(
  persist(
    (set, get) => ({
      inspection: initialInspection,
      categories: createInitialCategories(),
      conclusion: '',
      
      updateInspection: (data) =>
        set((state) => ({
          inspection: { ...state.inspection, ...data },
        })),
      
      setCategories: (categories) => set({ categories }),
      
      addPhotoToCategory: (categoryId) =>
        set((state) => ({
          categories: state.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              photos: [
                ...cat.photos,
                {
                  id: `photo-${categoryId}-${Date.now()}`,
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
            };
          }),
        })),
      
      removePhotoFromCategory: (categoryId, photoId) =>
        set((state) => ({
          categories: state.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              photos: cat.photos.filter(p => p.id !== photoId),
            };
          }),
        })),
      
      updatePhotoInCategory: (categoryId, photoId, data) =>
        set((state) => ({
          categories: state.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              photos: cat.photos.map(p =>
                p.id === photoId ? { ...p, ...data } : p
              ),
            };
          }),
        })),
      
      addAdditionalPartToCategory: (categoryId, part) =>
        set((state) => ({
          categories: state.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              additionalParts: [...cat.additionalParts, part],
            };
          }),
        })),
      
      removeAdditionalPartFromCategory: (categoryId, partId) =>
        set((state) => ({
          categories: state.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              additionalParts: cat.additionalParts.filter(p => p.id !== partId),
            };
          }),
        })),
      
      setConclusion: (text) => set({ conclusion: text }),
      
      // Load from external data (shared session)
      loadFromData: (data: { inspection?: Partial<InspectionData>; categories?: PhotoCategory[]; conclusion?: string }) =>
        set({
          inspection: data.inspection ? { ...initialInspection, ...data.inspection } : initialInspection,
          categories: data.categories || createInitialCategories(),
          conclusion: data.conclusion || '',
        }),
      
      // Get all data for sharing
      getAllData: () => ({
        inspection: get().inspection,
        categories: get().categories,
        conclusion: get().conclusion,
      }),
      
      clearAll: () =>
        set({
          inspection: initialInspection,
          categories: createInitialCategories(),
          conclusion: '',
        }),
    }),
    {
      name: 'home-report-storage',
      version: STORAGE_VERSION,
      migrate: (persistedState: any, version: number) => {
        // Se a versão é antiga, precisamos migrar
        if (version < STORAGE_VERSION) {
          // Filtrar categorias que não existem mais
          if (persistedState.categories) {
            persistedState.categories = persistedState.categories.filter(
              (cat: PhotoCategory) => VALID_CATEGORY_IDS.includes(cat.id)
            );
          }
        }
        return persistedState;
      },
    }
  )
);
