
import { Contract } from '../types';

const OFFICIAL_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbySBevJWxpUaMSX0O7oTLwYAYfFcRr4otWaZ1S5DHJnMW6Nv_gvOoN7cevUHZK7JtK4/exec';

export const webhookService = {
  sendToSheets: async (contract: Contract, isTest = false): Promise<boolean> => {
    const payload = isTest ? {
      status: 'TESTE_CONEXAO',
      id: 'TESTE-' + Math.floor(Math.random() * 1000),
      adminName: 'TESTE DE INTEGRAÇÃO AUTOMÁTICA',
      serviceType: 'SISTEMA EASY',
      createdAt: new Date().toLocaleString('pt-BR'),
      message: 'Conexão automática estabelecida com sucesso!'
    } : {
      status: contract.status === 'signed' ? 'ASSINADO' : 'PENDENTE',
      deliveryStatus: contract.deliveryStatus === 'delivered' ? 'ENTREGUE' : 'PENDENTE',
      paymentStatus: contract.paymentStatus || 'awaiting_setup',
      id: contract.id,
      shortId: contract.shortId || '',
      adminName: contract.adminName,
      serviceType: contract.serviceType,
      planType: contract.planType,
      planValue: contract.planType === 'ANNUAL' ? (contract.annualValue || contract.planValue) : contract.planValue,
      setupValue: contract.setupFee,
      nextDueDate: contract.nextDueDate || '',
      zelleKey: contract.zelleKey || '',
      venmoKey: contract.venmoKey || '',
      pixKey: contract.paymentKey || '',
      paymentLink: contract.paymentLink || '',
      clientName: contract.clientData?.fullName || '',
      clientCPF: contract.clientData?.cpf || '',
      clientEmail: contract.clientData?.email || '',
      clientBirthDate: contract.clientData?.birthDate || '',
      clientWhatsApp: contract.clientData?.whatsapp || '',
      clientAddress: contract.clientData?.address || '',
      ip: contract.metadata?.ip || '',
      signedAt: contract.signedAt || '',
      signatureUrl: contract.signatureImage || '',
      createdAt: contract.createdAt,
      finalSystemLink: contract.finalSystemLink || ''
    };

    try {
      await fetch(OFFICIAL_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      console.log('Dados sincronizados automaticamente com Google Sheets.');
      return true;
    } catch {
      return false;
    }
  }
};
