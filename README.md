# 🚀 Gerador de Currículo Inteligente com IA & Motor ATS (Gupy Ready)

> Sistema full-stack moderno para criação, importação e otimização automatizada de currículos profissionais para aprovação máxima em sistemas de Inteligência Artificial de Recrutamento e Seleção (**ATS - Applicant Tracking Systems**) como **Gupy**, **Kenoby**, **Workday**, **Taleo** e **Greenhouse**, com suporte a cadastro de múltiplos usuários e exportação em PDF 100% limpo.

---

## 🌟 Principais Funcionalidades

### 1. 📄 Importação Inteligente de PDF e Word (.docx / .doc) com IA
- **Leitura Multimodal e Extração Estruturada**: Converte documentos brutos em currículos digitais estruturados com precisão cirúrgica via **Google Gemini 3.8 Flash** e **Mammoth Engine**.
- **Otimização Automática para ATS & Gupy**:
  - **Reescrita com Verbos de Ação**: Transforma frases passivas em conquistas mensuráveis através do método **STAR** (*Situação, Tarefa, Ação e Resultado*).
  - **Densidade Semântica de Palavras-Chave**: Identifica e padroniza competências técnicas (*Hard Skills*) e comportamentais para passar nos filtros booleanos dos robôs de RH.
  - **Higienização de Formatação**: Elimina colunas quebradas, tabelas e caracteres complexos que travam os parsers de ATS.
- **Relatório de Auditoria ATS em Tempo Real**:
  - **Score de Compatibilidade (0 a 100%)** e **Nota Conceito (A+, A, B, C)**.
  - Lista de melhorias e correções aplicadas pelo algoritmo.
  - Nuvem de palavras-chave detectadas e sugestões de competências críticas a adicionar.

### 2. 👤 Sistema de Cadastro de Usuários & Múltiplos Perfis
- **Autenticação e Registro**: Criação de contas de usuário com Nome, Email, Senha e Área de Atuação.
- **Gerenciador de Currículos Multiversão ("Meus Currículos")**:
  - Permite criar, duplicar, renomear e alternar entre diferentes versões do currículo (ex: *Currículo Desenvolvedor Back-End*, *Currículo Infra & Redes FTTH*, *Versão Tech Lead*).
  - **Salvamento Persistente**: Dados salvos tanto no backend (`/data/users-storage.json`) quanto em cache local (`localStorage`) para segurança contra perda de dados.
  - **Backup & Portabilidade JSON**: Exportação e importação de arquivo de segurança de todos os perfis com um clique.

### 3. 🎨 5 Templates Profissionais Especializados
1. **Gupy / ATS Master** (Recomendado): Coluna única, leitura linear, hierarquia semântica pura aprovada pelos motores de recrutamento mais rigorosos.
2. **Modern Executive**: Visual limpo com destaques em azul marinho e tipografia contemporânea.
3. **Tech Mono / Terminal**: Inspirado em ambientes de engenharia de software com badges técnicos.
4. **Classic Corporate**: Formato executivo tradicional em tons sóbrios.
5. **ATS Clean Minimal**: Minimalismo de alto contraste para leitura rápida humana e digital.

### 4. 🖨️ Exportação em PDF 100% Limpa (Print Engine)
- Regras CSS `@page { margin: 0mm; }` e `@media print` milimetricamente calibradas.
- **Sem poluição de navegador**: Oculta automaticamente links de URL (`https://...`), títulos do sistema e carimbos de data do navegador.
- Preservação total de gráficos, destaques visuais e quebras de página controladas (`page-break-inside: avoid`).

### 5. 🤖 WilsonIA - Copiloto de Carreira & Simulador de Entrevistas
- Assistente conversacional integrado especializado no mercado de tecnologia, redes e desenvolvimento de software.
- Simulação de perguntas técnicas de entrevistas de emprego.
- Sugestões de certificações e palavras-chave alinhadas a vagas abertas.

---

## 🖥️ Demonstração das Telas do Sistema

```
==================================================================================================
 [Top Header]  Gerador de Currículo Wilson Sampaio  | ATS & IA Resume Engine
 [Ações]       [⚡ Importar PDF/Word] [🛡️ Score ATS: 96% A+] [📁 Meus Currículos (3)] [👤 Wilson Sampaio] [💾 Salvar] [Exportar PDF]
==================================================================================================
 -------------------------------------------------------- ----------------------------------------
 | PAINEL ESQUERDO: EDITOR & COPILOTO IA                | | PAINEL DIREITO: VISUALIZAÇÃO A4      |
 | [ Editar Informações ]  [ 🤖 WilsonIA Copiloto ]     | |                                      |
 |                                                      | |  WILSON SAMPAIO                      |
 |  [✓] Dados Pessoais & Contatos                       | |  Especialista em Redes / Dev Back-End|
 |  [✓] Resumo Executivo (com gerador de IA)            | |                                      |
 |  [✓] Experiências Profissionais (Método STAR)        | |  RESUMO PROFISSIONAL                 |
 |  [✓] Formação Acadêmica                              | |  Profissional sênior polivalente...  |
 |  [✓] Competências & Tecnologias (Hard Skills)        | |                                      |
 |  [✓] Certificações & Idiomas                         | |  EXPERIÊNCIA PROFISSIONAL            |
 |                                                      | |  • TecBan (Técnico de TI & Redes)    |
 |  [✨ Otimizar texto com IA] [🌐 Traduzir Currículo]   | |  • Networks Internet (FTTH/MikroTik) |
 -------------------------------------------------------- ----------------------------------------
```

