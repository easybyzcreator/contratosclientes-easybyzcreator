
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { webhookService } from '../services/webhookService';
import { Contract, PlanType, AdminFormData, Region } from '../types';
import ContractPreview from '../components/ContractPreview';
import { SERVICES, CONTRACT_TEMPLATE, PERSONALIZED_SERVICES, DEFAULT_INSTRUCTIONS_STANDARD } from '../constants';
import { generateUUID, generateShortId } from '../utils';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, CheckCircle2, Clock, Copy, Check, X, ChevronRight, LayoutGrid, Sparkles, PenTool, DollarSign, Wallet, ExternalLink, Building2, UserCircle, ScrollText, MessageSquareQuote, Save, RefreshCcw, MessageCircle } from 'lucide-react';

const PERSONALIZED_TAB = 'Contrato Personalizado';

const AdminDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedService, setSelectedService] = useState<string>(SERVICES[1]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const [formData, setFormData] = useState<AdminFormData>({
    serviceType: SERVICES[1],
    providerName: 'PATRICIA GUIMARÃES',
    providerBrand: 'EASY BYZ CREATOR',
    providerAddress: 'Santa Ana, CA - EUA',
    adminName: '',
    companyName: '',
    clientPhone: '',
    planType: PlanType.MONTHLY,
    planValue: '',
    annualValue: '',
    setupFee: '',
    setupInstallmentsCount: 1,
    paymentKey: '',
    zelleKey: '',
    venmoKey: '',
    paymentLink: '',
    clauses: JSON.parse(JSON.stringify(CONTRACT_TEMPLATE.clauses)),
    hiddenFields: [],
    activationInstructions: DEFAULT_INSTRUCTIONS_STANDARD
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const [contractsData, templateData] = await Promise.all([
        storageService.getAllContracts(),
        storageService.getDefaultTemplate()
      ]);
      
      setContracts(contractsData);
      
      if (templateData) {
        setFormData(prev => ({
          ...prev,
          clauses: templateData.clauses,
          activationInstructions: templateData.activationInstructions
        }));
      }
      
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  const handleSaveAsDefault = async () => {
    if (!window.confirm('Deseja salvar estas cláusulas e instruções como o novo padrão para todos os contratos?')) return;
    setIsSavingTemplate(true);
    try {
      await storageService.saveDefaultTemplate({
        clauses: formData.clauses,
        activationInstructions: formData.activationInstructions
      });
      alert('Modelo padrão atualizado com sucesso!');
    } catch {
      alert('Erro ao salvar modelo padrão.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleRestoreDefault = async () => {
    if (!window.confirm('Deseja restaurar as cláusulas e instruções originais do sistema? Isso apagará seu modelo personalizado.')) return;
    
    setIsSavingTemplate(true);
    try {
      await storageService.saveDefaultTemplate(null); // Passing null to delete custom template
      setFormData(prev => ({
        ...prev,
        clauses: JSON.parse(JSON.stringify(CONTRACT_TEMPLATE.clauses)),
        activationInstructions: DEFAULT_INSTRUCTIONS_STANDARD
      }));
      alert('Modelo original restaurado com sucesso!');
    } catch {
      alert('Erro ao restaurar modelo original.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (selectedService === PERSONALIZED_TAB) {
      return PERSONALIZED_SERVICES.includes(c.serviceType) || (!SERVICES.includes(c.serviceType));
    }
    return c.serviceType === selectedService;
  });

  const handleOpenModal = () => {
    const isVazio = selectedService === 'CONTRATO VAZIO';

    const initialServiceType = isVazio ? '' : selectedService;
    const defaultInstructions = formData.activationInstructions;

    setFormData({
      ...formData,
      serviceType: initialServiceType,
      adminName: '', 
      companyName: '', 
      clientPhone: '',
      paymentKey: '', 
      zelleKey: '', 
      venmoKey: '', 
      paymentLink: '',
      planValue: '', 
      annualValue: '', 
      setupFee: '',
      setupInstallmentsCount: 1,
      hiddenFields: [], 
      activationInstructions: defaultInstructions
    });
    setShowModal(true);
  };

  const handleClauseChange = (index: number, content: string) => {
    const newClauses = [...formData.clauses];
    newClauses[index].content = content;
    setFormData({ ...formData, clauses: newClauses });
  };

  const generateClientLink = (contract: Contract) => {
    if (!contract.shortId || contract.shortId === 'undefined') return "";
    return `${window.location.origin}/#/c/${contract.shortId}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);

    const newId = generateUUID();
    const newShortId = generateShortId();
    const isBR = formData.serviceType.toLowerCase().includes(' br') || formData.serviceType.toLowerCase() === 'site br';
    const region: Region = isBR ? 'BR' : 'USA';
    const currency = isBR ? 'BRL' : 'USD';

    const newContract: Contract = {
      ...formData,
      id: newId,
      shortId: newShortId,
      region,
      currency,
      status: 'pending',
      createdAt: new Date().toLocaleString('pt-BR'),
    };

    try {
      await storageService.saveContract(newContract);
      await webhookService.sendToSheets(newContract);

      setContracts(prev => [newContract, ...prev]);
      setShowModal(false);
      setShowSuccess(newId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      alert("Erro ao salvar no banco de dados. Verifique sua conexão.");
    } finally {
      setIsSyncing(false);
    }
  };

  const copyLink = (contract: Contract) => {
    const link = generateClientLink(contract);
    if (!link) {
      alert('Erro: ID inválido.');
      return;
    }
    navigator.clipboard.writeText(link);
    alert('Link curto copiado!');
  };

  return (
    <div className="flex min-h-screen bg-brand-dark text-white">
      <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col sticky top-0 h-screen bg-brand-dark/50 backdrop-blur-xl">
        <div className="p-6 flex-grow">
          <div className="flex items-center gap-2 mb-8 px-2 text-white/40 uppercase tracking-widest text-[10px] font-bold">
            <LayoutGrid size={16} className="text-brand-green" /> Serviços Easy
          </div>
          <nav className="space-y-1">
            {SERVICES.map((service) => (
              <button 
                key={service} 
                onClick={() => setSelectedService(service)} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${selectedService === service ? 'bg-brand-green/10 text-brand-green font-bold' : 'text-white/50 hover:bg-white/5'}`}
              >
                <span className="capitalize">{service}</span>
                {selectedService === service && <ChevronRight size={14} />}
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
              <button 
                onClick={() => setSelectedService('CONTRATO VAZIO')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${selectedService === 'CONTRATO VAZIO' ? 'bg-brand-green/10 text-brand-green font-bold' : 'text-white/30 hover:bg-white/5'}`}
              >
                <span className="flex items-center gap-2"><Plus size={16} /> Contrato Vazio</span>
                {selectedService === 'CONTRATO VAZIO' && <ChevronRight size={14} />}
              </button>
              <button 
                onClick={() => setSelectedService(PERSONALIZED_TAB)} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${selectedService === PERSONALIZED_TAB ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-white/30 hover:bg-white/5'}`}
              >
                <span className="flex items-center gap-2"><Sparkles size={16} /> Personalizado</span>
                {selectedService === PERSONALIZED_TAB && <ChevronRight size={14} />}
              </button>
            </div>
          </nav>
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8">
        {/* Mobile Service Selector */}
        <div className="lg:hidden mb-6 space-y-2">
          <div className="flex items-center gap-2 mb-3 px-2 text-white/40 uppercase tracking-widest text-[10px] font-bold">
            <LayoutGrid size={14} className="text-brand-green" /> Selecionar Serviço
          </div>
          <div className="grid grid-cols-1 gap-2">
            {SERVICES.map((service) => (
              <button 
                key={service} 
                onClick={() => setSelectedService(service)} 
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${selectedService === service ? 'bg-brand-green/10 border-brand-green text-brand-green' : 'bg-white/5 border-white/10 text-white/40'}`}
              >
                <span className="capitalize">{service}</span>
                {selectedService === service && <ChevronRight size={14} />}
              </button>
            ))}
            <button 
              onClick={() => setSelectedService('CONTRATO VAZIO')} 
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${selectedService === 'CONTRATO VAZIO' ? 'bg-brand-green/10 border-brand-green text-brand-green' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              <span className="flex items-center gap-2"><Plus size={14} /> Contrato Vazio</span>
              {selectedService === 'CONTRATO VAZIO' && <ChevronRight size={14} />}
            </button>
            <button 
              onClick={() => setSelectedService(PERSONALIZED_TAB)} 
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${selectedService === PERSONALIZED_TAB ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              <span className="flex items-center gap-2"><Sparkles size={14} /> Personalizado</span>
              {selectedService === PERSONALIZED_TAB && <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-brand-green/20 border border-brand-green/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-green text-brand-dark p-2 rounded-full"><Check size={20} /></div>
              <div>
                <p className="font-bold text-brand-green uppercase tracking-wide text-xs">Contrato Gerado!</p>
                <p className="text-[10px] text-white/60">O link curto está pronto.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const c = contracts.find(c => c.id === showSuccess);
                if (c) copyLink(c);
              }}
              className="w-full sm:w-auto bg-brand-green text-brand-dark px-6 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-brand-green/20"
            >
              <Copy size={16} /> Copiar Link Curto
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold capitalize">{selectedService}</h1>
            <p className="text-white/40 text-sm">Controle de registros e assinaturas.</p>
          </div>
          <Button onClick={handleOpenModal} size="lg" className="hover:scale-105 transition-transform">
            <Plus size={20} /> Novo Contrato
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Clock className="animate-spin text-brand-green mb-4" size={32} />
              <p className="text-white/40 text-xs font-bold uppercase">Carregando Nuvem...</p>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <Clock size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/40">Nenhum contrato aqui.</p>
            </div>
          ) : (
            filteredContracts.map(contract => (
              <Card key={contract.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contract.status === 'signed' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-blue/20 text-brand-blue'}`}>
                    {contract.status === 'signed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm uppercase">{contract.adminName || 'Cliente sem Nome'}</h3>
                      {(contract.clientPhone || contract.clientData?.whatsapp) && (
                        <a 
                          href={`https://wa.me/${(contract.clientPhone || contract.clientData?.whatsapp || '').replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-brand-green hover:brightness-125 transition-all"
                          title="Enviar mensagem no WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-white/40">ID Curto: <span className="font-mono text-brand-blue">{contract.shortId}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button onClick={() => copyLink(contract)} variant="outline" size="sm" className="flex-1 sm:flex-initial bg-brand-blue/10 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/20">
                    <Copy size={14} /> Link Curto
                  </Button>
                  <a href={generateClientLink(contract)} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 text-white/60 border border-white/10 rounded-lg hover:text-white transition-all">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-brand-dark/95 backdrop-blur-md overflow-hidden">
          <div className="bg-brand-dark border border-white/10 rounded-2xl w-full max-w-7xl shadow-2xl flex flex-col h-[95vh]">
            <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-[0.2em] text-brand-green flex items-center gap-2">
                <PenTool size={18} /> Configuração Completa do Contrato
              </h2>
              <Button onClick={() => setShowModal(false)} variant="ghost" className="text-white/20 hover:text-white p-2 h-auto"><X size={24} /></Button>
            </div>

            <div className="flex flex-col lg:flex-row overflow-hidden flex-grow">
              <div className="p-4 sm:p-8 lg:w-1/2 overflow-y-auto custom-scrollbar bg-[#0C2533]">
                <form onSubmit={handleCreate} className="space-y-12 pb-10">
                  <div className="space-y-6">
                    <h3 className="text-brand-green font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <Building2 size={14} /> 01. Identificação da Contratada
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome Completo (Responsável)</Label>
                        <Input type="text" value={formData.providerName} onChange={e => setFormData({...formData, providerName: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Marca/Fantasia</Label>
                          <Input type="text" value={formData.providerBrand} onChange={e => setFormData({...formData, providerBrand: e.target.value})} />
                        </div>
                        <div>
                          <Label>Sede / Endereço</Label>
                          <Input type="text" value={formData.providerAddress} onChange={e => setFormData({...formData, providerAddress: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-brand-green font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <UserCircle size={14} /> 02. Dados do Contratante
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Cliente</Label>
                        <Input type="text" required value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} placeholder="Ex: João Silva" />
                      </div>
                      <div>
                        <Label>Nome da Empresa</Label>
                        <Input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Ex: João Burguer" />
                      </div>
                      <div>
                        <Label>WhatsApp do Cliente</Label>
                        <Input type="text" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} placeholder="Ex: +55 11 99999-9999" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-brand-green font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <DollarSign size={14} /> 03. Plano e Valores
                    </h3>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-5">
                      <div>
                        <Label>Título do Serviço</Label>
                        <Input type="text" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} className="bg-brand-dark text-brand-blue font-bold" />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={() => setFormData({...formData, planType: PlanType.MONTHLY})} variant={formData.planType === PlanType.MONTHLY ? 'primary' : 'outline'} className="flex-1 uppercase text-[10px]">Mensal</Button>
                        <Button type="button" onClick={() => setFormData({...formData, planType: PlanType.ANNUAL})} variant={formData.planType === PlanType.ANNUAL ? 'primary' : 'outline'} className="flex-1 uppercase text-[10px]">Anual</Button>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div><Label className="text-[8px] text-white/30">V. Parcela</Label><Input type="text" value={formData.planValue} onChange={e => setFormData({...formData, planValue: e.target.value})} className="bg-brand-dark p-3" /></div>
                        <div><Label className="text-[8px] text-white/30">V. Total Anual</Label><Input type="text" value={formData.annualValue} onChange={e => setFormData({...formData, annualValue: e.target.value})} className="bg-brand-dark p-3" /></div>
                        <div><Label className="text-[8px] text-white/30">Setup / Taxa</Label><Input type="text" value={formData.setupFee} onChange={e => setFormData({...formData, setupFee: e.target.value})} className="bg-brand-dark p-3" /></div>
                        <div>
                          <Label className="text-[8px] text-white/30">Parc. Setup</Label>
                          <Select 
                            value={formData.setupInstallmentsCount} 
                            onChange={e => setFormData({...formData, setupInstallmentsCount: parseInt(e.target.value)})}
                            className="bg-brand-dark p-3"
                          >
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-brand-green font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <Wallet size={14} /> 04. Chaves de Pagamento
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Zelle</Label>
                        <Input type="text" value={formData.zelleKey} onChange={e => setFormData({...formData, zelleKey: e.target.value})} placeholder="Chave Zelle" />
                      </div>
                      <div>
                        <Label>Venmo</Label>
                        <Input type="text" value={formData.venmoKey} onChange={e => setFormData({...formData, venmoKey: e.target.value})} placeholder="Chave Venmo" />
                      </div>
                      <div>
                        <Label>PIX (Brasil)</Label>
                        <Input type="text" value={formData.paymentKey} onChange={e => setFormData({...formData, paymentKey: e.target.value})} placeholder="Chave PIX" />
                      </div>
                      <div>
                        <Label>Link de Pagamento</Label>
                        <Input type="text" value={formData.paymentLink} onChange={e => setFormData({...formData, paymentLink: e.target.value})} placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-brand-green font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <ScrollText size={14} /> 05. Instruções e Cláusulas
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <Label>Instruções de Ativação (Box Verde)</Label>
                        <Textarea rows={6} value={formData.activationInstructions} onChange={e => setFormData({...formData, activationInstructions: e.target.value})} />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-brand-green flex items-center gap-2">
                            <MessageSquareQuote size={14} /> Edição de Cláusulas Contratuais
                          </Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            onClick={handleRestoreDefault}
                            disabled={isSavingTemplate}
                            variant="outline"
                            className="text-[9px] px-3 py-1.5 h-auto"
                            title="Restaurar Cláusulas Originais"
                          >
                            <RefreshCcw size={12} className={isSavingTemplate ? 'animate-spin' : ''} />
                            Restaurar
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleSaveAsDefault}
                            disabled={isSavingTemplate}
                            variant="outline"
                            className="bg-brand-green/10 text-brand-green border-brand-green/20 text-[9px] px-3 py-1.5 h-auto hover:bg-brand-green/20"
                          >
                            {isSavingTemplate ? <Clock size={12} className="animate-spin" /> : <Save size={12} />}
                            Salvar como Modelo Padrão
                          </Button>
                        </div>
                        </div>
                        {formData.clauses.map((clause, idx) => (
                          <Card key={clause.id} className="p-4 space-y-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase">Cláusula {clause.id}: {clause.title}</span>
                            <Textarea value={clause.content} onChange={e => handleClauseChange(idx, e.target.value)} className="bg-brand-dark p-3 text-[10px] text-white/60" rows={3} />
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 pt-4 pb-2 bg-[#0C2533] space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-3">
                      <Button 
                        type="button" 
                        onClick={handleRestoreDefault}
                        disabled={isSavingTemplate}
                        variant="ghost"
                        className="text-[9px] text-white/30 hover:text-white h-auto"
                      >
                        <RefreshCcw size={12} /> Restaurar Cláusulas Originais
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleSaveAsDefault}
                        disabled={isSavingTemplate}
                        variant="ghost"
                        className="text-[9px] text-brand-green hover:brightness-110 h-auto"
                      >
                        <Save size={12} /> Salvar como Modelo Padrão
                      </Button>
                    </div>
                    <Button type="submit" disabled={isSyncing} className="w-full py-5 uppercase tracking-widest text-[11px] shadow-brand-green/20">
                      {isSyncing ? <><Clock className="animate-spin" size={18} /> Sincronizando com a Nuvem...</> : <><Plus size={18} /> Salvar e Gerar Link Único</>}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="hidden lg:block lg:w-1/2 bg-white/5 p-8 border-l border-white/10 overflow-y-auto">
                <div className="sticky top-0">
                  <h3 className="text-[10px] font-bold uppercase text-white/20 mb-4 flex items-center gap-2">
                    <Clock size={14} /> Visão em Tempo Real do Cliente
                  </h3>
                  <div className="origin-top scale-[0.75] transform-gpu">
                    <ContractPreview {...formData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
