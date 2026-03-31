
import { PlanType, Installment, Region } from './types';

export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatWhatsApp = (value: string, region: Region = 'USA') => {
  const digits = value.replace(/\D/g, '');
  if (region === 'BR') {
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

export const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.length === 11;
};

export const validateWhatsApp = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateShortId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'Indisponível';
  }
};

export const getClientLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve('Não suportado');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(`${pos.coords.latitude}, ${pos.coords.longitude}`),
      () => resolve('Acesso negado'),
      { timeout: 5000 }
    );
  });
};

export const getCaliforniaDate = (): Date => {
  const now = new Date();
  const caliStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  return new Date(caliStr);
};

export const formatCaliDate = (date: Date = getCaliforniaDate()): string => {
  return date.toLocaleString('pt-BR', { timeZone: 'America/Los_Angeles' });
};

export const isToday = (dateStr: string | undefined): boolean => {
  if (!dateStr) return false;
  const today = getCaliforniaDate();
  const [day, month, year] = dateStr.split(',')[0].trim().split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isThisWeek = (dateStr: string | undefined): boolean => {
  if (!dateStr) return false;
  const today = getCaliforniaDate();
  today.setHours(0, 0, 0, 0);
  const [day, month, year] = dateStr.split(',')[0].trim().split('/').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
};

export const isThisMonth = (dateStr: string | undefined): boolean => {
  if (!dateStr) return false;
  const today = getCaliforniaDate();
  const [day, month, year] = dateStr.split(',')[0].trim().split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const addBusinessDays = (startDateStr: string, days: number): string => {
  // Assuming startDateStr is like "DD/MM/YYYY, HH:mm:ss" or just "DD/MM/YYYY"
  const cleanDate = startDateStr.split(',')[0].trim();
  const [day, month, year] = cleanDate.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  let count = 0;
  while (count < days) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  return date.toLocaleDateString('pt-BR');
};

export const getDaysRemaining = (deadlineStr: string): number => {
  const [day, month, year] = deadlineStr.split('/').map(Number);
  const deadline = new Date(year, month - 1, day);
  const today = getCaliforniaDate();
  today.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getPlanExpirationDate = (signedAt: string | undefined): string => {
  if (!signedAt) return '-';
  const cleanDate = signedAt.split(',')[0].trim();
  const [day, month, year] = cleanDate.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  date.setFullYear(date.getFullYear() + 1);
  return date.toLocaleDateString('pt-BR');
};

export const getPlanDaysRemaining = (signedAt: string | undefined): number => {
  if (!signedAt) return 999;
  const expiryStr = getPlanExpirationDate(signedAt);
  return getDaysRemaining(expiryStr);
};

export const generateInstallments = (
  startDate: string, 
  planType: PlanType, 
  planValue: string, 
  setupFee: string, 
  setupInstallmentsCount: number
): Installment[] => {
  const installments: Installment[] = [];
  const [day, month, year] = startDate.split(',')[0].trim().split('/').map(Number);
  
  const cleanPlanValue = parseFloat(planValue.replace('.', '').replace(',', '.'));
  const cleanSetupFee = parseFloat(setupFee.replace('.', '').replace(',', '.'));

  // Monthly installments
  if (planType === PlanType.ANNUAL) {
    // Annual is 1 installment of 10x monthly value
    const value = (cleanPlanValue * 10).toFixed(2).replace('.', ',');
    installments.push({
      id: generateUUID(),
      dueDate: new Date(year, month - 1, day).toLocaleDateString('pt-BR'),
      value,
      status: 'paid',
      type: 'monthly',
      paidAt: formatCaliDate()
    });
  } else {
    // Monthly is 12 installments
    for (let i = 0; i < 12; i++) {
      const dueDate = new Date(year, month - 1 + i, day);
      installments.push({
        id: generateUUID(),
        dueDate: dueDate.toLocaleDateString('pt-BR'),
        value: cleanPlanValue.toFixed(2).replace('.', ','),
        status: i === 0 ? 'paid' : 'pending',
        type: 'monthly',
        paidAt: i === 0 ? formatCaliDate() : undefined
      });
    }
  }

  // Setup installments
  if (cleanSetupFee > 0) {
    const setupValue = (cleanSetupFee / setupInstallmentsCount).toFixed(2).replace('.', ',');
    for (let i = 0; i < setupInstallmentsCount; i++) {
      const dueDate = new Date(year, month - 1 + i, day);
      installments.push({
        id: generateUUID(),
        dueDate: dueDate.toLocaleDateString('pt-BR'),
        value: setupValue,
        status: i === 0 ? 'paid' : 'pending',
        type: 'setup',
        paidAt: i === 0 ? formatCaliDate() : undefined
      });
    }
  }

  return installments;
};
