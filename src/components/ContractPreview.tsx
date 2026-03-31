
import React from 'react';
import { BRAND, CONTRACT_TEMPLATE } from '../constants';
import { PlanType, Clause, Installment } from '../types';

interface Props {
  serviceType: string;
  providerName: string;
  providerBrand: string;
  providerAddress: string;
  adminName: string;
  companyName: string;
  planType: PlanType;
  planValue: string;
  annualValue?: string;
  setupFee: string;
  paymentKey?: string;
  zelleKey?: string;
  venmoKey?: string;
  paymentLink?: string;
  clauses: Clause[];
  hiddenFields: string[];
  activationInstructions: string;
  currency?: 'BRL' | 'USD';
  installments?: Installment[];
  clientData?: {
    fullName: string;
    email: string;
    cpf: string;
    birthDate: string;
    whatsapp: string;
    address: string;
  };
  signature?: string;
  signedAt?: string;
  metadata?: {
    ip: string;
    location: string;
  };
}

const ContractPreview: React.FC<Props> = ({
  serviceType,
  providerName,
  providerBrand,
  providerAddress,
  adminName,
  companyName,
  planType,
  planValue,
  annualValue,
  setupFee,
  paymentKey,
  zelleKey,
  venmoKey,
  paymentLink,
  clauses,
  hiddenFields,
  activationInstructions,
  currency = 'BRL',
  installments,
  clientData,
  signature,
  signedAt,
  metadata
}) => {
  const isVisible = (field: string) => !hiddenFields.includes(field);
  const symbol = currency === 'BRL' ? 'R$' : 'US$';

  const formatMoney = (val: string) => {
    const clean = val?.replace(/[^\d,.]/g, '').replace(',', '.') || '0';
    const parsed = parseFloat(clean) || 0;
    return parsed.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateTotalMensalContract = () => {
    const clean = planValue?.replace(/[^\d,.]/g, '').replace(',', '.') || '0';
    const parsed = parseFloat(clean) || 0;
    return (parsed * 12).toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white text-gray-800 p-6 sm:p-10 rounded-xl shadow-2xl max-w-4xl mx-auto overflow-hidden text-sm leading-relaxed border border-gray-100 contract-container">
      <div className="text-center mb-8">
        <img src={BRAND.contractLogo} alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
        <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900 border-b-2 border-brand-green inline-block pb-1">
          {CONTRACT_TEMPLATE.title} - {serviceType?.toUpperCase()}
        </h1>
      </div>

      <section className="mb-6 space-y-4">
        {isVisible('providerInfo') && (
          <p>
            <strong className="text-brand-dark">CONTRATADA:</strong> 
            <span className="uppercase"> {providerName || 'PATRICIA GUIMARÃES'}</span>, operando sob a marca <strong>{providerBrand || 'EASY BYZ CREATOR'}</strong>, com sede em {providerAddress || 'Santa Ana, CA - EUA'}.
          </p>
        )}

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="font-bold text-brand-dark mb-2 uppercase border-b border-gray-200 pb-1 text-xs">CONTRATANTE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-2">
            {isVisible('adminName') && (
              <p className="break-words"><strong>Nome/Razão Social:</strong> <span className="text-blue-600 font-medium">{clientData?.fullName || adminName || '____________________'}</span></p>
            )}
            {isVisible('companyName') && (
              <p className="break-words"><strong>Nome Fantasia:</strong> <span className="text-blue-600 font-medium">{companyName || '____________________'}</span></p>
            )}
            <p className="break-words"><strong>E-mail:</strong> <span className="text-gray-700">{clientData?.email || '____________________'}</span></p>
            <p><strong>CPF:</strong> {clientData?.cpf || '____________________'}</p>
            <p><strong>Data de Nascimento:</strong> {clientData?.birthDate || '____________________'}</p>
            <p><strong>WhatsApp:</strong> {clientData?.whatsapp || '____________________'}</p>
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2">
            <p className="break-words w-full"><strong>Endereço:</strong> <span className="text-gray-700">{clientData?.address || '____________________'}</span></p>
          </div>
        </div>
      </section>

      {clauses.map(clause => (
        isVisible(`clause-${clause.id}`) && (
          <section key={clause.id} className="mb-4">
            <h3 className="font-bold text-gray-900 uppercase">CLÁUSULA {clause.id} – {clause.title}</h3>
            <div className="text-justify text-gray-600 mt-1 whitespace-pre-line">
              {clause.id === 1 ? clause.content.replace('[SERVICE_NAME]', serviceType?.toUpperCase() || '') :
               clause.id === 3 ? (
                <div className="space-y-2">
                  <p>{clause.content}</p>
                  {planType === PlanType.ANNUAL ? (
                    <p>
                      3.1. O CONTRATANTE opta pelo <strong>PLANO ANUAL</strong> no valor único de <strong>{symbol} {formatMoney(annualValue || '0')}</strong> + Taxa de Setup única de <strong>{symbol} {formatMoney(setupFee)}</strong>.
                    </p>
                  ) : (
                    <p>
                      3.1. O CONTRATANTE opta pelo <strong>PLANO MENSAL</strong> no valor total de <strong>{symbol} {calculateTotalMensalContract()}</strong>, o qual será pago em <strong>12 parcelas mensais</strong> de <strong>{symbol} {formatMoney(planValue)}</strong> + Taxa de Setup única de <strong>{symbol} {formatMoney(setupFee)}</strong>.
                    </p>
                  )}
                  <p>3.2. A Taxa de Setup destina-se exclusivamente à remuneração do trabalho manual de personalização e inserção de dados no sistema.</p>
                </div>
              ) : clause.content}
            </div>
          </section>
        )
      ))}

      {installments && installments.length > 0 && (
        <section className="mb-6">
          <h3 className="font-bold text-gray-900 uppercase mb-2">CRONOGRAMA DE PAGAMENTOS</h3>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-3 py-2 font-bold uppercase">Vencimento</th>
                  <th className="px-3 py-2 font-bold uppercase">Tipo</th>
                  <th className="px-3 py-2 font-bold uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {installments.map((inst, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-1.5">{inst.dueDate}</td>
                    <td className="px-3 py-1.5 uppercase">{inst.type === 'setup' ? 'Setup' : 'Mensalidade'}</td>
                    <td className="px-3 py-1.5 font-bold">{symbol} {inst.value.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(activationInstructions?.trim() || paymentKey || zelleKey || venmoKey || paymentLink) && (
        <section className="mb-6 p-5 bg-brand-green/5 rounded-xl border border-brand-green/20">
          <h3 className="font-bold text-brand-dark uppercase mb-4 text-xs border-b border-brand-green/10 pb-2">Instruções para Ativação do Serviço</h3>
          
          <div className="mb-5 space-y-2 text-xs">
            {paymentKey && !zelleKey && !venmoKey && (
              <div className="flex items-center gap-2">
                <span className="font-bold">PAGAMENTO À VISTA (PIX):</span>
                <span className="bg-white px-2 py-0.5 rounded border border-brand-green/20 text-brand-dark font-medium">{paymentKey}</span>
              </div>
            )}
            {zelleKey && (
              <div className="flex items-center gap-2">
                <span className="font-bold">ZELLE:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-brand-green/20 text-brand-dark font-medium">{zelleKey}</span>
              </div>
            )}
            {venmoKey && (
              <div className="flex items-center gap-2">
                <span className="font-bold">VENMO:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-brand-green/20 text-brand-dark font-medium">{venmoKey}</span>
              </div>
            )}
            {paymentLink && (
              <div className="flex flex-col gap-1 pt-1">
                <span className="font-bold">PAGAMENTO PARCELADO (Link):</span>
                <span className="text-blue-600 break-all bg-white px-2 py-1 rounded border border-brand-green/20 text-[10px]">{paymentLink}</span>
              </div>
            )}
          </div>

          {activationInstructions?.trim() && (
            <div className="space-y-4 text-[10px] sm:text-[11px] text-gray-700 leading-relaxed text-justify whitespace-pre-line">
              {activationInstructions}
            </div>
          )}
        </section>
      )}

      <div className="mt-10 pt-6 border-t border-gray-200">
        <p className="text-center font-medium mb-6 italic text-gray-500 text-xs">
          Assinatura Eletrônica: Ao prosseguir com a assinatura e pagamento, o CONTRATANTE declara ter lido e aceitado todos os termos deste instrumento.
        </p>

        {signature ? (
          <div className="flex flex-col items-center">
            <img src={signature} alt="Assinatura" className="max-h-24 w-auto mb-2" />
            <div className="text-center text-[10px] text-gray-400 font-mono">
              <p>ASSINADO DIGITALMENTE POR {(clientData?.fullName || adminName).toUpperCase()}</p>
              {signedAt && <p>DATA: {signedAt}</p>}
              {metadata && <p>IP: {metadata.ip} | GEO: {metadata.location}</p>}
              {!signedAt && <p>PREVIEW EM TEMPO REAL</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-64 h-24 border-b border-gray-400 flex items-end justify-center pb-1">
              <span className="text-gray-300">Assinatura do Contratante</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractPreview;
