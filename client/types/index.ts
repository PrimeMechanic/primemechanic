export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: string;
}

export interface Mechanic {
  id: string;
  name: string;
  avatar: any;
  rating: number;
  reviewCount: number;
  distance: string;
  specialty: string;
  hourlyRate: number;
  isAvailable: boolean;
  completedJobs: number;
}

export interface Booking {
  id: string;
  service: Service;
  mechanic: Mechanic;
  date: string;
  time: string;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  location: string;
  totalPrice: number;
  vehicle: Vehicle;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  mechanic: Mechanic;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: any;
  vehicles: Vehicle[];
  role: "customer" | "mechanic";
}

export interface JobRequest {
  id: string;
  customer: {
    id: string;
    name: string;
    avatar: any;
  };
  service: Service;
  vehicle: Vehicle;
  date: string;
  time: string;
  location: string;
  notes?: string;
  status: "pending" | "accepted" | "declined" | "in_progress" | "completed";
  totalPrice: number;
  createdAt: string;
}

export interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  totalJobs: number;
}

export interface MechanicConversation {
  id: string;
  customer: {
    id: string;
    name: string;
    avatar: any;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
