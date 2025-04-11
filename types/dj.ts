interface DJ {
  _id: string;
  name: string;
  venue: string;
  profileImage?: string;
  rating?: number;
  isActive: boolean;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  // ... other fields
} 