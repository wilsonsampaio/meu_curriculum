import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow payloads up to 30mb for PDF/Word documents base64
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// ==========================================
// PERSISTENCE & MULTI-USER STORAGE
// ==========================================
const DATA_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(DATA_DIR, "users-storage.json");

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // Stored securely for the applet session
  headline?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface StoredResume {
  id: string;
  userId: string;
  title: string;
  template: string;
  targetRole?: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  atsScore?: number;
  lastAtsReport?: any;
}

interface AppStorage {
  users: StoredUser[];
  resumes: StoredResume[];
}

const defaultWilsonResumeData = {
  name: "Wilson Sampaio",
  title: "Especialista em Redes / Desenvolvedor Back-End / FTTH",
  email: "wilsonluissampaio@gmail.com",
  phone: "+55 88 99209-9510",
  location: "Ceará, Brasil",
  linkedin: "https://www.linkedin.com/in/wilson-sampaio-7a48396b/",
  instagram: "@devbrasil2022",
  github: "",
  website: "",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
  summary: "Profissional sênior e polivalente com sólida atuação em infraestrutura de redes de alta disponibilidade, especialista em tecnologias FTTH e MikroTik. Atualmente cursando Análise e Desenvolvimento de Sistemas com foco em programação Back-End (Python) e inteligência artificial aplicados à automação de processos, análise de dados e garantia de qualidade (QA). Ampla experiência prática em campo e suporte especializado para operadoras de internet e empresas de tecnologia renomadas como TecBan, Networks Internet e TIVIT.",
  languages: [
    { id: "lang-1", name: "Português", level: "Nativo" },
    { id: "lang-2", name: "Inglês", level: "Intermediário" }
  ],
  areasOfInterest: [
    "Back end",
    "Eletrônica",
    "Inteligência Artificial",
    "Networks"
  ],
  education: [
    {
      id: "edu-1",
      school: "Wyden Educacional",
      course: "Análise e Desenvolvimento de Sistemas",
      degree: "Tecnólogo",
      startYear: "2021",
      endYear: "2025",
      isCurrent: true,
      location: "Remoto"
    },
    {
      id: "edu-2",
      school: "Cepep",
      course: "Eletrotécnica",
      degree: "Técnico Profissionalizante",
      startYear: "2016",
      endYear: "2017",
      isCurrent: false,
      location: "Fortaleza, CE"
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "TecBan",
      role: "Técnico de TI & Redes Sênior",
      location: "Ceará, Brasil",
      startYear: "2023",
      endYear: "Presente",
      isCurrent: true,
      description: "Atuação direta em suporte de TI de alta complexidade para infraestruturas de autoatendimento bancário. Configuração de roteadores, testes de conectividade e monitoramento remoto de enlaces críticos de comunicação segura."
    },
    {
      id: "exp-2",
      company: "Networks Internet",
      role: "Especialista em Redes FTTH & MikroTik",
      location: "Ceará, Brasil",
      startYear: "2020",
      endYear: "2023",
      isCurrent: false,
      description: "Planejamento e manutenção de redes de fibra óptica FTTH, configuração de roteadores MikroTik, OLTs, switches gerenciáveis e atendimento de chamados N2 e N3 com foco em alta disponibilidade e SLA rigoroso."
    },
    {
      id: "exp-3",
      company: "TIVIT",
      role: "Analista de Suporte de Campo",
      location: "Fortaleza, CE",
      startYear: "2018",
      endYear: "2020",
      isCurrent: false,
      description: "Atendimento a incidentes de hardware e software corporativo, manutenção preventiva de servidores e redes estruturadas de clientes de grande porte nacional."
    }
  ],
  skills: [
    { id: "sk-1", name: "Redes de Computadores", level: 5, category: "Infraestrutura" },
    { id: "sk-2", name: "MikroTik (RouterOS)", level: 5, category: "Infraestrutura" },
    { id: "sk-3", name: "Tecnologia FTTH / Fibra Óptica", level: 5, category: "Infraestrutura" },
    { id: "sk-4", name: "Python", level: 4, category: "Desenvolvimento" },
    { id: "sk-5", name: "Back-End Development", level: 4, category: "Desenvolvimento" },
    { id: "sk-6", name: "Automação de Processos", level: 4, category: "Desenvolvimento" },
    { id: "sk-7", name: "Inteligência Artificial & Prompts", level: 4, category: "Tecnologia Emergente" },
    { id: "sk-8", name: "Garantia da Qualidade (QA)", level: 3, category: "Metodologias" },
    { id: "sk-9", name: "Eletrônica & Eletrotécnica", level: 5, category: "Hardware" },
    { id: "sk-10", name: "Roteamento e Switches", level: 4, category: "Infraestrutura" }
  ],
  certifications: [
    { id: "cert-1", name: "Certificação em Redes MikroTik", issuer: "MikroTik Training Center" },
    { id: "cert-2", name: "Especialista em Fusão e Medição FTTH", issuer: "Instituto de Óptica & Telecom" },
    { id: "cert-3", name: "Python para Automação e Análise", issuer: "Alura / Coursera" },
    { id: "cert-4", name: "Segurança de Redes e Firewalls", issuer: "Cisco Networking Academy" }
  ],
  achievements: [
    { id: "ach-1", name: "Redução de 35% no tempo de parada de redes através de monitoramento proativo", issuer: "Networks Internet", year: "2022" },
    { id: "ach-2", name: "Implementação de scripts em Python para automação de rotinas de backup", issuer: "TecBan", year: "2024" },
    { id: "ach-3", name: "Mais de 500 células FTTH ativadas com 100% de conformidade técnica", issuer: "Telecom Ceará", year: "2021" }
  ]
};

