import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InspectionData, PhotoData, AdditionalPart, PhotoCategory } from '@/types/report';
import { DEFAULT_CATEGORIES } from '@/types/report';

// Versão do storage - incrementar quando mudar a estrutura das categorias
const STORAGE_VERSION = 3;

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

// Função auxiliar para fazer merge de categorias
function mergeCategories(localCats: PhotoCategory[], serverCats: PhotoCategory[]): PhotoCategory[] {
  if (!serverCats || serverCats.length === 0) return localCats;
  if (!localCats || localCats.length === 0) return serverCats;
  
  return serverCats.map(serverCat => {
    const localCat = localCats.find(c => c.id === serverCat.id);
    if (!localCat) return serverCat;
    
    return {
      ...serverCat,
      photos: mergePhotos(localCat.photos, serverCat.photos),
      additionalParts: serverCat.additionalParts?.length ? serverCat.additionalParts : localCat.additionalParts || [],
    };
  });
}

interface HomeReportState {
  // Inspection Data
  inspection: InspectionData;
  
  // Categories with photos
  categories: PhotoCategory[];
  
  // Conclusion
  conclusion: string;
  
  // Timestamp da última edição local
  lastLocalEdit: number;
  
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
  mergeFromData: (data: { inspection?: Partial<InspectionData>; categories?: PhotoCategory[]; conclusion?: string }, serverTimestamp?: number) => void;
  getAllData: () => { inspection: InspectionData; categories: PhotoCategory[]; conclusion: string };
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

export const useHomeReportStore = create<HomeReportState>()(
  persist(
    (set, get) => ({
      inspection: initialInspection,
      categories: createInitialCategories(),
      conclusion: '',
      lastLocalEdit: 0,
      
      setLastLocalEdit: (timestamp) => set({ lastLocalEdit: timestamp }),
      
      updateInspection: (data) =>
        set((state) => ({
          inspection: { ...state.inspection, ...data },
          lastLocalEdit: Date.now(),
        })),
      
      setCategories: (categories) => set({ categories, lastLocalEdit: Date.now() }),
      
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
          lastLocalEdit: Date.now(),
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
          lastLocalEdit: Date.now(),
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
          lastLocalEdit: Date.now(),
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
          lastLocalEdit: Date.now(),
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
          lastLocalEdit: Date.now(),
        })),
      
      setConclusion: (text) => set({ conclusion: text, lastLocalEdit: Date.now() }),
      
      // Load from external data (shared session) - substitui tudo
      loadFromData: (data: { inspection?: Partial<InspectionData>; categories?: PhotoCategory[]; conclusion?: string }) =>
        set({
          inspection: data.inspection ? { ...initialInspection, ...data.inspection } : initialInspection,
          categories: data.categories || createInitialCategories(),
          conclusion: data.conclusion || '',
        }),
      
      // Merge inteligente - preserva dados locais mais recentes
      mergeFromData: (data: { inspection?: Partial<InspectionData>; categories?: PhotoCategory[]; conclusion?: string }, serverTimestamp?: number) =>
        set((state) => {
          const localEditTime = state.lastLocalEdit || 0;
          const serverTime = serverTimestamp || Date.now();
          
          // Se edição local é mais recente que o servidor, não atualizar
          // (o sync local vai enviar as mudanças para o servidor)
          if (localEditTime > serverTime && localEditTime > 0) {
            console.log('[Merge] Local edit is newer, skipping merge');
            return {};
          }
          
          const newInspection = { ...state.inspection };
          
          // Merge campo por campo da inspeção
          if (data.inspection) {
            Object.keys(data.inspection).forEach((key) => {
              const k = key as keyof InspectionData;
              const serverValue = data.inspection![k];
              const localValue = state.inspection[k];
              
              // Se servidor tem valor e local não tem (ou é vazio), usa servidor
              if (serverValue && (!localValue || localValue === '')) {
                (newInspection as any)[k] = serverValue;
              }
              // Se servidor tem valor mais recente, usa servidor
              else if (serverValue && serverTime > localEditTime) {
                (newInspection as any)[k] = serverValue;
              }
            });
          }
          
          // Merge das categorias
          const newCategories = data.categories 
            ? mergeCategories(state.categories, data.categories)
            : state.categories;
          
          // Merge da conclusão
          const newConclusion = (data.conclusion && (!state.conclusion || serverTime > localEditTime))
            ? data.conclusion
            : state.conclusion;
          
          return {
            inspection: newInspection,
            categories: newCategories,
            conclusion: newConclusion,
          };
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
          lastLocalEdit: 0,
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
