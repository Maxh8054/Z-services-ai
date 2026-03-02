'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TextareaWithSpellCheck } from '@/components/TextareaWithSpellCheck';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generatePowerPoint, generateHomePowerPoint } from '@/lib/powerpoint';
import { CollaborationPanel, OnlineStatusIndicator, useShareDialog } from '@/components/CollaborationPanel';
import { UserMenu } from '@/components/UserMenu';
import { LoginPage } from '@/components/LoginPage';
import { 
  generateAnalysisEmailBody, 
  generateConclusionEmailBody, 
  generateEmailSubject,
  openEmailClient,
  EMAIL_CONFIG 
} from '@/lib/emailUtils';
import { 
  exportPartsTableToExcelHome, 
  exportPartsTableToExcelInspecao 
} from '@/lib/excelExport';
import { 
  Trash2, Plus, Download, Upload, Settings, 
  Camera, FileImage, Edit, X, Check,
  Image as ImageIcon, Clock, Wrench, Package, ListTree, Circle,
  ArrowUpRight, MousePointer, Home, ClipboardList, ChevronDown, ChevronUp, Globe, Mail, Maximize2,
  FileSpreadsheet, FileText, Share2, Users, FileDown, Import, History, CheckCircle, AlertTriangle, Menu, LogOut, Loader2
} from 'lucide-react';
import { useReportStore } from '@/store/reportStore';
import { useHomeReportStore } from '@/store/homeReportStore';
import { useSharedReportStore } from '@/store/sharedReportStore';
import { useTranslationStore, useTranslation } from '@/store/translationStore';
import { TAG_OPTIONS, MACHINE_DATA } from '@/lib/config';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS, type Language } from '@/lib/translations';
import type { PhotoData, AdditionalPart, EmbeddedPhoto, PhotoCategory, Criticality } from '@/types/report';
import { SharedContent } from '@/components/SharedContent';
import { HistoryContent } from '@/components/HistoryContent';
import { isHistoryAdmin } from '@/lib/auth';

// Tipo para objetos do editor
interface EditorCircle {
  id: string;
  type: 'circle' | 'circleWithPhoto' | 'arrow';
  x: number;
  y: number;
  radius?: number;
  endX?: number;
  endY?: number;
  color: string;
  imageData?: string;
}

