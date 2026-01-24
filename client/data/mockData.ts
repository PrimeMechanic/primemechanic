import { Service, Mechanic, Booking, Conversation, Vehicle, User } from "@/types";

export const services: Service[] = [
  {
    id: "1",
    name: "Oil Change",
    description: "Full synthetic oil change with filter replacement",
    price: 75,
    duration: 30,
    icon: "droplet",
  },
  {
    id: "2",
    name: "Brake Service",
    description: "Brake pad replacement and rotor inspection",
    price: 250,
    duration: 90,
    icon: "disc",
  },
  {
    id: "3",
    name: "Diagnostics",
    description: "Full vehicle diagnostic scan and report",
    price: 100,
    duration: 45,
    icon: "cpu",
  },
  {
    id: "4",
    name: "Tire Service",
    description: "Tire rotation, balancing, and inspection",
    price: 60,
    duration: 45,
    icon: "circle",
  },
  {
    id: "5",
    name: "Battery",
    description: "Battery test, replacement, and terminal cleaning",
    price: 150,
    duration: 30,
    icon: "battery-charging",
  },
  {
    id: "6",
    name: "AC Service",
    description: "AC system check, recharge, and leak detection",
    price: 120,
    duration: 60,
    icon: "wind",
  },
];

export const mechanics: Mechanic[] = [
  {
    id: "1",
    name: "Marcus Johnson",
    avatar: require("../../assets/images/mechanic-avatar-1.png"),
    rating: 4.9,
    reviewCount: 127,
    distance: "0.8 mi",
    specialty: "German Vehicles",
    hourlyRate: 85,
    isAvailable: true,
    completedJobs: 342,
  },
  {
    id: "2",
    name: "Sarah Chen",
    avatar: require("../../assets/images/mechanic-avatar-2.png"),
    rating: 4.8,
    reviewCount: 89,
    distance: "1.2 mi",
    specialty: "Japanese Imports",
    hourlyRate: 75,
    isAvailable: true,
    completedJobs: 256,
  },
  {
    id: "3",
    name: "David Rodriguez",
    avatar: require("../../assets/images/mechanic-avatar-1.png"),
    rating: 4.7,
    reviewCount: 156,
    distance: "2.1 mi",
    specialty: "Domestic Vehicles",
    hourlyRate: 70,
    isAvailable: false,
    completedJobs: 489,
  },
  {
    id: "4",
    name: "Emily Watson",
    avatar: require("../../assets/images/mechanic-avatar-2.png"),
    rating: 5.0,
    reviewCount: 43,
    distance: "3.5 mi",
    specialty: "Electric Vehicles",
    hourlyRate: 95,
    isAvailable: true,
    completedJobs: 87,
  },
];

export const defaultVehicle: Vehicle = {
  id: "1",
  make: "Honda",
  model: "Accord",
  year: 2021,
  licensePlate: "ABC 1234",
};

export const bookings: Booking[] = [
  {
    id: "1",
    service: services[0],
    mechanic: mechanics[0],
    date: "2025-01-25",
    time: "10:00 AM",
    status: "upcoming",
    location: "123 Main St, Apt 4B",
    totalPrice: 75,
    vehicle: defaultVehicle,
  },
  {
    id: "2",
    service: services[1],
    mechanic: mechanics[1],
    date: "2025-01-20",
    time: "2:00 PM",
    status: "completed",
    location: "456 Oak Ave",
    totalPrice: 250,
    vehicle: defaultVehicle,
  },
  {
    id: "3",
    service: services[2],
    mechanic: mechanics[2],
    date: "2025-01-18",
    time: "9:00 AM",
    status: "completed",
    location: "789 Elm St",
    totalPrice: 100,
    vehicle: defaultVehicle,
  },
];

export const conversations: Conversation[] = [
  {
    id: "1",
    mechanic: mechanics[0],
    lastMessage: "I'll be there in 15 minutes!",
    lastMessageTime: "10:30 AM",
    unreadCount: 1,
  },
  {
    id: "2",
    mechanic: mechanics[1],
    lastMessage: "Your car is all fixed up. Let me know if you have any questions.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
];

export const currentUser: User = {
  id: "1",
  name: "Alex Thompson",
  email: "alex@example.com",
  phone: "(555) 123-4567",
  avatar: require("../../assets/images/avatar-default.png"),
  vehicles: [defaultVehicle],
};
