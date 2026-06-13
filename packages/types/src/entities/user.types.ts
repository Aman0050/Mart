export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
}
