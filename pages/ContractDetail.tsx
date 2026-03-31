
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Contract, PaymentStatus } from '../types';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import ContractPreview from '../components/ContractPreview';
import { ChevronLeft, ShieldCheck, Globe, Calendar, Download, AlertCircle, Trash2, UserX, UserCheck, Clock } from 'lucide-react';

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [showManualTrigger, setShowManualTrigger] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAdmin = location.state?.fromAdmin || false;

  useEffect(() => {
    const fetchContract = async () => {
      if (id) {
        setIsLoading(true);
        const data = await storageService.getContractById(id);
        setContract(data || null);
        setIsLoading(false);
      }
    };
    fetchContract();
  }, [id]);

  useEffect(() => {
    if (contract && location.state?.autoPrint) {
      setTimeout(() => setIsPreparing(true), 0);
      const timer = setTimeout(() => {
        setIsPreparing(false);
        try {
          window.print();
          window.history.replaceState({}, document.title);
        } catch {
          setShowManualTrigger(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [contract, location.state]);

  const handleManualPrint = () => {
    try {
      window.print();
    } catch {
      alert("Para baixar o PDF, use a função Imprimir do seu navegador e selecione 'Salvar como PDF'.");
    }
  };

  const handleDelete = async () => {
    if (!contract) return;
    if (window.confirm(`Excluir permanentemente o contrato de "${contract.clientData?.fullName || contract.adminName}" da nuvem?`)) {
      await storageService.deleteContract(contract.id);
      navigate('/clientes');
    }
  };

  const handleToggleInactive = async () => {
    if (!contract) return;
    const isInactive = contract.paymentStatus === 'inactive';
    const newStatus: PaymentStatus = isInactive ? 'paid' : 'inactive';
    const updated = { ...contract, paymentStatus: newStatus };
    await storageService.saveContract(updated);
    setContract(updated);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Clock className="animate-spin text-brand-green mb-4" size={40} />
      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Baixando da Nuvem...</p>
    </div>
  );

  if (!contract) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <AlertCircle className="text-red-400 mb-4" size={40} />
      <p className="text-white/40 font-bold uppercase">Contrato não encontrado.</p>
    </div>
  );

  const isInactive = contract.paymentStatus === 'inactive';

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isInactive ? 'opacity-90' : ''}`}>
      {isPreparing && (
        <div className="fixed inset-0 z-[100] bg-brand-dark/95 flex flex-col items-center justify-center text-center p-6 no-print">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-brand-green mb-2">Contrato Blindado!</h2>
          <p className="text-white/80 max-w-sm mb-6">Sua cópia está sendo gerada agora...</p>
          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 text-sm max-w-xs shadow-2xl">
            <p className="text-brand-green font-bold mb-3 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
              <AlertCircle size={14} /> Importante
            </p>
            <p className="text-white/70 mb-4 text-center">Selecione <strong>"Salvar como PDF"</strong> para guardar seu contrato.</p>
            {showManualTrigger && (
              <button onClick={handleManualPrint} className="w-full bg-brand-green text-brand-dark font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all">
                <Download size={18} /> Baixar Agora
              </button>
            )}
          </div>
        </div>
      )}

      <div className="no-print flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <Link to={isAdmin ? "/clientes" : "/"} className="flex items-center gap-2 text-white/60 hover:text-white px-4 py-2 hover:bg-white/5 rounded-lg transition-all">
          <ChevronLeft /> {isAdmin ? "Lista de Clientes" : "Dashboard"}
        </Link>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isAdmin && (
            <>
              <Button 
                onClick={handleToggleInactive}
                variant={isInactive ? "default" : "outline"}
                className={`flex-1 md:flex-initial px-6 py-4 h-auto text-[10px] ${
                  isInactive 
                  ? 'bg-brand-green/20 text-brand-green border-brand-green/30 hover:bg-brand-green/30' 
                  : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {isInactive ? <UserCheck size={20} /> : <UserX size={20} />}
                {isInactive ? 'Reativar Cliente' : 'Inativar Cliente'}
              </Button>
              <Button 
                onClick={handleDelete}
                variant="destructive"
                className="px-4 py-4 h-auto bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                title="Excluir da Nuvem"
              >
                <Trash2 size={20} />
              </Button>
            </>
          )}
          <Button 
            onClick={handleManualPrint} 
            className="flex-1 md:flex-initial px-8 py-4 h-auto shadow-xl shadow-brand-green/30 text-[10px]"
          >
            <Download size={20} /> Baixar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className={isInactive ? 'grayscale-[0.4]' : ''}>
            <ContractPreview 
              {...contract}
              clientData={contract.clientData}
              signature={contract.signatureImage}
              signedAt={contract.signedAt}
              metadata={contract.metadata}
              currency={contract.currency}
              installments={contract.installments}
            />
          </div>
        </div>

        <div className="no-print space-y-6">
          <Card className={`border rounded-2xl p-6 transition-all ${isInactive ? 'bg-white/5 border-white/10' : 'bg-brand-green/10 border-brand-green/20'}`}>
            <h3 className={`font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs ${isInactive ? 'text-white/40' : 'text-brand-green'}`}>
              <ShieldCheck size={18} /> {isInactive ? 'Cadastro Inativo' : 'Validação Técnica'}
            </h3>
            <div className="space-y-4 text-sm text-white">
              <div className="pb-4 border-b border-white/10">
                <label className="block text-white/40 mb-1 uppercase text-[10px] font-bold">Status Atual</label>
                <div className={`font-bold text-xl uppercase ${isInactive ? 'text-white/40' : 'text-brand-green'}`}>
                  {isInactive ? 'Serviço Suspenso' : 'Documento Blindado'}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-white/40 mt-1" size={16} />
                <div className="text-left">
                  <label className="block text-white/40 uppercase text-[10px] font-bold">Data Assinatura</label>
                  <div className="text-white/90">{contract.signedAt}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="text-white/40 mt-1" size={16} />
                <div className="text-left">
                  <label className="block text-white/40 uppercase text-[10px] font-bold">IP de Registro</label>
                  <div className="font-mono text-xs text-white/90">{contract.metadata?.ip}</div>
                </div>
              </div>
              {contract.finalSystemLink && (
                <div className="pt-4 mt-4 border-t border-white/10">
                   <Button 
                    asChild
                    variant="outline"
                    className="w-full py-3 h-auto bg-brand-blue/10 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/20 text-[10px]"
                   >
                     <a 
                      href={contract.finalSystemLink} 
                      target="_blank" 
                      rel="noreferrer"
                     >
                       Acessar Sistema <Globe size={14} />
                     </a>
                   </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
