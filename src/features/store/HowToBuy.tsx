import React from "react";
import { SearchCheck, FileText, SendHorizontal, HelpCircle } from "lucide-react";
import { CyberCard } from "../../components/ui/CyberCard";

interface HowToBuyProps {
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
}

export const HowToBuy: React.FC<HowToBuyProps> = ({
  step1Title,
  step1Desc,
  step2Title,
  step2Desc,
  step3Title,
  step3Desc,
}) => {
  const steps = [
    {
      title: step1Title,
      desc: step1Desc,
      icon: <SearchCheck className="w-8 h-8 text-accent-primary" />,
      color: "from-accent-primary/20 to-transparent",
    },
    {
      title: step2Title,
      desc: step2Desc,
      icon: <FileText className="w-8 h-8 text-accent-secondary" />,
      color: "from-accent-secondary/20 to-transparent",
    },
    {
      title: step3Title,
      desc: step3Desc,
      icon: <SendHorizontal className="w-8 h-8 text-accent-wa" />,
      color: "from-accent-wa/25 to-transparent",
    },
  ];

  return (
    <section id="howto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-accent-primary/10">
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-accent-secondary/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Decorative center shield icon */}
      <div className="text-center mb-16">
        <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white tracking-widest text-neon relative inline-block mb-3 uppercase">
          // CARA ORDER
        </h2>
        <p className="text-xs sm:text-sm text-cyber-muted font-sans uppercase tracking-widest">
          Cara bertransaksi instan kilat 100% aman bergaransi resmi
        </p>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connective gradient timeline line for bigger screens */}
        <div className="hidden md:block absolute top-1/2 left-12 right-12 h-[1px] bg-gradient-to-r from-accent-primary/30 via-accent-secondary/30 to-accent-wa/30 -z-10" />

        {steps.map((st, index) => (
          <CyberCard
            key={index}
            accent={index === 0 ? "primary" : index === 1 ? "secondary" : "neutral"}
            className="flex flex-col h-full bg-cyber-surface/60 border border-cyber-muted/10 relative p-8 rounded-none transition-transform"
          >
            {/* Outline giant number icon */}
            <span className="absolute top-4 right-6 font-orbitron font-black text-6xl text-white/5 tracking-wider select-none">
              0{index + 1}
            </span>

            {/* Left glowing marker strip */}
            <div className={`w-1 absolute top-0 bottom-0 left-0 bg-gradient-to-b ${index === 0 ? "from-accent-primary" : index === 1 ? "from-accent-secondary" : "from-accent-wa"}`} />

            <div className="bg-cyber-bg w-14 h-14 border border-cyber-muted/20 flex items-center justify-center rounded-xs mb-6 shadow-md shadow-black">
              {st.icon}
            </div>

            <h3 className="font-orbitron font-bold text-lg text-white mb-3 tracking-wide flex items-center gap-2">
              <span>{st.title}</span>
            </h3>

            <p className="text-sm text-cyber-muted leading-relaxed font-sans mt-1">
              {st.desc}
            </p>
          </CyberCard>
        ))}
      </div>
    </section>
  );
};