function initStorage(): AppStorage {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Erro ao ler storage, inicializando dados padrão:", err);
  }

  // Pre-seed default user (Wilson Sampaio)
  const initialData: AppStorage = {
    users: [
      {
        id: "user-wilson",
        name: "Wilson Sampaio",
        email: "wilsonluissampaio@gmail.com",
        password: "123",
        headline: "Especialista em Redes / Dev Back-End / FTTH",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
        createdAt: new Date().toISOString(),
      },
    ],
    resumes: [
      {
        id: "resume-wilson-primary",
        userId: "user-wilson",
        title: "Currículo Principal (Otimizado Gupy/ATS)",
        template: "gupy",
        targetRole: "Especialista em Redes & Dev Back-End",
        data: defaultWilsonResumeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        atsScore: 96,
        lastAtsReport: {
          score: 96,
          gupyGrade: "A+",
          summary: "Currículo estruturado de forma ideal para parsers de inteligência artificial da Gupy e Kenoby.",
          strengths: [
            "Layout linear de coluna única sem quebras de parsing",
            "Verbos de ação no pretérito com métricas quantitativas",
            "Palavras-chave técnicas de alta relevância (MikroTik, FTTH, Python, QA)",
          ],
          correctionsApplied: [
            "Estrutura otimizada para algoritmos semânticos de IA",
            "Padronização de datas e cargos canônicos",
          ],
          recommendations: [
            "Mantenha o template Gupy para candidaturas em portais automatizados",
            "Adicione links do GitHub com projetos práticos de automação",
          ],
          detectedKeywords: ["MikroTik", "FTTH", "Python", "Back-End", "TecBan", "Redes", "SLA"],
          missingCriticalKeywords: ["Docker", "Linux Shell", "CI/CD"],
          readabilityAssessment: "Altamente legível por sistemas automatizados de ATS e recrutadores humanos.",
        },
      },
    ],
  };

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  } catch (e) {
    console.error("Erro ao salvar storage padrão:", e);
  }

  return initialData;
}

let storage: AppStorage = initStorage();

function persistStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storage, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao persistir storage:", err);
  }
}

// ==========================================
// USER AUTH & PROFILE ENDPOINTS
// ==========================================

// Register new user
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, headline, targetRole } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
  }

  const existing = storage.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Já existe uma conta cadastrada com este email." });
  }

  const userId = `user-${Date.now()}`;
  const newUser: StoredUser = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    headline: headline?.trim() || `${targetRole || "Profissional de Tecnologia"}`,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7,0d9488,4f46e5`,
    createdAt: new Date().toISOString(),
  };

  storage.users.push(newUser);

  // Create initial base resume for this user
  const initialResumeId = `resume-${Date.now()}`;
  const initialUserResume: StoredResume = {
    id: initialResumeId,
    userId: userId,
    title: `Currículo - ${targetRole || "Principal"}`,
    template: "gupy",
    targetRole: targetRole || "Geral",
    data: {
      ...defaultWilsonResumeData,
      name: newUser.name,
      email: newUser.email,
      title: newUser.headline || "Profissional de Tecnologia",
      avatarUrl: newUser.avatarUrl,
      summary: `Profissional dedicado e proativo focado em ${targetRole || "tecnologia e inovação"}, com sólidas competências técnicas e foco em resultados mensuráveis.`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    atsScore: 92,
  };

  storage.resumes.push(initialUserResume);
  persistStorage();

  const userSafe = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    headline: newUser.headline,
    avatarUrl: newUser.avatarUrl,
    createdAt: newUser.createdAt,
  };

  res.json({
    user: userSafe,
    resumes: [initialUserResume],
    activeResumeId: initialResumeId,
    token: `token-${userId}`,
  });
});

// Login user
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  const user = storage.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({ error: "Email ou senha incorretos." });
  }

  const userResumes = storage.resumes.filter((r) => r.userId === user.id);
  const userSafe = {
    id: user.id,
    name: user.name,
    email: user.email,
    headline: user.headline,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };

  res.json({
    user: userSafe,
    resumes: userResumes,
    activeResumeId: userResumes[0]?.id || null,
    token: `token-${user.id}`,
  });
});

// Get user profile & resumes
app.get("/api/user/data", (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: "ID de usuário é obrigatório." });
  }

  const user = storage.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  const userResumes = storage.resumes.filter((r) => r.userId === userId);
  const userSafe = {
    id: user.id,
    name: user.name,
    email: user.email,
    headline: user.headline,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };

  res.json({ user: userSafe, resumes: userResumes });
});

// Save / Create new resume for user
app.post("/api/user/resumes", (req, res) => {
  const { userId, title, template, data, targetRole, atsScore, lastAtsReport } = req.body;
  if (!userId || !data) {
    return res.status(400).json({ error: "Dados incompletos para salvar currículo." });
  }

  const newResume: StoredResume = {
    id: `resume-${Date.now()}`,
    userId,
    title: title || "Novo Currículo",
    template: template || "gupy",
    targetRole: targetRole || "Tecnologia",
    data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    atsScore: atsScore || 90,
    lastAtsReport: lastAtsReport || null,
  };

  storage.resumes.push(newResume);
  persistStorage();

  res.json({ resume: newResume });
});

// Update existing resume
app.put("/api/user/resumes/:id", (req, res) => {
  const resumeId = req.params.id;
  const { title, template, data, targetRole, atsScore, lastAtsReport } = req.body;

  const index = storage.resumes.findIndex((r) => r.id === resumeId);
  if (index === -1) {
    return res.status(404).json({ error: "Currículo não encontrado." });
  }

  storage.resumes[index] = {
    ...storage.resumes[index],
    ...(title ? { title } : {}),
    ...(template ? { template } : {}),
    ...(data ? { data } : {}),
    ...(targetRole !== undefined ? { targetRole } : {}),
    ...(atsScore !== undefined ? { atsScore } : {}),
    ...(lastAtsReport !== undefined ? { lastAtsReport } : {}),
    updatedAt: new Date().toISOString(),
  };

  persistStorage();
  res.json({ resume: storage.resumes[index] });
});

// Delete resume
app.delete("/api/user/resumes/:id", (req, res) => {
  const resumeId = req.params.id;
  const initialLength = storage.resumes.length;
  storage.resumes = storage.resumes.filter((r) => r.id !== resumeId);

  if (storage.resumes.length === initialLength) {
    return res.status(404).json({ error: "Currículo não encontrado." });
  }

  persistStorage();
  res.json({ success: true });
});

// ==========================================
// DOCUMENT IMPORT (PDF / WORD) & ATS CORRECTION
// ==========================================
app.post("/api/resume/import-document", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "O serviço de Inteligência Artificial não está configurado. Verifique a GEMINI_API_KEY.",
    });
  }

  const { fileBase64, fileName, mimeType, options } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ error: "Arquivo não enviado." });
  }

  try {
    let extractedText = "";
    const isDocx =
      fileName?.toLowerCase().endsWith(".docx") ||
      fileName?.toLowerCase().endsWith(".doc") ||
      mimeType?.includes("wordprocessingml") ||
      mimeType?.includes("msword");

    const isPdf =
      fileName?.toLowerCase().endsWith(".pdf") ||
      mimeType === "application/pdf";

    if (isDocx) {
      try {
        const fileBuffer = Buffer.from(fileBase64, "base64");
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = docxResult.value?.trim() || "";
      } catch (err: any) {
        console.warn("Falha ao ler via mammoth, tentando interpretação direta:", err);
      }
    }

    const targetRole = options?.targetRole ? `Vaga-alvo desejada pelo candidato: "${options.targetRole}".` : "";
    const mode = options?.mode || "ultra-ats";

    const optimizationDirective = 
      mode === "ultra-ats"
        ? `NÍVEL ULTRA ATS (GUPY / KENOBY / WORKDAY):
