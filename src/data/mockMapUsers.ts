export interface MapUserNode {
  id: string;
  name: string;
  role: 'farmer' | 'buyer' | 'fpo' | 'transporter';
  crop?: string;
  district: string;
  lat: number;
  lng: number;
  activeStatus: 'Online' | 'Trading' | 'In Transit';
  rating: number;
  phone?: string;
  lotsCount?: number;
}

export const MOCK_MAP_USERS: MapUserNode[] = [
  { id: 'm-1', name: 'Ramesh Patil', role: 'farmer', crop: 'Soybean', district: 'Dharashiv (Osmanabad)', lat: 18.1856, lng: 76.0423, activeStatus: 'Trading', rating: 4.8, phone: '+91 98221 44550', lotsCount: 2 },
  { id: 'm-2', name: 'Ganesh Agro Processing & Oil Mill', role: 'buyer', crop: 'Soybean', district: 'Latur', lat: 18.4088, lng: 76.5604, activeStatus: 'Online', rating: 4.9, phone: '+91 94220 88990', lotsCount: 8 },
  { id: 'm-3', name: 'Marathwada Krishi Farmer Producer Co.', role: 'fpo', crop: 'Tur / Arhar', district: 'Solapur', lat: 17.6599, lng: 75.9064, activeStatus: 'Trading', rating: 4.7, phone: '+91 99701 22334', lotsCount: 5 },
  { id: 'm-4', name: 'Balaji Rural Freight Express', role: 'transporter', district: 'Dharashiv', lat: 18.25, lng: 76.10, activeStatus: 'In Transit', rating: 4.8, phone: '+91 98230 11223' },
  { id: 'm-5', name: 'Dnyaneshwar Shinde', role: 'farmer', crop: 'Onion (Red Nashik)', district: 'Nashik (Lasalgaon)', lat: 20.0063, lng: 73.7903, activeStatus: 'Online', rating: 4.6, phone: '+91 94231 66778', lotsCount: 3 },
  { id: 'm-6', name: 'Royal Dal Mill & Pulse Exporters', role: 'buyer', crop: 'Tur', district: 'Latur APMC', lat: 18.39, lng: 76.58, activeStatus: 'Online', rating: 4.8, phone: '+91 94221 77889', lotsCount: 12 },
  { id: 'm-7', name: 'Vikram Deshmukh', role: 'farmer', crop: 'Cotton (Medium Staple)', district: 'Jalgaon', lat: 21.0077, lng: 75.5626, activeStatus: 'Trading', rating: 4.9, phone: '+91 98600 33445', lotsCount: 1 },
  { id: 'm-8', name: 'Vidarbha Ginning & Pressing Co.', role: 'buyer', crop: 'Cotton', district: 'Akola', lat: 20.7002, lng: 77.0082, activeStatus: 'Online', rating: 4.7, phone: '+91 98901 55667', lotsCount: 6 },
  { id: 'm-9', name: 'Sahyadri Farmers Producer Hub', role: 'fpo', crop: 'Soybean & Chana', district: 'Pune (Baramati)', lat: 18.1519, lng: 74.5768, activeStatus: 'Trading', rating: 4.9, phone: '+91 98220 99881', lotsCount: 14 },
  { id: 'm-10', name: 'Khandesh Agri Haulage 9-Tonners', role: 'transporter', district: 'Dhule', lat: 20.9042, lng: 74.7749, activeStatus: 'In Transit', rating: 4.7, phone: '+91 98234 44556' },
  { id: 'm-11', name: 'Pravin Jadhav', role: 'farmer', crop: 'Wheat (Sharbati)', district: 'Amravati', lat: 20.9374, lng: 77.7796, activeStatus: 'Trading', rating: 4.8, phone: '+91 97654 33221', lotsCount: 2 },
  { id: 'm-12', name: 'Godavari Mega Food Park & Storage', role: 'buyer', crop: 'Maize & Soybean', district: 'Chhatrapati Sambhajinagar', lat: 19.8762, lng: 75.3433, activeStatus: 'Online', rating: 4.9, phone: '+91 94222 11990', lotsCount: 15 },
];
