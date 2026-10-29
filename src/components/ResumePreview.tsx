import { ResumeData, ResumeTemplate } from "../types.ts";
import { Mail, Phone, MapPin, Linkedin, Instagram, Award, Briefcase, GraduationCap, Code } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
  template: ResumeTemplate;
}

export default function ResumePreview({ data, template }: ResumePreviewProps) {
  const renderSkillRating = (level: number, colorClass: string) => {
    return (
      <div className="flex gap-1" id={`skill-rating-container-${level}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            id={`skill-rating-dot-${star}`}
            className={`w-2.5 h-2.5 rounded-full ${
              star <= level ? colorClass : "bg-neutral-200 dark:bg-neutral-700"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderModern = () => {
    return (
      <div id="template-modern" className="w-full bg-white text-neutral-800 rounded-xl overflow-hidden shadow-xl border border-neutral-100 flex flex-col md:flex-row min-h-[1100px] print:shadow-none print:border-none print:rounded-none">
        {/* Left Column (Sidebar) */}
        <div id="modern-sidebar" className="w-full md:w-[35%] bg-slate-900 text-white p-8 flex flex-col justify-between print:bg-slate-900 print:text-white">
          <div>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-slate-700 bg-slate-800 flex items-center justify-center text-3xl font-bold tracking-wider text-amber-500">
                {data.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{data.name}</h1>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest leading-relaxed">
                {data.title}
              </p>
            </div>

            <div className="mb-8" id="modern-contact-section">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800">
                Contato
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">{data.email}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{data.phone}</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{data.location}</span>
                </li>
                {data.linkedin && (
                  <li className="flex items-center gap-3">
                    <Linkedin className="w-4 h-4 text-amber-500 shrink-0" />
                    <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 truncate hover:underline">
                      LinkedIn
                    </a>
                  </li>
                )}
                {data.instagram && (
                  <li className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">{data.instagram}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="mb-8" id="modern-languages-section">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800">
                Idiomas
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {data.languages.map((lang) => (
                  <li key={lang.id} className="flex justify-between items-center">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{lang.level}</span>
                  </li>
                ))}
              </ul>
            </div>

            {data.areasOfInterest && data.areasOfInterest.length > 0 && (
              <div className="mb-8" id="modern-interests-section">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800">
                  Áreas de Interesse
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.areasOfInterest.map((area, idx) => (
                    <span key={idx} className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div id="modern-main-content" className="flex-1 p-10 flex flex-col gap-8">
          {data.summary && (
            <section id="modern-section-summary">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-amber-500 pb-1 mb-3 flex items-center gap-2">
                Perfil Profissional
              </h2>
              <p className="text-neutral-600 text-sm leading-relaxed text-justify">
                {data.summary}
              </p>
            </section>
          )}

          {data.experience && data.experience.length > 0 && (
            <section id="modern-section-experience" className="print-break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-amber-500 pb-1 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" /> Experiência Profissional
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-5 border-l-2 border-slate-100 last:border-transparent pb-1">
                    <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[7px] top-[5px]" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{exp.role}</h4>
                        <p className="text-xs font-semibold text-slate-500">{exp.company}</p>
                      </div>
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full mt-1 sm:mt-0 self-start">
                        {exp.startYear} — {exp.endYear}
                      </span>
                    </div>
                    {exp.location && (
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" /> {exp.location}
                      </p>
                    )}
                    <p className="text-neutral-600 text-xs leading-relaxed whitespace-pre-line text-justify">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.education && data.education.length > 0 && (
            <section id="modern-section-education" className="print-break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-amber-500 pb-1 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-500" /> Educação
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
                        {edu.degree || "Curso"}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 mt-1.5">{edu.course}</h4>
                      <p className="text-[11px] font-medium text-slate-600">{edu.school}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/50">
                      <span className="text-[10px] text-slate-400">{edu.location || ""}</span>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {edu.startYear} — {edu.endYear}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-break-inside-avoid">
            {data.skills && data.skills.length > 0 && (
              <section id="modern-section-skills">
                <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider border-b-2 border-amber-500 pb-1 mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-500" /> Habilidades
                </h2>
                <div className="space-y-3">
                  {data.skills.map((skill) => (
                    <div key={skill.id} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700">{skill.name}</span>
                      {renderSkillRating(skill.level, "bg-amber-500")}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section id="modern-section-certifications">
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider border-b-2 border-amber-500 pb-1 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Certificações & Conquistas
              </h2>
              <div className="space-y-2.5">
                {data.certifications.slice(0, 4).map((cert) => (
                  <div key={cert.id} className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800 leading-tight">{cert.name}</h4>
                      <p className="text-[10px] text-slate-500">{cert.issuer}</p>
                    </div>
                  </div>
                ))}
                {data.achievements.slice(0, 3).map((ach) => (
                  <div key={ach.id} className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800 leading-tight">{ach.name}</h4>
                      <p className="text-[10px] text-slate-500">{ach.issuer || "Conquista"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderTech = () => {
    return (
      <div id="template-tech" className="w-full bg-slate-950 text-slate-100 p-8 md:p-12 rounded-xl shadow-xl font-mono border border-slate-800 min-h-[1100px] print:shadow-none print:border-none print:bg-white print:text-slate-900 print:p-0 print:rounded-none">
        <div className="border-b-2 border-dashed border-slate-800 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:border-slate-300">
          <div>
            <div className="text-cyan-400 text-xs font-semibold mb-1 uppercase tracking-widest">&lt;DEVELOPER_PROFILE&gt;</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase print:text-slate-950">{data.name}</h1>
            <p className="text-emerald-400 text-sm mt-1 flex items-center gap-2 print:text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 print:hidden" />
              {data.title}
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 space-y-1 print:text-slate-600">
            <div><span className="text-slate-600">// LOC:</span> {data.location}</div>
            <div><span className="text-slate-600">// EMAIL:</span> {data.email}</div>
            <div><span className="text-slate-600">// TEL:</span> {data.phone}</div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-lg mb-8 text-xs leading-relaxed text-slate-300 text-justify print:bg-slate-50 print:border-slate-200 print:text-slate-800">
          <span className="text-emerald-400 font-bold">INFO: </span>
          {data.summary}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2 print:border-slate-300 print:text-cyan-800">
                [01] EXPERIENCIA_PROFISSIONAL
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="group border-l border-slate-800 pl-4 space-y-1.5 hover:border-cyan-500 transition-colors print:border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <h4 className="font-bold text-xs text-white group-hover:text-cyan-400 transition-colors print:text-slate-900">{exp.role}</h4>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0 print:border-slate-200 print:bg-slate-100 print:text-slate-700">
                        {exp.startYear} - {exp.endYear}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400">{exp.company} | {exp.location}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed text-justify print:text-slate-700 whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2 print:border-slate-300 print:text-cyan-800">
                [02] EDUCACAO_E_FORMACAO
              </h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="border-l border-slate-800 pl-4 space-y-1 print:border-slate-200">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs text-white print:text-slate-900">{edu.course}</h4>
                      <span className="text-[10px] text-slate-400">{edu.startYear} - {edu.endYear}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{edu.school} {edu.degree ? `(${edu.degree})` : ""} | {edu.location}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2 print:border-slate-300 print:text-cyan-800">
                [03] TEC_SKILLS
              </h2>
              <div className="space-y-3">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium print:text-slate-800">{skill.name}</span>
                      <span className="text-slate-500 font-mono">Lvl.{skill.level}/5</span>
                    </div>
                    {renderSkillRating(skill.level, "bg-cyan-500")}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2 print:border-slate-300 print:text-cyan-800">
                [04] CERTIFICACOES
              </h2>
              <ul className="space-y-3 text-[11px] text-slate-400 print:text-slate-700">
                {data.certifications.map((cert) => (
                  <li key={cert.id} className="flex gap-2">
                    <span className="text-cyan-500">&gt;</span>
                    <div>
                      <span className="text-white font-semibold print:text-slate-900">{cert.name}</span>
                      <div className="text-[10px] text-slate-500">{cert.issuer}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2 print:border-slate-300 print:text-cyan-800">
                [05] OUTRAS_INFOS
              </h2>
              <div className="space-y-3 text-[11px]">
                {data.languages.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-slate-500">// IDIOMAS:</div>
                    {data.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between text-slate-300 print:text-slate-800">
                        <span>{lang.name}</span>
                        <span>({lang.level})</span>
                      </div>
                    ))}
                  </div>
                )}
                {data.linkedin && (
                  <div className="space-y-0.5 pt-2">
                    <div className="text-slate-500">// SOCIAL:</div>
                    <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline block truncate">
                      linkedin.com/in/...
                    </a>
                    {data.instagram && (
                      <span className="text-slate-400 block truncate">{data.instagram}</span>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderClassic = () => {
    return (
      <div id="template-classic" className="w-full bg-white text-[#2a2a2a] p-10 md:p-14 rounded-xl shadow-xl font-serif border border-neutral-200 flex flex-col gap-8 min-h-[1100px] print:shadow-none print:border-none print:p-0 print:rounded-none">
        <div className="text-center space-y-2 pb-6 border-b border-neutral-300">
          <h1 className="text-3xl md:text-4xl font-normal tracking-wide text-neutral-900 uppercase font-serif">{data.name}</h1>
          <p className="text-sm italic tracking-widest font-sans text-neutral-500 uppercase">{data.title}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-sans text-neutral-600 mt-2">
            <span>{data.email}</span>
            <span>•</span>
            <span>{data.phone}</span>
            <span>•</span>
            <span>{data.location}</span>
            {data.linkedin && (
              <>
                <span>•</span>
                <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-neutral-900 font-medium">LinkedIn</a>
              </>
            )}
          </div>
        </div>

        {data.summary && (
          <section className="text-center font-sans">
            <p className="text-sm leading-relaxed text-neutral-600 text-justify italic max-w-3xl mx-auto px-4">
              "{data.summary}"
            </p>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section className="space-y-4 print-break-inside-avoid">
            <h2 className="text-sm font-bold font-sans tracking-widest text-neutral-900 uppercase border-b-2 border-neutral-800 pb-1 flex justify-between items-center">
              <span>Experiência Profissional</span>
              <span className="h-0.5 bg-neutral-200 flex-grow ml-4" />
            </h2>
            <div className="space-y-6 font-sans">
              {data.experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <h3 className="font-bold text-sm text-neutral-800">{exp.role} — <span className="font-semibold text-neutral-600">{exp.company}</span></h3>
                    <span className="text-xs font-semibold text-neutral-500 shrink-0">
                      {exp.startYear} — {exp.endYear}
                    </span>
                  </div>
                  {exp.location && <p className="text-[11px] italic text-neutral-400">{exp.location}</p>}
                  <p className="text-xs text-neutral-600 leading-relaxed text-justify whitespace-pre-line pt-1">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education && data.education.length > 0 && (
          <section className="space-y-4 print-break-inside-avoid">
            <h2 className="text-sm font-bold font-sans tracking-widest text-neutral-900 uppercase border-b-2 border-neutral-800 pb-1 flex justify-between items-center">
              <span>Formação Acadêmica</span>
              <span className="h-0.5 bg-neutral-200 flex-grow ml-4" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
              {data.education.map((edu) => (
                <div key={edu.id} className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-xs text-neutral-800">{edu.course}</h3>
                    <span className="text-[11px] text-neutral-500">{edu.startYear} — {edu.endYear}</span>
                  </div>
                  <p className="text-xs text-neutral-600">{edu.school} {edu.degree ? `(${edu.degree})` : ""}</p>
                  {edu.location && <p className="text-[10px] text-neutral-400">{edu.location}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans print-break-inside-avoid">
          {data.skills && data.skills.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-neutral-900 uppercase border-b border-neutral-300 pb-1">
                Habilidades & Competências
              </h2>
              <div className="space-y-2">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="flex justify-between items-center text-xs">
                    <span className="text-neutral-700 font-medium">{skill.name}</span>
                    <span className="text-[11px] text-neutral-500 font-serif italic">Level {skill.level}/5</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-neutral-900 uppercase border-b border-neutral-300 pb-1">
              Certificações & Prêmios
            </h2>
            <ul className="space-y-2 text-xs">
              {data.certifications.map((cert) => (
                <li key={cert.id} className="flex justify-between">
                  <span className="text-neutral-700 font-medium">{cert.name}</span>
                  <span className="text-neutral-500 text-[10px] italic">{cert.issuer}</span>
                </li>
              ))}
              {data.achievements.slice(0, 2).map((ach) => (
                <li key={ach.id} className="flex justify-between">
                  <span className="text-neutral-700 font-medium">{ach.name}</span>
                  <span className="text-neutral-500 text-[10px] italic">{ach.issuer || "Conquista"}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    );
  };

  const renderMinimal = () => {
    return (
      <div id="template-minimal" className="w-full bg-white text-neutral-900 p-8 md:p-12 rounded-xl shadow-xl font-sans min-h-[1100px] print:shadow-none print:border-none print:p-0 print:rounded-none">
        <div className="space-y-1.5 pb-6 border-b border-neutral-100 mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">{data.name}</h1>
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">{data.title}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 pt-1">
            <span>{data.email}</span>
            <span>•</span>
            <span>{data.phone}</span>
            <span>•</span>
            <span>{data.location}</span>
            {data.linkedin && (
              <>
                <span>•</span>
                <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-neutral-900">LinkedIn</a>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6 text-xs">
          {data.summary && (
            <section className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Resumo Profissional</h2>
              <p className="text-neutral-600 leading-relaxed text-justify">
                {data.summary}
              </p>
            </section>
          )}

          {data.experience && data.experience.length > 0 && (
            <section className="space-y-3 print-break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Experiência Profissional</h2>
              <div className="space-y-4">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline font-semibold text-neutral-800">
                      <span>{exp.role} <span className="font-normal text-neutral-500">at</span> {exp.company}</span>
                      <span className="text-[10px] text-neutral-500 font-normal">{exp.startYear} — {exp.endYear}</span>
                    </div>
                    {exp.location && <p className="text-[10px] text-neutral-400">{exp.location}</p>}
                    <p className="text-neutral-600 leading-relaxed text-justify whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.education && data.education.length > 0 && (
            <section className="space-y-3 print-break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Educação</h2>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-neutral-800">{edu.course}</h4>
                      <p className="text-[11px] text-neutral-500">{edu.school} {edu.degree ? `(${edu.degree})` : ""} | {edu.location}</p>
                    </div>
                    <span className="text-[10px] text-neutral-500 shrink-0">{edu.startYear} — {edu.endYear}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-inside-avoid">
            {data.skills && data.skills.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Competências</h2>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill) => (
                    <span key={skill.id} className="text-[10px] bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded">
                      {skill.name} (Lvl {skill.level})
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Certificações</h2>
              <ul className="space-y-1.5 text-neutral-600">
                {data.certifications.map((cert) => (
                  <li key={cert.id} className="flex justify-between items-baseline gap-1">
                    <span className="font-medium text-neutral-700">{cert.name}</span>
                    <span className="text-[10px] text-neutral-400">{cert.issuer}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderGupy = () => {
    return (
      <div id="template-gupy" className="w-full bg-white text-neutral-900 p-8 md:p-12 rounded-xl shadow-xl font-sans min-h-[1100px] print:shadow-none print:border-none print:p-0 print:rounded-none">
        {/* Info Banner (Omitted during print) */}
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 flex items-start gap-3 no-print">
          <div className="bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
          <div>
            <h4 className="font-bold text-emerald-950 mb-0.5">Modelo Gupy (Otimizado para IA & ATS)</h4>
            <p className="leading-relaxed">
              Este currículo foi otimizado para sistemas de recrutamento baseados em inteligência artificial (como <strong>Gupy, Kenoby e Sólides</strong>). Ele utiliza uma estrutura de <strong>coluna única vertical</strong>, sem elementos gráficos, colunas divididas ou tabelas complexas, permitindo que os leitores automatizados processem todo o seu histórico e encontrem as palavras-chave ideais.
            </p>
          </div>
        </div>

        {/* Header / Personal Data */}
        <div className="space-y-2 pb-6 border-b-2 border-neutral-850 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase">{data.name}</h1>
          <p className="text-sm font-bold text-neutral-600 tracking-wide uppercase">{data.title}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-700 pt-1 font-medium">
            <span><strong>E-mail:</strong> {data.email}</span>
            <span>•</span>
            <span><strong>Telefone:</strong> {data.phone}</span>
            <span>•</span>
            <span><strong>Localização:</strong> {data.location}</span>
            {data.linkedin && (
              <>
                <span>•</span>
                <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-700">LinkedIn</a>
              </>
            )}
            {data.github && (
              <>
                <span>•</span>
                <a href={data.github} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-700">GitHub</a>
              </>
            )}
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-xs">
          
          {/* Executive Summary */}
          {data.summary && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-300 pb-1">
                RESUMO PROFISSIONAL
              </h2>
              <p className="text-neutral-700 leading-relaxed text-justify">
                {data.summary}
              </p>
            </section>
          )}

          {/* Job Experiences */}
          {data.experience && data.experience.length > 0 && (
            <section className="space-y-4 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-300 pb-1">
                EXPERIÊNCIA PROFISSIONAL
              </h2>
              <div className="space-y-5">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-neutral-900">
                      <span className="font-bold text-sm">{exp.role}</span>
                      <span className="text-[11px] font-semibold text-neutral-500">{exp.startYear} — {exp.endYear}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 font-semibold text-[11px]">
                      <span>{exp.company}</span>
                      {exp.location && <span>{exp.location}</span>}
                    </div>
                    <p className="text-neutral-700 leading-relaxed text-justify whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Academic Formations */}
          {data.education && data.education.length > 0 && (
            <section className="space-y-3 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-300 pb-1">
                FORMAÇÃO ACADÊMICA
              </h2>
              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-neutral-900">
                      <span className="font-bold">{edu.course} {edu.degree ? `(${edu.degree})` : ""}</span>
                      <span className="text-[11px] font-semibold text-neutral-500">{edu.startYear} — {edu.endYear}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 text-[11px] font-semibold">
                      <span>{edu.school}</span>
                      {edu.location && <span>{edu.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Plain Text Skills & Competencies (highly parsed by Gupy) */}
          {data.skills && data.skills.length > 0 && (
            <section className="space-y-2 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-300 pb-1">
                COMPETÊNCIAS E HABILIDADES TÉCNICAS
              </h2>
              <p className="text-neutral-700 leading-relaxed text-[13px] tracking-wide">
                {data.skills.map((skill) => skill.name).join(", ")}
              </p>
            </section>
          )}

          {/* Certifications and achievements */}
          {((data.certifications && data.certifications.length > 0) || (data.achievements && data.achievements.length > 0)) && (
            <section className="space-y-2 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-300 pb-1">
                CURSOS E CERTIFICAÇÕES
              </h2>
              <ul className="list-disc list-inside space-y-1 text-neutral-700">
                {data.certifications.map((cert) => (
                  <li key={cert.id} className="leading-relaxed">
                    <span className="font-semibold text-neutral-900">{cert.name}</span> — <span>{cert.issuer}</span>
                  </li>
                ))}
                {data.achievements && data.achievements.map((ach) => (
                  <li key={ach.id} className="leading-relaxed">
                    <span className="font-semibold text-neutral-900">{ach.name}</span> — <span>{ach.issuer || "Outras informações"}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section className="space-y-2 print-break-inside-avoid">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-300 pb-1">
                IDIOMAS
              </h2>
              <div className="flex gap-6 font-medium">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="text-neutral-700">
                    <strong>{lang.name}:</strong> <span>{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    );
  };

  switch (template) {
    case "modern":
      return renderModern();
    case "tech":
      return renderTech();
    case "classic":
      return renderClassic();
    case "minimal":
      return renderMinimal();
    case "gupy":
      return renderGupy();
    default:
      return renderModern();
  }
}
