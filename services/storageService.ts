
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  orderBy,
  updateDoc
} from "firebase/firestore";
import { Contract, DefaultTemplate } from '../types';

const COLLECTION_NAME = 'contracts';
const SETTINGS_COLLECTION = 'settings';
const DEFAULT_TEMPLATE_DOC = 'default_template';

export const storageService = {
  saveContract: async (contract: Contract): Promise<void> => {
    try {
      const contractRef = doc(db, COLLECTION_NAME, contract.id);
      await setDoc(contractRef, contract);
      console.log("Contrato salvo no Firebase com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
      throw error;
    }
  },

  updateContract: async (id: string, data: Partial<Contract>): Promise<void> => {
    try {
      const contractRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(contractRef, data);
      console.log("Contrato atualizado no Firebase.");
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      throw error;
    }
  },

  getAllContracts: async (): Promise<Contract[]> => {
    try {
      const contractsCol = collection(db, COLLECTION_NAME);
      const q = query(contractsCol, orderBy('createdAt', 'desc'));
      const contractSnapshot = await getDocs(q);
      return contractSnapshot.docs.map(doc => doc.data() as Contract);
    } catch (error) {
      console.error("Erro ao carregar contratos do Firebase:", error);
      return [];
    }
  },

  getContractById: async (id: string): Promise<Contract | undefined> => {
    try {
      const contractRef = doc(db, COLLECTION_NAME, id);
      const contractSnap = await getDoc(contractRef);
      return contractSnap.exists() ? (contractSnap.data() as Contract) : undefined;
    } catch (error) {
      console.error("Erro ao buscar contrato por ID:", error);
      return undefined;
    }
  },

  getContractByShortId: async (shortId: string): Promise<Contract | undefined> => {
    try {
      const contractsCol = collection(db, COLLECTION_NAME);
      const q = query(contractsCol, where("shortId", "==", shortId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Contract;
      }
      return undefined;
    } catch (error) {
      console.error("Erro ao buscar por shortId no Firebase:", error);
      return undefined;
    }
  },

  deleteContract: async (id: string): Promise<void> => {
    try {
      const contractRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(contractRef);
      console.log("Contrato deletado do Firebase.");
    } catch (error) {
      console.error("Erro ao deletar contrato:", error);
      throw error;
    }
  },

  saveDefaultTemplate: async (template: DefaultTemplate): Promise<void> => {
    try {
      const templateRef = doc(db, SETTINGS_COLLECTION, DEFAULT_TEMPLATE_DOC);
      await setDoc(templateRef, template);
      console.log("Template padrão salvo com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar template padrão:", error);
      throw error;
    }
  },

  getDefaultTemplate: async (): Promise<DefaultTemplate | undefined> => {
    try {
      const templateRef = doc(db, SETTINGS_COLLECTION, DEFAULT_TEMPLATE_DOC);
      const templateSnap = await getDoc(templateRef);
      return templateSnap.exists() ? (templateSnap.data() as DefaultTemplate) : undefined;
    } catch (error) {
      console.error("Erro ao buscar template padrão:", error);
      return undefined;
    }
  }
};