// Componente de Menu de Ações Mobile
function MobileActionMenu({
  onAddPhoto,
  onDataDialog,
  onExportDialog,
  onEmailDialog,
  onClearConfirm,
  onShare,
  reportData,
  reportType,
  t,
}: {
  onAddPhoto: () => void;
  onDataDialog: () => void;
  onExportDialog: () => void;
  onEmailDialog: () => void;
  onClearConfirm: () => void;
  onShare: () => void;
  reportData: unknown;
  reportType: 'home' | 'inspecao';
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef(10);

  useEffect(() => {
    if (isOpen) {
      // Reset countdown ref
      countdownRef.current = 10;
      
      timerRef.current = setInterval(() => {
        countdownRef.current -= 1;
        const newTime = countdownRef.current;
        setTimeLeft(newTime);
        
        if (newTime <= 0) {
          setIsOpen(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      {/* Menu expandido */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-black/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/10 min-w-[200px]">
          <div className="text-xs text-white/60 mb-2 text-center">
            Fechando em {timeLeft}s
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              size="icon" 
              className="rounded-full bg-green-600 hover:bg-green-700 h-12 w-12" 
              onClick={() => handleAction(onAddPhoto)}
              title={t('action.addPhoto')}
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full bg-blue-600 hover:bg-blue-700 h-12 w-12" 
              onClick={() => handleAction(onDataDialog)}
              title={t('action.importExport')}
            >
              <FileDown className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full bg-purple-600 hover:bg-purple-700 h-12 w-12" 
              onClick={() => handleAction(onExportDialog)}
              title={t('action.download')}
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full bg-orange-500 hover:bg-orange-600 h-12 w-12" 
              onClick={() => handleAction(onEmailDialog)}
              title="Email"
            >
              <Mail className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full bg-indigo-500 hover:bg-indigo-600 h-12 w-12" 
              onClick={() => handleAction(onShare)}
              title="Compartilhar"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full bg-red-600 hover:bg-red-700 h-12 w-12" 
              onClick={() => handleAction(onClearConfirm)}
              title={t('action.clear')}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Botão principal */}
      <Button
        className={`rounded-full h-14 w-14 shadow-lg ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
}

// Componente para visualização em tela cheia
function FullScreenImageViewer({
  imageData,
  onClose,
  t,
}: {
  imageData: string;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `photo_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center touch-none">
      {/* Close button - larger for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10 h-12 w-12 md:h-10 md:w-10"
        onClick={onClose}
      >
        <X className="h-7 w-7 md:h-6 md:w-6" />
      </Button>
      
      {/* Download button - larger for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-20 md:right-16 text-white hover:bg-white/20 z-10 h-12 w-12 md:h-10 md:w-10"
        onClick={handleDownload}
      >
        <Download className="h-6 w-6 md:h-5 md:w-5" />
      </Button>
      
      {/* Image - pinch to zoom enabled via CSS */}
      <img
        src={imageData}
        alt="Fullscreen"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'manipulation' }}
      />
      
      {/* Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm bg-black/50 px-4 py-2 rounded-full">
        {t('fullscreen.close')}: ESC ou toque no X
      </div>
    </div>
  );
}

// Componente de opções de foto reutilizável
function PhotoOptionsDialog({
  open,
  onOpenChange,
  hasImage,
  onUpload,
  onCamera,
  onPaste,
  onViewFullscreen,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasImage: boolean;
  onUpload: (file: File) => void;
  onCamera: () => void;
  onPaste: () => void;
  onViewFullscreen?: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{t('photoOptions.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {/* Ver em tela cheia - só aparece se já tem foto */}
          {hasImage && onViewFullscreen && (
            <Button 
              className="w-full justify-start h-12 md:h-10" 
              variant="outline"
              onClick={() => { onViewFullscreen(); onOpenChange(false); }}
            >
              <Maximize2 className="h-5 w-5 mr-3" />
              {t('photoOptions.viewFullscreen')}
            </Button>
          )}
          
          {/* Upload de arquivo */}
          <Button 
            className="w-full justify-start h-12 md:h-10" 
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => { 
                const file = (e.target as HTMLInputElement).files?.[0]; 
                if (file) { 
                  onUpload(file); 
                  onOpenChange(false);
                } 
              };
              input.click();
            }}
          >
            <Upload className="h-5 w-5 mr-3" />
            {hasImage ? t('photoOptions.replacePhoto') : t('photoOptions.uploadFile')}
          </Button>
          
          {/* Abrir câmera */}
          <Button 
            className="w-full justify-start h-12 md:h-10" 
            variant="outline"
            onClick={() => { onCamera(); onOpenChange(false); }}
          >
            <Camera className="h-5 w-5 mr-3" />
            {t('photoOptions.openCamera')}
          </Button>
          
          {/* Colar da área de transferência */}
          <Button 
            className="w-full justify-start h-12 md:h-10" 
            variant="outline"
            onClick={() => { onPaste(); onOpenChange(false); }}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            {t('photoOptions.pasteClipboard')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para a seção de peças adicionais
function AdditionalPartsSection({
  parentPn,
  additionalParts,
  onAddPart,
  onRemovePart,
  onUpdatePart,
  t,
}: {
  parentPn: string;
  additionalParts: AdditionalPart[];
  onAddPart: (part: AdditionalPart) => void;
  onRemovePart: (id: string) => void;
  onUpdatePart?: (id: string, data: Partial<AdditionalPart>) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [newPn, setNewPn] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newCriticality, setNewCriticality] = useState<'Alta' | 'Média' | 'Baixa' | ''>('');

  const photoAdditionalParts = additionalParts.filter(p => p.parentPn === parentPn);

  const handleAddPart = () => {
    if (!newPn.trim() || !newPartName.trim() || !newQuantity.trim()) return;
    
    onAddPart({
      id: `add-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pn: newPn.trim(),
      serialNumber: newSerialNumber.trim(),
      partName: newPartName.trim(),
      quantity: newQuantity.trim(),
      criticality: newCriticality,
      parentPn: parentPn,
    });

    setNewPn('');
    setNewSerialNumber('');
    setNewPartName('');
    setNewQuantity('');
    setNewCriticality('');
  };

  // Get badge color based on criticality
  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case 'Alta':
        return <Badge className="bg-red-500 text-white text-xs h-5 px-2">{t('photo.criticalityHigh')}</Badge>;
      case 'Média':
        return <Badge className="bg-yellow-500 text-white text-xs h-5 px-2">{t('photo.criticalityMedium')}</Badge>;
      case 'Baixa':
        return <Badge className="bg-green-500 text-white text-xs h-5 px-2">{t('photo.criticalityLow')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="mt-3 p-3 bg-orange-50 rounded-lg border-2 border-orange-400 space-y-2">
      <Label className="text-sm text-orange-800 font-bold flex items-center gap-2">
        <ListTree className="h-4 w-4" />
        {t('subparts.partsOf', { pn: parentPn || '...' })}
      </Label>
      
      {photoAdditionalParts.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {photoAdditionalParts.map((part) => (
            <div key={part.id} className="flex items-center gap-2 bg-white p-2 rounded border text-sm">
              <span className="text-orange-600 font-mono font-bold">└─</span>
              <span className="font-semibold text-gray-700">{part.pn}</span>
              {part.serialNumber && (
                <span className="text-gray-500">({part.serialNumber})</span>
              )}
              <span className="text-gray-600 flex-1 truncate">{part.partName}</span>
              <Badge variant="secondary" className="text-xs h-5 px-2">{t('photo.quantity')}: {part.quantity}</Badge>
              {getCriticalityBadge(part.criticality)}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0" onClick={() => onRemovePart(part.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Mobile layout - stacked */}
      <div className="md:hidden space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input className="h-11 text-base" placeholder="PN" value={newPn} onChange={(e) => setNewPn(e.target.value)} />
          <Input className="h-11 text-base" placeholder={t('photo.serialPlaceholder')} value={newSerialNumber} onChange={(e) => setNewSerialNumber(e.target.value)} />
        </div>
        <Input className="h-11 text-base" placeholder={t('photo.partNamePlaceholder')} value={newPartName} onChange={(e) => setNewPartName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input className="h-11 text-base" placeholder={t('photo.quantityPlaceholder')} type="number" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
          <Select value={newCriticality} onValueChange={(v) => setNewCriticality(v as 'Alta' | 'Média' | 'Baixa' | '')}>
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder={t('photo.criticality')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alta">{t('photo.criticalityHigh')}</SelectItem>
              <SelectItem value="Média">{t('photo.criticalityMedium')}</SelectItem>
              <SelectItem value="Baixa">{t('photo.criticalityLow')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="lg" className="w-full h-12 bg-orange-500 hover:bg-orange-600" onClick={handleAddPart} disabled={!newPn.trim() || !newPartName.trim() || !newQuantity.trim()}>
          <Plus className="h-5 w-5 mr-2" /> {t('action.add')}
        </Button>
      </div>

      {/* Desktop layout - inline grid */}
      <div className="hidden md:grid grid-cols-12 gap-2">
        <Input className="h-8 text-sm col-span-2" placeholder="PN" value={newPn} onChange={(e) => setNewPn(e.target.value)} />
        <Input className="h-8 text-sm col-span-2" placeholder={t('photo.serialPlaceholder')} value={newSerialNumber} onChange={(e) => setNewSerialNumber(e.target.value)} />
        <Input className="h-8 text-sm col-span-3" placeholder={t('photo.partNamePlaceholder')} value={newPartName} onChange={(e) => setNewPartName(e.target.value)} />
        <Input className="h-8 text-sm col-span-1" placeholder={t('photo.quantityPlaceholder')} type="number" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
        <Select value={newCriticality} onValueChange={(v) => setNewCriticality(v as 'Alta' | 'Média' | 'Baixa' | '')}>
          <SelectTrigger className="h-8 text-xs col-span-2">
            <SelectValue placeholder={t('photo.criticality')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alta">{t('photo.criticalityHigh')}</SelectItem>
            <SelectItem value="Média">{t('photo.criticalityMedium')}</SelectItem>
            <SelectItem value="Baixa">{t('photo.criticalityLow')}</SelectItem>
          </SelectContent>
        </Select>
        <Button size="icon" className="h-8 w-8 bg-orange-500 hover:bg-orange-600 col-span-2" onClick={handleAddPart} disabled={!newPn.trim() || !newPartName.trim() || !newQuantity.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Editor de Foto
function PhotoEditor({
  photo,
  onSave,
  onClose,
  t,
}: {
  photo: PhotoData;
  onSave: (data: Partial<PhotoData>) => void;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  const [objects, setObjects] = useState<EditorCircle[]>(() => {
    return (photo.embeddedPhotos || []).map(ep => ({
      id: ep.id,
      type: 'circleWithPhoto' as const,
      x: ep.circleX,
      y: ep.circleY,
      radius: ep.circleRadius,
      color: '#f97316',
      imageData: ep.imageData,
    }));
  });
  
  const [currentTool, setCurrentTool] = useState<'select' | 'circle' | 'circlePhoto' | 'arrow'>('select');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentColor, setCurrentColor] = useState('#f97316');
  const [showAddPhotoDialog, setShowAddPhotoDialog] = useState(false);
  const [pendingPhotoCircle, setPendingPhotoCircle] = useState<EditorCircle | null>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [arrowPreview, setArrowPreview] = useState<{ x: number; y: number } | null>(null);

  const imageSrc = photo.editedImageData || photo.imageData;
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0, scale: 1 });

  useEffect(() => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      const container = containerRef.current;
      if (!container) return;
      const containerWidth = Math.min(container.clientWidth - 32, 900);
      const containerHeight = 500;
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
      setCanvasSize({ width: img.width * scale, height: img.height * scale, scale });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, scale } = canvasSize;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    objects.forEach((obj) => {
      const isSelected = obj.id === selectedObjectId;
      
      if (obj.type === 'circle' || obj.type === 'circleWithPhoto') {
        const x = obj.x * scale;
        const y = obj.y * scale;
        const radius = (obj.radius || 50) * scale;

        if (obj.type === 'circleWithPhoto' && obj.imageData) {
          const embeddedImg = new window.Image();
          embeddedImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(embeddedImg, x - radius + 2, y - radius + 2, (radius - 2) * 2, (radius - 2) * 2);
            ctx.restore();
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = isSelected ? 4 : 3;
            ctx.stroke();
          };
          embeddedImg.src = obj.imageData;
        } else {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = isSelected ? 4 : 3;
          ctx.stroke();
        }
      }
      
      if (obj.type === 'arrow') {
        const startX = obj.x * scale;
        const startY = obj.y * scale;
        const endX = (obj.endX || obj.x + 50) * scale;
        const endY = (obj.endY || obj.y + 50) * scale;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = isSelected ? 4 : 3;
        ctx.stroke();

        const angle = Math.atan2(endY - startY, endX - startX);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 15 * Math.cos(angle - Math.PI / 6), endY - 15 * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 15 * Math.cos(angle + Math.PI / 6), endY - 15 * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    });

    if (isDrawingArrow && arrowStart && arrowPreview) {
      ctx.beginPath();
      ctx.moveTo(arrowStart.x * scale, arrowStart.y * scale);
      ctx.lineTo(arrowPreview.x * scale, arrowPreview.y * scale);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [imageSrc, canvasSize, objects, selectedObjectId, isDrawingArrow, arrowStart, arrowPreview, currentColor]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMousePos = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / canvasSize.scale, y: (e.clientY - rect.top) / canvasSize.scale };
  };

  // Touch position helper for mobile
  const getTouchPos = (e: React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return { x: (touch.clientX - rect.left) / canvasSize.scale, y: (touch.clientY - rect.top) / canvasSize.scale };
  };

  const findObjectAtPosition = (x: number, y: number): EditorCircle | null => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.type === 'circle' || obj.type === 'circleWithPhoto') {
        const dist = Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2);
        if (dist <= (obj.radius || 50)) return obj;
      }
      if (obj.type === 'arrow') {
        const lineLength = Math.sqrt((obj.endX! - obj.x) ** 2 + (obj.endY! - obj.y) ** 2);
        const d1 = Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2);
        const d2 = Math.sqrt((x - obj.endX!) ** 2 + (y - obj.endY!) ** 2);
        if (d1 + d2 <= lineLength + 15) return obj;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (currentTool === 'select') {
      const obj = findObjectAtPosition(pos.x, pos.y);
      if (obj) {
        setSelectedObjectId(obj.id);
        setIsDragging(true);
        setDragOffset({ x: pos.x - obj.x, y: pos.y - obj.y });
      } else {
        setSelectedObjectId(null);
      }
    } else if (currentTool === 'circle') {
      const newCircle: EditorCircle = { id: `circle-${Date.now()}`, type: 'circle', x: pos.x, y: pos.y, radius: 50, color: currentColor };
      setObjects(prev => [...prev, newCircle]);
      setSelectedObjectId(newCircle.id);
      setCurrentTool('select');
    } else if (currentTool === 'circlePhoto') {
      setPendingPhotoCircle({ id: `cp-${Date.now()}`, type: 'circleWithPhoto', x: pos.x, y: pos.y, radius: 50, color: currentColor });
      setShowAddPhotoDialog(true);
    } else if (currentTool === 'arrow') {
      setIsDrawingArrow(true);
      setArrowStart(pos);
      setArrowPreview(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (isDragging && selectedObjectId) {
      setObjects(prev => prev.map(obj => {
        if (obj.id !== selectedObjectId) return obj;
        const newX = pos.x - dragOffset.x;
        const newY = pos.y - dragOffset.y;
        if (obj.type === 'arrow') {
          const dx = obj.endX! - obj.x;
          const dy = obj.endY! - obj.y;
          return { ...obj, x: newX, y: newY, endX: newX + dx, endY: newY + dy };
        }
        return { ...obj, x: newX, y: newY };
      }));
    }
    if (isDrawingArrow) setArrowPreview(pos);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) setIsDragging(false);
    if (isDrawingArrow && arrowStart && currentTool === 'arrow') {
      const pos = getMousePos(e);
      const distance = Math.sqrt((pos.x - arrowStart.x) ** 2 + (pos.y - arrowStart.y) ** 2);
      if (distance > 10) {
        const newArrow: EditorCircle = { id: `arrow-${Date.now()}`, type: 'arrow', x: arrowStart.x, y: arrowStart.y, endX: pos.x, endY: pos.y, color: currentColor };
        setObjects(prev => [...prev, newArrow]);
        setSelectedObjectId(newArrow.id);
      }
      setIsDrawingArrow(false);
      setArrowStart(null);
      setArrowPreview(null);
      setCurrentTool('select');
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    if (currentTool === 'select') {
      const obj = findObjectAtPosition(pos.x, pos.y);
      if (obj) {
        setSelectedObjectId(obj.id);
        setIsDragging(true);
        setDragOffset({ x: pos.x - obj.x, y: pos.y - obj.y });
      } else {
        setSelectedObjectId(null);
      }
    } else if (currentTool === 'circle') {
      const newCircle: EditorCircle = { id: `circle-${Date.now()}`, type: 'circle', x: pos.x, y: pos.y, radius: 50, color: currentColor };
      setObjects(prev => [...prev, newCircle]);
      setSelectedObjectId(newCircle.id);
      setCurrentTool('select');
    } else if (currentTool === 'circlePhoto') {
      setPendingPhotoCircle({ id: `cp-${Date.now()}`, type: 'circleWithPhoto', x: pos.x, y: pos.y, radius: 50, color: currentColor });
      setShowAddPhotoDialog(true);
    } else if (currentTool === 'arrow') {
      setIsDrawingArrow(true);
      setArrowStart(pos);
      setArrowPreview(pos);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    if (isDragging && selectedObjectId) {
      setObjects(prev => prev.map(obj => {
        if (obj.id !== selectedObjectId) return obj;
        const newX = pos.x - dragOffset.x;
        const newY = pos.y - dragOffset.y;
        if (obj.type === 'arrow') {
          const dx = obj.endX! - obj.x;
          const dy = obj.endY! - obj.y;
          return { ...obj, x: newX, y: newY, endX: newX + dx, endY: newY + dy };
        }
        return { ...obj, x: newX, y: newY };
      }));
    }
    if (isDrawingArrow) setArrowPreview(pos);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDragging) setIsDragging(false);
    if (isDrawingArrow && arrowStart && currentTool === 'arrow') {
      const pos = arrowPreview || arrowStart;
      const distance = Math.sqrt((pos.x - arrowStart.x) ** 2 + (pos.y - arrowStart.y) ** 2);
      if (distance > 10) {
        const newArrow: EditorCircle = { id: `arrow-${Date.now()}`, type: 'arrow', x: arrowStart.x, y: arrowStart.y, endX: pos.x, endY: pos.y, color: currentColor };
        setObjects(prev => [...prev, newArrow]);
        setSelectedObjectId(newArrow.id);
      }
      setIsDrawingArrow(false);
      setArrowStart(null);
      setArrowPreview(null);
      setCurrentTool('select');
    }
  };

  const handleAddPhotoToCircle = (file: File) => {
    if (!pendingPhotoCircle) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setObjects(prev => [...prev, { ...pendingPhotoCircle, imageData }]);
      setPendingPhotoCircle(null);
      setShowAddPhotoDialog(false);
      setCurrentTool('select');
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    if (selectedObjectId) {
      setObjects(prev => prev.filter(obj => obj.id !== selectedObjectId));
      setSelectedObjectId(null);
    }
  };

  const resizeSelected = (delta: number) => {
    if (selectedObjectId) {
      setObjects(prev => prev.map(obj => {
        if (obj.id !== selectedObjectId || !obj.radius) return obj;
        return { ...obj, radius: Math.max(20, Math.min(200, obj.radius + delta)) };
      }));
    }
  };

  const handleSave = () => {
    const embeddedPhotos: EmbeddedPhoto[] = objects.filter(obj => obj.type === 'circleWithPhoto' && obj.imageData).map(obj => ({ id: obj.id, circleX: obj.x, circleY: obj.y, circleRadius: obj.radius || 50, imageData: obj.imageData! }));
    onSave({ embeddedPhotos });
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId && !showAddPhotoDialog) { e.preventDefault(); deleteSelected(); }
      if (e.key === 'Escape') { setSelectedObjectId(null); setCurrentTool('select'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, showAddPhotoDialog]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 md:p-4 border-b">
          <h3 className="text-base md:text-lg font-semibold flex items-center gap-2"><Edit className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />Editor de Foto</h3>
          <Button variant="ghost" size="icon" className="h-10 w-10 md:h-8 md:w-8" onClick={onClose}><X className="h-5 w-5 md:h-4 md:w-4" /></Button>
        </div>
        
        {/* Mobile Tools - Horizontal scroll */}
        <div className="md:hidden flex items-center gap-2 p-2 border-b bg-gray-50 overflow-x-auto">
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant={currentTool === 'select' ? "default" : "outline"} size="sm" className={`h-10 w-10 p-0 ${currentTool === 'select' ? "bg-orange-500 hover:bg-orange-600" : ""}`} onClick={() => setCurrentTool('select')}><MousePointer className="h-5 w-5" /></Button>
            <Button variant={currentTool === 'circle' ? "default" : "outline"} size="sm" className={`h-10 w-10 p-0 ${currentTool === 'circle' ? "bg-orange-500 hover:bg-orange-600" : ""}`} onClick={() => setCurrentTool('circle')}><Circle className="h-5 w-5" /></Button>
            <Button variant={currentTool === 'circlePhoto' ? "default" : "outline"} size="sm" className={`h-10 w-10 p-0 ${currentTool === 'circlePhoto' ? "bg-orange-500 hover:bg-orange-600" : ""}`} onClick={() => setCurrentTool('circlePhoto')}><div className="relative"><Circle className="h-5 w-5" /><Camera className="h-3 w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div></Button>
            <Button variant={currentTool === 'arrow' ? "default" : "outline"} size="sm" className={`h-10 w-10 p-0 ${currentTool === 'arrow' ? "bg-orange-500 hover:bg-orange-600" : ""}`} onClick={() => setCurrentTool('arrow')}><ArrowUpRight className="h-5 w-5" /></Button>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#ffffff', '#000000'].map(color => (
              <button key={color} className={`w-8 h-8 rounded border-2 ${currentColor === color ? 'border-orange-500' : 'border-gray-300'}`} style={{ backgroundColor: color }} onClick={() => setCurrentColor(color)} />
            ))}
          </div>
          {selectedObjectId && (
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={() => resizeSelected(-10)}>-</Button>
              <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={() => resizeSelected(10)}>+</Button>
              <Button variant="destructive" size="sm" className="h-10 w-10 p-0" onClick={deleteSelected}><Trash2 className="h-5 w-5" /></Button>
            </div>
          )}
        </div>

        {/* Desktop Tools */}
        <div className="hidden md:flex items-center gap-2 p-3 border-b bg-gray-50 flex-wrap">
          <div className="flex items-center gap-1 border-r pr-3">
            <Button variant={currentTool === 'select' ? "default" : "outline"} size="sm" className={currentTool === 'select' ? "bg-orange-500 hover:bg-orange-600" : ""} onClick={() => setCurrentTool('select')}><MousePointer className="h-4 w-4" /></Button>
            <Button variant={currentTool === 'circle' ? "default" : "outline"} size="sm" className={currentTool === 'circle' ? "bg-orange-500 hover:bg-orange-600" : ""} onClick={() => setCurrentTool('circle')}><Circle className="h-4 w-4" /></Button>
            <Button variant={currentTool === 'circlePhoto' ? "default" : "outline"} size="sm" className={currentTool === 'circlePhoto' ? "bg-orange-500 hover:bg-orange-600" : ""} onClick={() => setCurrentTool('circlePhoto')}><div className="relative"><Circle className="h-4 w-4" /><Camera className="h-2.5 w-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div></Button>
            <Button variant={currentTool === 'arrow' ? "default" : "outline"} size="sm" className={currentTool === 'arrow' ? "bg-orange-500 hover:bg-orange-600" : ""} onClick={() => setCurrentTool('arrow')}><ArrowUpRight className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-500">Cor:</Label>
            {['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#ffffff', '#000000'].map(color => (
              <button key={color} className={`w-6 h-6 rounded border-2 ${currentColor === color ? 'border-orange-500' : 'border-gray-300'}`} style={{ backgroundColor: color }} onClick={() => setCurrentColor(color)} />
            ))}
          </div>
          {selectedObjectId && (
            <div className="flex items-center gap-2 border-l pl-3">
              <Button variant="outline" size="sm" onClick={() => resizeSelected(-10)}>-</Button>
              <Button variant="outline" size="sm" onClick={() => resizeSelected(10)}>+</Button>
              <Button variant="destructive" size="sm" onClick={deleteSelected}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )}
          <div className="ml-auto text-xs text-gray-500">
            {currentTool === 'select' && 'Clique para selecionar, arraste para mover'}
            {currentTool === 'circle' && 'Clique para adicionar círculo'}
            {currentTool === 'circlePhoto' && 'Clique para adicionar círculo com foto'}
            {currentTool === 'arrow' && 'Clique e arraste para desenhar seta'}
          </div>
        </div>

        {/* Mobile instructions */}
        {selectedObjectId && (
          <div className="md:hidden text-center text-xs text-orange-600 py-2 bg-orange-50">
            Objeto selecionado • Use os botões + e - para redimensionar
          </div>
        )}
        
        <div ref={containerRef} className="flex-1 overflow-auto p-2 md:p-4 flex justify-center bg-gray-100">
          {imageSrc ? (
            <canvas 
              ref={canvasRef} 
              className="border rounded shadow-lg cursor-crosshair touch-none max-w-full" 
              onMouseDown={handleMouseDown} 
              onMouseMove={handleMouseMove} 
              onMouseUp={handleMouseUp} 
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ width: canvasSize.width, height: canvasSize.height }} 
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">Nenhuma foto para editar</div>
          )}
        </div>
        
        <div className="flex justify-between items-center gap-2 p-3 md:p-4 border-t bg-white">
          <p className="text-xs text-gray-500 hidden md:block">Delete para remover • Esc para cancelar</p>
          <p className="text-xs text-gray-500 md:hidden">Toque no objeto para selecionar</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="min-h-[44px] h-11 px-6">Cancelar</Button>
            <Button className="bg-orange-500 hover:bg-orange-600 min-h-[44px] h-11 px-6" onClick={handleSave}><Check className="h-5 w-5 mr-2" />Salvar</Button>
          </div>
        </div>
      </div>
      <Dialog open={showAddPhotoDialog} onOpenChange={(open) => { setShowAddPhotoDialog(open); if (!open) { setPendingPhotoCircle(null); setCurrentTool('select'); } }}>
        <DialogContent className="max-w-[90vw]">
          <DialogHeader><DialogTitle>Adicionar Foto ao Círculo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Escolha uma foto:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleAddPhotoToCircle(file); };
                input.click();
              }}><Upload className="h-5 w-5 mr-2" />Upload</Button>
              <Button variant="outline" className="flex-1 h-12" onClick={async () => {
                try {
                  const items = await navigator.clipboard.read();
                  for (const item of items) { for (const type of item.types) { if (type.startsWith('image/')) { const blob = await item.getType(type); handleAddPhotoToCircle(blob as File); } } }
                } catch (err) { console.error('Failed to paste:', err); }
              }}><Camera className="h-5 w-5 mr-2" />Colar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para foto de identificação
function IdentificationPhoto({
  label,
  imageData,
  onUpload,
  onRemove,
  caption,
  t,
}: {
  label: string;
  imageData: string | null;
  onUpload: (data: string) => void;
  onRemove: () => void;
  caption?: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { onUpload(e.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error('Erro ao abrir câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const handleCapturePhoto = () => {
    const video = document.getElementById('camera-video-identification') as HTMLVideoElement;
    if (!video) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      onUpload(imageData);
    }
    
    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => { onUpload(e.target?.result as string); };
            reader.readAsDataURL(blob);
          }
        }
      }
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-2 bg-orange-500 text-white text-center font-semibold text-sm">{label}</div>
        <div 
          className="relative h-28 md:h-32 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors active:bg-gray-300" 
          onClick={() => setShowOptions(true)}
        >
          {imageData ? (
            <>
              <img src={imageData} alt={label} className="w-full h-full object-cover" />
              <Button 
                size="icon" 
                className="absolute top-1 right-1 rounded-full bg-red-600 hover:bg-red-700 h-8 w-8 md:h-6 md:w-6" 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
              >
                <X className="h-4 w-4 md:h-3 md:w-3" />
              </Button>
            </>
          ) : (
            <div className="text-center text-gray-400">
              <Camera className="h-8 w-8 mx-auto mb-1" />
              <p className="text-xs">{t('photos.clickToAdd')}</p>
            </div>
          )}
        </div>
        {caption && <div className="p-2 bg-gray-50 text-center text-xs text-gray-600 min-h-[32px]">{caption}</div>}
      </Card>

      {/* Photo Options Dialog */}
      <PhotoOptionsDialog
        open={showOptions}
        onOpenChange={setShowOptions}
        hasImage={!!imageData}
        onUpload={handleFileUpload}
        onCamera={handleOpenCamera}
        onPaste={handlePaste}
        onViewFullscreen={() => setShowFullscreen(true)}
        t={t}
      />

      {/* Fullscreen Viewer */}
      {showFullscreen && imageData && (
        <FullScreenImageViewer
          imageData={imageData}
          onClose={() => setShowFullscreen(false)}
          t={t}
        />
      )}

      {/* Camera Dialog */}
      {showCamera && cameraStream && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="flex justify-between items-center p-3 md:p-4 bg-black/50">
            <span className="text-white font-semibold text-sm md:text-base">{label}</span>
            <Button variant="ghost" size="icon" className="text-white h-10 w-10" onClick={handleCloseCamera}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <video
              id="camera-video-identification"
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              ref={(video) => {
                if (video && cameraStream) {
                  video.srcObject = cameraStream;
                }
              }}
            />
          </div>
          <div className="p-4 md:p-6 flex justify-center bg-black/50">
            <Button 
              size="lg"
              className="rounded-full h-16 w-16 md:h-14 md:w-14 bg-white text-black hover:bg-gray-200"
              onClick={handleCapturePhoto}
            >
              <Camera className="h-8 w-8 md:h-7 md:w-7" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// ABA HOME - Com Categorias
// ============================================
function HomeContent() {
  const {
    inspection,
    categories,
    conclusion,
    updateInspection,
    setCategories,
    addPhotoToCategory,
    removePhotoFromCategory,
    updatePhotoInCategory,
    addAdditionalPartToCategory,
    removeAdditionalPartFromCategory,
    setConclusion,
    clearAll,
  } = useHomeReportStore();
  
  const { language, t } = useTranslation();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showPhotoOptions, setShowPhotoOptions] = useState<{ categoryId: string; photoId: string } | null>(null);
  const [showAdditionalParts, setShowAdditionalParts] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<{ categoryId: string; photo: PhotoData } | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<{ categoryId: string; photoId: string } | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const shareDialog = useShareDialog();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);
  const clipboardPhotoId = useRef<{ categoryId: string; photoId: string } | null>(null);

  const handleTagChange = (tag: string) => {
    updateInspection({ tag });
    if (tag && MACHINE_DATA[tag]) {
      const machine = MACHINE_DATA[tag];
      updateInspection({ modelo: machine.modelo, sn: machine.sn, entrega: machine.entrega, cliente: machine.cliente });
    }
  };

  const handlePhotoUpload = (categoryId: string, photoId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { updatePhotoInCategory(categoryId, photoId, { imageData: e.target?.result as string, editedImageData: null }); };
    reader.readAsDataURL(file);
    setShowPhotoOptions(null);
  };

  const handlePaste = useCallback(async (categoryId: string, photoId: string) => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => { updatePhotoInCategory(categoryId, photoId, { imageData: e.target?.result as string, editedImageData: null }); };
            reader.readAsDataURL(blob);
          }
        }
      }
    } catch (err) { console.error('Failed to paste:', err); }
    setShowPhotoOptions(null);
  }, [updatePhotoInCategory]);

  // Camera functions
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error('Erro ao abrir câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraTarget(null);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video-home') as HTMLVideoElement;
    if (!video || !cameraTarget) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      updatePhotoInCategory(cameraTarget.categoryId, cameraTarget.photoId, { imageData, editedImageData: null });
    }
    
    closeCamera();
    setShowPhotoOptions(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardPhotoId.current) {
        handlePaste(clipboardPhotoId.current.categoryId, clipboardPhotoId.current.photoId);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePaste]);

  const handleClearReport = () => { clearAll(); setShowClearConfirm(false); };

  const handleFinalizeReport = async () => {
    console.log('[Finalize] Starting...');
    
    // Validation
    const missingFields: string[] = [];
    
    if (!conclusion) missingFields.push(t('finalize.conclusionRequired'));
    if (!inspection.inspetor) missingFields.push(t('finalize.executantesRequired'));
    if (!inspection.tag) missingFields.push(t('finalize.tagRequired'));
    if (!inspection.descricao) missingFields.push(t('finalize.descricaoRequired'));
    
    console.log('[Finalize] Missing fields:', missingFields);
    console.log('[Finalize] Data:', { conclusion: !!conclusion, inspetor: inspection.inspetor, tag: inspection.tag, descricao: inspection.descricao });
    
    if (missingFields.length > 0) {
      alert(t('finalize.requiredFields') + '\n\n' + missingFields.join('\n'));
      return;
    }
    
    try {
      console.log('[Finalize] Sending request...');
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reportType: 'home',
          tag: inspection.tag,
          cliente: inspection.cliente,
          descricao: inspection.descricao,
          conclusao: conclusion,
          executantes: inspection.inspetor,
          machineDown: inspection.machineDown === 'Yes',
          data: { inspection, categories, conclusion },
        }),
      });
      
      console.log('[Finalize] Response status:', response.status);
      
      if (response.ok) {
        // Download JSON automaticamente
        const jsonData = { 
          version: '1.0',
          exportDate: new Date().toISOString(),
          inspection, 
          categories, 
          conclusion 
        };
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Relatorio_${inspection.tag || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Download PowerPoint automaticamente
        await generateHomePowerPoint({ inspection, categories, conclusion, language: 'pt' });
        
        alert(t('finalize.success'));
        clearAll();
      } else {
        const error = await response.json();
        if (error.missingFields) {
          alert(t('finalize.requiredFields') + '\n\n' + error.missingFields.join('\n'));
        } else if (error.error === 'Report already finalized') {
          alert('Este relatório já foi finalizado anteriormente!');
        } else {
          alert(t('finalize.error'));
        }
      }
    } catch (error) {
      alert(t('finalize.error'));
    }
  };

  const handleExport = () => {
    // Export ALL data including photos (base64), categories, inspection, conclusion
    const data = { 
      version: '1.0',
      exportDate: new Date().toISOString(),
      inspection, 
      categories, 
      conclusion 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${inspection.tag || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Import inspection data
        if (data.inspection) {
          Object.keys(data.inspection).forEach(key => {
            updateInspection({ [key]: data.inspection[key] });
          });
        }
        // Import categories with all photos and additional parts
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        // Import conclusion
        if (data.conclusion) setConclusion(data.conclusion);
      } catch (err) { 
        console.error('Failed to import:', err);
        alert('Erro ao importar arquivo. Verifique se o arquivo é válido.');
      }
      // Reset input to allow re-importing same file
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleGeneratePPT = async () => {
    setIsLoading(true);
    try {
      // Translate dynamic texts if not in Portuguese
      if (language !== 'pt') {
        const { translateDynamic, translateDynamicBatch } = useTranslationStore.getState();
        
        // Translate all inspection text fields
        const translatedInspection = { ...inspection };
        if (inspection.descricao) {
          translatedInspection.descricao = await translateDynamic(inspection.descricao);
        }
        if (inspection.osExecucao) {
          translatedInspection.osExecucao = await translateDynamic(inspection.osExecucao);
        }
        if (inspection.inspetor) {
          translatedInspection.inspetor = await translateDynamic(inspection.inspetor);
        }
        if (inspection.cliente) {
          translatedInspection.cliente = await translateDynamic(inspection.cliente);
        }
        
        // Translate all category photos
        const translatedCategories = await Promise.all(categories.map(async (category) => {
          const translatedPhotos = await Promise.all(category.photos.map(async (photo) => {
            const translatedPhoto = { ...photo };
            if (photo.description) {
              translatedPhoto.description = await translateDynamic(photo.description);
            }
            if (photo.partName) {
              translatedPhoto.partName = await translateDynamic(photo.partName);
            }
            return translatedPhoto;
          }));
          
          const translatedAdditionalParts = await Promise.all(category.additionalParts.map(async (part) => {
            const translatedPart = { ...part };
            if (part.partName) {
              translatedPart.partName = await translateDynamic(part.partName);
            }
            return translatedPart;
          }));
          
          return {
            ...category,
            photos: translatedPhotos,
            additionalParts: translatedAdditionalParts,
          };
        }));
        
        // Translate conclusion
        const translatedConclusion = conclusion ? await translateDynamic(conclusion) : conclusion;
        
        await generateHomePowerPoint({ 
          inspection: translatedInspection, 
          categories: translatedCategories, 
          conclusion: translatedConclusion,
          language 
        });
      } else {
        await generateHomePowerPoint({ inspection, categories, conclusion, language: 'pt' });
      }
    } catch (error) { 
      console.error('Error generating PowerPoint:', error); 
    }
    setIsLoading(false);
  };

  // Email handlers
  const handleSendAnalysisEmail = () => {
    const subject = generateEmailSubject(inspection, 'analysis');
    const body = generateAnalysisEmailBody(inspection, [], [], categories);
    openEmailClient({
      to: EMAIL_CONFIG.analysisRecipients,
      cc: EMAIL_CONFIG.analysisCc,
      subject,
      body,
    });
    setShowEmailDialog(false);
  };

  const handleSendConclusionEmail = () => {
    const subject = generateEmailSubject(inspection, 'conclusion');
    const body = generateConclusionEmailBody(inspection, conclusion, [], [], categories);
    openEmailClient({
      to: EMAIL_CONFIG.conclusionRecipients,
      cc: EMAIL_CONFIG.conclusionCc,
      subject,
      body,
    });
    setShowEmailDialog(false);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  return (
    <>
      {/* Action Buttons - Responsivo */}
      <div className="fixed top-20 right-4 md:flex flex-col gap-2 z-40 hidden">
        <Button size="icon" className="rounded-full bg-red-600 hover:bg-red-700" onClick={() => setShowClearConfirm(true)} title={t('action.clear')}><Trash2 className="h-5 w-5" /></Button>
        
        {/* Botão de Dados (Importar/Exportar JSON) */}
        <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowDataDialog(true)} title={t('action.importExport')}><FileDown className="h-5 w-5" /></Button>
        
        {/* Botão de Exportar (PDF/RDO) */}
        <Button size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowExportDialog(true)} title={t('action.download')}><Download className="h-5 w-5" /></Button>
        
        <Button size="icon" className="rounded-full bg-orange-500 hover:bg-orange-600" onClick={() => setShowEmailDialog(true)} title="Enviar Email"><Mail className="h-5 w-5" /></Button>
        <CollaborationPanel
          reportType="home"
          reportData={{ inspection, categories, conclusion }}
          onDataRequest={() => ({ inspection, categories, conclusion })}
          t={t}
          externalOpen={shareDialog.isOpen}
          onExternalOpenChange={shareDialog.setIsOpen}
        />
      </div>
      
      {/* Mobile Action Bar - Botão flutuante */}
      <MobileActionMenu
        onAddPhoto={() => addPhotoToCategory(categories[0]?.id || '')}
        onDataDialog={() => setShowDataDialog(true)}
        onExportDialog={() => setShowExportDialog(true)}
        onEmailDialog={() => setShowEmailDialog(true)}
        onClearConfirm={() => setShowClearConfirm(true)}
        onShare={shareDialog.openDialog}
        reportData={{ inspection, categories, conclusion }}
        reportType="home"
        t={t}
      />
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImport} className="hidden" />
      <input ref={fileImportRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

      {/* Export Dialog - PDF/RDO */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-[90vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-500" />
              {t('action.download')}
            </DialogTitle>
            <DialogDescription>{t('action.downloadDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={() => { handleGeneratePPT(); setShowExportDialog(false); }}
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileImage className="h-5 w-5 md:h-4 md:w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{t('rdo.powerpoint')}</p>
                  <p className="text-xs text-gray-500">{t('action.pptDesc')}</p>
                </div>
              </div>
            </Button>
            
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={() => { alert('🚧 Relatório RDO está em construção. Em breve estará disponível!'); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 md:h-4 md:w-4 text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-400">{t('rdo.executive')} 🚧</p>
                  <p className="text-xs text-gray-400">Em construção...</p>
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>{t('action.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Dialog - Import/Export JSON */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent className="max-w-[90vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <FileDown className="h-5 w-5 text-blue-500" />
              {t('action.importExport')}
            </DialogTitle>
            <DialogDescription>{t('action.importExportDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={() => { handleExport(); setShowDataDialog(false); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Download className="h-5 w-5 md:h-4 md:w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{t('action.exportJson')}</p>
                  <p className="text-xs text-gray-500">{t('action.exportJsonDesc')}</p>
                </div>
              </div>
            </Button>
            
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={() => { fileImportRef.current?.click(); setShowDataDialog(false); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-5 w-5 md:h-4 md:w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{t('action.importJson')}</p>
                  <p className="text-xs text-gray-500">{t('action.importJsonDesc')}</p>
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDataDialog(false)}>{t('action.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Options Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-[90vw] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Enviar Email</DialogTitle>
            <DialogDescription>Selecione o tipo de email que deseja enviar:</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={handleSendAnalysisEmail}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 md:h-4 md:w-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold">Análise</div>
                  <div className="text-xs text-gray-500">Envia para Wallysson, Emerson e Jadson</div>
                </div>
              </div>
            </Button>
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={handleSendConclusionEmail}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 md:h-4 md:w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold">Concluído</div>
                  <div className="text-xs text-gray-500">Envia para todos os destinatários</div>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Page */}
      <section className="p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader><CardTitle className="text-2xl font-bold">{t('report.technicalReport')}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* Machine Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-orange-500" />{t('report.executionInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t('report.tag')}</Label><Input list="tag-options-home" value={inspection.tag} onChange={(e) => handleTagChange(e.target.value)} placeholder={t('placeholder.tag')} /><datalist id="tag-options-home">{TAG_OPTIONS.map(tag => (<option key={tag} value={tag} />))}</datalist></div>
                <div className="space-y-2"><Label>{t('report.modelo')}</Label><Input value={inspection.modelo} onChange={(e) => updateInspection({ modelo: e.target.value })} placeholder={t('placeholder.modelo')} /></div>
                <div className="space-y-2"><Label>{t('report.sn')}</Label><Input value={inspection.sn} onChange={(e) => updateInspection({ sn: e.target.value })} placeholder={t('placeholder.sn')} /></div>
                <div className="space-y-2"><Label>{t('report.entrega')}</Label><Input value={inspection.entrega} onChange={(e) => updateInspection({ entrega: e.target.value })} placeholder={t('placeholder.entrega')} /></div>
                <div className="space-y-2"><Label>{t('report.cliente')}</Label><Input value={inspection.cliente} onChange={(e) => updateInspection({ cliente: e.target.value })} placeholder={t('placeholder.cliente')} /></div>
                <div className="space-y-2"><Label>{t('report.descricao')}</Label><Input value={inspection.descricao} onChange={(e) => updateInspection({ descricao: e.target.value })} placeholder={t('placeholder.descricao')} /></div>
                <div className="space-y-2"><Label>{t('report.machineDown')}</Label><Select value={inspection.machineDown} onValueChange={(value) => updateInspection({ machineDown: value as 'Yes' | 'No' })}><SelectTrigger><SelectValue placeholder={t('select.selectOption')} /></SelectTrigger><SelectContent><SelectItem value="No">{t('select.no')}</SelectItem><SelectItem value="Yes">{t('select.yes')}</SelectItem></SelectContent></Select></div>
              </div>
            </div>

            <Separator />

            {/* Fotos de Identificação da Máquina */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Camera className="h-5 w-5 text-orange-500" />{t('machine.identification')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <IdentificationPhoto label={t('machine.equipmentPhoto')} imageData={inspection.machinePhoto} onUpload={(data) => updateInspection({ machinePhoto: data })} onRemove={() => updateInspection({ machinePhoto: null })} caption={inspection.tag || t('machine.equipmentTag')} t={t} />
                <IdentificationPhoto label={t('machine.hourMeterPhoto')} imageData={inspection.horimetroPhoto} onUpload={(data) => updateInspection({ horimetroPhoto: data })} onRemove={() => updateInspection({ horimetroPhoto: null })} caption={`${t('report.hourMeter')}: ${inspection.horimetro || '-'}`} t={t} />
                <IdentificationPhoto label={t('machine.serialPhoto')} imageData={inspection.serialPhoto} onUpload={(data) => updateInspection({ serialPhoto: data })} onRemove={() => updateInspection({ serialPhoto: null })} caption={`${t('machine.serialNumber')}: ${inspection.sn || '-'}`} t={t} />
              </div>
            </div>

            <Separator />

            {/* Execution Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5 text-orange-500" />{t('report.reportData')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t('report.executionDate')}</Label><Input type="date" value={inspection.data} onChange={(e) => updateInspection({ data: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t('report.endDateOptional')}</Label><Input type="date" value={inspection.dataFinal} onChange={(e) => updateInspection({ dataFinal: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t('report.workOrderOptional')}</Label><Input value={inspection.osExecucao} onChange={(e) => updateInspection({ osExecucao: e.target.value })} placeholder={t('placeholder.os')} /></div>
                <div className="space-y-2"><Label>{t('report.performers')}</Label><Input value={inspection.inspetor} onChange={(e) => updateInspection({ inspetor: e.target.value })} placeholder={t('placeholder.inspector')} /></div>
                <div className="space-y-2"><Label>{t('report.hourMeter')}</Label><Input value={inspection.horimetro} onChange={(e) => updateInspection({ horimetro: e.target.value })} placeholder={t('placeholder.hourmeter')} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Categorized Photos Section */}
      <section className="p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Camera className="h-6 w-6 text-orange-500" />
            {t('photos.title')}
          </h2>

          {/* Categories */}
          <div className="space-y-4">
            {categories.map((category, catIndex) => (
              <Collapsible key={category.id} open={expandedCategories[category.id] ?? false} onOpenChange={() => toggleCategory(category.id)}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                            {catIndex + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{t(`category.${category.id}`, { defaultValue: category.title })}</CardTitle>
                            <p className="text-sm text-gray-500">{t(`category.${category.id}Desc`, { defaultValue: category.description })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{t('photos.photoCount', { count: category.photos.filter(p => p.imageData).length })}</Badge>
                          {expandedCategories[category.id] ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.photos.map((photo, index) => (
                          <Card key={photo.id} className="overflow-hidden group border-2 border-gray-200">
                            <div className="p-3 bg-black/5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-600">{t('photos.photo')} {index + 1}</span>
                                {category.photos.length > 2 && (
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhotoFromCategory(category.id, photo.id)} title={t('action.remove')}><Trash2 className="h-4 w-4" /></Button>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Label className="text-xs font-semibold text-orange-600 whitespace-nowrap">{t('photo.pn')}:</Label>
                                <Input className="h-7 text-xs flex-1 min-w-0" value={photo.pn} onChange={(e) => updatePhotoInCategory(category.id, photo.id, { pn: e.target.value })} placeholder={t('photo.pnPlaceholder')} />
                                <Label className="text-xs whitespace-nowrap">{t('photo.serial')}:</Label>
                                <Input className="h-7 text-xs w-24" value={photo.serialNumber || ''} onChange={(e) => updatePhotoInCategory(category.id, photo.id, { serialNumber: e.target.value })} placeholder={t('photo.serialPlaceholder')} />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">{t('photo.partName')}:</Label>
                                <Input className="h-7 text-xs flex-1" value={photo.partName} onChange={(e) => updatePhotoInCategory(category.id, photo.id, { partName: e.target.value })} placeholder={t('photo.partNamePlaceholder')} />
                                <Label className="text-xs">{t('photo.quantity')}:</Label>
                                <Input className="h-7 text-xs w-16" type="number" value={photo.quantity} onChange={(e) => updatePhotoInCategory(category.id, photo.id, { quantity: e.target.value })} placeholder={t('photo.quantityPlaceholder')} />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">{t('photo.criticality')}:</Label>
                                <Select value={photo.criticality || ''} onValueChange={(v) => updatePhotoInCategory(category.id, photo.id, { criticality: v as Criticality })}>
                                  <SelectTrigger className="h-7 text-xs flex-1">
                                    <SelectValue placeholder={t('select.selectOption')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Alta">{t('photo.criticalityHigh')}</SelectItem>
                                    <SelectItem value="Média">{t('photo.criticalityMedium')}</SelectItem>
                                    <SelectItem value="Baixa">{t('photo.criticalityLow')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-amber-100 rounded-lg border-2 border-amber-400">
                                <Checkbox id={`subparts-home-${category.id}-${photo.id}`} checked={showAdditionalParts[`${category.id}-${photo.id}`] || false} onCheckedChange={(checked) => setShowAdditionalParts(prev => ({ ...prev, [`${category.id}-${photo.id}`]: !!checked }))} className="border-amber-600 data-[state=checked]:bg-amber-500" />
                                <Label htmlFor={`subparts-home-${category.id}-${photo.id}`} className="text-sm font-bold text-amber-800 cursor-pointer flex items-center gap-1"><ListTree className="h-4 w-4" /> {t('subparts.title')}</Label>
                              </div>
                              {showAdditionalParts[`${category.id}-${photo.id}`] && (
                                <AdditionalPartsSection parentPn={photo.pn} additionalParts={category.additionalParts} onAddPart={(part) => addAdditionalPartToCategory(category.id, part)} onRemovePart={(id) => removeAdditionalPartFromCategory(category.id, id)} t={t} />
                              )}
                            </div>
                            <div className="relative h-40 bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors" onClick={() => { setShowPhotoOptions({ categoryId: category.id, photoId: photo.id }); clipboardPhotoId.current = { categoryId: category.id, photoId: photo.id }; }}>
                              {photo.imageData ? (
                                <img src={photo.editedImageData || photo.imageData} alt={`${t('photos.photo')} ${index + 1}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center text-gray-500"><Camera className="h-10 w-10 mx-auto mb-2" /><p className="text-sm">{t('photos.clickToAdd')}</p></div>
                              )}
                              {photo.imageData && (
                                <div className="absolute top-2 right-2 flex gap-1">
                                  <Button size="icon" className="rounded-full bg-orange-500 hover:bg-orange-600 h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingPhoto({ categoryId: category.id, photo }); }} title={t('action.edit')}><Edit className="h-3.5 w-3.5" /></Button>
                                  <Button size="icon" className="rounded-full bg-red-600 hover:bg-red-700 h-7 w-7" onClick={(e) => { e.stopPropagation(); updatePhotoInCategory(category.id, photo.id, { imageData: null, editedImageData: null }); }} title={t('action.remove')}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                              )}
                              {photo.embeddedPhotos && photo.embeddedPhotos.length > 0 && (
                                <div className="absolute bottom-2 left-2"><Badge className="bg-orange-500 text-white text-xs"><Circle className="h-3 w-3 mr-1" />{photo.embeddedPhotos.length} {t('photo.circles')}</Badge></div>
                              )}
                            </div>
                            <div className="p-2">
                              <TextareaWithSpellCheck
                                className="h-14 text-sm"
                                placeholder={t('photo.descriptionPlaceholder')}
                                value={photo.description}
                                onChange={(value) => updatePhotoInCategory(category.id, photo.id, { description: value })}
                                language={language}
                                t={t}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Button variant="outline" className="mt-4 w-full" onClick={() => addPhotoToCategory(category.id)}>
                        <Plus className="h-4 w-4 mr-2" />{t('photos.addPhoto')}
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {/* Parts Table - All parts from all categories */}
          <Card className="mt-8">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-orange-500" />{t('partsTable.title')}</CardTitle>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 h-10"
                onClick={() => exportPartsTableToExcelHome(inspection, categories)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {t('partsTable.exportExcel')}
              </Button>
            </CardHeader>
            <CardContent>
              {/* Mobile scroll hint */}
              <p className="md:hidden text-xs text-gray-500 mb-2 flex items-center gap-1">
                ← {t('table.swipe')} →
              </p>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="w-full min-w-[600px]">
                  <thead><tr className="bg-black text-white"><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.pnSerial')}</th><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.partName')}</th><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.qty')}</th><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.criticality')}</th><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.type')}</th></tr></thead>
                  <tbody>
                    {categories.flatMap(cat => cat.photos.filter(p => p.pn).map(photo => ({ photo, categoryId: cat.id }))).map(({ photo, categoryId }) => (
                      <React.Fragment key={photo.id}>
                        <tr className="border-b hover:bg-orange-50">
                          <td className="p-2 md:p-3 font-semibold text-sm">{photo.pn}{photo.serialNumber && <span className="text-gray-500 font-normal ml-1">({photo.serialNumber})</span>}</td>
                          <td className="p-2 md:p-3 text-sm">{photo.partName || '-'}</td>
                          <td className="p-2 md:p-3 text-sm">{photo.quantity || '-'}</td>
                          <td className="p-2 md:p-3">
                            {photo.criticality === 'Alta' && <Badge className="bg-red-500 text-white text-xs">Alta</Badge>}
                            {photo.criticality === 'Média' && <Badge className="bg-yellow-500 text-white text-xs">Média</Badge>}
                            {photo.criticality === 'Baixa' && <Badge className="bg-green-500 text-white text-xs">Baixa</Badge>}
                            {!photo.criticality && '-'}
                          </td>
                          <td className="p-2 md:p-3"><Badge variant="outline" className="text-xs">{t('partsTable.main')}</Badge></td>
                        </tr>
                        {categories.find(c => c.id === categoryId)?.additionalParts.filter(ap => ap.parentPn === photo.pn).map((subPart) => (
                          <tr key={subPart.id} className="border-b bg-orange-50/50 hover:bg-orange-100/50">
                            <td className="p-2 md:p-3 pl-6 text-orange-700 text-sm"><span className="mr-1">└─</span>{subPart.pn}{subPart.serialNumber && <span className="text-gray-500 ml-1">({subPart.serialNumber})</span>}</td>
                            <td className="p-2 md:p-3 text-gray-600 italic text-sm">{subPart.partName}</td>
                            <td className="p-2 md:p-3 text-sm">{subPart.quantity}</td>
                            <td className="p-2 md:p-3">
                              {subPart.criticality === 'Alta' && <Badge className="bg-red-500 text-white text-xs">Alta</Badge>}
                              {subPart.criticality === 'Média' && <Badge className="bg-yellow-500 text-white text-xs">Média</Badge>}
                              {subPart.criticality === 'Baixa' && <Badge className="bg-green-500 text-white text-xs">Baixa</Badge>}
                              {!subPart.criticality && '-'}
                            </td>
                            <td className="p-2 md:p-3"><Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">{t('partsTable.subpart')}</Badge></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card className="mt-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><Check className="h-5 w-5 text-orange-500" />{t('conclusion.title')}</CardTitle></CardHeader>
            <CardContent>
              <TextareaWithSpellCheck
                className="min-h-32"
                placeholder={t('conclusion.placeholder')}
                value={conclusion}
                onChange={setConclusion}
                language={language}
                t={t}
              />
            </CardContent>
          </Card>

          {/* Botões Finalizar e Limpar */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1 h-12 border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              {t('action.clear')}
            </Button>
            <Button
              className="flex-1 h-12 bg-green-500 hover:bg-green-600"
              onClick={handleFinalizeReport}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {t('action.finalize')}
            </Button>
          </div>
        </div>
      </section>

      {/* Photo Options Dialog - Home */}
      {showPhotoOptions && (
        <PhotoOptionsDialog
          open={!!showPhotoOptions}
          onOpenChange={(open) => !open && setShowPhotoOptions(null)}
          hasImage={!!categories.find(c => c.id === showPhotoOptions?.categoryId)?.photos.find(p => p.id === showPhotoOptions?.photoId)?.imageData}
          onUpload={(file) => {
            if (showPhotoOptions) {
              handlePhotoUpload(showPhotoOptions.categoryId, showPhotoOptions.photoId, file);
            }
          }}
          onCamera={() => {
            if (showPhotoOptions) {
              setCameraTarget(showPhotoOptions);
              openCamera();
            }
          }}
          onPaste={() => {
            if (showPhotoOptions) {
              handlePaste(showPhotoOptions.categoryId, showPhotoOptions.photoId);
            }
          }}
          onViewFullscreen={() => {
            if (showPhotoOptions) {
              const photo = categories.find(c => c.id === showPhotoOptions.categoryId)?.photos.find(p => p.id === showPhotoOptions.photoId);
              if (photo?.imageData) {
                setFullscreenImage(photo.editedImageData || photo.imageData);
              }
            }
          }}
          t={t}
        />
      )}

      {/* Fullscreen Viewer - Home */}
      {fullscreenImage && (
        <FullScreenImageViewer
          imageData={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          t={t}
        />
      )}

      {/* Camera Dialog - Home */}
      {showCamera && cameraStream && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="flex justify-between items-center p-3 md:p-4 bg-black/50">
            <span className="text-white font-semibold text-sm md:text-base">{t('photoOptions.openCamera')}</span>
            <Button variant="ghost" size="icon" className="text-white h-10 w-10" onClick={closeCamera}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <video
              id="camera-video-home"
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              ref={(video) => {
                if (video && cameraStream) {
                  video.srcObject = cameraStream;
                }
              }}
            />
            {/* Botão de capturar sobre o vídeo */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
              <Button 
                size="lg"
                className="rounded-full h-16 w-16 md:h-14 md:w-14 bg-white text-black hover:bg-gray-200 shadow-lg"
                onClick={capturePhoto}
              >
                <Camera className="h-8 w-8 md:h-7 md:w-7" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirm Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="max-w-[90vw] md:max-w-lg">
          <DialogHeader><DialogTitle>{t('clearConfirm.title')}</DialogTitle><DialogDescription>{t('clearConfirm.description')}</DialogDescription></DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="w-full sm:w-auto h-11">{t('action.cancel')}</Button>
            <Button variant="destructive" onClick={handleClearReport} className="w-full sm:w-auto h-11">{t('action.clear')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Editor */}
      {editingPhoto && (
        <PhotoEditor photo={editingPhoto.photo} onSave={(data) => { updatePhotoInCategory(editingPhoto.categoryId, editingPhoto.photo.id, data); setEditingPhoto(null); }} onClose={() => setEditingPhoto(null)} t={t} />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-64"><CardContent className="p-6 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div><p className="text-sm text-gray-600">{t('loading.generatingPPT')}</p></CardContent></Card>
        </div>
      )}
    </>
  );
}

// ============================================
// ABA INSPEÇÃO - Sem Categorias (formato original)
// ============================================
function InspecaoContent() {
  const {
    inspection,
    photos,
    additionalParts,
    conclusion,
    updateInspection,
    setPhotos,
    addPhoto,
    removePhoto,
    updatePhoto,
    addAdditionalPart,
    removeAdditionalPart,
    setAdditionalParts,
    setConclusion,
    clearAll,
  } = useReportStore();
  
  const { language, t } = useTranslation();

  const [showPhotoOptions, setShowPhotoOptions] = useState<string | null>(null);
  const [showAdditionalParts, setShowAdditionalParts] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoData | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTargetId, setCameraTargetId] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const shareDialog = useShareDialog();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);
  const clipboardPhotoId = useRef<string | null>(null);

  const handleTagChange = (tag: string) => {
    updateInspection({ tag });
    if (tag && MACHINE_DATA[tag]) {
      const machine = MACHINE_DATA[tag];
      updateInspection({ modelo: machine.modelo, sn: machine.sn, entrega: machine.entrega, cliente: machine.cliente });
    }
  };

  const handlePhotoUpload = (photoId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { updatePhoto(photoId, { imageData: e.target?.result as string, editedImageData: null }); };
    reader.readAsDataURL(file);
    setShowPhotoOptions(null);
  };

  const handlePaste = useCallback(async (photoId: string) => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) { for (const type of item.types) { if (type.startsWith('image/')) { const blob = await item.getType(type); const reader = new FileReader(); reader.onload = (e) => { updatePhoto(photoId, { imageData: e.target?.result as string, editedImageData: null }); }; reader.readAsDataURL(blob); } } }
    } catch (err) { console.error('Failed to paste:', err); }
    setShowPhotoOptions(null);
  }, [updatePhoto]);

  // Camera functions for InspecaoContent
  const openCameraInsp = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error('Erro ao abrir câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const closeCameraInsp = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraTargetId(null);
  };

  const capturePhotoInsp = () => {
    const video = document.getElementById('camera-video-insp') as HTMLVideoElement;
    if (!video || !cameraTargetId) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      updatePhoto(cameraTargetId, { imageData, editedImageData: null });
    }
    
    closeCameraInsp();
    setShowPhotoOptions(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardPhotoId.current) handlePaste(clipboardPhotoId.current); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePaste]);

  const handleClearReport = () => { clearAll(); setShowClearConfirm(false); };

  const handleFinalizeReport = async () => {
    console.log('[Finalize Inspecao] Starting...');
    
    // Validation
    const missingFields: string[] = [];
    
    if (!conclusion) missingFields.push(t('finalize.conclusionRequired'));
    if (!inspection.inspetor) missingFields.push(t('finalize.executantesRequired'));
    if (!inspection.tag) missingFields.push(t('finalize.tagRequired'));
    if (!inspection.descricao) missingFields.push(t('finalize.descricaoRequired'));
    
    console.log('[Finalize Inspecao] Missing fields:', missingFields);
    console.log('[Finalize Inspecao] Data:', { conclusion: !!conclusion, inspetor: inspection.inspetor, tag: inspection.tag, descricao: inspection.descricao });
    
    if (missingFields.length > 0) {
      alert(t('finalize.requiredFields') + '\n\n' + missingFields.join('\n'));
      return;
    }
    
    try {
      console.log('[Finalize Inspecao] Sending request...');
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reportType: 'inspecao',
          tag: inspection.tag,
          cliente: inspection.cliente,
          descricao: inspection.descricao,
          conclusao: conclusion,
          executantes: inspection.inspetor,
          machineDown: inspection.machineDown === 'Yes',
          data: { inspection, photos, additionalParts, conclusion },
        }),
      });
      
      console.log('[Finalize Inspecao] Response status:', response.status);
      
      if (response.ok) {
        // Download JSON automaticamente
        const jsonData = { 
          version: '1.0',
          exportDate: new Date().toISOString(),
          inspection, 
          photos, 
          additionalParts, 
          conclusion 
        };
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Inspecao_${inspection.tag || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Download PowerPoint automaticamente
        await generatePowerPoint({ inspection, photos, additionalParts, conclusion, language: 'pt' });
        
        alert(t('finalize.success'));
        clearAll();
      } else {
        const error = await response.json();
        if (error.missingFields) {
          alert(t('finalize.requiredFields') + '\n\n' + error.missingFields.join('\n'));
        } else if (error.error === 'Report already finalized') {
          alert('Este relatório já foi finalizado anteriormente!');
        } else {
          alert(t('finalize.error'));
        }
      }
    } catch (error) {
      alert(t('finalize.error'));
    }
  };

  const handleExport = () => {
    // Export ALL data including photos (base64), inspection, photos, additionalParts, conclusion
    const data = { 
      version: '1.0',
      exportDate: new Date().toISOString(),
      inspection, 
      photos, 
      additionalParts, 
      conclusion 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Inspecao_${inspection.tag || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Import inspection data
        if (data.inspection) {
          Object.keys(data.inspection).forEach(key => {
            updateInspection({ [key]: data.inspection[key] });
          });
        }
        // Import photos with all data including imageData
        if (data.photos && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        }
        // Import additional parts
        if (data.additionalParts && Array.isArray(data.additionalParts)) {
          setAdditionalParts(data.additionalParts);
        }
        // Import conclusion
        if (data.conclusion) setConclusion(data.conclusion);
      } catch (err) { 
        console.error('Failed to import:', err);
        alert('Erro ao importar arquivo. Verifique se o arquivo é válido.');
      }
      // Reset input to allow re-importing same file
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleGeneratePPT = async () => {
    setIsLoading(true);
    try {
      // Translate dynamic texts if not in Portuguese
      if (language !== 'pt') {
        const { translateDynamic } = useTranslationStore.getState();
        
        // Translate all inspection text fields
        const translatedInspection = { ...inspection };
        if (inspection.descricao) {
          translatedInspection.descricao = await translateDynamic(inspection.descricao);
        }
        if (inspection.osExecucao) {
          translatedInspection.osExecucao = await translateDynamic(inspection.osExecucao);
        }
        if (inspection.inspetor) {
          translatedInspection.inspetor = await translateDynamic(inspection.inspetor);
        }
        if (inspection.cliente) {
          translatedInspection.cliente = await translateDynamic(inspection.cliente);
        }
        
        // Translate all photos
        const translatedPhotos = await Promise.all(photos.map(async (photo) => {
          const translatedPhoto = { ...photo };
          if (photo.description) {
            translatedPhoto.description = await translateDynamic(photo.description);
          }
          if (photo.partName) {
            translatedPhoto.partName = await translateDynamic(photo.partName);
          }
          return translatedPhoto;
        }));
        
        // Translate additional parts
        const translatedAdditionalParts = await Promise.all(additionalParts.map(async (part) => {
          const translatedPart = { ...part };
          if (part.partName) {
            translatedPart.partName = await translateDynamic(part.partName);
          }
          return translatedPart;
        }));
        
        // Translate conclusion
        const translatedConclusion = conclusion ? await translateDynamic(conclusion) : conclusion;
        
        await generatePowerPoint({ 
          inspection: translatedInspection, 
          photos: translatedPhotos, 
          additionalParts: translatedAdditionalParts, 
          conclusion: translatedConclusion,
          language 
        });
      } else {
        await generatePowerPoint({ inspection, photos, additionalParts, conclusion, language: 'pt' });
      }
    } catch (error) { 
      console.error('Error generating PowerPoint:', error); 
    }
    setIsLoading(false);
  };

  // Email handlers
  const handleSendAnalysisEmail = () => {
    const subject = generateEmailSubject(inspection, 'analysis');
    const body = generateAnalysisEmailBody(inspection, photos, additionalParts);
    openEmailClient({
      to: EMAIL_CONFIG.analysisRecipients,
      cc: EMAIL_CONFIG.analysisCc,
      subject,
      body,
    });
    setShowEmailDialog(false);
  };

  const handleSendConclusionEmail = () => {
    const subject = generateEmailSubject(inspection, 'conclusion');
    const body = generateConclusionEmailBody(inspection, conclusion, photos, additionalParts);
    openEmailClient({
      to: EMAIL_CONFIG.conclusionRecipients,
      cc: EMAIL_CONFIG.conclusionCc,
      subject,
      body,
    });
    setShowEmailDialog(false);
  };

  return (
    <>
      {/* Action Buttons - Responsivo */}
      <div className="fixed top-20 right-4 md:flex flex-col gap-2 z-40 hidden">
        <Button size="icon" className="rounded-full bg-green-600 hover:bg-green-700" onClick={() => addPhoto()} title={t('action.addPhoto')}><Plus className="h-5 w-5" /></Button>
        <Button size="icon" className="rounded-full bg-red-600 hover:bg-red-700" onClick={() => setShowClearConfirm(true)} title={t('action.clear')}><Trash2 className="h-5 w-5" /></Button>
        
        {/* Botão de Dados (Importar/Exportar JSON) */}
        <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowDataDialog(true)} title={t('action.importExport')}><FileDown className="h-5 w-5" /></Button>
        
        {/* Botão de Exportar (PDF/RDO) */}
        <Button size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowExportDialog(true)} title={t('action.download')}><Download className="h-5 w-5" /></Button>
        
        <Button size="icon" className="rounded-full bg-orange-500 hover:bg-orange-600" onClick={() => setShowEmailDialog(true)} title="Enviar Email"><Mail className="h-5 w-5" /></Button>
        <CollaborationPanel
          reportType="inspecao"
          reportData={{ inspection, photos, additionalParts, conclusion }}
          onDataRequest={() => ({ inspection, photos, additionalParts, conclusion })}
          t={t}
          externalOpen={shareDialog.isOpen}
          onExternalOpenChange={shareDialog.setIsOpen}
        />
      </div>
      
      {/* Mobile Action Bar - Botão flutuante */}
      <MobileActionMenu
        onAddPhoto={() => addPhoto()}
        onDataDialog={() => setShowDataDialog(true)}
        onExportDialog={() => setShowExportDialog(true)}
        onEmailDialog={() => setShowEmailDialog(true)}
        onClearConfirm={() => setShowClearConfirm(true)}
        onShare={shareDialog.openDialog}
        reportData={{ inspection, photos, additionalParts, conclusion }}
        reportType="inspecao"
        t={t}
      />
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImport} className="hidden" />
      <input ref={fileImportRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

      {/* Export Dialog - PDF/RDO */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-[90vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-500" />
              {t('action.download')}
            </DialogTitle>
            <DialogDescription>{t('action.downloadDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={() => { handleGeneratePPT(); setShowExportDialog(false); }}
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileImage className="h-5 w-5 md:h-4 md:w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{t('rdo.powerpoint')}</p>
                  <p className="text-xs text-gray-500">{t('action.pptDesc')}</p>
                </div>
              </div>
            </Button>
            
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={() => { alert('🚧 Relatório RDO está em construção. Em breve estará disponível!'); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 md:h-4 md:w-4 text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-400">{t('rdo.executive')} 🚧</p>
                  <p className="text-xs text-gray-400">Em construção...</p>
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>{t('action.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Dialog - Import/Export JSON */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent className="max-w-[90vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <FileDown className="h-5 w-5 text-blue-500" />
              {t('action.importExport')}
            </DialogTitle>
            <DialogDescription>{t('action.importExportDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={() => { handleExport(); setShowDataDialog(false); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Download className="h-5 w-5 md:h-4 md:w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{t('action.exportJson')}</p>
                  <p className="text-xs text-gray-500">{t('action.exportJsonDesc')}</p>
                </div>
              </div>
            </Button>
            
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={() => { fileImportRef.current?.click(); setShowDataDialog(false); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-5 w-5 md:h-4 md:w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{t('action.importJson')}</p>
                  <p className="text-xs text-gray-500">{t('action.importJsonDesc')}</p>
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDataDialog(false)}>{t('action.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Options Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-[90vw] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Enviar Email</DialogTitle>
            <DialogDescription>Selecione o tipo de email que deseja enviar:</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={handleSendAnalysisEmail}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 md:h-4 md:w-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold">Análise</div>
                  <div className="text-xs text-gray-500">Envia para Wallysson, Emerson e Jadson</div>
                </div>
              </div>
            </Button>
            <Button 
              className="w-full justify-start h-16 md:h-14 text-left" 
              variant="outline"
              onClick={handleSendConclusionEmail}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 md:h-4 md:w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold">Concluído</div>
                  <div className="text-xs text-gray-500">Envia para todos os destinatários</div>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Page */}
      <section className="p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader><CardTitle className="text-2xl font-bold">{t('report.technicalReport')}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-orange-500" />{t('report.executionInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t('report.tag')}</Label><Input list="tag-options-insp" value={inspection.tag} onChange={(e) => handleTagChange(e.target.value)} placeholder={t('placeholder.tag')} /><datalist id="tag-options-insp">{TAG_OPTIONS.map(tag => (<option key={tag} value={tag} />))}</datalist></div>
                <div className="space-y-2"><Label>{t('report.modelo')}</Label><Input value={inspection.modelo} onChange={(e) => updateInspection({ modelo: e.target.value })} placeholder={t('placeholder.modelo')} /></div>
                <div className="space-y-2"><Label>{t('report.sn')}</Label><Input value={inspection.sn} onChange={(e) => updateInspection({ sn: e.target.value })} placeholder={t('placeholder.sn')} /></div>
                <div className="space-y-2"><Label>{t('report.entrega')}</Label><Input value={inspection.entrega} onChange={(e) => updateInspection({ entrega: e.target.value })} placeholder={t('placeholder.entrega')} /></div>
                <div className="space-y-2"><Label>{t('report.cliente')}</Label><Input value={inspection.cliente} onChange={(e) => updateInspection({ cliente: e.target.value })} placeholder={t('placeholder.cliente')} /></div>
                <div className="space-y-2"><Label>{t('report.descricao')}</Label><Input value={inspection.descricao} onChange={(e) => updateInspection({ descricao: e.target.value })} placeholder={t('placeholder.descricao')} /></div>
                <div className="space-y-2"><Label>{t('report.machineDown')}</Label><Select value={inspection.machineDown} onValueChange={(value) => updateInspection({ machineDown: value as 'Yes' | 'No' })}><SelectTrigger><SelectValue placeholder={t('select.selectOption')} /></SelectTrigger><SelectContent><SelectItem value="No">{t('select.no')}</SelectItem><SelectItem value="Yes">{t('select.yes')}</SelectItem></SelectContent></Select></div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Camera className="h-5 w-5 text-orange-500" />{t('machine.identification')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <IdentificationPhoto label={t('machine.equipmentPhoto')} imageData={inspection.machinePhoto} onUpload={(data) => updateInspection({ machinePhoto: data })} onRemove={() => updateInspection({ machinePhoto: null })} caption={inspection.tag || t('machine.equipmentTag')} t={t} />
                <IdentificationPhoto label={t('machine.hourMeterPhoto')} imageData={inspection.horimetroPhoto} onUpload={(data) => updateInspection({ horimetroPhoto: data })} onRemove={() => updateInspection({ horimetroPhoto: null })} caption={`${t('report.hourMeter')}: ${inspection.horimetro || '-'}`} t={t} />
                <IdentificationPhoto label={t('machine.serialPhoto')} imageData={inspection.serialPhoto} onUpload={(data) => updateInspection({ serialPhoto: data })} onRemove={() => updateInspection({ serialPhoto: null })} caption={`${t('machine.serialNumber')}: ${inspection.sn || '-'}`} t={t} />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5 text-orange-500" />{t('report.reportData')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t('report.executionDate')}</Label><Input type="date" value={inspection.data} onChange={(e) => updateInspection({ data: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t('report.endDateOptional')}</Label><Input type="date" value={inspection.dataFinal} onChange={(e) => updateInspection({ dataFinal: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t('report.workOrderOptional')}</Label><Input value={inspection.osExecucao} onChange={(e) => updateInspection({ osExecucao: e.target.value })} placeholder={t('placeholder.os')} /></div>
                <div className="space-y-2"><Label>{t('report.performers')}</Label><Input value={inspection.inspetor} onChange={(e) => updateInspection({ inspetor: e.target.value })} placeholder={t('placeholder.inspector')} /></div>
                <div className="space-y-2"><Label>{t('report.hourMeter')}</Label><Input value={inspection.horimetro} onChange={(e) => updateInspection({ horimetro: e.target.value })} placeholder={t('placeholder.hourmeter')} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Photos Section */}
      <section className="p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Camera className="h-6 w-6 text-orange-500" />{t('photos.title')} ({photos.length} {t('photos.photoCount', { count: photos.length })})</h2>
            <Button onClick={() => addPhoto()} className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" />{t('photos.addPhoto')}</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photos.map((photo, index) => (
              <Card key={photo.id} className="overflow-hidden group">
                <div className="p-3 bg-black/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">{t('photos.photo')} {index + 1}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(photo.id)} title={t('action.remove')}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-xs font-semibold text-orange-600 whitespace-nowrap">{t('photo.pn')}:</Label>
                    <Input className="h-7 text-xs flex-1 min-w-0" value={photo.pn} onChange={(e) => updatePhoto(photo.id, { pn: e.target.value })} placeholder={t('photo.pnPlaceholder')} />
                    <Label className="text-xs whitespace-nowrap">{t('photo.serial')}:</Label>
                    <Input className="h-7 text-xs w-24" value={photo.serialNumber || ''} onChange={(e) => updatePhoto(photo.id, { serialNumber: e.target.value })} placeholder={t('photo.serialPlaceholder')} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">{t('photo.partName')}:</Label>
                    <Input className="h-7 text-xs flex-1" value={photo.partName} onChange={(e) => updatePhoto(photo.id, { partName: e.target.value })} placeholder={t('photo.partNamePlaceholder')} />
                    <Label className="text-xs">{t('photo.quantity')}:</Label>
                    <Input className="h-7 text-xs w-16" type="number" value={photo.quantity} onChange={(e) => updatePhoto(photo.id, { quantity: e.target.value })} placeholder={t('photo.quantityPlaceholder')} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">{t('photo.criticality')}:</Label>
                    <Select value={photo.criticality || ''} onValueChange={(v) => updatePhoto(photo.id, { criticality: v as Criticality })}>
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue placeholder={t('select.selectOption')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">{t('photo.criticalityHigh')}</SelectItem>
                        <SelectItem value="Média">{t('photo.criticalityMedium')}</SelectItem>
                        <SelectItem value="Baixa">{t('photo.criticalityLow')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-amber-100 rounded-lg border-2 border-amber-400">
                    <Checkbox id={`subparts-insp-${photo.id}`} checked={showAdditionalParts[photo.id] || false} onCheckedChange={(checked) => setShowAdditionalParts(prev => ({ ...prev, [photo.id]: !!checked }))} className="border-amber-600 data-[state=checked]:bg-amber-500" />
                    <Label htmlFor={`subparts-insp-${photo.id}`} className="text-sm font-bold text-amber-800 cursor-pointer flex items-center gap-1"><ListTree className="h-4 w-4" /> {t('subparts.title')}</Label>
                  </div>
                  {showAdditionalParts[photo.id] && (
                    <AdditionalPartsSection parentPn={photo.pn} additionalParts={additionalParts} onAddPart={(part) => addAdditionalPart(part)} onRemovePart={(id) => removeAdditionalPart(id)} t={t} />
                  )}
                </div>
                <div className="relative h-48 bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors" onClick={() => { setShowPhotoOptions(photo.id); clipboardPhotoId.current = photo.id; }}>
                  {photo.imageData ? (
                    <img src={photo.editedImageData || photo.imageData} alt={`${t('photos.photo')} ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-500"><Camera className="h-12 w-12 mx-auto mb-2" /><p className="text-sm">{t('photos.clickToAdd')}</p></div>
                  )}
                  {photo.imageData && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button size="icon" className="rounded-full bg-orange-500 hover:bg-orange-600 h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingPhoto(photo); }} title={t('action.edit')}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" className="rounded-full bg-red-600 hover:bg-red-700 h-7 w-7" onClick={(e) => { e.stopPropagation(); updatePhoto(photo.id, { imageData: null, editedImageData: null }); }} title={t('action.remove')}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                  {photo.embeddedPhotos && photo.embeddedPhotos.length > 0 && (
                    <div className="absolute bottom-2 left-2"><Badge className="bg-orange-500 text-white text-xs"><Circle className="h-3 w-3 mr-1" />{photo.embeddedPhotos.length} {t('photo.circles')}</Badge></div>
                  )}
                </div>
                <div className="p-2">
                  <TextareaWithSpellCheck
                    className="h-16 text-sm"
                    placeholder={t('photo.descriptionPlaceholder')}
                    value={photo.description}
                    onChange={(value) => updatePhoto(photo.id, { description: value })}
                    language={language}
                    t={t}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-orange-500" />{t('partsTable.title')}</CardTitle>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 h-10"
                onClick={() => exportPartsTableToExcelInspecao(inspection, photos, additionalParts)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {t('partsTable.exportExcel')}
              </Button>
            </CardHeader>
            <CardContent>
              {/* Mobile scroll hint */}
              <p className="md:hidden text-xs text-gray-500 mb-2 flex items-center gap-1">
                ← {t('table.swipe')} →
              </p>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="w-full min-w-[600px]">
                  <thead><tr className="bg-black text-white"><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.pnSerial')}</th><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.partName')}</th><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.qty')}</th><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.criticality')}</th><th className="p-2 md:p-3 text-left text-sm">{t('partsTable.type')}</th></tr></thead>
                  <tbody>
                    {photos.filter(p => p.pn).map((photo) => (
                      <React.Fragment key={photo.id}>
                        <tr className="border-b hover:bg-orange-50">
                          <td className="p-2 md:p-3 font-semibold text-sm">{photo.pn}{photo.serialNumber && <span className="text-gray-500 font-normal ml-1">({photo.serialNumber})</span>}</td>
                          <td className="p-2 md:p-3 text-sm">{photo.partName || '-'}</td>
                          <td className="p-2 md:p-3 text-sm">{photo.quantity || '-'}</td>
                          <td className="p-2 md:p-3">
                            {photo.criticality === 'Alta' && <Badge className="bg-red-500 text-white text-xs">Alta</Badge>}
                            {photo.criticality === 'Média' && <Badge className="bg-yellow-500 text-white text-xs">Média</Badge>}
                            {photo.criticality === 'Baixa' && <Badge className="bg-green-500 text-white text-xs">Baixa</Badge>}
                            {!photo.criticality && '-'}
                          </td>
                          <td className="p-2 md:p-3"><Badge variant="outline" className="text-xs">{t('partsTable.main')}</Badge></td>
                        </tr>
                        {additionalParts.filter(ap => ap.parentPn === photo.pn).map((subPart) => (
                          <tr key={subPart.id} className="border-b bg-orange-50/50 hover:bg-orange-100/50">
                            <td className="p-2 md:p-3 pl-6 text-orange-700 text-sm"><span className="mr-1">└─</span>{subPart.pn}{subPart.serialNumber && <span className="text-gray-500 ml-1">({subPart.serialNumber})</span>}</td>
                            <td className="p-2 md:p-3 text-gray-600 italic text-sm">{subPart.partName}</td>
                            <td className="p-2 md:p-3 text-sm">{subPart.quantity}</td>
                            <td className="p-2 md:p-3">
                              {subPart.criticality === 'Alta' && <Badge className="bg-red-500 text-white text-xs">Alta</Badge>}
                              {subPart.criticality === 'Média' && <Badge className="bg-yellow-500 text-white text-xs">Média</Badge>}
                              {subPart.criticality === 'Baixa' && <Badge className="bg-green-500 text-white text-xs">Baixa</Badge>}
                              {!subPart.criticality && '-'}
                            </td>
                            <td className="p-2 md:p-3"><Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">{t('partsTable.subpart')}</Badge></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><Check className="h-5 w-5 text-orange-500" />{t('conclusion.title')}</CardTitle></CardHeader>
            <CardContent>
              <TextareaWithSpellCheck
                className="min-h-32"
                placeholder={t('conclusion.placeholder')}
                value={conclusion}
                onChange={setConclusion}
                language={language}
                t={t}
              />
            </CardContent>
          </Card>

          {/* Botões Finalizar e Limpar */}
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              className="flex-1 h-12 border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              {t('action.clear')}
            </Button>
            <Button
              className="flex-1 h-12 bg-green-500 hover:bg-green-600"
              onClick={handleFinalizeReport}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {t('action.finalize')}
            </Button>
          </div>
        </div>
      </section>

      {/* Photo Options Dialog - Inspecao */}
      {showPhotoOptions && (
        <PhotoOptionsDialog
          open={!!showPhotoOptions}
          onOpenChange={(open) => !open && setShowPhotoOptions(null)}
          hasImage={!!photos.find(p => p.id === showPhotoOptions)?.imageData}
          onUpload={(file) => {
            if (showPhotoOptions) {
              handlePhotoUpload(showPhotoOptions, file);
            }
          }}
          onCamera={() => {
            if (showPhotoOptions) {
              setCameraTargetId(showPhotoOptions);
              openCameraInsp();
            }
          }}
          onPaste={() => {
            if (showPhotoOptions) {
              handlePaste(showPhotoOptions);
            }
          }}
          onViewFullscreen={() => {
            if (showPhotoOptions) {
              const photo = photos.find(p => p.id === showPhotoOptions);
              if (photo?.imageData) {
                setFullscreenImage(photo.editedImageData || photo.imageData);
              }
            }
          }}
          t={t}
        />
      )}

      {/* Fullscreen Viewer - Inspecao */}
      {fullscreenImage && (
        <FullScreenImageViewer
          imageData={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          t={t}
        />
      )}

      {/* Camera Dialog - Inspecao */}
      {showCamera && cameraStream && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="flex justify-between items-center p-3 md:p-4 bg-black/50">
            <span className="text-white font-semibold text-sm md:text-base">{t('photoOptions.openCamera')}</span>
            <Button variant="ghost" size="icon" className="text-white h-10 w-10" onClick={closeCameraInsp}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <video
              id="camera-video-insp"
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              ref={(video) => {
                if (video && cameraStream) {
                  video.srcObject = cameraStream;
                }
              }}
            />
            {/* Botão de capturar sobre o vídeo */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
              <Button 
                size="lg"
                className="rounded-full h-16 w-16 md:h-14 md:w-14 bg-white text-black hover:bg-gray-200 shadow-lg"
                onClick={capturePhotoInsp}
              >
                <Camera className="h-8 w-8 md:h-7 md:w-7" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="max-w-[90vw] md:max-w-lg">
          <DialogHeader><DialogTitle>{t('clearConfirm.title')}</DialogTitle><DialogDescription>{t('clearConfirm.description')}</DialogDescription></DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="w-full sm:w-auto h-11">{t('action.cancel')}</Button>
            <Button variant="destructive" onClick={handleClearReport} className="w-full sm:w-auto h-11">{t('action.clear')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingPhoto && <PhotoEditor photo={editingPhoto} onSave={(data) => { updatePhoto(editingPhoto.id, data); setEditingPhoto(null); }} onClose={() => setEditingPhoto(null)} t={t} />}

      {isLoading && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><Card className="w-64"><CardContent className="p-6 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div><p className="text-sm text-gray-600">{t('loading.generatingPPT')}</p></CardContent></Card></div>}
    </>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function TechnicalReportPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'home' | 'inspecao' | 'shared' | 'history'>(() => {
    // Check for openTabOnLoad on initial render
    if (typeof window !== 'undefined') {
      const openTabOnLoad = localStorage.getItem('openTabOnLoad');
      if (openTabOnLoad) {
        localStorage.removeItem('openTabOnLoad');
        return openTabOnLoad as 'home' | 'inspecao';
      }
    }
    return 'home';
  });
  const { language, setLanguage, t } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sessionUrlDetected, setSessionUrlDetected] = useState<string | null>(null);
  
  // Check if user is history admin
  const isHistoryAdminUser = isHistoryAdmin(session?.user?.email);
  
  const languages: Language[] = ['pt', 'en', 'ja', 'zh'];

  // Get stores for save/load functionality
  const homeStore = useHomeReportStore();
  const inspecaoStore = useReportStore();
  const sharedStore = useSharedReportStore();

  // Detect session parameter in URL - only runs once on mount
  const sessionUrlRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only run once
    if (sessionUrlRef.current !== null) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get('session');
    
    // Mark as checked (even if no session found)
    sessionUrlRef.current = sessionParam || '';
    
    if (sessionParam) {
      // Set session info directly in store
      sharedStore.setSessionInfo(sessionParam, 'external');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Auto-switch to shared tab if session is active
  const sharedSessionId = sharedStore.sessionId;
  const isSharedSession = sharedStore.isSharedSession;
  
  // Sincronização bidirecional com sessão compartilhada - carrega do localStorage na inicialização
  const [activeSharedSession, setActiveSharedSession] = useState<{
    sessionId: string;
    permission: string;
    reportType: string;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('activeSharedSession');
      if (sessionData) {
        try {
          return JSON.parse(sessionData);
        } catch (e) {
          console.error('Error parsing activeSharedSession:', e);
        }
      }
    }
    return null;
  });
  
  // Sincronizar mudanças do store para a sessão compartilhada
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!activeSharedSession || activeSharedSession.permission !== 'edit' || !session) return;
    
    // Debounce para evitar muitas requisições
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(async () => {
      const reportType = activeSharedSession.reportType;
      const data = reportType === 'home' 
        ? homeStore.getAllData() 
        : inspecaoStore.getAllData();
      
      // Só sincroniza se houver dados significativos
      if (data.inspection?.tag || data.inspection?.cliente || data.conclusion || 
          (data.categories && data.categories.some((c: any) => c.photos?.length > 0))) {
        try {
          await fetch('/api/share', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              sessionId: activeSharedSession.sessionId,
              data: {
                ...data,
                lastModifiedBy: session?.user?.name || 'Usuário',
                lastModifiedAt: new Date().toISOString(),
              }
            }),
          });
        } catch (error) {
          // Ignorar erros de rede silenciosamente
          if (error instanceof TypeError && error.message.includes('fetch')) {
            return;
          }
          console.error('Error syncing to shared session:', error);
        }
      }
    }, 1000); // 1 segundo de debounce
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    activeSharedSession,
    homeStore.inspection,
    homeStore.categories,
    homeStore.conclusion,
    inspecaoStore.inspection,
    inspecaoStore.photos,
    inspecaoStore.conclusion,
    session?.user?.name,
    session
  ]);
  
  // Polling para receber atualizações da sessão compartilhada
  useEffect(() => {
    if (!activeSharedSession || !session) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/share?sessionId=${activeSharedSession.sessionId}`, {
          credentials: 'include',
        });
        
        // Se não autorizado, limpar sessão compartilhada
        if (response.status === 401) {
          localStorage.removeItem('activeSharedSession');
          setActiveSharedSession(null);
          return;
        }
        
        const result = await response.json();
        
        if (result.success && result.session?.data) {
          const serverData = result.session.data;
          const reportType = activeSharedSession.reportType;
          
          // Verificar se os dados do servidor são mais recentes
          if (serverData.lastModifiedAt) {
            const serverTime = new Date(serverData.lastModifiedAt).getTime();
            const localTime = Date.now() - 2000; // 2 segundos de tolerância
            
            if (serverTime > localTime) {
              // Atualizar store com dados do servidor
              if (reportType === 'home') {
                homeStore.loadFromData({
                  inspection: serverData.inspection,
                  categories: serverData.categories,
                  conclusion: serverData.conclusion,
                });
              } else {
                inspecaoStore.loadFromData({
                  inspection: serverData.inspection,
                  photos: serverData.photos,
                  conclusion: serverData.conclusion,
                });
              }
            }
          }
        }
      } catch (error) {
        // Ignorar erros de rede silenciosamente
        if (error instanceof TypeError && error.message.includes('fetch')) {
          return;
        }
        console.error('Polling error:', error);
      }
    }, 3000); // A cada 3 segundos
    
    return () => clearInterval(pollInterval);
  }, [activeSharedSession, homeStore, inspecaoStore, session]);
  
  // Limpar sessão compartilhada quando o usuário faz logout
  useEffect(() => {
    if (!session && activeSharedSession) {
      localStorage.removeItem('activeSharedSession');
      setActiveSharedSession(null);
    }
  }, [session, activeSharedSession]);
  
  // Função para sair da sessão compartilhada
  const handleLeaveSharedSession = useCallback(() => {
    localStorage.removeItem('activeSharedSession');
    setActiveSharedSession(null);
  }, []);
  
  // Estado para diálogo de sair da sessão
  const [showExitSessionDialog, setShowExitSessionDialog] = useState(false);
  const [exitingSession, setExitingSession] = useState(false);
  
  // Função para sair e salvar no histórico
  const handleExitAndSave = useCallback(async () => {
    if (!activeSharedSession) return;
    
    setExitingSession(true);
    try {
      const reportType = activeSharedSession.reportType;
      const data = reportType === 'home' 
        ? homeStore.getAllData() 
        : inspecaoStore.getAllData();
      
      await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'saveAndExit',
          sessionId: activeSharedSession.sessionId,
          data,
        }),
      });
      
      // Limpar sessão
      localStorage.removeItem('activeSharedSession');
      setActiveSharedSession(null);
      setShowExitSessionDialog(false);
    } catch (error) {
      console.error('Error saving and exiting:', error);
    } finally {
      setExitingSession(false);
    }
  }, [activeSharedSession, homeStore, inspecaoStore]);
  
  // Função para sair sem salvar
  const handleExitWithoutSave = useCallback(() => {
    localStorage.removeItem('activeSharedSession');
    setActiveSharedSession(null);
    setShowExitSessionDialog(false);
  }, []);
  
  // Determine active tab based on shared session
  const effectiveActiveTab = isSharedSession && sharedSessionId ? 'shared' : activeTab;

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500 animate-pulse text-xl">Carregando...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (status === 'unauthenticated' || !session) {
    return <LoginPage onSuccess={() => window.location.reload()} />;
  }

  // Handle loading report from history
  const handleLoadReport = (data: any, reportType: string) => {
    if (reportType === 'home') {
      setActiveTab('home');
      if (data.inspection) {
        Object.keys(data.inspection).forEach((key) => {
          homeStore.updateInspection({ [key]: data.inspection[key] });
        });
      }
      if (data.categories && Array.isArray(data.categories)) {
        homeStore.setCategories(data.categories);
      }
      if (data.conclusion) homeStore.setConclusion(data.conclusion);
    } else {
      setActiveTab('inspecao');
      if (data.inspection) {
        Object.keys(data.inspection).forEach((key) => {
          inspecaoStore.updateInspection({ [key]: data.inspection[key] });
        });
      }
      if (data.photos && Array.isArray(data.photos)) {
        inspecaoStore.setPhotos(data.photos);
      }
      if (data.conclusion) inspecaoStore.setConclusion(data.conclusion);
    }
  };

  // Handle saving report to history
  const handleSaveReport = async (name: string, reportType: string): Promise<void> => {
    const data = reportType === 'home'
      ? {
          exportDate: new Date().toISOString(),
          inspection: homeStore.inspection,
          categories: homeStore.categories,
          conclusion: homeStore.conclusion,
        }
      : {
          exportDate: new Date().toISOString(),
          inspection: inspecaoStore.inspection,
          photos: inspecaoStore.photos,
          conclusion: inspecaoStore.conclusion,
        };

    const tag = reportType === 'home' ? homeStore.inspection.tag : inspecaoStore.inspection.tag;
    const cliente = reportType === 'home' ? homeStore.inspection.cliente : inspecaoStore.inspection.cliente;

    const response = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        reportType,
        tag,
        cliente,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save report');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="bg-black text-white p-3 flex justify-between items-center md:hidden sticky top-0 z-50">
        <button 
          onClick={() => setShowMobileMenu(true)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-orange-500" />
          <span className="font-bold text-sm">{t('app.title')}</span>
          {activeSharedSession && (
            <button
              onClick={() => setShowExitSessionDialog(true)}
              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded-full transition-colors"
              title="Clique para sair da sessão compartilhada"
            >
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">Sessão Ativa</span>
              <LogOut className="h-3 w-3 ml-1" />
            </button>
          )}
          <OnlineStatusIndicator />
        </div>
        <div className="flex items-center gap-2">
          <UserMenu
            onLoadReport={handleLoadReport}
            onSaveReport={handleSaveReport}
            currentReportType={activeTab}
          />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setShowMobileMenu(false)}>
          <div 
            className="bg-black text-white w-72 h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-lg">{t('app.title')}</span>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2 flex-1">
              <button 
                onClick={() => { setActiveTab('home'); setShowMobileMenu(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${activeTab === 'home' ? 'text-white bg-orange-500/20 border-l-4 border-orange-500' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                <Home className="h-5 w-5" /><span className="font-medium">{t('tab.home')}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('inspecao'); setShowMobileMenu(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${activeTab === 'inspecao' ? 'text-white bg-orange-500/20 border-l-4 border-orange-500' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                <ClipboardList className="h-5 w-5" /><span className="font-medium">{t('tab.inspecao')}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('shared'); setShowMobileMenu(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${activeTab === 'shared' ? 'text-white bg-indigo-500/20 border-l-4 border-indigo-500' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                <Users className="h-5 w-5" /><span className="font-medium">Compartilhada</span>
              </button>
              {isHistoryAdminUser && (
                <button 
                  onClick={() => { setActiveTab('history'); setShowMobileMenu(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${activeTab === 'history' ? 'text-white bg-purple-500/20 border-l-4 border-purple-500' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
                >
                  <History className="h-5 w-5" /><span className="font-medium">{t('tab.history')}</span>
                </button>
              )}
            </nav>
            
            {/* Language Selector Mobile */}
            <div className="p-4 border-t border-white/10">
              <Label className="text-xs text-gray-400 mb-2 block">{t('select.selectOption')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors min-h-[44px] ${language === lang ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                  >
                    <span>{LANGUAGE_FLAGS[lang]}</span>
                    <span className="text-sm">{LANGUAGE_NAMES[lang]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Sidebar Desktop */}
        <aside className="w-64 bg-black text-white flex flex-col fixed h-full z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-orange-500" />
              <span className="font-bold text-lg">{t('app.title')}</span>
            </div>
          </div>
          <nav className="p-4 space-y-2 flex-1">
            <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-h-[44px] ${activeTab === 'home' ? 'text-white bg-orange-500/20 border-l-4 border-orange-500' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>
              <Home className="h-5 w-5" /><span>{t('tab.home')}</span>
            </button>
            <button onClick={() => setActiveTab('inspecao')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-h-[44px] ${activeTab === 'inspecao' ? 'text-white bg-orange-500/20 border-l-4 border-orange-500' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>
              <ClipboardList className="h-5 w-5" /><span>{t('tab.inspecao')}</span>
            </button>
            <button onClick={() => setActiveTab('shared')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-h-[44px] ${activeTab === 'shared' ? 'text-white bg-indigo-500/20 border-l-4 border-indigo-500' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>
              <Users className="h-5 w-5" /><span className="font-medium">Compartilhada</span>
            </button>
            {isHistoryAdminUser && (
              <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-h-[44px] ${activeTab === 'history' ? 'text-white bg-purple-500/20 border-l-4 border-purple-500' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>
                <History className="h-5 w-5" /><span className="font-medium">{t('tab.history')}</span>
              </button>
            )}
          </nav>
          
          {/* Language Selector Desktop */}
          <div className="p-4 border-t border-white/10">
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors min-h-[44px]"
              >
                <Globe className="h-5 w-5 text-orange-500" />
                <span className="flex-1 text-left">{LANGUAGE_FLAGS[language]} {LANGUAGE_NAMES[language]}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
              </button>
              {showLangMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-white/10">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 transition-colors min-h-[44px] ${language === lang ? 'bg-orange-500/20 text-orange-400' : ''}`}
                    >
                      <span>{LANGUAGE_FLAGS[lang]}</span>
                      <span>{LANGUAGE_NAMES[lang]}</span>
                      {language === lang && <Check className="h-4 w-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Desktop */}
        <main className="ml-64 flex-1 min-h-screen">
          {/* Header Desktop */}
          <header className="bg-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-orange-500" />
              <span className="font-bold text-xl">{t('app.title')}</span>
              {activeSharedSession && (
                <button
                  onClick={() => setShowExitSessionDialog(true)}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                  title="Clique para sair da sessão compartilhada"
                >
                  <Users className="h-4 w-4" />
                  <span>Sessão Compartilhada Ativa</span>
                  <LogOut className="h-4 w-4 ml-1" />
                </button>
              )}
              <OnlineStatusIndicator />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{LANGUAGE_FLAGS[language]} {LANGUAGE_NAMES[language]}</span>
              <Badge className="bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm">{activeTab === 'home' ? t('tab.home') : activeTab === 'inspecao' ? t('tab.inspecao') : 'Compartilhada'}</Badge>
              <UserMenu
                onLoadReport={handleLoadReport}
                onSaveReport={handleSaveReport}
                currentReportType={activeTab}
              />
            </div>
          </header>

          {/* Content Desktop */}
          {activeTab === 'home' && <HomeContent />}
          {activeTab === 'inspecao' && <InspecaoContent />}
          {activeTab === 'shared' && <SharedContent />}
          {activeTab === 'history' && isHistoryAdminUser && (
            <HistoryContent />
          )}

          {/* Footer Desktop */}
          <footer className="bg-black text-white p-4 text-center text-sm">
            <p>{t('footer.copyright')}</p>
          </footer>
        </main>
      </div>

      {/* Mobile Content */}
      <main className="md:hidden min-h-screen">
        {activeTab === 'home' && <HomeContent />}
        {activeTab === 'inspecao' && <InspecaoContent />}
        {activeTab === 'shared' && <SharedContent />}
        {activeTab === 'history' && isHistoryAdminUser && (
          <HistoryContent />
        )}
      </main>

      {/* Exit Session Dialog */}
      <Dialog open={showExitSessionDialog} onOpenChange={setShowExitSessionDialog}>
        <DialogContent className="max-w-[90vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-orange-500" />
              Sair da Sessão Compartilhada
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              Você está saindo da sessão compartilhada. Deseja salvar as alterações no seu histórico antes de sair?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <p className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Salvar no Histórico
              </p>
              <p className="text-xs mt-1 text-green-700">
                O relatório será salvo no seu histórico e poderá ser acessado posteriormente.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <p className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Sair sem Salvar
              </p>
              <p className="text-xs mt-1 text-yellow-700">
                Todas as alterações feitas na sessão serão perdidas para você.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowExitSessionDialog(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              onClick={handleExitWithoutSave}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Sair sem Salvar
            </Button>
            <Button 
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
              onClick={handleExitAndSave}
              disabled={exitingSession}
            >
              {exitingSession ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Salvar e Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