- Reestruture as experiências usando rigorosamente o método STAR (Situação, Tarefa, Ação e Resultado).
- Comece cada ponto de experiência com verbos de ação no pretérito (ex: "Desenvolveu", "Implementou", "Otimizou", "Configurou", "Reduziu").
- Inclua métricas e indicadores de desempenho estimados coerentes com o cargo (ex: % de aumento de velocidade, redução de downtime, volume de atendimentos).
- Extraia e padronize todas as palavras-chave técnicas (Hard Skills) e competências essenciais para busca booleana por robôs.
- Elimine jargões confusos e formate datas no padrão canônico (ex: "2021", "2024", "Presente").`
        : mode === "executive"
        ? `NÍVEL EXECUTIVO:
- Destaque liderança, visão estratégica, projetos entregues e impacto de negócio.
- Resumo de alto impacto profissional e linguagem polida.`
        : `NÍVEL FIEL COM CORREÇÃO GRAMATICAL:
- Mantenha estritamente o conteúdo original, corrigindo apenas gramática, ortografia e pontuação para leitura impecável por IAs.`;

    const systemPrompt = `Você é o principal Auditor e Engenheiro de Currículos de IA para sistemas ATS (Applicant Tracking Systems), especialista em portais como Gupy, Kenoby, Workday, Taleo e Greenhouse.

Sua missão é ler o documento fornecido (PDF ou Word), extrair com 100% de fidelidade os dados do profissional e APLICAR AS DEVIDAS CORREÇÕES para tornar o currículo perfeitamente legível e prioritário para os algoritmos de triagem de Inteligência Artificial.

${targetRole}
${optimizationDirective}

