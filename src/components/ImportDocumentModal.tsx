import React, { useState, useRef } from "react";
import { ResumeData, AtsReport, ImportOptimizationMode } from "../types";
import { 
  Upload, FileText, Sparkles, CheckCircle2, AlertCircle, 
  ShieldCheck, Cpu, RefreshCw, X, Zap 
} from "lucide-react";

interface ImportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResume: (parsedData: ResumeData, atsReport: AtsReport, asNewResume: boolean, title?: string) => void;
}

export default function ImportDocumentModal({
  isOpen,
  onClose,
  onApplyResume,
}: ImportDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<ImportOptimizationMode>("ultra-ats");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [resultData, setResultData] = useState<{
    resumeData: ResumeData;
    atsReport: AtsReport;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setError(null);
    const validExtensions = [".pdf", ".docx", ".doc", ".txt"];
    const ext = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf("."));

    if (!validExtensions.includes(ext)) {
      setError("Por favor, selecione um arquivo em formato PDF (.pdf) ou Word (.docx, .doc).");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("O arquivo é muito grande. O limite máximo é de 20MB.");
      return;
    }

    setFile(selectedFile);
  };

  const convertFileToBase64 = (fileObj: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileObj);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProcessDocument = async () => {
    if (!file) {
      setError("Selecione um arquivo PDF ou Word antes de prosseguir.");
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep("Lendo arquivo e preparando análise semântica...");

    try {
      const base64 = await convertFileToBase64(file);

      setLoadingStep("Gemini IA: analisando seções, histórico e competências...");

      const response = await fetch("/api/resume/import-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          options: {
            mode,
            targetRole: targetRole.trim(),
            addMissingKeywords: true,
          },
        }),
      });

      setLoadingStep("Otimizando gramática, verbos de ação e aderência para bots ATS...");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao processar documento com IA.");
      }

      setResultData(data);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao ler arquivo com IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultData(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Importar PDF / Word com IA</h2>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-[10px] font-bold uppercase tracking-wider">
                  ATS & Gupy Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Transforme currículos brutos em modelos acessíveis e de alta pontuação para robôs de triagem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!resultData ? (
            <>
              {/* Drop area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                    : file
                    ? "border-emerald-300 bg-emerald-50/20"
                    : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{file.name}</span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Clique ou arraste outro para trocar
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <Upload className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Arraste e solte seu arquivo PDF ou Word aqui
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Suporte a arquivos <strong>.pdf</strong>, <strong>.docx</strong> e <strong>.doc</strong> de até 20MB
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm">
                      Procurar arquivo no computador
                    </span>
                  </div>
                )}
              </div>

              {/* Optimization Settings */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Diretrizes de Otimização para IAs de RH
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMode("ultra-ats")}
                    className={`p-3 rounded-xl border text-left transition ${
                      mode === "ultra-ats"
                        ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                        : "bg-white/50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      Ultra ATS (Gupy)
                      {mode === "ultra-ats" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Reescreve com verbos de ação, métricas STAR e normaliza palavras-chave para leitura linear de robôs.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("executive")}
                    className={`p-3 rounded-xl border text-left transition ${
                      mode === "executive"
                        ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                        : "bg-white/50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      Executivo & Impacto
                      {mode === "executive" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Foco em resultados estratégicos, liderança e entrega de projetos de grande porte.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("faithful")}
                    className={`p-3 rounded-xl border text-left transition ${
                      mode === "faithful"
                        ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                        : "bg-white/50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      Fiel com Correções
                      {mode === "faithful" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Preserva fielmente o texto original, corrigindo gramática, pontuação e falhas de formatação.
                    </p>
                  </button>
                </div>

                {/* Target role optional input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo ou Vaga Pretendida (Opcional - calibra as palavras-chave no modelo)
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Ex: Desenvolvedor Back-End Python / Especialista em Redes FTTH"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Results & ATS Audit View */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Score card */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center border border-white/30 shrink-0">
                    <span className="text-2xl font-black">{resultData.atsReport.score}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">ATS Score</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">Currículo Processado & Otimizado</h3>
                      <span className="px-2 py-0.5 bg-white/25 text-white rounded text-xs font-black">
                        Nota {resultData.atsReport.gupyGrade}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                      {resultData.atsReport.summary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-medium transition shrink-0"
                >
                  Importar Outro
                </button>
              </div>

              {/* What was improved by AI */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Correções e Melhorias Aplicadas para Leitura por IAs:
                </h4>
                <ul className="space-y-1.5">
                  {resultData.atsReport.correctionsApplied.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detected Keywords */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  Palavras-Chave Identificadas pelo Algoritmo:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {resultData.atsReport.detectedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extracted preview info */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs space-y-1 text-slate-700">
                <p>
                  <strong>Nome extraído:</strong> {resultData.resumeData.name} ({resultData.resumeData.title})
                </p>
                <p>
                  <strong>Experiências estruturadas:</strong> {resultData.resumeData.experience.length} posições
                  profissionais • <strong>Educação:</strong> {resultData.resumeData.education.length} formações •{" "}
                  <strong>Habilidades:</strong> {resultData.resumeData.skills.length} competências
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
          >
            Fechar
          </button>

          {!resultData ? (
            <button
              onClick={handleProcessDocument}
              disabled={!file || loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {loadingStep || "Processando com Gemini..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Processar e Otimizar com IA
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onApplyResume(resultData.resumeData, resultData.atsReport, false);
                  onClose();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
              >
                Substituir no Editor Atual
              </button>
              <button
                onClick={() => {
                  const title = `Currículo Importado (${resultData.resumeData.title || "IA ATS"})`;
                  onApplyResume(resultData.resumeData, resultData.atsReport, true, title);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salvar como Nova Versão no Perfil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
