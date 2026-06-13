export interface Company {
  id: string;
  companyName: string;
  slug: string;
  verified: boolean;
  status: 'active' | 'pending_review' | 'suspended' | 'deleted';
  createdAt: Date;
}
