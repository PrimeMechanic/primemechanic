import { JobRequest, EarningsData, MechanicConversation, Service, Vehicle } from "@/types";
import { services } from "@/data/mockData";

const customerAvatar = require("../../assets/images/avatar-default.png");

export const mechanicProfile = {
  id: "1",
  name: "Marcus Johnson",
  email: "marcus@primemechanic.com",
  phone: "(555) 987-6543",
  avatar: require("../../assets/images/mechanic-avatar-1.png"),
  specialty: "German Vehicles",
  bio: "Certified mechanic with over 10 years of experience specializing in German vehicles. ASE certified and committed to providing top-quality mobile auto repair services.",
  hourlyRate: 85,
  rating: 4.9,
  reviewCount: 127,
  completedJobs: 342,
  isAvailable: true,
  services: [
    { serviceId: "1", price: 75 },
    { serviceId: "2", price: 250 },
    { serviceId: "3", price: 100 },
    { serviceId: "4", price: 60 },
  ],
};

export const jobRequests: JobRequest[] = [
  {
    id: "jr1",
    customer: {
      id: "c1",
      name: "Alex Thompson",
      avatar: customerAvatar,
    },
    service: services[0],
    vehicle: {
      id: "v1",
      make: "BMW",
      model: "330i",
      year: 2022,
      licensePlate: "XYZ 789",
    },
    date: "2025-01-24",
    time: "2:00 PM",
    location: "456 Oak Street, Apt 12",
    notes: "Car is parked in the driveway. Please call when you arrive.",
    status: "pending",
    totalPrice: 75,
    createdAt: "2025-01-24T09:30:00Z",
  },
  {
    id: "jr2",
    customer: {
      id: "c2",
      name: "Jennifer Lee",
      avatar: customerAvatar,
    },
    service: services[1],
    vehicle: {
      id: "v2",
      make: "Audi",
      model: "A4",
      year: 2021,
      licensePlate: "ABC 456",
    },
    date: "2025-01-24",
    time: "4:30 PM",
    location: "789 Pine Ave",
    status: "pending",
    totalPrice: 250,
    createdAt: "2025-01-24T08:15:00Z",
  },
  {
    id: "jr3",
    customer: {
      id: "c3",
      name: "Michael Brown",
      avatar: customerAvatar,
    },
    service: services[2],
    vehicle: {
      id: "v3",
      make: "Mercedes",
      model: "C300",
      year: 2020,
      licensePlate: "DEF 123",
    },
    date: "2025-01-25",
    time: "10:00 AM",
    location: "123 Main St",
    notes: "Check engine light has been on for a week",
    status: "accepted",
    totalPrice: 100,
    createdAt: "2025-01-23T14:00:00Z",
  },
];

export const activeJobs: JobRequest[] = [
  {
    id: "aj1",
    customer: {
      id: "c4",
      name: "Sarah Wilson",
      avatar: customerAvatar,
    },
    service: services[3],
    vehicle: {
      id: "v4",
      make: "Volkswagen",
      model: "Golf",
      year: 2023,
      licensePlate: "GHI 789",
    },
    date: "2025-01-24",
    time: "11:00 AM",
    location: "567 Elm Boulevard",
    status: "in_progress",
    totalPrice: 60,
    createdAt: "2025-01-23T16:30:00Z",
  },
];

export const completedJobs: JobRequest[] = [
  {
    id: "cj1",
    customer: {
      id: "c5",
      name: "David Chen",
      avatar: customerAvatar,
    },
    service: services[0],
    vehicle: {
      id: "v5",
      make: "Porsche",
      model: "Cayenne",
      year: 2022,
      licensePlate: "LUX 001",
    },
    date: "2025-01-23",
    time: "3:00 PM",
    location: "890 Luxury Lane",
    status: "completed",
    totalPrice: 75,
    createdAt: "2025-01-22T10:00:00Z",
  },
  {
    id: "cj2",
    customer: {
      id: "c6",
      name: "Emily Davis",
      avatar: customerAvatar,
    },
    service: services[1],
    vehicle: {
      id: "v6",
      make: "BMW",
      model: "X5",
      year: 2021,
      licensePlate: "BMW 555",
    },
    date: "2025-01-22",
    time: "1:00 PM",
    location: "234 Park Avenue",
    status: "completed",
    totalPrice: 250,
    createdAt: "2025-01-21T09:00:00Z",
  },
  {
    id: "cj3",
    customer: {
      id: "c7",
      name: "Robert Martinez",
      avatar: customerAvatar,
    },
    service: services[4],
    vehicle: {
      id: "v7",
      make: "Audi",
      model: "Q7",
      year: 2020,
      licensePlate: "AUD 777",
    },
    date: "2025-01-21",
    time: "10:00 AM",
    location: "456 Battery Street",
    status: "completed",
    totalPrice: 150,
    createdAt: "2025-01-20T14:00:00Z",
  },
];

export const earningsData: EarningsData = {
  today: 135,
  thisWeek: 875,
  thisMonth: 3450,
  pending: 325,
  totalJobs: 342,
};

export const mechanicConversations: MechanicConversation[] = [
  {
    id: "mc1",
    customer: {
      id: "c4",
      name: "Sarah Wilson",
      avatar: customerAvatar,
    },
    lastMessage: "I'm on my way now!",
    lastMessageTime: "10:45 AM",
    unreadCount: 0,
  },
  {
    id: "mc2",
    customer: {
      id: "c1",
      name: "Alex Thompson",
      avatar: customerAvatar,
    },
    lastMessage: "Can you come earlier tomorrow?",
    lastMessageTime: "9:30 AM",
    unreadCount: 1,
  },
];

export const todaysSchedule = [
  {
    id: "ts1",
    time: "11:00 AM",
    customer: "Sarah Wilson",
    service: "Tire Service",
    location: "567 Elm Boulevard",
    status: "in_progress" as const,
  },
  {
    id: "ts2",
    time: "2:00 PM",
    customer: "Alex Thompson",
    service: "Oil Change",
    location: "456 Oak Street",
    status: "upcoming" as const,
  },
  {
    id: "ts3",
    time: "4:30 PM",
    customer: "Jennifer Lee",
    service: "Brake Service",
    location: "789 Pine Ave",
    status: "upcoming" as const,
  },
];
