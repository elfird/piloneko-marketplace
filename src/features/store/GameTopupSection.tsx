import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

export const GameTopupSection: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/topup-games')
      .then(r => r.json())
      .then(data => setGames(data))
      .catch(err => console.error(err));
  }, []);

  if (games.length === 0) return null;

  return (
    <section className="py-20 bg-cyber-bg relative border-t border-accent-primary/10 overflow-hidden" id="topup">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-secondary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-primary/10 border border-accent-primary/20 rounded-full text-accent-primary text-xs font-mono mb-4 shadow-[0_0_10px_rgba(0,245,255,0.2)]">
            <Gamepad2 className="w-4 h-4" />
            <span>INSTANT DELIVERY</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-orbitron font-black text-white mb-4 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-white to-accent-primary">GAME</span> TOPUP
          </h2>
          <p className="text-cyber-muted font-sans max-w-2xl mx-auto text-sm md:text-base tracking-wide">
            Topup saldo game favorit Anda secara instan dan otomatis 24/7.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {games.map((game) => (
            <div 
              key={game._id}
              onClick={() => navigate(`/topup/${game.slug}`)}
              className="bg-cyber-surface/40 border border-cyber-muted/20 rounded-xl overflow-hidden cursor-pointer group hover:border-accent-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,245,255,0.15)] relative transform hover:-translate-y-1 flex flex-col items-center p-4"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 border border-cyber-muted/20 group-hover:border-accent-primary/50 relative">
                {game.logo ? (
                  <img src={game.logo} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-cyber-card flex items-center justify-center text-3xl font-bold text-cyber-muted group-hover:text-accent-primary transition-colors">
                    {game.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <h3 className="text-white font-bold text-sm text-center font-orbitron tracking-wide group-hover:text-accent-primary transition-colors">{game.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