### 📸 Telas & Modais em Destaque

#### 1. Modal de Importação com IA (PDF & Word)
```
+-----------------------------------------------------------------------------------+
| ⚡ Importar PDF / Word com IA                                  [ATS & GUPY READY] |
+-----------------------------------------------------------------------------------+
|  [ Arraste e solte seu arquivo .pdf ou .docx aqui ]                               |
|  Arquivo selecionado: curriculo_antigo.pdf (1.4 MB)                                |
|                                                                                   |
|  Diretrizes de Otimização:                                                        |
|  (•) Ultra ATS (Gupy)   ( ) Executivo & Impacto   ( ) Fiel com Correção           |
|                                                                                   |
|  Cargo ou Vaga Pretendida: [ Especialista em Redes & Dev Back-End Python ]        |
|                                                                                   |
|  [Cancelar]                                     [✨ Processar e Otimizar com IA] |
+-----------------------------------------------------------------------------------+
```

#### 2. Relatório de Auditoria de Compatibilidade ATS (Score 96%)
```
+-----------------------------------------------------------------------------------+
| 🛡️ Auditoria de Compatibilidade ATS & Gupy                                       |
+-----------------------------------------------------------------------------------+
|   [ 96% ]  STATUS: APROVADO PARA TRIAGEM (NOTA A+)                                |
|            Currículo estruturado de forma ideal para parsers de IA da Gupy.       |
|                                                                                   |
|  ✓ Pontos Fortes:                                                                |
|    • Layout linear de coluna única sem quebras de parsing                         |
|    • Verbos de ação no pretérito com métricas quantitativas                       |
|    • Palavras-chave técnicas de alta relevância (MikroTik, FTTH, Python, QA)      |
|                                                                                   |
|  ⚡ Correções Aplicadas:                                                          |
|    • Reestruturação no formato canônico reconhecido por bots                      |
|    • Normalização de datas e cargos                                               |
|                                                                                   |
|  🔑 Palavras-chave detectadas: [MikroTik] [FTTH] [Python] [Back-End] [SLA] [QA]   |
+-----------------------------------------------------------------------------------+
```

#### 3. Gerenciador de Currículos do Usuário ("Meus Currículos")
```
+-----------------------------------------------------------------------------------+
| 📁 Meus Currículos Salvos                                         [+ Nova Versão] |
+-----------------------------------------------------------------------------------+
|  [📄] Currículo Principal (Otimizado Gupy/ATS) - [ATIVO]                          |
|       Template: Gupy • ATS Score: 96% • Atualizado hoje                           |
|       [✓ Carregado]  [📋 Duplicar]                                               |
|                                                                                   |
|  [📄] Currículo - Vaga Back-End Python & IA                                       |
|       Template: Moderno • ATS Score: 94%                                          |
|       [Carregar]  [📋 Duplicar]  [🗑️ Excluir]                                     |
|                                                                                   |
|  [📥 Baixar Backup JSON]                                                          |
+-----------------------------------------------------------------------------------+
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - React 18 & TypeScript
  - Tailwind CSS v4 (Design moderno, responsivo e adaptado para impressão A4)
  - Lucide React (Iconografia vetorial de alta precisão)
- **Backend & Servidor**:
  - Node.js & Express
  - **Google Gemini 3.8 Flash** (`@google/genai` SDK) para leitura multimodal de PDFs, auditoria semântica e reescrita
  - **Mammoth Engine** para extração limpa de documentos Word (`.docx`)
  - Sistema de Armazenamento Persistente Multi-Usuário em JSON (`./data/users-storage.json`)
- **Build & Ferramentas**:
  - Vite 5 & TSX
  - Esbuild para empacotamento rápido de servidor

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v18 ou superior) ou Bun
- Chave de API do Google Gemini (`GEMINI_API_KEY`)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente (.env)
cp .env.example .env
# Adicione sua chave GEMINI_API_KEY no arquivo .env

# 4. Inicie o servidor de desenvolvimento (Frontend + Backend)
npm run dev
```

Acesse a aplicação em seu navegador em `http://localhost:3000`.

---

## 📦 Como Enviar para o GitHub

Para subir todas as alterações para o seu repositório pessoal no GitHub:

```bash
# 1. Verifique as alterações preparadas
git status

# 2. Conecte o repositório remoto do GitHub (substitua com a URL do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/curriculo-inteligente-ia.git

# 3. Envie o branch principal para o GitHub
git branch -M main
git push -u origin main
```

---

## 📄 Licença
Desenvolvido com foco em excelência e aprovação profissional. Livre para uso pessoal e customização.
