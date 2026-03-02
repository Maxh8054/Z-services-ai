# Z-Services AI - Technical Report System

Sistema de Relatórios Técnicos para Manutenção Industrial.

## Deploy no Render

### Opção 1: Deploy via Dashboard (Recomendado)

1. Acesse [render.com](https://render.com) e crie uma conta
2. Clique em **"New +"** e selecione **"Web Service"**
3. Conecte seu repositório GitHub/GitLab
4. Configure o serviço:
   - **Name**: `z-services-ai`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

5. Clique em **"Create Web Service"**

### Opção 2: Deploy via render.yaml

1. Faça push do código para seu repositório
2. No Render, clique em **"New +"** → **"Blueprint"**
3. Conecte o repositório
4. O Render detectará o `render.yaml` automaticamente

## Desenvolvimento Local

```bash
# Instalar dependências
bun install

# Rodar em desenvolvimento
bun run dev

# Build para produção
bun run build

# Rodar em produção
bun run start
```

## Funcionalidades

- **Aba Relatório**: Sistema com categorias organizadas para relatórios completos
- **Aba Inspeção**: Formato livre para inspeções rápidas
- **Fotos**: Upload, câmera, clipboard, e editor de fotos
- **Criticidade**: Classificação de peças (Alta/Média/Baixa)
- **Exportação**: PowerPoint, Excel, JSON
- **Tradução**: Português, Inglês, Japonês, Chinês
- **Email**: Envio de relatórios por email

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Zustand
- PptxGenJS
- XLSX

## Licença

© 2024 - Departamento de Manutenção Industrial | Todos os direitos reservados
