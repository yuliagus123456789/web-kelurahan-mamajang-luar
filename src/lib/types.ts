export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  category: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  event_date: string | null;
  created_at: string;
}

export interface UmkmItem {
  id: string;
  name: string;
  owner: string;
  category: string;
  description: string;
  image_url: string | null;
  contact: string | null;
  address: string | null;
  created_at: string;
  status?: 'Disetujui' | 'Menunggu' | 'Ditolak';
}

export interface ComplaintItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  category?: string | null;
  impact_scope?: string | null;
  ticket_number?: string | null;
  image_url?: string | null;
  admin_response?: string | null;
  responded_at?: string | null;
}

export interface SawScoreDetails {
  rawCategory: number;
  rawImpact: number;
  rawUrgency: number;
  normCategory: number;
  normImpact: number;
  normUrgency: number;
  finalScore: number;
  priorityLevel: 'Tinggi' | 'Sedang' | 'Rendah';
  matchedKeywords: string[];
  rank: number;
}

export interface SawComplaintItem extends ComplaintItem {
  saw: SawScoreDetails;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  steps: string[];
  icon: string;
  created_at: string;
}
