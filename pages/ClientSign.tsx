
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { webhookService } from '../services/webhookService';
import { Contract, ClientData } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { formatCPF, formatWhatsApp, validateCPF, validateWhatsApp, getClientIP, getClientLocation, generateInstallments } from '../utils';
import ContractPreview from '../components/ContractPreview';
import SignatureCanvas from '../components/SignatureCanvas';
import { BRAND } from '../constants';
import { User, Phone, MapPin, Mail, AlertCircle, Clock, ShieldCheck, FileText } from 'lucide-react';

const ClientSign: React.FC = () => {
  const { id, shortId } = useParams<{ id?: string; shortId?: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  
  const [clientData, setClientData] = useState<ClientData>({
    fullName: '',
    email: '',
    cpf: '',
    birthDate: '',
    whatsapp: '',
    address: ''
  });
  const [signature, setSignature] = useState<string>('');

  useEffect(() => {
    const fetchContract = async () => {
      setIsSearching(true);
      setError(null);
      try {
        let c: Contract | undefined;
        if (shortId) {
          c = await storageService.getContractByShortId(shortId);
        }
        if (!c && id) {
          c = await storageService.getContractById(id);
        }
        if (c) {
          setContract(c);
          if (c.status === 'signed') navigate(`/contrato/${c.id}`);
        } else {
          setError('Este contrato não foi encontrado na nuvem ou o link expirou.');
        }
      } catch {
        setError('Ocorreu um erro ao conectar com o servidor. Tente novamente.');
      } finally {
        setIsSearching(false);
      }
    };
    fetchContract();
  }, [id, shortId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (clientData.fullName.length < 5) return setError('Digite seu nome completo.');
    if (!validateCPF(clientData.cpf)) return setError('CPF inválido.');
    if (!validateWhatsApp(clientData.whatsapp)) return setError('WhatsApp inválido.');
    if (!signature) return setError('A assinatura é obrigatória.');

    setIsSubmitting(true);
    try {
      const ip = await getClientIP();
      const loc = await getClientLocation();
      
      const signedAt = new Date().toLocaleString('pt-BR');
      const installments = generateInstallments(
        signedAt,
        contract!.planType,
        contract!.planValue,
        contract!.setupFee,
        contract!.setupInstallmentsCount || 1
      );

      const updatedContract: Contract = {
        ...contract!,
        status: 'signed',
        signedAt,
        clientData,
        signatureImage: signature,
        installments,
        metadata: {
          ip,
          location: loc,
          userAgent: navigator.userAgent
        }
      };

      await storageService.saveContract(updatedContract);
      await webhookService.sendToSheets(updatedContract);

      navigate(`/contrato/${updatedContract.id}`, { state: { autoPrint: true } });
    } catch {
      setError('Erro ao processar assinatura na nuvem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <AlertCircle size={60} className="text-red-400 mb-4" />
      <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
      <p className="text-white/40 mb-6 max-w-sm">{error}</p>
      <Button onClick={() => window.location.reload()} variant="outline" className="text-brand-green border-brand-green/20 bg-brand-green/10 px-6 py-3 h-auto text-[10px]">Tentar Novamente</Button>
    </div>
  );

  if (isSearching) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Clock className="animate-spin text-brand-green mb-4" size={40} />
      <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Buscando Contrato na Nuvem...</p>
    </div>
  );

  if (!contract) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="lg:w-3/5 w-full space-y-4">
          <div className="flex items-center gap-2 text-brand-green font-bold uppercase tracking-widest text-[10px] mb-2">
            <FileText size={16} /> Verifique os termos abaixo:
          </div>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5">
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
              <ContractPreview
                {...contract}
                clientData={clientData}
                signature={signature}
                currency={contract.currency}
              />
            </div>
          </div>
        </div>

        <div className="lg:w-2/5 w-full lg:sticky lg:top-24">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-8">
            <div className="text-center">
              <img src={BRAND.logo} alt="Logo" className="h-14 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white">Assinatura Digital</h1>
              <p className="text-brand-green text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Segura e Blindada</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 z-10" size={16} />
                  <Input type="text" required placeholder="Nome Completo" className="pl-12 py-4" value={clientData.fullName} onChange={e => setClientData({...clientData, fullName: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input type="text" required placeholder="CPF (11 dígitos)" className="py-4" value={clientData.cpf} onChange={e => setClientData({...clientData, cpf: formatCPF(e.target.value)})} />
                  <Input type="date" required className="py-4" value={clientData.birthDate} onChange={e => setClientData({...clientData, birthDate: e.target.value})} />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 z-10" size={16} />
                  <Input type="text" required placeholder="WhatsApp" className="pl-12 py-4" value={clientData.whatsapp} onChange={e => setClientData({...clientData, whatsapp: formatWhatsApp(e.target.value, contract.region)})} />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-white/20 z-10" size={16} />
                  <Textarea required rows={2} placeholder="Endereço Completo" className="pl-12 py-4 resize-none" value={clientData.address} onChange={e => setClientData({...clientData, address: e.target.value})} />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 z-10" size={16} />
                  <Input type="email" required placeholder="E-mail para receber cópia" className="pl-12 py-4" value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-left">
                <SignatureCanvas onSave={setSignature} onClear={() => setSignature('')} />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-2xl flex items-center gap-2 font-bold uppercase">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full py-5 h-auto shadow-xl shadow-brand-green/20 text-[10px]">
                {isSubmitting ? (
                  <><Clock className="animate-spin" size={18} /> Validando...</>
                ) : (
                  <><ShieldCheck size={18} /> Finalizar e Assinar</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSign;
