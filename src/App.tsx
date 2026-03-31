
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import ClientSign from './pages/ClientSign';
import ContractDetail from './pages/ContractDetail';
import ClientsList from './pages/ClientsList';
import { BRAND } from './constants';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPublicPortal = location.pathname.startsWith('/contract/') || 
                         location.pathname.startsWith('/c/');

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-white">
      {!isPublicPortal && <Navbar />}
      
      {isPublicPortal && (
        <header className="bg-brand-dark border-b border-white/10 p-4 no-print">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <img src={BRAND.logo} alt="Logo" className="h-10 w-auto" />
            <div className="flex items-center gap-2 text-[10px] text-brand-blue bg-brand-blue/10 px-4 py-2 rounded-full border border-brand-blue/20">
              <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse"></span>
              <span className="font-bold uppercase tracking-widest">Portal de Assinatura Seguro</span>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow">
        {children}
      </main>

      {!isPublicPortal && (
        <footer className="py-8 text-center text-white/20 text-xs border-t border-white/5 no-print">
          <p>© {new Date().getFullYear()} Easy Byz Creator. Sistema de Gestão Blindado.</p>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/financeiro" element={<FinanceDashboard />} />
          <Route path="/clientes" element={<ClientsList />} />
          <Route path="/c/:shortId" element={<ClientSign />} />
          <Route path="/contract/:id" element={<ClientSign />} />
          <Route path="/contrato/:id" element={<ContractDetail />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
