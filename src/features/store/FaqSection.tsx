import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { FaqItem } from "../../types";

interface FaqSectionProps {
  faqItems: FaqItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqItems }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (faqItems.length === 0) return null;

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-accent-primary/10">
      <div className="absolute top-1/4 left-1/2 w-84 h-84 bg-accent-primary/2 rounded-full blur-[90px] pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-16">
        <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white tracking-widest text-neon relative inline-block mb-3 uppercase">
          // KNOWLEDGE BASE
        </h2>
        <p className="text-xs sm:text-sm text-cyber-muted font-sans uppercase tracking-widest">
          Frequently Asked Questions (FAQ) & Solusi Kendala
        </p>
      </div>

      {/* Accordion container */}
      <div className="space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.id}
              className={`border transition-all duration-300 rounded-none bg-cyber-card/75 ${
                isOpen
                  ? "border-accent-primary bg-cyber-surface/90 shadow-[0_0_12px_rgba(0,245,255,0.15)]"
                  : "border-cyber-muted/20 hover:border-accent-primary/40"
              }`}
            >
              {/* Trigger Button bar */}
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left px-5 py-4 focus:outline-none flex justify-between items-center gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? "text-accent-primary" : "text-cyber-muted"}`} />
                  <span className={`font-orbitron text-xs sm:text-sm font-semibold tracking-wider ${isOpen ? "text-accent-primary" : "text-white"}`}>
                    {item.question.toUpperCase()}
                  </span>
                </div>
                <div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-accent-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-cyber-muted" />
                  )}
                </div>
              </button>

              {/* Reveal text with smooth CSS height transition */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isOpen ? "max-h-80 border-t border-accent-primary/10" : "max-h-0"
                }`}
              >
                <div className="px-5 py-4 text-xs sm:text-sm leading-relaxed text-cyber-text/90 font-sans">
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