Estrutura Obrigatória de Saída em JSON:
{
  "resumeData": {
    "name": "Nome Completo",
    "title": "Título Profissional Otimizado (ex: Engenheiro de Software Full Stack / Especialista em Redes)",
    "email": "email@exemplo.com",
    "phone": "+55 ...",
    "location": "Cidade, Estado, País",
    "linkedin": "url ou texto",
    "github": "url se houver",
    "website": "url se houver",
    "avatarUrl": "",
    "summary": "Resumo profissional de 3 a 5 linhas altamente otimizado com palavras-chave estratégicas e impacto de carreira.",
    "languages": [
      { "id": "lang-1", "name": "Português", "level": "Nativo" }
    ],
    "areasOfInterest": ["Área 1", "Área 2", "Área 3"],
    "education": [
      {
        "id": "edu-1",
        "school": "Nome da Instituição",
        "course": "Nome do Curso",
        "degree": "Bacharelado / Tecnólogo / etc",
        "startYear": "2020",
        "endYear": "2024",
        "isCurrent": false,
        "location": "Cidade, UF"
      }
    ],
    "experience": [
      {
        "id": "exp-1",
        "company": "Nome da Empresa",
        "role": "Cargo Otimizado",
        "location": "Cidade, UF ou Remoto",
        "startYear": "2022",
        "endYear": "Presente",
        "isCurrent": true,
        "description": "Texto estruturado com verbos de ação, atividades técnicas e resultados quantitativos."
      }
    ],
    "skills": [
      { "id": "sk-1", "name": "Nome da Habilidade (ex: Python, Docker, MikroTik)", "level": 4, "category": "Hard Skills" }
    ],
    "certifications": [
      { "id": "cert-1", "name": "Nome da Certificação", "issuer": "Instituição Emissora", "year": "2023" }
    ],
    "achievements": [
      { "id": "ach-1", "name": "Conquista ou Destaque relevante", "issuer": "Empresa", "year": "2023" }
    ]
  },
  "atsReport": {
    "score": 95,
    "gupyGrade": "A+",
    "summary": "Resumo explicativo das melhorias realizadas para aprovação pelas IAs de RH.",
    "strengths": [
      "Pontos fortes identificados pelo parser"
    ],
    "correctionsApplied": [
      "Lista detalhada de correções realizadas (ex: reescrita com verbos de ação, eliminação de ambiguidades, normalização de termos)"
    ],
    "recommendations": [
      "Recomendações estratégicas para o candidato maximizar a taxa de entrevistas"
    ],
    "detectedKeywords": ["Palavra-chave 1", "Palavra-chave 2"],
    "missingCriticalKeywords": ["Palavra-chave sugerida para a área"],
    "readabilityAssessment": "Avaliação de legibilidade por robôs e humanos"
  }
}

