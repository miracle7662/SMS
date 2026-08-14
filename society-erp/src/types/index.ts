export type UserRole =
  | "SUPER_ADMIN"
  | "SOCIETY_ADMIN"
  | "CHAIRMAN"
  | "SECRETARY"
  | "TREASURER"
  | "ACCOUNTANT"
  | "SECURITY"
  | "RESIDENT";

export type OccupancyStatus = "Occupied" | "Vacant" | "Under Renovation";
export type MemberType = "Owner" | "Co-Owner" | "Tenant" | "Family Member";
export type BillStatus = "Paid" | "Unpaid" | "Partial" | "Overdue";
export type ComplaintStatus = "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";
export type ComplaintPriority = "Low" | "Medium" | "High" | "Critical";
export type NoticeStatus = "Draft" | "Scheduled" | "Published" | "Expired";
export type DocumentStatus = "Uploaded" | "Verified" | "Pending" | "Expired";
export type PaymentStatus = "Success" | "Pending" | "Failed" | "Refunded";
export type AgreementStatus = "Active" | "Expired" | "Expiring Soon" | "Terminated";

export interface Society {
  id: string;
  name: string;
  registrationNo: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logo?: string;
  totalBuildings: number;
  totalFlats: number;
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
  buildingId: string;
  wing: string;
  floor: number;
  number: string;
  type: string; // 1BHK, 2BHK, 3BHK, etc.
  areaSqft: number;
  occupancyStatus: OccupancyStatus;
  ownerName: string;
  ownerMobile: string;
}

export interface Member {
  id: string;
  type: MemberType;
  name: string;
  mobile: string;
  email?: string;
  flatId: string;
  flatNumber: string;
  buildingName: string;
  photo?: string;
  status: "Active" | "Inactive";
  joiningDate: string;
}

export interface Tenant extends Member {
  rentStartDate: string;
  rentEndDate: string;
  brokerName?: string;
  brokerMobile?: string;
  agreementStatus: AgreementStatus;
  policeNoc: DocumentStatus;
  rentAmount: number;
}

export interface MaintenanceBill {
  id: string;
  billNo: string;
  flatId: string;
  flatNumber: string;
  buildingName: string;
  ownerName: string;
  month: string;
  year: number;
  amount: number;
  paidAmount: number;
  status: BillStatus;
  dueDate: string;
  chargeBreakdown: { name: string; amount: number }[];
}

export interface Payment {
  id: string;
  receiptNo: string;
  billId: string;
  flatNumber: string;
  memberName: string;
  amount: number;
  mode: "UPI" | "Cash" | "Cheque" | "NEFT" | "Card";
  status: PaymentStatus;
  paidAt: string;
  transactionId?: string;
}

export interface Complaint {
  id: string;
  complaintNo: string;
  complainant: string;
  type: "Owner" | "Tenant";
  flatNumber: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  assignedTo?: string;
  description: string;
}

export interface Notice {
  id: string;
  title: string;
  type: "Tenant Notice" | "Owner Notice" | "All Members" | "Building/Wing" | "Specific Flat";
  status: NoticeStatus;
  publishDate: string;
  expiryDate?: string;
  recipients: string;
}

export interface Vehicle {
  id: string;
  number: string;
  type: "Two Wheeler" | "Four Wheeler";
  brand: string;
  model: string;
  color: string;
  ownerName: string;
  flatNumber: string;
  parkingSlot?: string;
}

export interface ParkingSlot {
  id: string;
  number: string;
  type: "Covered" | "Open";
  status: "Available" | "Occupied" | "Reserved";
  vehicleNumber?: string;
  flatNumber?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  visibility: string;
  status: DocumentStatus;
}

export interface KPIStat {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: "primary" | "success" | "warning" | "danger" | "info";
}
