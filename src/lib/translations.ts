// Translation system for Z-Services AI

export type Language = 'pt' | 'en' | 'ja' | 'zh';

export const LANGUAGE_NAMES: Record<Language, string> = {
  pt: 'Português',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
};

// Static translations
export const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Header & Sidebar
    'app.title': 'Z-Services AI',
    'tab.home': 'Relatório',
    'tab.inspecao': 'Inspeção',
    
    // Cover Page
    'report.technicalReport': 'Relatório Técnico',
    'report.executionInfo': 'Informações da Execução',
    'report.tag': 'TAG',
    'report.modelo': 'Modelo',
    'report.sn': 'SN',
    'report.entrega': 'Entrega',
    'report.cliente': 'Cliente',
    'report.descricao': 'Descrição',
    'report.machineDown': 'MACHINE DOWN?',
    'report.reportData': 'DADOS DO RELATÓRIO',
    'report.executionDate': 'Data da Execução',
    'report.endDate': 'Data Final',
    'report.endDateOptional': 'Data Final (Opcional)',
    'report.workOrder': 'OS de Execução',
    'report.workOrderOptional': 'OS de Execução (Opcional)',
    'report.performers': 'Nomes dos Executantes',
    'report.hourMeter': 'Horímetro',
    
    // Machine Identification
    'machine.identification': 'Identificação da Máquina',
    'machine.equipmentPhoto': 'Foto do Equipamento',
    'machine.hourMeterPhoto': 'Foto do Horímetro',
    'machine.serialPhoto': 'Foto do Serial Number',
    'machine.equipmentTag': 'TAG do Equipamento',
    'machine.serialNumber': 'Número de Série',
    
    // Photo Registration
    'photos.title': 'REGISTRO FOTOGRÁFICO',
    'photos.photoCount': '{count} fotos',
    'photos.addPhoto': 'Adicionar Foto',
    'photos.photo': 'Foto',
    'photos.clickToAdd': 'Clique para adicionar foto',
    'photos.noPhoto': 'Sem Foto',
    
    // Photo Fields
    'photo.pn': 'PN',
    'photo.pnPlaceholder': 'Numero da Peça',
    'photo.serial': 'Serial',
    'photo.serialPlaceholder': 'Serial',
    'photo.partName': 'Peça',
    'photo.partNamePlaceholder': 'Nome da peça',
    'photo.quantity': 'Qtd',
    'photo.quantityPlaceholder': 'Qtd',
    'photo.criticality': 'Criticidade',
    'photo.criticalityHigh': 'Alta',
    'photo.criticalityMedium': 'Média',
    'photo.criticalityLow': 'Baixa',
    'photo.description': 'Descrição',
    'photo.descriptionPlaceholder': 'Descrição...',
    'photo.circles': 'círculo(s)',
    
    // Sub-parts
    'subparts.title': 'Sub-peças',
    'subparts.partsOf': 'Peças Adicionais (Sub-peças de {pn})',
    'subparts.type': 'Sub-peça',
    
    // Categories (Home tab)
    'category.contexto': 'Contexto da intervenção',
    'category.contextoDesc': 'Sintoma, data, OS/chamado, objetivo, escopo',
    'category.componente': 'Foto do componente em questão',
    'category.componenteDesc': 'Condição atual de falha com PN',
    'category.preparacao': 'Preparação de peças/recursos',
    'category.preparacaoDesc': 'Fotos + lista de peças (filtros, recursos, coisas que precisam para fazer a atividade)',
    'category.desmontagem': 'Desmontagem',
    'category.desmontagemDesc': 'Fotos longe/médio/perto + observações (primeira parte da atividade)',
    'category.diagnostico': 'Diagnóstico',
    'category.diagnosticoDesc': 'O que foi identificado, evidências, medições',
    'category.execucao': 'Execução do reparo/ajuste/substituição',
    'category.execucaoDesc': 'Passos críticos, torques, parâmetros',
    'category.montagem': 'Montagem',
    'category.montagemDesc': 'Fotos do componente instalado',
    'category.testes': 'Testes e medições',
    'category.testesDesc': 'Antes/depois',
    
    // Parts Table
    'partsTable.title': 'Tabela de Peças',
    'partsTable.pnSerial': 'PN (Serial)',
    'partsTable.partName': 'Nome da Peça',
    'partsTable.qty': 'Qtd',
    'partsTable.type': 'Tipo',
    'partsTable.criticality': 'Criticidade',
    'partsTable.main': 'Principal',
    'partsTable.subpart': 'Sub-peça',
    'partsTable.exportExcel': 'Exportar Excel',
    
    // Conclusion
    'conclusion.title': 'Conclusão',
    'conclusion.placeholder': 'Digite a conclusão do relatório...',
    
    // Actions
    'action.clear': 'Limpar Relatório',
    'action.export': 'Exportar Dados',
    'action.import': 'Importar Dados',
    'action.downloadPPT': 'Baixar PowerPoint',
    'action.importExport': 'Importar / Exportar',
    'action.importExportDesc': 'Salvar ou carregar dados do relatório:',
    'action.download': 'Baixar Relatório',
    'action.downloadDesc': 'Escolha o formato de download:',
    'action.pptDesc': 'Relatório completo com imagens',
    'action.exportJson': 'Exportar JSON',
    'action.exportJsonDesc': 'Baixar dados como arquivo .json',
    'action.importJson': 'Importar JSON',
    'action.importJsonDesc': 'Carregar dados de arquivo .json',
    'action.addPhoto': 'Adicionar Foto',
    'action.add': 'Adicionar',
    'action.remove': 'Remover',
    'action.edit': 'Editar',
    'action.save': 'Salvar',
    'action.cancel': 'Cancelar',
    'action.confirm': 'Confirmar',
    
    // Photo Editor
    'editor.title': 'Editor de Foto',
    'editor.select': 'Selecionar',
    'editor.circle': 'Círculo',
    'editor.circleWithPhoto': 'Círculo com foto',
    'editor.arrow': 'Seta',
    'editor.color': 'Cor:',
    'editor.deleteSelected': 'Delete para remover • Esc para cancelar',
    'editor.clickToSelect': 'Clique para selecionar, arraste para mover',
    'editor.clickToAddCircle': 'Clique para adicionar círculo',
    'editor.clickToAddPhotoCircle': 'Clique para adicionar círculo com foto',
    'editor.clickAndDragArrow': 'Clique e arraste para desenhar seta',
    'editor.addPhotoToCircle': 'Adicionar Foto ao Círculo',
    'editor.choosePhoto': 'Escolha uma foto:',
    'editor.upload': 'Upload',
    'editor.paste': 'Colar',
    
    // Photo Options Dialog
    'photoOptions.title': 'Opções da Foto',
    'photoOptions.uploadFile': 'Upload de Arquivo',
    'photoOptions.openCamera': 'Abrir Câmera',
    'photoOptions.pasteClipboard': 'Colar da Área de Transferência',
    'photoOptions.viewFullscreen': 'Ver em Tela Cheia',
    'photoOptions.replacePhoto': 'Substituir Foto',
    
    // Fullscreen Viewer
    'fullscreen.close': 'Fechar',
    'fullscreen.download': 'Baixar',
    
    // Clear Confirm Dialog
    'clearConfirm.title': 'Confirmar Limpeza',
    'clearConfirm.description': 'Tem certeza que deseja limpar todo o relatório?',
    
    // Loading
    'loading.generatingPPT': 'Gerando PowerPoint...',
    
    // Footer
    'footer.copyright': '© 2024 - Departamento de Manutenção Industrial | Todos os direitos reservados',
    
    // Placeholders
    'placeholder.tag': 'Digite ou selecione a TAG...',
    'placeholder.modelo': 'Digite o modelo',
    'placeholder.sn': 'Digite o número de série',
    'placeholder.entrega': 'Digite a data de entrega',
    'placeholder.cliente': 'Digite o nome do cliente',
    'placeholder.descricao': 'Digite a descrição',
    'placeholder.os': 'Digite a OS de execução',
    'placeholder.inspector': 'Digite o nome do inspetor',
    'placeholder.hourmeter': 'Digite o horímetro',
    
    // Select Options
    'select.no': 'No',
    'select.yes': 'Yes',
    'select.selectOption': 'Selecione...',
    
    // Table
    'table.swipe': 'Deslize para ver mais',
    
    // Spell Check
    'spellCheck.title': 'Verificar Ortografia',
    'spellCheck.foundErrors': '{count} erro(s) encontrado(s)',
    'spellCheck.applyAll': 'Corrigir Todos',
    'spellCheck.apply': 'Aplicar',
    'spellCheck.noErrors': 'Nenhum erro encontrado!',
    'spellCheck.checking': 'Verificando...',
    
    // Collaboration
    'collaboration.title': 'Colaboração em Tempo Real',
    'collaboration.description': 'Compartilhe este link para permitir que outras pessoas editem o relatório junto com você em tempo real.',
    'collaboration.share': 'Compartilhar',
    'collaboration.link': 'Link de Compartilhamento',
    'collaboration.copyLink': 'Copiar Link',
    'collaboration.copied': 'Copiado!',
    'collaboration.scanQR': 'Escaneie para acessar no celular',
    'collaboration.info': 'Como funciona:',
    'collaboration.info1': 'Todas as alterações são sincronizadas em tempo real',
    'collaboration.info2': 'Múltiplas pessoas podem editar simultaneamente',
    'collaboration.info3': 'O link expira em 24 horas',
    'collaboration.usersOnline': '{count} online',
    'collaboration.userJoined': 'Usuário entrou na sessão',
    'collaboration.userLeft': 'Usuário saiu da sessão',
    
    // History Tab (Admin)
    'tab.history': 'Histórico',
    'history.dashboard': 'Dashboard',
    'history.ranking': 'Ranking',
    'history.reports': 'Relatórios',
    'history.reportsByMonth': 'Relatórios por Mês',
    'history.reportsByUser': 'Relatórios por Colaborador',
    'history.monthlyTotal': 'Total do Mês',
    'history.noReports': 'Nenhum relatório finalizado ainda',
    'history.table.user': 'Usuário',
    'history.table.type': 'Tipo',
    'history.table.tag': 'TAG',
    'history.table.description': 'Descrição',
    'history.table.date': 'Data',
    'history.table.conclusion': 'Conclusão',
    'history.type.home': 'Relatório de Falha',
    'history.type.inspecao': 'Inspeção',
    'history.machineDown': 'Máquina Parada',
    
    // Finalize Report
    'action.finalize': 'Finalizar',
    'finalize.title': 'Finalizar Relatório',
    'finalize.confirm': 'Confirmar Finalização',
    'finalize.success': 'Relatório finalizado com sucesso!',
    'finalize.error': 'Erro ao finalizar relatório',
    'finalize.requiredFields': 'Preencha os campos obrigatórios:',
    'finalize.conclusionRequired': 'Conclusão é obrigatória',
    'finalize.executantesRequired': 'Nomes dos executantes é obrigatório',
    'finalize.tagRequired': 'TAG é obrigatória',
    'finalize.descricaoRequired': 'Descrição é obrigatória',
    'clear.confirm': 'Tem certeza que deseja limpar o relatório? Todos os dados serão perdidos.',
    
    // RDO Report
    'rdo.title': 'Relatório Executivo (RDO)',
    'rdo.generate': 'Gerar RDO',
    'rdo.download': 'Baixar RDO',
    'rdo.description': 'Relatório resumido estilo RDO (1-2 páginas)',
    'rdo.powerpoint': 'PowerPoint (Completo)',
    'rdo.executive': 'RDO',
    
    // Offline
    'offline.title': 'Modo Offline',
    'offline.status': 'Você está offline',
    'offline.syncPending': '{count} alteração(ões) pendente(s) para sincronizar',
    'offline.syncNow': 'Sincronizar Agora',
    'offline.synced': 'Sincronizado',
  },
  
  en: {
    // Header & Sidebar
    'app.title': 'Z-Services AI',
    'tab.home': 'Report',
    'tab.inspecao': 'Inspection',
    
    // Cover Page
    'report.technicalReport': 'Technical Report',
    'report.executionInfo': 'Execution Information',
    'report.tag': 'TAG',
    'report.modelo': 'Model',
    'report.sn': 'SN',
    'report.entrega': 'Delivery',
    'report.cliente': 'Customer',
    'report.descricao': 'Description',
    'report.machineDown': 'MACHINE DOWN?',
    'report.reportData': 'REPORT DATA',
    'report.executionDate': 'Execution Date',
    'report.endDate': 'End Date',
    'report.endDateOptional': 'End Date (Optional)',
    'report.workOrder': 'Work Order',
    'report.workOrderOptional': 'Work Order (Optional)',
    'report.performers': 'Names of Performers',
    'report.hourMeter': 'Hour Meter',
    
    // Machine Identification
    'machine.identification': 'Machine Identification',
    'machine.equipmentPhoto': 'Equipment Photo',
    'machine.hourMeterPhoto': 'Hour Meter Photo',
    'machine.serialPhoto': 'Serial Number Photo',
    'machine.equipmentTag': 'Equipment TAG',
    'machine.serialNumber': 'Serial Number',
    
    // Photo Registration
    'photos.title': 'PHOTOGRAPHIC RECORD',
    'photos.photoCount': '{count} photos',
    'photos.addPhoto': 'Add Photo',
    'photos.photo': 'Photo',
    'photos.clickToAdd': 'Click to add photo',
    'photos.noPhoto': 'No Photo',
    
    // Photo Fields
    'photo.pn': 'PN',
    'photo.pnPlaceholder': 'Part Number',
    'photo.serial': 'Serial',
    'photo.serialPlaceholder': 'Serial',
    'photo.partName': 'Part',
    'photo.partNamePlaceholder': 'Part name',
    'photo.quantity': 'Qty',
    'photo.quantityPlaceholder': 'Qty',
    'photo.criticality': 'Criticality',
    'photo.criticalityHigh': 'High',
    'photo.criticalityMedium': 'Medium',
    'photo.criticalityLow': 'Low',
    'photo.description': 'Description',
    'photo.descriptionPlaceholder': 'Description...',
    'photo.circles': 'circle(s)',
    
    // Sub-parts
    'subparts.title': 'Sub-parts',
    'subparts.partsOf': 'Additional Parts (Sub-parts of {pn})',
    'subparts.type': 'Sub-part',
    
    // Categories
    'category.contexto': 'Intervention Context',
    'category.contextoDesc': 'Symptom, date, work order/call, objective, scope',
    'category.componente': 'Component Photo',
    'category.componenteDesc': 'Current failure condition with PN',
    'category.preparacao': 'Parts/Resources Preparation',
    'category.preparacaoDesc': 'Photos + parts list (filters, resources, items needed for the activity)',
    'category.desmontagem': 'Disassembly',
    'category.desmontagemDesc': 'Far/medium/close photos + observations (first part of activity)',
    'category.diagnostico': 'Diagnosis',
    'category.diagnosticoDesc': 'What was identified, evidence, measurements',
    'category.execucao': 'Repair/Adjustment/Replacement Execution',
    'category.execucaoDesc': 'Critical steps, torques, parameters',
    'category.montagem': 'Assembly',
    'category.montagemDesc': 'Installed component photos',
    'category.testes': 'Tests and Measurements',
    'category.testesDesc': 'Before/after',
    
    // Parts Table
    'partsTable.title': 'Parts Table',
    'partsTable.pnSerial': 'PN (Serial)',
    'partsTable.partName': 'Part Name',
    'partsTable.qty': 'Qty',
    'partsTable.type': 'Type',
    'partsTable.criticality': 'Criticality',
    'partsTable.main': 'Main',
    'partsTable.subpart': 'Sub-part',
    'partsTable.exportExcel': 'Export Excel',
    
    // Conclusion
    'conclusion.title': 'Conclusion',
    'conclusion.placeholder': 'Enter the report conclusion...',
    
    // Actions
    'action.clear': 'Clear Report',
    'action.export': 'Export Data',
    'action.import': 'Import Data',
    'action.downloadPPT': 'Download PowerPoint',
    'action.importExport': 'Import / Export',
    'action.importExportDesc': 'Save or load report data:',
    'action.download': 'Download Report',
    'action.downloadDesc': 'Choose the download format:',
    'action.pptDesc': 'Full report with images',
    'action.exportJson': 'Export JSON',
    'action.exportJsonDesc': 'Download data as .json file',
    'action.importJson': 'Import JSON',
    'action.importJsonDesc': 'Load data from .json file',
    'action.addPhoto': 'Add Photo',
    'action.add': 'Add',
    'action.remove': 'Remove',
    'action.edit': 'Edit',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    
    // Photo Editor
    'editor.title': 'Photo Editor',
    'editor.select': 'Select',
    'editor.circle': 'Circle',
    'editor.circleWithPhoto': 'Circle with photo',
    'editor.arrow': 'Arrow',
    'editor.color': 'Color:',
    'editor.deleteSelected': 'Delete to remove • Esc to cancel',
    'editor.clickToSelect': 'Click to select, drag to move',
    'editor.clickToAddCircle': 'Click to add circle',
    'editor.clickToAddPhotoCircle': 'Click to add circle with photo',
    'editor.clickAndDragArrow': 'Click and drag to draw arrow',
    'editor.addPhotoToCircle': 'Add Photo to Circle',
    'editor.choosePhoto': 'Choose a photo:',
    'editor.upload': 'Upload',
    'editor.paste': 'Paste',
    
    // Photo Options Dialog
    'photoOptions.title': 'Photo Options',
    'photoOptions.uploadFile': 'File Upload',
    'photoOptions.openCamera': 'Open Camera',
    'photoOptions.pasteClipboard': 'Paste from Clipboard',
    'photoOptions.viewFullscreen': 'View Fullscreen',
    'photoOptions.replacePhoto': 'Replace Photo',
    
    // Fullscreen Viewer
    'fullscreen.close': 'Close',
    'fullscreen.download': 'Download',
    
    // Clear Confirm Dialog
    'clearConfirm.title': 'Confirm Clear',
    'clearConfirm.description': 'Are you sure you want to clear the entire report?',
    
    // Loading
    'loading.generatingPPT': 'Generating PowerPoint...',
    
    // Footer
    'footer.copyright': '© 2024 - Industrial Maintenance Department | All rights reserved',
    
    // Placeholders
    'placeholder.tag': 'Enter or select TAG...',
    'placeholder.modelo': 'Enter the model',
    'placeholder.sn': 'Enter the serial number',
    'placeholder.entrega': 'Enter the delivery date',
    'placeholder.cliente': 'Enter the customer name',
    'placeholder.descricao': 'Enter the description',
    'placeholder.os': 'Enter the work order',
    'placeholder.inspector': 'Enter the inspector name',
    'placeholder.hourmeter': 'Enter the hour meter',
    
    // Select Options
    'select.no': 'No',
    'select.yes': 'Yes',
    'select.selectOption': 'Select...',
    
    // Table
    'table.swipe': 'Swipe to see more',
    
    // Spell Check
    'spellCheck.title': 'Check Spelling',
    'spellCheck.foundErrors': '{count} error(s) found',
    'spellCheck.applyAll': 'Fix All',
    'spellCheck.apply': 'Apply',
    'spellCheck.noErrors': 'No errors found!',
    'spellCheck.checking': 'Checking...',
    
    // Collaboration
    'collaboration.title': 'Real-time Collaboration',
    'collaboration.description': 'Share this link to allow others to edit the report with you in real time.',
    'collaboration.share': 'Share',
    'collaboration.link': 'Share Link',
    'collaboration.copyLink': 'Copy Link',
    'collaboration.copied': 'Copied!',
    'collaboration.scanQR': 'Scan to access on mobile',
    'collaboration.info': 'How it works:',
    'collaboration.info1': 'All changes are synchronized in real time',
    'collaboration.info2': 'Multiple people can edit simultaneously',
    'collaboration.info3': 'The link expires in 24 hours',
    'collaboration.usersOnline': '{count} online',
    'collaboration.userJoined': 'User joined the session',
    'collaboration.userLeft': 'User left the session',
    
    // History Tab (Admin)
    'tab.history': 'History',
    'history.dashboard': 'Dashboard',
    'history.ranking': 'Ranking',
    'history.reports': 'Reports',
    'history.reportsByMonth': 'Reports by Month',
    'history.reportsByUser': 'Reports by Collaborator',
    'history.monthlyTotal': 'Monthly Total',
    'history.noReports': 'No finalized reports yet',
    'history.table.user': 'User',
    'history.table.type': 'Type',
    'history.table.tag': 'TAG',
    'history.table.description': 'Description',
    'history.table.date': 'Date',
    'history.table.conclusion': 'Conclusion',
    'history.type.home': 'Failure Report',
    'history.type.inspecao': 'Inspection',
    'history.machineDown': 'Machine Down',
    
    // Finalize Report
    'action.finalize': 'Finalize',
    'finalize.title': 'Finalize Report',
    'finalize.confirm': 'Confirm Finalization',
    'finalize.success': 'Report finalized successfully!',
    'finalize.error': 'Error finalizing report',
    'finalize.requiredFields': 'Fill in the required fields:',
    'finalize.conclusionRequired': 'Conclusion is required',
    'finalize.executantesRequired': 'Performer names are required',
    'finalize.tagRequired': 'TAG is required',
    'finalize.descricaoRequired': 'Description is required',
    'clear.confirm': 'Are you sure you want to clear the report? All data will be lost.',
    
    // RDO Report
    'rdo.title': 'Executive Report (RDO)',
    'rdo.generate': 'Generate RDO',
    'rdo.download': 'Download RDO',
    'rdo.description': 'Summary report in RDO style (1-2 pages)',
    'rdo.powerpoint': 'PowerPoint (Full)',
    'rdo.executive': 'RDO',
    
    // Offline
    'offline.title': 'Offline Mode',
    'offline.status': 'You are offline',
    'offline.syncPending': '{count} change(s) pending to sync',
    'offline.syncNow': 'Sync Now',
    'offline.synced': 'Synced',
  },
  
  ja: {
    // Header & Sidebar
    'app.title': 'Z-Services AI',
    'tab.home': 'レポート',
    'tab.inspecao': '検査',
    
    // Cover Page
    'report.technicalReport': '技術報告書',
    'report.executionInfo': '実行情報',
    'report.tag': 'TAG',
    'report.modelo': 'モデル',
    'report.sn': 'SN',
    'report.entrega': '納期',
    'report.cliente': '顧客',
    'report.descricao': '説明',
    'report.machineDown': 'MACHINE DOWN?',
    'report.reportData': '報告書データ',
    'report.executionDate': '実行日',
    'report.endDate': '終了日',
    'report.endDateOptional': '終了日（オプション）',
    'report.workOrder': '作業指示書',
    'report.workOrderOptional': '作業指示書（オプション）',
    'report.performers': '実行者名',
    'report.hourMeter': 'アワーメーター',
    
    // Machine Identification
    'machine.identification': '機械識別',
    'machine.equipmentPhoto': '設備写真',
    'machine.hourMeterPhoto': 'アワーメーター写真',
    'machine.serialPhoto': 'シリアル番号写真',
    'machine.equipmentTag': '設備TAG',
    'machine.serialNumber': 'シリアル番号',
    
    // Photo Registration
    'photos.title': '写真記録',
    'photos.photoCount': '{count}枚の写真',
    'photos.addPhoto': '写真を追加',
    'photos.photo': '写真',
    'photos.clickToAdd': 'クリックして写真を追加',
    'photos.noPhoto': '写真なし',
    
    // Photo Fields
    'photo.pn': 'PN',
    'photo.pnPlaceholder': '部品番号',
    'photo.serial': 'シリアル',
    'photo.serialPlaceholder': 'シリアル',
    'photo.partName': '部品',
    'photo.partNamePlaceholder': '部品名',
    'photo.quantity': '数量',
    'photo.quantityPlaceholder': '数量',
    'photo.criticality': '重要度',
    'photo.criticalityHigh': '高',
    'photo.criticalityMedium': '中',
    'photo.criticalityLow': '低',
    'photo.description': '説明',
    'photo.descriptionPlaceholder': '説明...',
    'photo.circles': '円',
    
    // Sub-parts
    'subparts.title': 'サブ部品',
    'subparts.partsOf': '追加部品（{pn}のサブ部品）',
    'subparts.type': 'サブ部品',
    
    // Categories
    'category.contexto': '介入コンテキスト',
    'category.contextoDesc': '症状、日付、作業指示書/コール、目的、範囲',
    'category.componente': 'コンポーネント写真',
    'category.componenteDesc': '現在の故障状態とPN',
    'category.preparacao': '部品/リソース準備',
    'category.preparacaoDesc': '写真 + 部品リスト（フィルター、リソース、作業に必要な項目）',
    'category.desmontagem': '分解',
    'category.desmontagemDesc': '遠/中/近写真 + 観察（作業の最初の部分）',
    'category.diagnostico': '診断',
    'category.diagnosticoDesc': '特定された内容、証拠、測定値',
    'category.execucao': '修理/調整/交換の実行',
    'category.execucaoDesc': '重要なステップ、トルク、パラメータ',
    'category.montagem': '組立',
    'category.montagemDesc': '設置されたコンポーネントの写真',
    'category.testes': 'テストと測定',
    'category.testesDesc': '前/後',
    
    // Parts Table
    'partsTable.title': '部品表',
    'partsTable.pnSerial': 'PN (シリアル)',
    'partsTable.partName': '部品名',
    'partsTable.qty': '数量',
    'partsTable.type': 'タイプ',
    'partsTable.criticality': '重要度',
    'partsTable.main': 'メイン',
    'partsTable.subpart': 'サブ部品',
    'partsTable.exportExcel': 'Excelエクスポート',
    
    // Conclusion
    'conclusion.title': '結論',
    'conclusion.placeholder': '報告書の結論を入力...',
    
    // Actions
    'action.clear': '報告書をクリア',
    'action.export': 'データをエクスポート',
    'action.import': 'データをインポート',
    'action.downloadPPT': 'PowerPointをダウンロード',
    'action.importExport': 'インポート / エクスポート',
    'action.importExportDesc': '報告書データを保存または読み込み:',
    'action.download': 'レポートをダウンロード',
    'action.downloadDesc': 'ダウンロード形式を選択:',
    'action.pptDesc': '画像付き完全レポート',
    'action.exportJson': 'JSONエクスポート',
    'action.exportJsonDesc': '.jsonファイルとしてデータをダウンロード',
    'action.importJson': 'JSONインポート',
    'action.importJsonDesc': '.jsonファイルからデータを読み込み',
    'action.addPhoto': '写真を追加',
    'action.add': '追加',
    'action.remove': '削除',
    'action.edit': '編集',
    'action.save': '保存',
    'action.cancel': 'キャンセル',
    'action.confirm': '確認',
    
    // Photo Editor
    'editor.title': '写真エディタ',
    'editor.select': '選択',
    'editor.circle': '円',
    'editor.circleWithPhoto': '写真付き円',
    'editor.arrow': '矢印',
    'editor.color': '色:',
    'editor.deleteSelected': '削除キーで削除 • Escでキャンセル',
    'editor.clickToSelect': 'クリックして選択、ドラッグして移動',
    'editor.clickToAddCircle': 'クリックして円を追加',
    'editor.clickToAddPhotoCircle': 'クリックして写真付き円を追加',
    'editor.clickAndDragArrow': 'クリックしてドラッグで矢印を描画',
    'editor.addPhotoToCircle': '円に写真を追加',
    'editor.choosePhoto': '写真を選択:',
    'editor.upload': 'アップロード',
    'editor.paste': '貼り付け',
    
    // Photo Options Dialog
    'photoOptions.title': '写真オプション',
    'photoOptions.uploadFile': 'ファイルをアップロード',
    'photoOptions.openCamera': 'カメラを開く',
    'photoOptions.pasteClipboard': 'クリップボードから貼り付け',
    'photoOptions.viewFullscreen': 'フルスクリーン表示',
    'photoOptions.replacePhoto': '写真を交換',
    
    // Fullscreen Viewer
    'fullscreen.close': '閉じる',
    'fullscreen.download': 'ダウンロード',
    
    // Clear Confirm Dialog
    'clearConfirm.title': 'クリアの確認',
    'clearConfirm.description': '報告書全体をクリアしてもよろしいですか？',
    
    // Loading
    'loading.generatingPPT': 'PowerPointを生成中...',
    
    // Footer
    'footer.copyright': '© 2024 - 産業メンテナンス部 | 全著作権所有',
    
    // Placeholders
    'placeholder.tag': 'TAGを入力または選択...',
    'placeholder.modelo': 'モデルを入力',
    'placeholder.sn': 'シリアル番号を入力',
    'placeholder.entrega': '納期を入力',
    'placeholder.cliente': '顧客名を入力',
    'placeholder.descricao': '説明を入力',
    'placeholder.os': '作業指示書を入力',
    'placeholder.inspector': '検査員名を入力',
    'placeholder.hourmeter': 'アワーメーターを入力',
    
    // Select Options
    'select.no': 'いいえ',
    'select.yes': 'はい',
    'select.selectOption': '選択...',
    
    // Table
    'table.swipe': 'スワイプして詳細を見る',
    
    // Spell Check
    'spellCheck.title': 'スペルチェック',
    'spellCheck.foundErrors': '{count}件のエラーが見つかりました',
    'spellCheck.applyAll': 'すべて修正',
    'spellCheck.apply': '適用',
    'spellCheck.noErrors': 'エラーは見つかりませんでした！',
    'spellCheck.checking': '確認中...',
  },
  
  zh: {
    // Header & Sidebar
    'app.title': 'Z-Services AI',
    'tab.home': '报告',
    'tab.inspecao': '检查',
    
    // Cover Page
    'report.technicalReport': '技术报告',
    'report.executionInfo': '执行信息',
    'report.tag': 'TAG',
    'report.modelo': '型号',
    'report.sn': 'SN',
    'report.entrega': '交付',
    'report.cliente': '客户',
    'report.descricao': '描述',
    'report.machineDown': 'MACHINE DOWN?',
    'report.reportData': '报告数据',
    'report.executionDate': '执行日期',
    'report.endDate': '结束日期',
    'report.endDateOptional': '结束日期（可选）',
    'report.workOrder': '工单',
    'report.workOrderOptional': '工单（可选）',
    'report.performers': '执行者姓名',
    'report.hourMeter': '小时表',
    
    // Machine Identification
    'machine.identification': '机器识别',
    'machine.equipmentPhoto': '设备照片',
    'machine.hourMeterPhoto': '小时表照片',
    'machine.serialPhoto': '序列号照片',
    'machine.equipmentTag': '设备TAG',
    'machine.serialNumber': '序列号',
    
    // Photo Registration
    'photos.title': '照片记录',
    'photos.photoCount': '{count}张照片',
    'photos.addPhoto': '添加照片',
    'photos.photo': '照片',
    'photos.clickToAdd': '点击添加照片',
    'photos.noPhoto': '无照片',
    
    // Photo Fields
    'photo.pn': 'PN',
    'photo.pnPlaceholder': '零件号',
    'photo.serial': '序列号',
    'photo.serialPlaceholder': '序列号',
    'photo.partName': '零件',
    'photo.partNamePlaceholder': '零件名称',
    'photo.quantity': '数量',
    'photo.quantityPlaceholder': '数量',
    'photo.criticality': '重要性',
    'photo.criticalityHigh': '高',
    'photo.criticalityMedium': '中',
    'photo.criticalityLow': '低',
    'photo.description': '描述',
    'photo.descriptionPlaceholder': '描述...',
    'photo.circles': '圆圈',
    
    // Sub-parts
    'subparts.title': '子零件',
    'subparts.partsOf': '附加零件（{pn}的子零件）',
    'subparts.type': '子零件',
    
    // Categories
    'category.contexto': '干预背景',
    'category.contextoDesc': '症状、日期、工单/呼叫、目标、范围',
    'category.componente': '组件照片',
    'category.componenteDesc': '当前故障状态与PN',
    'category.preparacao': '零件/资源准备',
    'category.preparacaoDesc': '照片 + 零件清单（过滤器、资源、活动所需物品）',
    'category.desmontagem': '拆卸',
    'category.desmontagemDesc': '远/中/近照片 + 观察（活动第一部分）',
    'category.diagnostico': '诊断',
    'category.diagnosticoDesc': '识别内容、证据、测量值',
    'category.execucao': '维修/调整/更换执行',
    'category.execucaoDesc': '关键步骤、扭矩、参数',
    'category.montagem': '组装',
    'category.montagemDesc': '已安装组件照片',
    'category.testes': '测试和测量',
    'category.testesDesc': '之前/之后',
    
    // Parts Table
    'partsTable.title': '零件表',
    'partsTable.pnSerial': 'PN（序列号）',
    'partsTable.partName': '零件名称',
    'partsTable.qty': '数量',
    'partsTable.type': '类型',
    'partsTable.criticality': '重要性',
    'partsTable.main': '主要',
    'partsTable.subpart': '子零件',
    'partsTable.exportExcel': '导出Excel',
    
    // Conclusion
    'conclusion.title': '结论',
    'conclusion.placeholder': '输入报告结论...',
    
    // Actions
    'action.clear': '清除报告',
    'action.export': '导出数据',
    'action.import': '导入数据',
    'action.downloadPPT': '下载PowerPoint',
    'action.importExport': '导入 / 导出',
    'action.importExportDesc': '保存或加载报告数据:',
    'action.download': '下载报告',
    'action.downloadDesc': '选择下载格式:',
    'action.pptDesc': '包含图片的完整报告',
    'action.exportJson': '导出JSON',
    'action.exportJsonDesc': '下载数据为.json文件',
    'action.importJson': '导入JSON',
    'action.importJsonDesc': '从.json文件加载数据',
    'action.addPhoto': '添加照片',
    'action.add': '添加',
    'action.remove': '删除',
    'action.edit': '编辑',
    'action.save': '保存',
    'action.cancel': '取消',
    'action.confirm': '确认',
    
    // Photo Editor
    'editor.title': '照片编辑器',
    'editor.select': '选择',
    'editor.circle': '圆圈',
    'editor.circleWithPhoto': '带照片圆圈',
    'editor.arrow': '箭头',
    'editor.color': '颜色:',
    'editor.deleteSelected': 'Delete删除 • Esc取消',
    'editor.clickToSelect': '点击选择，拖动移动',
    'editor.clickToAddCircle': '点击添加圆圈',
    'editor.clickToAddPhotoCircle': '点击添加带照片圆圈',
    'editor.clickAndDragArrow': '点击拖动绘制箭头',
    'editor.addPhotoToCircle': '添加照片到圆圈',
    'editor.choosePhoto': '选择照片:',
    'editor.upload': '上传',
    'editor.paste': '粘贴',
    
    // Photo Options Dialog
    'photoOptions.title': '照片选项',
    'photoOptions.uploadFile': '文件上传',
    'photoOptions.openCamera': '打开相机',
    'photoOptions.pasteClipboard': '从剪贴板粘贴',
    'photoOptions.viewFullscreen': '全屏查看',
    'photoOptions.replacePhoto': '更换照片',
    
    // Fullscreen Viewer
    'fullscreen.close': '关闭',
    'fullscreen.download': '下载',
    
    // Clear Confirm Dialog
    
    // Clear Confirm Dialog
    'clearConfirm.title': '确认清除',
    'clearConfirm.description': '确定要清除整个报告吗？',
    
    // Loading
    'loading.generatingPPT': '正在生成PowerPoint...',
    
    // Footer
    'footer.copyright': '© 2024 - 工业维护部门 | 版权所有',
    
    // Placeholders
    'placeholder.tag': '输入或选择TAG...',
    'placeholder.modelo': '输入型号',
    'placeholder.sn': '输入序列号',
    'placeholder.entrega': '输入交付日期',
    'placeholder.cliente': '输入客户名称',
    'placeholder.descricao': '输入描述',
    'placeholder.os': '输入工单',
    'placeholder.inspector': '输入检查员姓名',
    'placeholder.hourmeter': '输入小时表',
    
    // Select Options
    'select.no': '否',
    'select.yes': '是',
    'select.selectOption': '选择...',
    
    // Table
    'table.swipe': '滑动查看更多',
    
    // Spell Check
    'spellCheck.title': '拼写检查',
    'spellCheck.foundErrors': '发现 {count} 个错误',
    'spellCheck.applyAll': '全部修正',
    'spellCheck.apply': '应用',
    'spellCheck.noErrors': '未发现错误！',
    'spellCheck.checking': '检查中...',
  },
};

