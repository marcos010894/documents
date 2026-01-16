// src/services/contactSolicitationsService.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sua-api.com/api/v1', // Substitua pela URL real da sua API
});

export interface Contact {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  id_busness: number;
  type_user: string;
  termos_aceitos: boolean;
  created_at?: string;
  status?: string;
}

// GET /contactsSolicitations
export const getContacts = async (): Promise<Contact[]> => {
  const response = await api.get<Contact[]>('/contactsSolicitations/');
  return response.data;
};

// POST /contactsSolicitations
export const createContact = async (data: Omit<Contact, 'id' | 'created_at' | 'status'>): Promise<Contact> => {
  const response = await api.post<Contact>('/contactsSolicitations/', data);
  return response.data;
};

// GET /contactsSolicitations/{contact_id}
export const getContactById = async (id: number): Promise<Contact> => {
  const response = await api.get<Contact>(`/contactsSolicitations/${id}`);
  return response.data;
};

// PATCH /contactsSolicitations/{contact_id}
export const updateContactStatus = async (id: number, status: string): Promise<Contact> => {
  const response = await api.patch<Contact>(`/contactsSolicitations/${id}`, { status });
  return response.data;
};