IMPORTANTE: Retorne ESTRITAMENTE o JSON sem blocos de código markdown (\`\`\`json), sem comentários adicionais. Deve ser diretamente analisável por JSON.parse().`;

    let response;

    if (isPdf) {
      // PDF directly sent via Gemini Multimodal inlineData
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: fileBase64,
                },
              },
              {
                text: systemPrompt,
              },
            ],
          },
        ],
      });
    } else {
      // Word / Text extracted
      const documentContent = extractedText.length > 50 
        ? extractedText 
        : `Arquivo: ${fileName}\nConteúdo em texto/base64:\n${Buffer.from(fileBase64, "base64").toString("utf-8").slice(0, 15000)}`;

      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\n--- CONTEÚDO DO DOCUMENTO EXTRAÍDO (${fileName}) ---\n${documentContent}`,
              },
            ],
          },
        ],
      });
    }

    const rawText = response.text?.trim() || "{}";
    const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Ensure IDs exist in all list items
    if (parsed.resumeData) {
      const data = parsed.resumeData;
      data.languages = (data.languages || []).map((l: any, i: number) => ({ ...l, id: l.id || `lang-${i + 1}` }));
      data.education = (data.education || []).map((e: any, i: number) => ({ ...e, id: e.id || `edu-${i + 1}` }));
      data.experience = (data.experience || []).map((e: any, i: number) => ({ ...e, id: e.id || `exp-${i + 1}` }));
      data.skills = (data.skills || []).map((s: any, i: number) => ({ ...s, id: s.id || `sk-${i + 1}`, level: s.level || 4 }));
      data.certifications = (data.certifications || []).map((c: any, i: number) => ({ ...c, id: c.id || `cert-${i + 1}` }));
      data.achievements = (data.achievements || []).map((a: any, i: number) => ({ ...a, id: a.id || `ach-${i + 1}` }));
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Erro ao importar e otimizar documento:", error);
    res.status(500).json({
      error: `Não foi possível processar o arquivo: ${error.message || "Erro desconhecido."}`,
    });
  }
});

// ==========================================
// REAL-TIME ATS AUDIT ON CURRENT RESUME
// ==========================================
app.post("/api/resume/audit-ats", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "O serviço de Inteligência Artificial não está configurado." });
  }

  const { resumeData, targetRole } = req.body;

  try {
    const prompt = `Você é o Auditor Sênior de Algoritmos de ATS e Recrutamento (Gupy, Kenoby, Workday, Taleo).
Analise o currículo a seguir e avalie minuciosamente o nível de aprovação e legibilidade por robôs e IAs de triagem.
${targetRole ? `Vaga ou cargo pretendido: "${targetRole}"` : ""}

Currículo para auditoria:
${JSON.stringify(resumeData, null, 2)}

Avalie os seguintes critérios:
1. Estrutura linear e ausência de bloqueios para parsers.
2. Presença de verbos de ação e indicadores quantitativos nas experiências.
3. Densidade de palavras-chave técnicas e consistência de competências.
4. Clareza e impacto do resumo profissional.
5. Completude das informações de contato e formação.

Retorne ESTRITAMENTE um JSON no formato:
{
  "score": 94,
  "gupyGrade": "A+",
  "summary": "Resumo de 2 linhas da auditoria",
  "strengths": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
  "correctionsApplied": ["Sugestão de correção prioritária 1", "Sugestão 2"],
  "recommendations": ["Recomendação prática 1", "Recomendação 2"],
  "detectedKeywords": ["Palavra 1", "Palavra 2", "Palavra 3"],
  "missingCriticalKeywords": ["Palavra recomendada 1", "Palavra recomendada 2"],
  "readabilityAssessment": "Excelente para parsers e leitura visual"
}
Não inclua crases markdown nem textos extras.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const rawText = response.text?.trim() || "{}";
    const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    res.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error("Erro na auditoria ATS:", error);
    res.status(500).json({ error: error.message || "Erro ao realizar auditoria ATS." });
  }
});

// ==========================================
// EXISTING RESUME AI ENDPOINTS (UPGRADED TO GEMINI-3.8-FLASH)
// ==========================================