// Get translation for a key
export function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  // First try to get translation from current language
  let text = translations[lang]?.[key];
  
  // If not found, try Portuguese as fallback
  if (!text) {
    text = translations['pt'][key];
  }
  
  // If still not found, use defaultValue or the key itself
  if (!text) {
    text = (params?.defaultValue as string) || key;
  }
  
  // Replace any parameters in the text
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      if (paramKey !== 'defaultValue') {
        text = text.replace(`{${paramKey}}`, String(value));
      }
    });
  }
  
  return text;
}

// Translate dynamic text using AI
export async function translateText(text: string, targetLang: Language, sourceLang: Language = 'pt'): Promise<string> {
  if (!text || text.trim() === '') return text;
  if (sourceLang === targetLang) return text;
  
  const langNames: Record<Language, string> = {
    pt: 'Portuguese',
    en: 'English',
    ja: 'Japanese',
    zh: 'Chinese (Mandarin)',
  };
  
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
        sourceLangName: langNames[sourceLang],
        targetLangName: langNames[targetLang],
      }),
    });
    
    const data = await response.json();
    return data.translation || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

// Batch translate multiple texts
export async function translateBatch(
  texts: string[],
  targetLang: Language,
  sourceLang: Language = 'pt'
): Promise<string[]> {
  if (sourceLang === targetLang) return texts;
  
  const langNames: Record<Language, string> = {
    pt: 'Portuguese',
    en: 'English',
    ja: 'Japanese',
    zh: 'Chinese (Mandarin)',
  };
  
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts,
        sourceLang,
        targetLang,
        sourceLangName: langNames[sourceLang],
        targetLangName: langNames[targetLang],
        batch: true,
      }),
    });
    
    const data = await response.json();
    return data.translations || texts;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
}
