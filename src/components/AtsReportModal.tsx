import { AtsReport } from "../types";
import { 
  ShieldCheck, CheckCircle2, Cpu, 
  Sparkles, X, Target 
} from "lucide-react";

interface AtsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AtsReport | null;
  loading: boolean;
  onRefreshAudit: () => void;
}

export default function AtsReportModal({
  isOpen,
  onClose,
  report,
  loading,
  onRefreshAudit,
}: AtsReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Auditoria de Compatibilidade ATS & Gupy</h2>
              <p className="text-xs text-slate-400">
                Avaliação de legibilidade e pontuação pelos robôs de triagem
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-800">
                Avaliando currículo com Inteligência Artificial...
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Verificando densidade de palavras-chave, método STAR e legibilidade para ATS.
              </p>
            </div>
          ) : report ? (
            <>
              {/* Score header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-5 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center border border-white/30 shrink-0">
                    <span className="text-2xl font-black">{report.score}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Score ATS</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">Status: Aprovado para Triagem</h3>
                      <span className="px-2 py-0.5 bg-white/20 text-white rounded text-xs font-black">
                        Nota {report.gupyGrade}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                      {report.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pontos Fortes Identificados para Robôs de RH:
                </h4>
                <ul className="space-y-1.5">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-600" />
                  Recomendações Práticas para Triagem:
                </h4>
                <ul className="space-y-1.5">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-amber-950 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detected keywords */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  Palavras-Chave de Maior Peso Encontradas:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {report.detectedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing critical keywords */}
              {report.missingCriticalKeywords?.length > 0 && (
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Palavras-Chave Recomendadas para Agregar:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {report.missingCriticalKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhuma auditoria realizada ainda. Clique abaixo para auditar.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
          >
            Fechar
          </button>
          <button
            onClick={onRefreshAudit}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Recalcular Auditoria Agora
          </button>
        </div>
      </div>
    </div>
  );
}
