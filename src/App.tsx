import { useState, useEffect } from "react";
import { initialResumeData } from "./data.ts";
import { 
  ResumeData, ResumeTemplate, Experience, Education, 
  Skill, Certification, UserProfile, SavedResume, AtsReport 
} from "./types.ts";
import ResumePreview from "./components/ResumePreview.tsx";
import AuthModal from "./components/AuthModal.tsx";
import ResumeManagerModal from "./components/ResumeManagerModal.tsx";
import ImportDocumentModal from "./components/ImportDocumentModal.tsx";
import AtsReportModal from "./components/AtsReportModal.tsx";
import { 
  FileText, Sparkles, Download, Languages, Edit, RotateCcw, 
  Plus, Trash2, Send, Bot, AlertCircle, RefreshCw, 
  Award, X, ExternalLink, Printer, FolderKanban, 
  ShieldCheck, CheckCircle2, UploadCloud, Save, ChevronDown
} from "lucide-react";

export default function App() {
  // Current Active User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const cached = localStorage.getItem("curriculo_user");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      id: "user-wilson",
      name: "Wilson Sampaio",
      email: "wilsonluissampaio@gmail.com",
      headline: "Especialista em Redes / Dev Back-End / FTTH",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
      createdAt: new Date().toISOString(),
    };
  });

  // Saved Resumes for the active user
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>(() => {
    try {
      const cached = localStorage.getItem("curriculo_resumes");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [
      {
        id: "resume-wilson-primary",
        userId: "user-wilson",
        title: "Currículo Principal (Otimizado Gupy/ATS)",
        template: "gupy",
        targetRole: "Especialista em Redes & Dev Back-End",
        data: initialResumeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        atsScore: 96,
      },
    ];
  });

  const [activeResumeId, setActiveResumeId] = useState<string>("resume-wilson-primary");
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [template, setTemplate] = useState<ResumeTemplate>("gupy");
  const [activeTab, setActiveTab] = useState<"edit" | "ai-coach">("edit");
  const [showPrintModal, setShowPrintModal] = useState(false);

  // User management & Document Import Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showResumeManagerModal, setShowResumeManagerModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAtsReportModal, setShowAtsReportModal] = useState(false);

  // ATS Score & Audit state
  const [atsScore, setAtsScore] = useState<number>(96);
  const [atsReport, setAtsReport] = useState<AtsReport | null>(null);
  const [isAuditingAts, setIsAuditingAts] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  
  // AI State
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isImproving, setIsImproving] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState("Inglês");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chat/Coach State
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { 
      role: "assistant", 
      content: "Olá Wilson! Sou o **WilsonIA**, seu assistente de carreira e recrutador de TI virtual. Analisei seu currículo e vi que você tem excelentes competências em Redes, MikroTik, FTTH e está se capacitando em Python, Inteligência Artificial e QA. Como posso ajudar você hoje? Posso simular uma entrevista técnica, sugerir melhorias ou ajudar na busca por vagas!" 
    }
  ]);
  const [userQuery, setUserQuery] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);


  // --- RESUME EDITORS ACTION HANDLERS ---
  const handlePersonalUpdate = (field: keyof ResumeData, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayUpdate = <T extends { id: string }>(
    field: "experience" | "education" | "skills" | "certifications" | "languages",
    id: string,
    updater: (item: T) => T
  ) => {
    setResumeData(prev => ({
      ...prev,
      [field]: (prev[field] as unknown as T[]).map(item => item.id === id ? updater(item) : item)
    }));
  };

  const handleAddListItem = (field: "experience" | "education" | "skills" | "certifications" | "languages") => {
    const newId = `${field}-${Date.now()}`;
    let newItem: any;

    if (field === "experience") {
      newItem = { id: newId, company: "Nova Empresa", role: "Novo Cargo", location: "Ceará, Brasil", startYear: "2026", endYear: "Presente", isCurrent: true, description: "Descrição das atividades profissionais realizadas." };
    } else if (field === "education") {
      newItem = { id: newId, school: "Nova Instituição", course: "Novo Curso", degree: "Graduação", startYear: "2025", endYear: "2028", isCurrent: false, location: "Fortaleza, CE" };
    } else if (field === "skills") {
      newItem = { id: newId, name: "Nova Competência", level: 3, category: "Hard Skills" };
    } else if (field === "certifications") {
      newItem = { id: newId, name: "Nova Certificação", issuer: "Instituição Emissora" };
    } else if (field === "languages") {
      newItem = { id: newId, name: "Novo Idioma", level: "Intermediário" };
    }

    setResumeData(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  const handleRemoveListItem = (field: "experience" | "education" | "skills" | "certifications" | "languages", id: string) => {
    setResumeData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter(item => item.id !== id)
    }));
  };

  // --- BACKEND API GEMINI INTEGATION CALLS ---

  // Generate customized, high-impact executive summary based on all resume data
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/resume/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resumeData.name,
          education: resumeData.education,
          experiences: resumeData.experience,
          skills: resumeData.skills,
          areasOfInterest: resumeData.areasOfInterest,
        }),
      });

      if (!response.ok) throw new Error("Falha ao se comunicar com o servidor de IA.");
      const result = await response.json();
      if (result.summary) {
        setResumeData(prev => ({ ...prev, summary: result.summary }));
      } else if (result.error) {
        setErrorMsg(result.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro inesperado.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Improve experience descriptions with expert AI phrasing
  const handleImproveText = async (text: string, id: string, fieldType: string) => {
    setIsImproving(id);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/resume/improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          type: fieldType,
          context: "Wilson Sampaio - Especialista em Redes e Desenvolvedor Back-end Python",
        }),
      });

      if (!response.ok) throw new Error("Erro de comunicação com o servidor.");
      const result = await response.json();
      
      if (result.improvedText) {
        if (fieldType === "summary") {
          setResumeData(prev => ({ ...prev, summary: result.improvedText }));
        } else {
          // Update specific experience description
          handleArrayUpdate<Experience>("experience", id, (item) => ({
            ...item,
            description: result.improvedText
          }));
        }
      } else if (result.error) {
        setErrorMsg(result.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao otimizar texto.");
    } finally {
      setIsImproving(null);
    }
  };

  // Translate entire structure using JSON payload mapping
  const handleTranslateResume = async () => {
    setIsTranslating(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/resume/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          targetLanguage: targetLang,
        }),
      });

      if (!response.ok) throw new Error("Erro ao traduzir documento.");
      const result = await response.json();
      
      if (result.translatedData) {
        // Deep copy translated values safely
        setResumeData(result.translatedData);
      } else if (result.rawOutput) {
        // Fallback or alert if model gave raw output
        setErrorMsg("A IA retornou um formato não-padrão. Tente novamente.");
      } else if (result.error) {
        setErrorMsg(result.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão com o tradutor AI.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Chat with custom Career Coach / Interview simulator
  const handleSendChatMessage = async () => {
    if (!userQuery.trim() || isSendingChat) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: userQuery }];
    setChatMessages(newMessages);
    setUserQuery("");
    setIsSendingChat(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/resume/chat-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          resumeData: resumeData,
        }),
      });

      if (!response.ok) throw new Error("Erro de conexão com o assistente.");
      const result = await response.json();
      
      if (result.reply) {
        setChatMessages(prev => [...prev, { role: "assistant", content: result.reply }]);
      } else if (result.error) {
        setErrorMsg(result.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro no chat de IA.");
    } finally {
      setIsSendingChat(false);
    }
  };

  // --- PERSISTENCE & USER PROFILE HANDLERS ---
  
  // Cache user and resumes in localStorage as instant offline backup
  useEffect(() => {
    try {
      localStorage.setItem("curriculo_user", JSON.stringify(currentUser));
      localStorage.setItem("curriculo_resumes", JSON.stringify(savedResumes));
    } catch (e) {}
  }, [currentUser, savedResumes]);

  // Keep active resume in sync with resumeData edits
  useEffect(() => {
    setSavedResumes(prev => prev.map(r => r.id === activeResumeId ? {
      ...r,
      data: resumeData,
      template: template,
      updatedAt: new Date().toISOString(),
    } : r));
  }, [resumeData, template]);

  const handleLoginSuccess = (user: UserProfile, resumes: SavedResume[], activeId: string) => {
    setCurrentUser(user);
    if (resumes && resumes.length > 0) {
      setSavedResumes(resumes);
      const target = resumes.find(r => r.id === activeId) || resumes[0];
      setActiveResumeId(target.id);
      setResumeData(target.data);
      setTemplate(target.template || "gupy");
      if (target.atsScore) setAtsScore(target.atsScore);
      if (target.lastAtsReport) setAtsReport(target.lastAtsReport);
    }
  };

  const handleSwitchResume = (resumeId: string) => {
    const target = savedResumes.find(r => r.id === resumeId);
    if (target) {
      setActiveResumeId(target.id);
      setResumeData(target.data);
      setTemplate(target.template || "gupy");
      if (target.atsScore) setAtsScore(target.atsScore);
      if (target.lastAtsReport) setAtsReport(target.lastAtsReport);
      setShowResumeManagerModal(false);
    }
  };

  const handleCreateResume = async (title: string, newTemplate: ResumeTemplate) => {
    const newResumeId = `resume-${Date.now()}`;
    const newResume: SavedResume = {
      id: newResumeId,
      userId: currentUser.id,
      title,
      template: newTemplate,
      targetRole: title,
      data: {
        ...resumeData,
        title,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      atsScore: 92,
    };

    try {
      await fetch("/api/user/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResume),
      });
    } catch (e) {
      console.warn("Erro ao salvar currículo no servidor:", e);
    }

    setSavedResumes(prev => [...prev, newResume]);
    setActiveResumeId(newResumeId);
    setResumeData(newResume.data);
    setTemplate(newTemplate);
    setShowResumeManagerModal(false);
  };

  const handleDuplicateResume = async (resumeId: string) => {
    const source = savedResumes.find(r => r.id === resumeId);
    if (!source) return;

    const dupId = `resume-${Date.now()}`;
    const dupResume: SavedResume = {
      ...source,
      id: dupId,
      title: `${source.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/user/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dupResume),
      });
    } catch (e) {}

    setSavedResumes(prev => [...prev, dupResume]);
    setActiveResumeId(dupId);
    setResumeData(dupResume.data);
    setTemplate(dupResume.template);
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (savedResumes.length <= 1) return;
    if (!confirm("Tem certeza que deseja excluir esta versão do currículo?")) return;

    try {
      await fetch(`/api/user/resumes/${resumeId}`, { method: "DELETE" });
    } catch (e) {}

    const remaining = savedResumes.filter(r => r.id !== resumeId);
    setSavedResumes(remaining);

    if (activeResumeId === resumeId) {
      const next = remaining[0];
      setActiveResumeId(next.id);
      setResumeData(next.data);
      setTemplate(next.template);
    }
  };

  const handleSaveToProfile = async () => {
    setSaveStatus("saving");
    try {
      const current = savedResumes.find(r => r.id === activeResumeId);
      const title = current?.title || `Currículo ${currentUser.name}`;

      await fetch(`/api/user/resumes/${activeResumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          template,
          data: resumeData,
          atsScore,
          lastAtsReport: atsReport,
        }),
      });

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (e) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  const handleApplyImportedResume = async (
    parsedData: ResumeData, 
    report: AtsReport, 
    asNewResume: boolean, 
    title?: string
  ) => {
    setAtsReport(report);
    setAtsScore(report.score);

    if (asNewResume) {
      const newResumeId = `resume-${Date.now()}`;
      const newResume: SavedResume = {
        id: newResumeId,
        userId: currentUser.id,
        title: title || `Currículo Importado (${parsedData.title || "IA ATS"})`,
        template: "gupy",
        targetRole: parsedData.title || "Tecnologia",
        data: parsedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        atsScore: report.score,
        lastAtsReport: report,
      };

      try {
        await fetch("/api/user/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newResume),
        });
      } catch (e) {}

      setSavedResumes(prev => [...prev, newResume]);
      setActiveResumeId(newResumeId);
      setResumeData(parsedData);
      setTemplate("gupy");
    } else {
      setResumeData(parsedData);
      setTemplate("gupy");
    }

    setChatMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: `🎉 **Currículo importado com sucesso a partir do seu documento!**\n\nA IA estruturou o documento e aplicou otimizações para **ATS e Gupy com Nota ${report.gupyGrade} (${report.score}%)**.\n\nPrincipais correções aplicadas:\n${report.correctionsApplied.map(c => `• ${c}`).join("\n")}\n\nVocê pode continuar refinando cada seção pelo editor ou me perguntar sobre vagas e dicas!`
      }
    ]);
  };

  const handleRunAtsAudit = async () => {
    setIsAuditingAts(true);
    setShowAtsReportModal(true);
    try {
      const res = await fetch("/api/resume/audit-ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          targetRole: resumeData.title,
        }),
      });
      const report = await res.json();
      if (report.score) {
        setAtsReport(report);
        setAtsScore(report.score);
      }
    } catch (e) {
      console.error("Erro na auditoria:", e);
    } finally {
      setIsAuditingAts(false);
    }
  };

  // Reset to default data
  const handleResetData = () => {
    if (confirm("Deseja realmente restaurar os dados originais extraídos do documento?")) {
      setResumeData(initialResumeData);
    }
  };

  // Quick action: Print/Export to PDF
  const handlePrint = () => {
    setShowPrintModal(true);
    try {
      window.print();
    } catch (e) {
      console.warn("Falha ao invocar print no ambiente sandbox:", e);
    }
  };

  const currentResumeTitle = savedResumes.find(r => r.id === activeResumeId)?.title || "Currículo Ativo";

  return (
    <div id="resume-dashboard-root" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col print:bg-white print:text-black">
      {/* Top Banner (No Print) */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 py-3 px-4 md:px-6 sticky top-0 z-40 no-print flex flex-col xl:flex-row justify-between items-center gap-3">
        {/* Brand & Active Resume */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 p-2 rounded-xl font-bold flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">{resumeData.name || currentUser.name}</h1>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded text-[10px] font-bold">
                  {currentResumeTitle}
                </span>
              </div>
              <p className="text-[11px] text-amber-400 font-semibold tracking-wider flex items-center gap-1.5">
                <span>ATS & IA Resume Engine</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-normal">Gupy / Kenoby / Workday Compliant</span>
              </p>
            </div>
          </div>

          {/* User profile mobile button */}
          <div className="xl:hidden flex items-center gap-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 text-xs"
            >
              <img src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=WS"} alt="" className="w-5 h-5 rounded-full" />
              <span className="truncate max-w-[80px]">{currentUser.name.split(" ")[0]}</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto justify-between xl:justify-end">
          {/* IMPORT PDF / WORD BUTTON */}
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm hover:shadow cursor-pointer"
            title="Criar ou atualizar currículo a partir de um PDF ou Word com correção automática para IAs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Importar PDF / Word</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded font-extrabold uppercase ml-0.5">
              IA
            </span>
          </button>

          {/* ATS SCORE BADGE */}
          <button
            onClick={handleRunAtsAudit}
            className="px-3 py-2 bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Auditar pontuação para algoritmos ATS (Gupy)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Score ATS: {atsScore}%</span>
            <span className="text-[10px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-black">
              {atsReport?.gupyGrade || "A+"}
            </span>
          </button>

          {/* MEUS CURRÍCULOS (VERSÕES) */}
          <button
            onClick={() => setShowResumeManagerModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Gerenciar diferentes versões salvas deste currículo"
          >
            <FolderKanban className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Meus Currículos</span>
            <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center">
              {savedResumes.length}
            </span>
          </button>

          {/* USER PROFILE CHIP (DESKTOP) */}
          <div className="hidden xl:flex items-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 flex items-center gap-2 transition"
              title="Perfil do Usuário e Login"
            >
              <img
                src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                alt=""
                className="w-5 h-5 rounded-full object-cover border border-slate-600"
              />
              <div className="text-left">
                <span className="block font-semibold text-[11px] leading-tight text-white">
                  {currentUser.name}
                </span>
                <span className="block text-[9px] text-slate-400 leading-tight">
                  Conta Ativa • Trocar
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* SAVE TO PROFILE BUTTON */}
          <button
            onClick={handleSaveToProfile}
            disabled={saveStatus === "saving"}
            className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
              saveStatus === "saved"
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
            title="Salvar alterações no perfil e na nuvem"
          >
            {saveStatus === "saving" ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salvo!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </>
            )}
          </button>

          {/* Template Selectors */}
          <div className="hidden lg:flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            {(["gupy", "modern", "tech", "classic", "minimal"] as ResumeTemplate[]).map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  template === t 
                    ? "bg-amber-500 text-slate-950 font-bold shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "gupy" && "Gupy ATS"}
                {t === "modern" && "Moderno"}
                {t === "tech" && "Tech"}
                {t === "classic" && "Clássico"}
                {t === "minimal" && "Minimal"}
              </button>
            ))}
          </div>

          {/* Export to PDF / Print */}
          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetData}
            title="Restaurar dados originais"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main workspace (No Print layout adapts) */}
      <main className="flex-1 flex flex-col lg:flex-row print:block">
        
        {/* Left pane: Control Panel & Editors (No Print) */}
        <section className="w-full lg:w-[45%] bg-white border-r border-slate-200 flex flex-col no-print max-h-[calc(100vh-73px)] overflow-y-auto">
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "edit"
                  ? "border-amber-500 text-slate-900 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Edit className="w-4 h-4" /> Editar Informações
            </button>
            <button
              onClick={() => setActiveTab("ai-coach")}
              className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "ai-coach"
                  ? "border-amber-500 text-slate-900 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bot className="w-4 h-4 text-purple-600" /> WilsonIA Copiloto
              <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">Novo</span>
            </button>
          </div>

          {/* Error notification banner if any */}
          {errorMsg && (
            <div className="m-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Aviso</p>
                <p>{errorMsg}</p>
                <p className="mt-1 text-[10px] opacity-80">Por favor, verifique se a chave de API do Gemini está configurada nos segredos ou tente novamente.</p>
              </div>
            </div>
          )}

          {/* TAB 1: EDIT FORM */}
          {activeTab === "edit" && (
            <div className="p-6 space-y-8 pb-12" id="edit-panel">
              {/* AI Quick Actions Widget */}
              <div className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ações Rápidas por Inteligência Artificial</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Generate profile with AI */}
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isGeneratingSummary ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    Gerar Perfil por IA
                  </button>

                  {/* Translate */}
                  <div className="flex items-center border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden">
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="text-xs font-semibold text-slate-700 px-2.5 py-2 bg-transparent focus:outline-none border-r border-slate-200 shrink-0"
                    >
                      <option value="Inglês">Inglês</option>
                      <option value="Espanhol">Espanhol</option>
                      <option value="Português">Português</option>
                    </select>
                    <button
                      onClick={handleTranslateResume}
                      disabled={isTranslating}
                      className="flex-1 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-2.5 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {isTranslating ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-500" />
                      ) : (
                        <Languages className="w-3.5 h-3.5 text-purple-500" />
                      )}
                      Traduzir
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Data Block */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">Informações de Contato</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Nome</label>
                    <input
                      type="text"
                      value={resumeData.name}
                      onChange={(e) => handlePersonalUpdate("name", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Cargo / Título</label>
                    <input
                      type="text"
                      value={resumeData.title}
                      onChange={(e) => handlePersonalUpdate("title", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">E-mail</label>
                    <input
                      type="email"
                      value={resumeData.email}
                      onChange={(e) => handlePersonalUpdate("email", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Telefone</label>
                    <input
                      type="text"
                      value={resumeData.phone}
                      onChange={(e) => handlePersonalUpdate("phone", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Localização</label>
                    <input
                      type="text"
                      value={resumeData.location}
                      onChange={(e) => handlePersonalUpdate("location", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">LinkedIn</label>
                    <input
                      type="text"
                      value={resumeData.linkedin}
                      onChange={(e) => handlePersonalUpdate("linkedin", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Instagram</label>
                    <input
                      type="text"
                      value={resumeData.instagram || ""}
                      onChange={(e) => handlePersonalUpdate("instagram", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Summary Block */}
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Perfil Profissional</h3>
                  <button
                    onClick={() => handleImproveText(resumeData.summary, "summary", "summary")}
                    disabled={isImproving === "summary"}
                    className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 hover:bg-amber-100/80 px-2 py-1 rounded transition"
                  >
                    {isImproving === "summary" ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-600" />
                    )}
                    Melhorar com IA
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={resumeData.summary}
                  onChange={(e) => handlePersonalUpdate("summary", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed font-medium focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Work Experience Block */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Experiências Profissionais</h3>
                  <button
                    onClick={() => handleAddListItem("experience")}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3 relative group">
                      <button
                        onClick={() => handleRemoveListItem("experience", exp.id)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Empresa</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleArrayUpdate<Experience>("experience", exp.id, item => ({ ...item, company: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Cargo</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleArrayUpdate<Experience>("experience", exp.id, item => ({ ...item, role: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Início</label>
                          <input
                            type="text"
                            value={exp.startYear}
                            onChange={(e) => handleArrayUpdate<Experience>("experience", exp.id, item => ({ ...item, startYear: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Término</label>
                          <input
                            type="text"
                            value={exp.endYear}
                            onChange={(e) => handleArrayUpdate<Experience>("experience", exp.id, item => ({ ...item, endYear: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição das atividades</label>
                          <button
                            onClick={() => handleImproveText(exp.description, exp.id, "experiência de trabalho")}
                            disabled={isImproving === exp.id}
                            className="text-[10px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded transition"
                          >
                            {isImproving === exp.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3 text-purple-500" />
                            )}
                            Otimizar com IA
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => handleArrayUpdate<Experience>("experience", exp.id, item => ({ ...item, description: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs leading-relaxed font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Block */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Educação & Formação</h3>
                  <button
                    onClick={() => handleAddListItem("education")}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                <div className="space-y-4">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3 relative group">
                      <button
                        onClick={() => handleRemoveListItem("education", edu.id)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Instituição</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => handleArrayUpdate<Education>("education", edu.id, item => ({ ...item, school: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Curso</label>
                          <input
                            type="text"
                            value={edu.course}
                            onChange={(e) => handleArrayUpdate<Education>("education", edu.id, item => ({ ...item, course: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Grau / Tipo</label>
                          <input
                            type="text"
                            value={edu.degree || ""}
                            onChange={(e) => handleArrayUpdate<Education>("education", edu.id, item => ({ ...item, degree: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Local</label>
                          <input
                            type="text"
                            value={edu.location || ""}
                            onChange={(e) => handleArrayUpdate<Education>("education", edu.id, item => ({ ...item, location: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Ano Início</label>
                          <input
                            type="text"
                            value={edu.startYear}
                            onChange={(e) => handleArrayUpdate<Education>("education", edu.id, item => ({ ...item, startYear: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Ano Término</label>
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={(e) => handleArrayUpdate<Education>("education", edu.id, item => ({ ...item, endYear: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Block */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Habilidades & Níveis</h3>
                  <button
                    onClick={() => handleAddListItem("skills")}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {resumeData.skills.map((skill) => (
                    <div key={skill.id} className="flex gap-2.5 items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-lg text-xs relative group">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => handleArrayUpdate<Skill>("skills", skill.id, item => ({ ...item, name: e.target.value }))}
                        className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 font-semibold focus:outline-none"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => handleArrayUpdate<Skill>("skills", skill.id, item => ({ ...item, level: parseInt(e.target.value) }))}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium focus:outline-none shrink-0"
                      >
                        <option value="1">1 / 5 (Iniciante)</option>
                        <option value="2">2 / 5 (Básico)</option>
                        <option value="3">3 / 5 (Intermediário)</option>
                        <option value="4">4 / 5 (Avançado)</option>
                        <option value="5">5 / 5 (Especialista)</option>
                      </select>

                      <button
                        onClick={() => handleRemoveListItem("skills", skill.id)}
                        className="text-slate-400 hover:text-red-500 p-1 transition opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Block */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Certificações</h3>
                  <button
                    onClick={() => handleAddListItem("certifications")}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                <div className="space-y-2">
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id} className="flex gap-2 bg-slate-50 border border-slate-200/50 p-3 rounded-xl relative group">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          value={cert.name}
                          placeholder="Nome da Certificação"
                          onChange={(e) => handleArrayUpdate<Certification>("certifications", cert.id, item => ({ ...item, name: e.target.value }))}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          placeholder="Emissor"
                          onChange={(e) => handleArrayUpdate<Certification>("certifications", cert.id, item => ({ ...item, issuer: e.target.value }))}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveListItem("certifications", cert.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 self-center opacity-0 group-hover:opacity-100 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI CAREER COACH CHAT */}
          {activeTab === "ai-coach" && (
            <div className="flex-1 flex flex-col min-h-[500px]" id="ai-chat-panel">
              {/* Context Info header */}
              <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center gap-3 shrink-0">
                <Bot className="w-8 h-8 text-purple-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-purple-950">WilsonIA - Consultoria de TI & Entrevistas</p>
                  <p className="text-purple-700/80">Faça simulações de perguntas técnicas, peça dicas de capacitação ou ideias de vagas remotas.</p>
                </div>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-270px)] min-h-[300px]">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.role === "user" 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {msg.role === "user" ? "WS" : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                        msg.role === "user"
                          ? "bg-amber-500 border-amber-600 text-white"
                          : "bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isSendingChat && (
                  <div className="flex gap-3 mr-auto max-w-[80%] items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                    </div>
                    <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 italic">
                      WilsonIA está digitando uma resposta especializada...
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions chips */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto whitespace-nowrap shrink-0 text-[10px] no-scrollbar">
                {[
                  "Simular uma pergunta de entrevista técnica sobre MikroTik.",
                  "Quais são as melhores vagas remotas para desenvolvedor Python Back-end?",
                  "Que outras competências devo adicionar para atuar com IA?",
                  "Me dê dicas para melhorar meu perfil para vaga de Analista de QA."
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => setUserQuery(chip)}
                    className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full font-semibold transition shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    placeholder="Faça uma pergunta sobre carreira, entrevistas ou peça sugestões..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={isSendingChat || !userQuery.trim()}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition disabled:opacity-40 shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right pane: Interactive Live Preview Block */}
        <section className="flex-1 bg-slate-800 p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-73px)] print:bg-white print:p-0 print:max-h-none flex flex-col items-center">
          {/* Quick instructions for user (No Print) */}
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 text-slate-300 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print shadow-lg">
            <div className="flex gap-3 items-center">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">Visualização em Tempo Real (PDF ready)</p>
                <p className="text-slate-400">Qualquer alteração feita no painel esquerdo é atualizada imediatamente no template.</p>
              </div>
            </div>
            <div className="text-slate-500 text-[11px] font-mono shrink-0">
              Template Ativo: <span className="text-amber-400 font-bold uppercase">{template}</span>
            </div>
          </div>

          {/* Actual resume rendering container */}
          <div id="resume-preview-wrapper" className="w-full max-w-[850px] shadow-2xl rounded-xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:w-full print:m-0 print:p-0">
            <ResumePreview data={resumeData} template={template} />
          </div>
        </section>
      </main>

      {/* Print/Export Guidance Modal */}
      {showPrintModal && (
        <div id="print-guide-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Instruções de Exportação PDF Limpo</h3>
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed">
                Para gerar o documento em PDF <strong>100% limpo</strong> (sem endereço do sistema, URLs ou rodapés de navegador), siga as etapas abaixo:
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4" /> Passo a passo para o PDF perfeito:
                </h4>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed text-slate-700">
                  <li>
                    Se estiver no preview do AI Studio, clique em <strong className="text-slate-900">"Abrir em nova aba"</strong> (ícone ↗ no topo direito).
                  </li>
                  <li>
                    Na tela de impressão, escolha o destino: <strong className="text-slate-900">"Salvar como PDF"</strong>.
                  </li>
                  <li>
                    <strong className="text-emerald-800">SEM ENDEREÇO / URL:</strong> Em "Mais definições", <strong>desmarque a opção "Cabeçalhos e rodapés"</strong> (Headers and footers). Assim, nenhum link ou data será impresso!
                  </li>
                  <li>
                    <strong className="text-amber-800">CORES E ESTILOS:</strong> Ative a opção <strong>"Gráficos de segundo plano"</strong> (Background graphics) para preservar todas as cores e destaques.
                  </li>
                  <li>
                    Defina <strong>Margens</strong> como <strong>"Nenhuma"</strong> ou <strong>"Padrão"</strong> (o sistema já aplica os espaçamentos ideais).
                  </li>
                </ol>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-semibold transition text-center cursor-pointer"
                >
                  Fechar guia
                </button>
                <button
                  onClick={() => {
                    try {
                      window.print();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Resume Versions & Manager Modal */}
      <ResumeManagerModal
        isOpen={showResumeManagerModal}
        onClose={() => setShowResumeManagerModal(false)}
        currentUser={currentUser}
        resumes={savedResumes}
        activeResumeId={activeResumeId}
        onSelectResume={handleSwitchResume}
        onCreateResume={handleCreateResume}
        onDuplicateResume={handleDuplicateResume}
        onDeleteResume={handleDeleteResume}
      />

      {/* PDF / Word Document Importer with AI ATS Optimization */}
      <ImportDocumentModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onApplyResume={handleApplyImportedResume}
      />

      {/* ATS Compatibility & Audit Report Modal */}
      <AtsReportModal
        isOpen={showAtsReportModal}
        onClose={() => setShowAtsReportModal(false)}
        report={atsReport}
        loading={isAuditingAts}
        onRefreshAudit={handleRunAtsAudit}
      />
    </div>
  );
}

