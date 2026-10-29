import React, { useState } from "react";
import { UserProfile, SavedResume, ResumeTemplate } from "../types";
import { 
  FileText, Plus, Copy, Trash2, Check, Sparkles, 
  Clock, Download, X, ShieldCheck 
} from "lucide-react";

interface ResumeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  resumes: SavedResume[];
  activeResumeId: string;
  onSelectResume: (resumeId: string) => void;
  onCreateResume: (title: string, template: ResumeTemplate) => void;
  onDuplicateResume: (resumeId: string) => void;
  onDeleteResume: (resumeId: string) => void;
}

export default function ResumeManagerModal({
  isOpen,
  onClose,
  currentUser,
  resumes,
  activeResumeId,
  onSelectResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
}: ResumeManagerModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState<ResumeTemplate>("gupy");

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateResume(newTitle.trim(), newTemplate);
    setNewTitle("");
    setIsCreating(false);
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user: currentUser, resumes }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup-curriculos-${currentUser.name.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Meus Currículos Salvos</h2>
              <p className="text-xs text-slate-400">
                Gerencie múltiplas versões do seu currículo para diferentes vagas e ATS
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

        {/* Action bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-medium">
            Usuário ativo: <span className="font-bold text-slate-900">{currentUser.name}</span> ({resumes.length} versão(ões))
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBackup}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
              title="Baixar cópia de segurança de todos os seus dados em JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Backup JSON
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar Nova Versão
            </button>
          </div>
        </div>

        {/* Create new modal inline */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="p-4 bg-indigo-50/70 border-b border-indigo-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Nova Versão de Currículo
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Currículo - Vaga Python Back-End"
                className="md:col-span-2 px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value as ResumeTemplate)}
                className="px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="gupy">Template Gupy (Recomendado ATS)</option>
                <option value="modern">Template Moderno</option>
                <option value="tech">Template Tech / Terminal</option>
                <option value="classic">Template Clássico</option>
                <option value="minimal">Template Minimalista</option>
              </select>
            </div>
            <button
              type="submit"
              className="self-end px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Salvar e Abrir Versão
            </button>
          </form>
        )}

        {/* List of resumes */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {resumes.map((item) => {
            const isActive = item.id === activeResumeId;
            const updatedDate = new Date(item.updatedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isActive
                    ? "bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Ativo no Editor
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>Template: <strong className="text-slate-700 capitalize">{item.template}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Atualizado em {updatedDate}
                      </span>
                    </div>

                    {item.atsScore && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ATS Score: {item.atsScore}%
                        </span>
                        {item.targetRole && (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Foco: {item.targetRole}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => onSelectResume(item.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Carregar
                    </button>
                  )}
                  <button
                    onClick={() => onDuplicateResume(item.id)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Duplicar versão"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {resumes.length > 1 && (
                    <button
                      onClick={() => onDeleteResume(item.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Excluir versão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
