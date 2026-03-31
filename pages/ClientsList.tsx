
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { webhookService } from '../services/webhookService';
import { Contract, PaymentStatus, DeliveryStatus, Region, PlanType } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Search, User, Calendar, ArrowRight, UserCheck, Settings2, X, AlertCircle, Clock, Trash2, Truck, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import { isToday, isThisWeek, isThisMonth, addBusinessDays, getDaysRemaining, getPlanExpirationDate, getPlanDaysRemaining } from '../utils';
import { PERSONALIZED_SERVICES } from '../constants';

const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Contract[]>([]);
  const [regionFilter, setRegionFilter] = useState<'all' | Region>('all');
  const [financeFilter, setFinanceFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [deliveryView, setDeliveryView] = useState(false);
  const [expiryView, setExpiryView] = useState(false);
  const [managingClient, setManagingClient] = useState<Contract | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    const all = await storageService.getAllContracts();
    const signed = all.filter(c => c.status === 'signed');
    setClients(signed);
    setIsLoading(false);
  };

  const handleUpdateClient = async (updated: Contract) => {
    setIsSyncing(true);
    try {
      await storageService.saveContract(updated);
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
      await webhookService.sendToSheets(updated);
      setManagingClient(null);
    } catch {
      alert("Erro ao sincronizar com a Nuvem.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (window.confirm(`Excluir o cliente "${name}" da Nuvem?`)) {
      await storageService.deleteContract(id);
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleReady = async (client: Contract) => {
    const newStatus: DeliveryStatus = client.deliveryStatus === 'delivered' ? 'pending' : 'delivered';
    const updated = { ...client, deliveryStatus: newStatus };
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    await storageService.saveContract(updated);
    webhookService.sendToSheets(updated);
  };

  const filteredClients = clients.filter(c => {
    const name = c.clientData?.fullName || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.clientData?.cpf || '').includes(searchTerm) ||
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = regionFilter === 'all' || c.region === regionFilter;

    let matchesFinance = true;
    if (financeFilter === 'today') matchesFinance = isToday(c.nextDueDate);
    if (financeFilter === 'week') matchesFinance = isThisWeek(c.nextDueDate);
    if (financeFilter === 'month') matchesFinance = isThisMonth(c.nextDueDate);

    if (deliveryView && c.deliveryStatus === 'delivered' && !searchTerm) return false;

    return matchesSearch && matchesRegion && matchesFinance;
  });

  const displayedClients = expiryView
    ? [...filteredClients].sort((a, b) => getPlanDaysRemaining(a.signedAt) - getPlanDaysRemaining(b.signedAt))
    : filteredClients;

  const getStatusLabel = (status?: PaymentStatus) => {
    switch (status) {
      case 'paid': return { label: 'Em Dia', color: 'text-brand-green bg-brand-green/10' };
      case 'overdue': return { label: 'Atrasado', color: 'text-red-400 bg-red-400/10' };
      case 'inactive': return { label: 'Inativo', color: 'text-white/40 bg-white/5' };
      default: return { label: 'Aguardando', color: 'text-yellow-400 bg-yellow-400/10' };
    }
  };

  const getDeliveryInfo = (client: Contract) => {
    if (!client.signedAt) return { deadline: '---', remaining: 0 };
    const isPersonalized = PERSONALIZED_SERVICES.includes(client.serviceType);
    const days = isPersonalized ? 30 : 15;
    const deadline = addBusinessDays(client.signedAt, days);
    const remaining = getDaysRemaining(deadline);
    return { deadline, remaining };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserCheck className="text-brand-green" /> Meus Clientes
          </h1>
          <p className="text-white/60">Gestão operacional na nuvem.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button 
            onClick={() => { setDeliveryView(!deliveryView); setExpiryView(false); }}
            variant={deliveryView ? 'primary' : 'outline'}
            className={`px-4 py-2 h-auto text-xs flex items-center gap-2 ${deliveryView ? 'shadow-lg shadow-brand-green/20' : 'text-white/40 hover:text-white'}`}
          >
            <Truck size={16} /> Fila de Entrega
          </Button>
          <Button 
            onClick={() => { setExpiryView(!expiryView); setDeliveryView(false); }}
            variant={expiryView ? 'outline' : 'outline'}
            className={`px-4 py-2 h-auto text-xs flex items-center gap-2 border transition-all ${expiryView ? 'bg-brand-blue border-brand-blue text-brand-dark shadow-lg shadow-brand-blue/20' : 'text-white/40 hover:text-white'}`}
          >
            <ShieldAlert size={16} /> Planos a vencer
          </Button>
          <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>
          <Button onClick={() => setRegionFilter(regionFilter === 'USA' ? 'all' : 'USA')} variant={regionFilter === 'USA' ? 'outline' : 'outline'} className={`px-4 py-2 h-auto text-xs ${regionFilter === 'USA' ? 'bg-brand-blue border-brand-blue text-brand-dark' : 'text-white/40'}`}>🇺🇸 USA</Button>
          <Button onClick={() => setRegionFilter(regionFilter === 'BR' ? 'all' : 'BR')} variant={regionFilter === 'BR' ? 'primary' : 'outline'} className={`px-4 py-2 h-auto text-xs ${regionFilter === 'BR' ? '' : 'text-white/40'}`}>🇧🇷 BR</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <Input 
            type="text"
            placeholder="Buscar por nome, empresa..."
            className="pl-12 py-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 lg:col-span-3">
          <Button onClick={() => setFinanceFilter(financeFilter === 'today' ? 'all' : 'today')} variant={financeFilter === 'today' ? 'outline' : 'outline'} className={`flex flex-col items-center justify-center p-3 h-auto rounded-2xl ${financeFilter === 'today' ? 'bg-brand-blue border-brand-blue text-brand-dark' : 'bg-white/5 text-white/40'}`}><AlertCircle size={18} /><span className="text-[9px] font-bold uppercase mt-1">Hoje</span></Button>
          <Button onClick={() => setFinanceFilter(financeFilter === 'week' ? 'all' : 'week')} variant={financeFilter === 'week' ? 'primary' : 'outline'} className={`flex flex-col items-center justify-center p-3 h-auto rounded-2xl ${financeFilter === 'week' ? '' : 'bg-white/5 text-white/40'}`}><Calendar size={18} /><span className="text-[9px] font-bold uppercase mt-1">Semana</span></Button>
          <Button onClick={() => setFinanceFilter(financeFilter === 'month' ? 'all' : 'month')} variant={financeFilter === 'month' ? 'outline' : 'outline'} className={`flex flex-col items-center justify-center p-3 h-auto rounded-2xl ${financeFilter === 'month' ? 'bg-brand-blue border-brand-blue text-brand-dark' : 'bg-white/5 text-white/40'}`}><Clock size={18} /><span className="text-[9px] font-bold uppercase mt-1">Mês</span></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <Clock className="animate-spin text-brand-green mb-4" size={32} />
            <p className="text-white/40 text-xs font-bold uppercase">Carregando Assinaturas...</p>
          </div>
        ) : displayedClients.length === 0 ? (
           <div className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <User className="mx-auto mb-4 text-white/10" size={48} />
            <p className="text-white/40">Nenhum cliente assinado encontrado.</p>
          </div>
        ) : displayedClients.map(client => {
          const statusInfo = getStatusLabel(client.paymentStatus);
          const isDelivered = client.deliveryStatus === 'delivered';
          const expirationDate = getPlanExpirationDate(client.signedAt);
          const deliveryInfo = getDeliveryInfo(client);

          return (
            <div key={client.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 flex gap-2">
                <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${statusInfo.color}`}>{statusInfo.label}</span>
                <Button onClick={() => handleDeleteClient(client.id, client.clientData?.fullName || client.adminName)} variant="ghost" className="p-1.5 h-auto text-white/20 hover:text-red-400"><Trash2 size={16} /></Button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-brand-green/20 text-brand-green"><User size={28} /></div>
                <div className="overflow-hidden text-left">
                  <h3 className="font-bold text-lg text-white truncate">{client.clientData?.fullName}</h3>
                  <p className="text-sm text-white/40 truncate uppercase text-[10px] tracking-widest">{client.companyName}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3 flex-grow text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-brand-blue font-bold uppercase">{client.serviceType}</span>
                  {isDelivered ? (
                    <span className="text-[10px] text-brand-green font-bold flex items-center gap-1"><CheckCircle2 size={12} /> ENTREGUE</span>
                  ) : deliveryView ? (
                    <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1"><Clock size={12} /> EM PRODUÇÃO</span>
                  ) : null}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-left">
                  <div>
                    <p className="text-white/30 uppercase font-bold text-[9px]">Valor Contratado</p>
                    <p className="text-white/70 font-medium">{client.region === 'BR' ? 'R$' : '$'}{client.planType === PlanType.ANNUAL ? client.annualValue : client.planValue}</p>
                  </div>
                  
                  <div className="text-right">
                    {deliveryView ? (
                      <>
                        <p className="text-brand-green uppercase font-bold text-[9px]">Entrega Limite</p>
                        <p className="text-brand-green font-bold text-[13px]">{deliveryInfo?.deadline}</p>
                      </>
                    ) : expiryView ? (
                      <>
                        <p className="text-brand-blue uppercase font-bold text-[9px]">Fim do Contrato</p>
                        <p className="text-brand-blue font-bold text-[13px]">{expirationDate}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-white/30 uppercase font-bold text-[9px]">Vencimento</p>
                        <p className="text-white/70 font-bold text-[13px]">{client.nextDueDate ? new Date(client.nextDueDate).toLocaleDateString('pt-BR') : 'A definir'}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => toggleReady(client)} variant={isDelivered ? 'primary' : 'outline'} className={`h-auto py-3 text-[10px] ${isDelivered ? '' : 'text-brand-green border-brand-green/20 hover:bg-brand-green/10'}`}><CheckCircle2 size={14} /> {isDelivered ? 'Pronto' : 'Marcar'}</Button>
                <Button onClick={() => setManagingClient(client)} variant="outline" className="h-auto py-3 text-[10px] text-white/60 hover:bg-white/10"><Settings2 size={14} /> Gerenciar</Button>
                <Button onClick={() => navigate(`/contrato/${client.id}`, { state: { fromAdmin: true } })} variant="outline" className="h-auto py-3 text-[10px] text-brand-green border-brand-green/10 hover:bg-brand-green/20">Ficha <ArrowRight size={14} /></Button>
              </div>
            </div>
          );
        })}
      </div>

      {managingClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-brand-dark border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <Settings2 className="text-brand-green" size={20} />
                <h2 className="font-bold text-sm uppercase tracking-widest text-white">Painel de Gestão</h2>
              </div>
              <Button onClick={() => setManagingClient(null)} variant="ghost" className="text-white/20 hover:text-white p-0 h-auto"><X size={24} /></Button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-bold text-brand-green uppercase tracking-widest flex items-center gap-2">
                    <Truck size={14} /> Produção / Prazo
                  </h4>
                  <span className="text-[9px] text-white/30 uppercase font-bold">Expira: {getPlanExpirationDate(managingClient.signedAt)}</span>
                </div>
                <div>
                  <Label>Status da Entrega</Label>
                  <Select className="bg-brand-dark h-auto p-3" value={managingClient.deliveryStatus || 'pending'} onChange={(e) => setManagingClient({...managingClient, deliveryStatus: e.target.value as DeliveryStatus})}>
                    <option value="pending">Produção Pendente</option>
                    <option value="delivered">Sistema Entregue (Pronto)</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Link do Sistema Finalizado</Label>
                  <Input type="text" className="py-3" placeholder="https://..." value={managingClient.finalSystemLink || ''} onChange={(e) => setManagingClient({...managingClient, finalSystemLink: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <Label>Status Financeiro</Label>
                    <Select className="bg-brand-dark h-auto p-3" value={managingClient.paymentStatus || 'awaiting_setup'} onChange={(e) => setManagingClient({...managingClient, paymentStatus: e.target.value as PaymentStatus})}>
                      <option value="awaiting_setup">Aguardando Setup</option>
                      <option value="paid">Em Dia</option>
                      <option value="overdue">Atrasado</option>
                      <option value="inactive">Inativo</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Próx. Vencimento</Label>
                    <Input type="date" className="bg-brand-dark h-auto p-3" value={managingClient.nextDueDate || ''} onChange={(e) => setManagingClient({...managingClient, nextDueDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button onClick={() => setManagingClient(null)} variant="ghost" className="flex-1 py-4 h-auto text-[10px] text-white/40">Cancelar</Button>
                <Button onClick={() => handleUpdateClient(managingClient)} disabled={isSyncing} className="flex-2 py-4 h-auto text-[10px]">
                  {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
