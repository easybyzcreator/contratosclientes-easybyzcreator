import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter,
  Calendar,
  FileText,
  MessageCircle,
  X
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Contract, Installment, InstallmentStatus } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Label } from '../components/ui/label';

const FinanceDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCurrency, setActiveCurrency] = useState<'BRL' | 'USD'>('BRL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstallmentStatus | 'all'>('all');
  const [paymentModal, setPaymentModal] = useState<{ contractId: string; index: number; date: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await storageService.getAllContracts();
        setContracts(data);
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMarkAsPaid = async (contractId: string, installmentIndex: number, paymentDate: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract || !contract.installments) return;

    const updatedInstallments = [...contract.installments];
    updatedInstallments[installmentIndex] = {
      ...updatedInstallments[installmentIndex],
      status: 'paid',
      paidAt: paymentDate
    };

    try {
      await storageService.updateContract(contractId, { installments: updatedInstallments });
      setContracts(contracts.map(c => c.id === contractId ? { ...c, installments: updatedInstallments } : c));
      setPaymentModal(null);
    } catch {
      alert('Erro ao atualizar status da parcela.');
    }
  };

  const getAllInstallments = () => {
    const all: { contract: Contract; installment: Installment; index: number }[] = [];
    contracts.forEach(contract => {
      if (contract.installments && contract.currency === activeCurrency) {
        contract.installments.forEach((inst, idx) => {
          const matchesSearch = contract.clientData?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               contract.clientName.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
          
          if (matchesSearch && matchesStatus) {
            all.push({ contract, installment: inst, index: idx });
          }
        });
      }
    });
    return all.sort((a, b) => {
      const dateA = new Date(a.installment.dueDate.split('/').reverse().join('-'));
      const dateB = new Date(b.installment.dueDate.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  };

  const stats = {
    totalPaid: contracts
      .filter(c => c.currency === activeCurrency)
      .reduce((acc, c) => acc + (c.installments?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.value, 0) || 0), 0),
    totalPending: contracts
      .filter(c => c.currency === activeCurrency)
      .reduce((acc, c) => acc + (c.installments?.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.value, 0) || 0), 0),
    totalOverdue: contracts
      .filter(c => c.currency === activeCurrency)
      .reduce((acc, c) => acc + (c.installments?.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.value, 0) || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  const filteredInstallments = getAllInstallments();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="text-brand-green" /> Financeiro
          </h1>
          <p className="text-white/40 text-sm mt-1">Gestão de cobranças e recebimentos</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <Button 
            onClick={() => setActiveCurrency('BRL')}
            variant={activeCurrency === 'BRL' ? 'primary' : 'ghost'}
            className="px-6 py-2 h-auto text-xs"
          >
            BRASIL (R$)
          </Button>
          <Button 
            onClick={() => setActiveCurrency('USD')}
            variant={activeCurrency === 'USD' ? 'primary' : 'ghost'}
            className="px-6 py-2 h-auto text-xs"
          >
            USA (US$)
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-2xl">
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Recebido</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {activeCurrency === 'BRL' ? 'R$' : 'US$'} {stats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-2xl">
              <Clock className="text-yellow-500" size={24} />
            </div>
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Pendente</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {activeCurrency === 'BRL' ? 'R$' : 'US$'} {stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <AlertCircle className="text-red-500" size={24} />
            </div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Atrasado</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {activeCurrency === 'BRL' ? 'R$' : 'US$'} {stats.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <Input 
              type="text" 
              placeholder="Buscar por cliente..." 
              className="pl-12 py-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
            <Filter size={16} className="text-white/40" />
            <Select 
              className="bg-transparent border-none outline-none text-sm text-white cursor-pointer h-auto p-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InstallmentStatus | 'all')}
            >
              <option value="all" className="bg-zinc-900">Todos os Status</option>
              <option value="pending" className="bg-zinc-900">Pendentes</option>
              <option value="paid" className="bg-zinc-900">Pagos</option>
              <option value="overdue" className="bg-zinc-900">Atrasados</option>
            </Select>
          </div>
        </div>

        {/* Installments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Vencimento</th>
                <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Cliente</th>
                <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Tipo</th>
                <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Valor</th>
                <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInstallments.length > 0 ? (
                filteredInstallments.map(({ contract, installment, index }) => (
                  <tr key={`${contract.id}-${index}`} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand-green" />
                        <span className="text-sm text-white font-medium">{installment.dueDate}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-bold">{contract.clientData?.fullName || contract.clientName}</span>
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
                        <span className="text-[10px] text-white/40 uppercase tracking-tighter">{contract.planType}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                        installment.type === 'setup' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {installment.type === 'setup' ? 'Setup' : 'Mensalidade'}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-bold text-white">
                        {activeCurrency === 'BRL' ? 'R$' : 'US$'} {installment.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {installment.status === 'paid' ? (
                          <div className="flex items-center gap-1.5 text-green-500">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pago</span>
                          </div>
                        ) : installment.status === 'overdue' ? (
                          <div className="flex items-center gap-1.5 text-red-500">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Atrasado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-yellow-500">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pendente</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      {installment.status !== 'paid' && (
                        <Button 
                          onClick={() => setPaymentModal({ 
                            contractId: contract.id, 
                            index, 
                            date: new Date().toLocaleDateString('pt-BR') 
                          })}
                          variant="outline"
                          className="text-brand-green border-brand-green/20 bg-brand-green/10 hover:bg-brand-green hover:text-black px-4 py-2 h-auto text-[10px]"
                        >
                          Baixar Parcela
                        </Button>
                      )}
                      {installment.status === 'paid' && (
                        <span className="text-[9px] text-white/20 uppercase font-bold">Pago em {installment.paidAt}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-white/20">
                      <FileText size={40} />
                      <p className="text-sm font-medium">Nenhuma parcela encontrada para os filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="text-brand-green" /> Confirmar Pagamento
              </h3>
              <Button onClick={() => setPaymentModal(null)} variant="ghost" className="text-white/20 hover:text-white p-0 h-auto">
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-2">Data do Pagamento</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" size={16} />
                  <Input 
                    type="text" 
                    value={paymentModal.date}
                    onChange={(e) => setPaymentModal({ ...paymentModal, date: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="pl-12 py-4"
                  />
                </div>
                <p className="text-[9px] text-white/20 mt-2">Informe a data em que o cliente realizou o pagamento.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  onClick={() => setPaymentModal(null)}
                  variant="outline"
                  className="flex-1 py-4 h-auto text-[10px]"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleMarkAsPaid(paymentModal.contractId, paymentModal.index, paymentModal.date)}
                  className="flex-1 py-4 h-auto text-[10px] shadow-lg shadow-brand-green/20"
                >
                  Confirmar Baixa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;
