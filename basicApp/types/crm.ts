export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'website' | 'referral' | 'social_media' | 'email' | 'call' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  _id: string;
  leadId: string;
  lead?: Lead;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'other';
  scheduledDate: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  type: 'lead_created' | 'lead_updated' | 'follow_up_created' | 'follow_up_completed' | 'status_changed' | 'note_added';
  description: string;
  leadId?: string;
  leadName?: string;
  performedBy: string;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsThisMonth: number;
  todaysFollowUps: number;
  pendingFollowUps: number;
  conversionRate: number;
  leadsByStatus: {
    status: string;
    count: number;
  }[];
}

export type LeadSource = Lead['source'];
export type LeadStatus = Lead['status'];
export type FollowUpType = FollowUp['type'];
export type FollowUpStatus = FollowUp['status'];

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'call', label: 'Cold Call' },
  { value: 'other', label: 'Other' },
];

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: '#3B82F6' },
  { value: 'contacted', label: 'Contacted', color: '#6366F1' },
  { value: 'qualified', label: 'Qualified', color: '#8B5CF6' },
  { value: 'proposal', label: 'Proposal', color: '#F59E0B' },
  { value: 'negotiation', label: 'Negotiation', color: '#EC4899' },
  { value: 'closed_won', label: 'Closed Won', color: '#10B981' },
  { value: 'closed_lost', label: 'Closed Lost', color: '#EF4444' },
];

export const FOLLOW_UP_TYPES: { value: FollowUpType; label: string }[] = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'demo', label: 'Demo' },
  { value: 'other', label: 'Other' },
];
