import api from './api';
import { Lead, FollowUp, Activity, DashboardStats, LeadStatus } from '../types/crm';

export interface CreateLeadData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: Lead['source'];
  notes?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: LeadStatus;
}

export interface CreateFollowUpData {
  leadId: string;
  type: FollowUp['type'];
  scheduledDate: string;
  notes?: string;
}

export interface UpdateFollowUpData {
  status: FollowUp['status'];
  notes?: string;
  completedAt?: string;
}

export interface GetLeadsParams {
  status?: LeadStatus;
  source?: Lead['source'];
  search?: string;
  page?: number;
  limit?: number;
}

export const crmAPI = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/crm/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<Activity[]> => {
    const response = await api.get(`/crm/activity?limit=${limit}`);
    return response.data;
  },

  // Leads
  getLeads: async (params?: GetLeadsParams): Promise<{ leads: Lead[]; total: number; page: number; totalPages: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/crm/leads?${queryParams.toString()}`);
    return response.data;
  },

  getLead: async (id: string): Promise<Lead> => {
    const response = await api.get(`/crm/leads/${id}`);
    return response.data;
  },

  createLead: async (data: CreateLeadData): Promise<Lead> => {
    const response = await api.post('/crm/leads', data);
    return response.data;
  },

  updateLead: async (id: string, data: UpdateLeadData): Promise<Lead> => {
    const response = await api.put(`/crm/leads/${id}`, data);
    return response.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/crm/leads/${id}`);
  },

  // Follow-ups
  getFollowUps: async (params?: { leadId?: string; status?: FollowUp['status']; date?: string }): Promise<FollowUp[]> => {
    const queryParams = new URLSearchParams();
    if (params?.leadId) queryParams.append('leadId', params.leadId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date) queryParams.append('date', params.date);
    
    const response = await api.get(`/crm/follow-ups?${queryParams.toString()}`);
    return response.data;
  },

  getTodaysFollowUps: async (): Promise<FollowUp[]> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/crm/follow-ups?date=${today}`);
    return response.data;
  },

  createFollowUp: async (data: CreateFollowUpData): Promise<FollowUp> => {
    const response = await api.post('/crm/follow-ups', data);
    return response.data;
  },

  updateFollowUp: async (id: string, data: UpdateFollowUpData): Promise<FollowUp> => {
    const response = await api.put(`/crm/follow-ups/${id}`, data);
    return response.data;
  },

  completeFollowUp: async (id: string, notes?: string): Promise<FollowUp> => {
    const response = await api.put(`/crm/follow-ups/${id}/complete`, { notes });
    return response.data;
  },

  deleteFollowUp: async (id: string): Promise<void> => {
    await api.delete(`/crm/follow-ups/${id}`);
  },
};

export default crmAPI;