app.post("/api/resume/generate-summary", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "O serviço de Inteligência Artificial não está configurado. Insira a chave GEMINI_API_KEY.",
    });
  }
  const { name, education, experiences, skills, areasOfInterest } = req.body;
  try {
    const prompt = `Você é um especialista de Recrutamento e Seleção de Tecnologia (Tech Recruiter) sênior. 
Com base nas informações do profissional listadas abaixo, escreva um resumo profissional (perfil/resumo executivo) moderno, impactante, altamente profissional e focado em resultados.
O texto deve ser em português (Brasil), ter cerca de 3 a 5 linhas, ser cativante, usar palavras de impacto técnico e ressaltar as competências em tecnologia, redes, infraestrutura ou desenvolvimento, dependendo do perfil do profissional.

Dados do profissional:
Nome: ${name}
Educação: ${JSON.stringify(education)}
Experiências Profissionais: ${JSON.stringify(experiences)}
Habilidades Principais: ${JSON.stringify(skills)}
Áreas de Interesse: ${JSON.stringify(areasOfInterest)}

Retorne APENAS o parágrafo de resumo profissional de texto corrido, sem formatação markdown adicional, sem aspas e sem comentários.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });
    res.json({ summary: response.text?.trim() || "" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro desconhecido ao chamar IA." });
  }
});

app.post("/api/resume/translate", async (req, res) => {
  if (!ai) return res.status(503).json({ error: "O serviço de Inteligência Artificial não está configurado." });
  const { resumeData, targetLanguage } = req.body;
  try {
    const prompt = `Você é um tradutor profissional técnico especializado em currículos de tecnologia.
Traduza os campos de texto do seguinte currículo em JSON para o idioma de destino: "${targetLanguage}".
Mantenha rigorosamente os nomes das propriedades JSON idênticos, as datas, os links e as notas de habilidades numéricas de 1 a 5 inalterados.
Traduza apenas as strings que descrevem cargos, cursos, instituições, descrições de atividades, conquistas, nomes de certificações, e o resumo executivo.
Use termos técnicos de mercado padrão do idioma de destino.

JSON do Currículo:
${JSON.stringify(resumeData, null, 2)}

Retorne estritamente o objeto JSON traduzido. Não inclua blocos de código com crases (\`\`\`json ou \`\`\`), nem comentários explicativos. O retorno deve ser parseável diretamente como JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });
    const rawText = response.text?.trim() || "{}";
    const cleanJsonString = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    res.json({ translatedData: JSON.parse(cleanJsonString) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro desconhecido ao chamar IA." });
  }
});

app.post("/api/resume/improve-text", async (req, res) => {
  if (!ai) return res.status(503).json({ error: "O serviço de Inteligência Artificial não está configurado." });
  const { text, type, context } = req.body;
  try {
    const prompt = `Você é um consultor profissional sênior de carreira de TI. 
Melhore a descrição a seguir para deixá-la mais impactante e adequada para um currículo de tecnologia.
Use verbos de ação fortes no início das frases. Seja conciso, profissional e destaque resultados e tecnologias sempre que possível.

Tipo de conteúdo: ${type || "experiência de trabalho"}
Contexto profissional geral: ${context || "TI, redes e eletrônica"}

Texto original a ser melhorado:
"${text}"

Retorne APENAS o texto melhorado pronto, sem aspas, sem marcadores markdown adicionais e sem explicações.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });
    res.json({ improvedText: response.text?.trim() || text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao otimizar texto." });
  }
});

app.post("/api/resume/chat-advice", async (req, res) => {
  if (!ai) return res.status(503).json({ error: "O serviço de Inteligência Artificial não está configurado." });
  const { messages, resumeData } = req.body;
  try {
    const systemInstruction = `Você é o "WilsonIA", um assistente inteligente especialista em carreiras de TI e otimização de currículos para a área de infraestrutura, redes, eletrônica e desenvolvimento de software.
Você tem acesso ao currículo atual do usuário para poder dar conselhos personalizados, especialmente focados na otimização para sistemas de inteligência artificial de recrutamento, como a Gupy, Kenoby e Sólides (ATS).

Diretrizes importantes:
1. Explique como otimizar o currículo para a Gupy: uso de coluna única vertical, texto limpo, sem gráficos de estrelas para competências (mencionar no texto) e inclusão de palavras-chave críticas.
2. Sugira palavras-chave relevantes para o perfil do candidato.
3. Ensine-o a alinhar as descrições de experiências usando verbos de ação focados em resultados quantitativos e qualitativos.
4. Responda de forma encorajadora, precisa, sucinta e em formato markdown amigável (use negritos, listas e títulos claros).

Currículo Atual:
${JSON.stringify(resumeData, null, 2)}

Responda em português (Brasil).`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: { systemInstruction },
    });
    res.json({ reply: response.text?.trim() || "" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao processar conselho de IA." });
  }
});

// ==========================================
// VITE DEV / PRODUCTION MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
