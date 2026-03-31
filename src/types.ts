
export enum PlanType {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL'
}

export type PaymentStatus = 'awaiting_setup' | 'paid' | 'overdue' | 'inactive';
export type DeliveryStatus = 'pending' | 'delivered';
export type Region = 'USA' | 'BR';
export type InstallmentStatus = 'pending' | 'paid' | 'overdue';
export type InstallmentType = 'monthly' | 'setup';

export interface Installment {
  id: string;
  dueDate: string;
  value: string;
  status: InstallmentStatus;
  type: InstallmentType;
  paidAt?: string;
}

export interface ClientData {
  fullName: string;
  email: string;
  cpf: string;
  birthDate: string;
  whatsapp: string;
  address: string;
}

export interface Clause {
  id: number;
  title: string;
  content: string;
}

export interface Contract {
  id: string;
  shortId: string;
  serviceType: string;
  region: Region;
  providerName: string;
  providerBrand: string;
  providerAddress: string;
  adminName: string;
  companyName: string;
  clientPhone?: string;
  planType: PlanType;
  planValue: string;
  annualValue?: string;
  setupFee: string;
  setupInstallmentsCount?: number;
  paymentKey?: string;
  zelleKey?: string;
  venmoKey?: string;
  paymentLink?: string;
  status: 'pending' | 'signed';
  createdAt: string;
  signedAt?: string;
  clientData?: ClientData;
  signatureImage?: string;
  metadata?: {
    ip: string;
    location: string;
    userAgent: string;
  };
  clauses: Clause[];
  hiddenFields: string[];
  activationInstructions: string;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  nextDueDate?: string;
  finalSystemLink?: string;
  installments?: Installment[];
  currency?: 'BRL' | 'USD';
}

export interface AdminFormData {
  serviceType: string;
  providerName: string;
  providerBrand: string;
  providerAddress: string;
  adminName: string;
  companyName: string;
  clientPhone: string;
  planType: PlanType;
  planValue: string;
  annualValue: string;
  setupFee: string;
  setupInstallmentsCount: number;
  paymentKey: string;
  zelleKey: string;
  venmoKey: string;
  paymentLink: string;
  clauses: Clause[];
  hiddenFields: string[];
  activationInstructions: string;
}

export interface DefaultTemplate {
  clauses: Clause[];
  activationInstructions: string;
}
