export interface AlbumItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  category: 'classroom' | 'teachers' | 'extracurricular' | 'prom-reunion' | 'candids';
  title: string;
  description?: string;
  year?: string;
  submittedBy?: string;
}

export interface RSVPData {
  id?: string;
  name: string;
  phone: string;
  email: string;
  attendance: 'yes' | 'no' | 'maybe';
  guestCount: number;
  message?: string;
  classGroup?: string; // e.g., 12A1, 12A2, Chuyên Toán, etc.
  createdAt?: any;
}

export interface DonationData {
  id?: string;
  name: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  classGroup?: string;
  createdAt?: any;
}

export interface GuestbookPost {
  id?: string;
  name: string;
  message: string;
  avatarSeed: string; // seed for random colorful avatar / initials
  classGroup?: string;
  nostalgiaTag?: string; // e.g., "Nhà xe phượng vĩ", "Ghế đá hàng me", "Căng tin", "Cúp học"
  createdAt?: any;
}

export interface TimelineEvent {
  period: string;
  title: string;
  description: string;
  iconType: 'school' | 'book' | 'star' | 'flag' | 'music';
  highlights?: string[];
}

export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface UniformData {
  id?: string;
  name: string;
  phone: string;
  email: string;
  classGroup: string;
  size: string;
  quantity: number;
  deliveryMethod: 'event' | 'shipping';
  address?: string;
  notes?: string;
  createdAt?: any;
}
