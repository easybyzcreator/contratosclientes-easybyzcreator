
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BRAND } from '../constants';
import { ShieldCheck, LayoutDashboard, Users, Lock, Wallet } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isClientPortal = location.pathname.startsWith('/c/') || location.pathname.startsWith('/contract/') || 
                         (location.pathname.startsWith('/contrato/') && !location.state?.fromAdmin);

  return (
    <nav className="bg-brand-dark border-b border-white/10 p-4 sticky top-0 z-50 no-print">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={BRAND.logo} alt="Logo" className="h-8 sm:h-10 w-auto" />
          <span className="font-bold text-sm sm:text-lg hidden xs:block">EASY BYZ</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          {!isClientPortal ? (
            <div className="flex items-center gap-3 sm:gap-6">
              <Link 
                to="/" 
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors ${location.pathname === '/' ? 'text-brand-green font-bold' : 'text-white/70 hover:text-brand-green'}`}
              >
                <LayoutDashboard size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <Link 
                to="/financeiro" 
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors ${location.pathname === '/financeiro' ? 'text-brand-green font-bold' : 'text-white/70 hover:text-brand-green'}`}
              >
                <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden md:inline">Financeiro</span>
              </Link>
              <Link 
                to="/clientes" 
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors ${location.pathname === '/clientes' ? 'text-brand-green font-bold' : 'text-white/70 hover:text-brand-green'}`}
              >
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden md:inline">Clientes</span>
              </Link>
              <div className="hidden lg:flex items-center gap-1 text-[10px] text-brand-green bg-brand-green/10 px-3 py-1 rounded-full border border-brand-green/20 font-bold uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>Gestor</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-brand-blue bg-brand-blue/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-brand-blue/20">
              <Lock size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em]">Portal Seguro</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
