export type Role =
  | "SUPER_ADMIN"
  | "SOCIETY_ADMIN"
  | "CHAIRMAN"
  | "SECRETARY"
  | "TREASURER"
  | "ACCOUNTANT"
  | "SECURITY"
  | "RESIDENT";

export type Status =
  | "Active"
  | "Inactive"
  | "Pending"
  | "Paid"
  | "Unpaid"
  | "Overdue"
  | "Open"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "Expired"
  | "Draft"
  | "Published"
  | "Scheduled"
  | "Verified"
  | "Uploaded"
  | "Vacant"
  | "Occupied"
  | "Reserved"
  | "Available";

export interface Society {
  id: string;
  name: string;
  registrationNo: string;
  address: string;
  city: string;
  totalBuildings: number;
  totalFlats: number;
  logo?: string;
}

export interface Building {
  id: string;
  societyId: string;
  name: string;
  wings: string[];
  totalFloors: number;
  totalFlats: number;
}

export interface Flat {
  id: string;
  flatNo: string;
  building: string;
  wing: string;
  floor: number;
  type: string; // 1BHK, 2BHK, etc
  areaSqft: number;
  ownerId: string;
  ownerName: string;
  occupancy: "Owner Occupied" | "Rented" | "Vacant";
  status: Status;
}

export interface Member {
  id: string;
  name: string;
  photo?: string;
  flatNo: string;
  building: string;
  mobile: string;
  email: string;
  type: "Owner" | "Co-Owner" | "Tenant" | "Family Member";
  status: Status;
}

export interface Tenant {
  id: string;
  name: string;
  photo?: string;
  flatNo: string;
  building: string;
  mobile: string;
  email: string;
  address: string;
  rentStart: string;
  rentEnd: string;
  brokerName?: string;
  brokerMobile?: string;
  agreementStatus: Status;
  policeNoc: Status;
  ownerName: string;
  status: Status;
}

export interface MaintenanceBill {
  id: string;
  billNo: string;
  flatNo: string;
  building: string;
  ownerName: string;
  month: string;
  financialYear: string;
  amount: number;
  dueDate: string;
  status: Status;
  chargeBreakup: { label: string; amount: number }[];
}

export interface Payment {
  id: string;
  receiptNo: string;
  flatNo: string;
  payerName: string;
  amount: number;
  mode: "Cash" | "Cheque" | "NEFT" | "UPI" | "Card" | "Online";
  date: string;
  status: "Success" | "Pending" | "Failed";
  billNo?: string;
}

export interface Complaint {
  id: string;
  complaintNo: string;
  complainant: string;
  flatNo: string;
  type: "Tenant" | "Owner";
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: Status;
  createdDate: string;
  assignedTo?: string;
  description: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  noticeType: "Tenant Notice" | "Owner Notice" | "All Members" | "Building/Wing" | "Specific Flat";
  publishDate: string;
  expiryDate: string;
  status: Status;
  recipients: string;
}

export interface Vehicle {
  id: string;
  vehicleNo: string;
  type: "Car" | "Bike" | "Scooter" | "Other";
  brand: string;
  model: string;
  color: string;
  ownerName: string;
  flatNo: string;
}

export interface ParkingSlot {
  id: string;
  slotNo: string;
  type: "Two Wheeler" | "Four Wheeler";
  status: "Available" | "Occupied" | "Reserved";
  flatNo?: string;
  vehicleNo?: string;
}

export interface Visitor {
  id: string;
  name: string;
  mobile: string;
  purpose: string;
  flatNo: string;
  checkIn: string;
  checkOut?: string;
  status: "In" | "Out" | "Expected";
  photo?: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  capacity: number;
  bookable: boolean;
  status: Status;
}

export interface Booking {
  id: string;
  amenityName: string;
  flatNo: string;
  bookedBy: string;
  date: string;
  slot: string;
  status: Status;
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  contact: string;
  mobile: string;
  email: string;
  status: Status;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  vendor: string;
  amount: number;
  date: string;
  paymentStatus: Status;
}

export interface SocietyDocument {
  id: string;
  title: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  visibility: string;
  status: Status;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  module: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  status: Status;
  lastLogin?: string;
}

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavChild[];
}
