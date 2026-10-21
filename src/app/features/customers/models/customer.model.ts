export interface Customer {
  id: number;
  idRole: number;
  idStatus: number;
  contact: string;
  address: string;
  paidOrderCount: number;
  totalPurchases: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string | null;
}
