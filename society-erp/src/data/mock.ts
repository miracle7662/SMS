import type {
  Society,
  Building,
  Flat,
  Member,
  Tenant,
  MaintenanceBill,
  Payment,
  Complaint,
  Notice,
  Vehicle,
  ParkingSlot,
  DocumentItem,
  KPIStat,
} from "@/types";

export const currentSociety: Society = {
  id: "soc-001",
  name: "Green Valley Cooperative Housing Society",
  registrationNo: "MH/PUNE/CHS/2018/1247",
  address: "Survey No. 45, Baner Road",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411045",
  totalBuildings: 4,
  totalFlats: 248,
};

export const buildings: Building[] = [
  { id: "b-01", societyId: "soc-001", name: "A Wing", wings: ["A"], totalFloors: 12, totalFlats: 72 },
  { id: "b-02", societyId: "soc-001", name: "B Wing", wings: ["B"], totalFloors: 12, totalFlats: 72 },
  { id: "b-03", societyId: "soc-001", name: "C Wing", wings: ["C"], totalFloors: 10, totalFlats: 60 },
  { id: "b-04", societyId: "soc-001", name: "D Wing", wings: ["D"], totalFloors: 8, totalFlats: 44 },
];

export const flats: Flat[] = [
  { id: "f-101", buildingId: "b-01", wing: "A", floor: 1, number: "A-101", type: "2BHK", areaSqft: 980, occupancyStatus: "Occupied", ownerName: "Rajesh Sharma", ownerMobile: "9876543210" },
  { id: "f-102", buildingId: "b-01", wing: "A", floor: 1, number: "A-102", type: "3BHK", areaSqft: 1350, occupancyStatus: "Occupied", ownerName: "Priya Patel", ownerMobile: "9823456789" },
  { id: "f-103", buildingId: "b-01", wing: "A", floor: 1, number: "A-103", type: "2BHK", areaSqft: 980, occupancyStatus: "Vacant", ownerName: "Amit Deshmukh", ownerMobile: "9765432109" },
  { id: "f-201", buildingId: "b-01", wing: "A", floor: 2, number: "A-201", type: "2BHK", areaSqft: 980, occupancyStatus: "Occupied", ownerName: "Sunita Joshi", ownerMobile: "9890123456" },
  { id: "f-202", buildingId: "b-02", wing: "B", floor: 2, number: "B-202", type: "3BHK", areaSqft: 1400, occupancyStatus: "Occupied", ownerName: "Vikram Mehta", ownerMobile: "9812345678" },
  { id: "f-301", buildingId: "b-02", wing: "B", floor: 3, number: "B-301", type: "1BHK", areaSqft: 650, occupancyStatus: "Occupied", ownerName: "Neha Kulkarni", ownerMobile: "9789012345" },
  { id: "f-401", buildingId: "b-03", wing: "C", floor: 4, number: "C-401", type: "2BHK", areaSqft: 1050, occupancyStatus: "Under Renovation", ownerName: "Suresh Iyer", ownerMobile: "9654321098" },
  { id: "f-501", buildingId: "b-04", wing: "D", floor: 5, number: "D-501", type: "3BHK", areaSqft: 1450, occupancyStatus: "Occupied", ownerName: "Anjali Reddy", ownerMobile: "9543210987" },
];

export const members: Member[] = [
  { id: "m-01", type: "Owner", name: "Rajesh Sharma", mobile: "9876543210", email: "rajesh.sharma@email.com", flatId: "f-101", flatNumber: "A-101", buildingName: "A Wing", status: "Active", joiningDate: "2019-03-15" },
  { id: "m-02", type: "Owner", name: "Priya Patel", mobile: "9823456789", email: "priya.patel@email.com", flatId: "f-102", flatNumber: "A-102", buildingName: "A Wing", status: "Active", joiningDate: "2018-11-22" },
  { id: "m-03", type: "Owner", name: "Amit Deshmukh", mobile: "9765432109", flatId: "f-103", flatNumber: "A-103", buildingName: "A Wing", status: "Active", joiningDate: "2020-01-10" },
  { id: "m-04", type: "Owner", name: "Sunita Joshi", mobile: "9890123456", email: "sunita.j@email.com", flatId: "f-201", flatNumber: "A-201", buildingName: "A Wing", status: "Active", joiningDate: "2019-07-08" },
  { id: "m-05", type: "Owner", name: "Vikram Mehta", mobile: "9812345678", email: "vikram.m@email.com", flatId: "f-202", flatNumber: "B-202", buildingName: "B Wing", status: "Active", joiningDate: "2021-02-14" },
];

export const tenants: Tenant[] = [
  { id: "t-01", type: "Tenant", name: "Arjun Nair", mobile: "9900112233", email: "arjun.nair@email.com", flatId: "f-101", flatNumber: "A-101", buildingName: "A Wing", status: "Active", joiningDate: "2024-06-01", rentStartDate: "2024-06-01", rentEndDate: "2025-05-31", brokerName: "Suresh Realty", brokerMobile: "9876501234", agreementStatus: "Active", policeNoc: "Verified", rentAmount: 28000 },
  { id: "t-02", type: "Tenant", name: "Meera Kapoor", mobile: "9911223344", email: "meera.k@email.com", flatId: "f-202", flatNumber: "B-202", buildingName: "B Wing", status: "Active", joiningDate: "2023-12-15", rentStartDate: "2023-12-15", rentEndDate: "2024-12-14", brokerName: "City Homes", brokerMobile: "9765409876", agreementStatus: "Expiring Soon", policeNoc: "Verified", rentAmount: 35000 },
  { id: "t-03", type: "Tenant", name: "Rohan Gupta", mobile: "9922334455", flatId: "f-301", flatNumber: "B-301", buildingName: "B Wing", status: "Active", joiningDate: "2024-01-10", rentStartDate: "2024-01-10", rentEndDate: "2025-01-09", agreementStatus: "Active", policeNoc: "Pending", rentAmount: 18000 },
];

export const bills: MaintenanceBill[] = [
  { id: "bill-01", billNo: "MB-2025-08-A101", flatId: "f-101", flatNumber: "A-101", buildingName: "A Wing", ownerName: "Rajesh Sharma", month: "August", year: 2025, amount: 4850, paidAmount: 4850, status: "Paid", dueDate: "2025-08-10", chargeBreakdown: [{ name: "Monthly Maintenance", amount: 3500 }, { name: "Sinking Fund", amount: 500 }, { name: "Parking", amount: 850 }] },
  { id: "bill-02", billNo: "MB-2025-08-A102", flatId: "f-102", flatNumber: "A-102", buildingName: "A Wing", ownerName: "Priya Patel", month: "August", year: 2025, amount: 6200, paidAmount: 0, status: "Unpaid", dueDate: "2025-08-10", chargeBreakdown: [{ name: "Monthly Maintenance", amount: 4800 }, { name: "Sinking Fund", amount: 700 }, { name: "Parking", amount: 700 }] },
  { id: "bill-03", billNo: "MB-2025-08-A103", flatId: "f-103", flatNumber: "A-103", buildingName: "A Wing", ownerName: "Amit Deshmukh", month: "August", year: 2025, amount: 4200, paidAmount: 0, status: "Overdue", dueDate: "2025-08-10", chargeBreakdown: [{ name: "Monthly Maintenance", amount: 3500 }, { name: "Non-Occupancy Charge", amount: 700 }] },
  { id: "bill-04", billNo: "MB-2025-08-B202", flatId: "f-202", flatNumber: "B-202", buildingName: "B Wing", ownerName: "Vikram Mehta", month: "August", year: 2025, amount: 5800, paidAmount: 3000, status: "Partial", dueDate: "2025-08-10", chargeBreakdown: [{ name: "Monthly Maintenance", amount: 4500 }, { name: "Sinking Fund", amount: 600 }, { name: "Parking", amount: 700 }] },
  { id: "bill-05", billNo: "MB-2025-07-A101", flatId: "f-101", flatNumber: "A-101", buildingName: "A Wing", ownerName: "Rajesh Sharma", month: "July", year: 2025, amount: 4850, paidAmount: 4850, status: "Paid", dueDate: "2025-07-10", chargeBreakdown: [{ name: "Monthly Maintenance", amount: 3500 }, { name: "Sinking Fund", amount: 500 }, { name: "Parking", amount: 850 }] },
];

export const payments: Payment[] = [
  { id: "pay-01", receiptNo: "RCP-2025-0842", billId: "bill-01", flatNumber: "A-101", memberName: "Rajesh Sharma", amount: 4850, mode: "UPI", status: "Success", paidAt: "2025-08-05T14:32:00", transactionId: "UPI123456789" },
  { id: "pay-02", receiptNo: "RCP-2025-0831", billId: "bill-05", flatNumber: "A-101", memberName: "Rajesh Sharma", amount: 4850, mode: "NEFT", status: "Success", paidAt: "2025-07-08T11:15:00", transactionId: "NEFT987654321" },
  { id: "pay-03", receiptNo: "RCP-2025-0798", billId: "bill-04", flatNumber: "B-202", memberName: "Vikram Mehta", amount: 3000, mode: "Cash", status: "Success", paidAt: "2025-08-12T09:45:00" },
];

export const complaints: Complaint[] = [
  { id: "cmp-01", complaintNo: "CMP-2025-0142", complainant: "Arjun Nair", type: "Tenant", flatNumber: "A-101", category: "Plumbing", priority: "High", status: "In Progress", createdAt: "2025-08-08T10:20:00", assignedTo: "Maintenance Team", description: "Kitchen sink leaking continuously since morning." },
  { id: "cmp-02", complaintNo: "CMP-2025-0138", complainant: "Priya Patel", type: "Owner", flatNumber: "A-102", category: "Electrical", priority: "Medium", status: "Assigned", createdAt: "2025-08-07T16:45:00", assignedTo: "Electrician Ramesh", description: "Frequent power tripping in bedroom circuit." },
  { id: "cmp-03", complaintNo: "CMP-2025-0129", complainant: "Sunita Joshi", type: "Owner", flatNumber: "A-201", category: "Common Area", priority: "Low", status: "Resolved", createdAt: "2025-08-03T09:10:00", assignedTo: "Housekeeping", description: "Lift lobby lights not working properly on 2nd floor." },
  { id: "cmp-04", complaintNo: "CMP-2025-0115", complainant: "Meera Kapoor", type: "Tenant", flatNumber: "B-202", category: "Security", priority: "Critical", status: "Open", createdAt: "2025-08-11T21:30:00", description: "Main gate not closing properly after 10 PM." },
];

export const notices: Notice[] = [
  { id: "nt-01", title: "AGM Notice - Annual General Meeting 2025", type: "All Members", status: "Published", publishDate: "2025-08-01", expiryDate: "2025-08-25", recipients: "All Members" },
  { id: "nt-02", title: "Water Supply Interruption - 15 Aug", type: "All Members", status: "Published", publishDate: "2025-08-10", expiryDate: "2025-08-15", recipients: "All Members" },
  { id: "nt-03", title: "Parking Rules Update", type: "Owner Notice", status: "Scheduled", publishDate: "2025-08-18", recipients: "All Owners" },
  { id: "nt-04", title: "Monsoon Preparedness Guidelines", type: "All Members", status: "Draft", publishDate: "2025-08-20", recipients: "All Members" },
];

export const vehicles: Vehicle[] = [
  { id: "v-01", number: "MH12 AB 1234", type: "Four Wheeler", brand: "Honda", model: "City", color: "White", ownerName: "Rajesh Sharma", flatNumber: "A-101", parkingSlot: "P-12" },
  { id: "v-02", number: "MH12 CD 5678", type: "Two Wheeler", brand: "Hero", model: "Splendor", color: "Black", ownerName: "Priya Patel", flatNumber: "A-102", parkingSlot: "P-45" },
  { id: "v-03", number: "MH14 EF 9012", type: "Four Wheeler", brand: "Maruti", model: "Swift", color: "Red", ownerName: "Vikram Mehta", flatNumber: "B-202", parkingSlot: "P-28" },
];

export const parkingSlots: ParkingSlot[] = [
  { id: "ps-01", number: "P-12", type: "Covered", status: "Occupied", vehicleNumber: "MH12 AB 1234", flatNumber: "A-101" },
  { id: "ps-02", number: "P-13", type: "Covered", status: "Available" },
  { id: "ps-03", number: "P-28", type: "Open", status: "Occupied", vehicleNumber: "MH14 EF 9012", flatNumber: "B-202" },
  { id: "ps-04", number: "P-45", type: "Open", status: "Occupied", vehicleNumber: "MH12 CD 5678", flatNumber: "A-102" },
  { id: "ps-05", number: "P-46", type: "Covered", status: "Reserved" },
];

export const documents: DocumentItem[] = [
  { id: "doc-01", title: "Society Bye-Laws 2019", category: "Bye-Laws", uploadedBy: "Secretary", uploadDate: "2019-05-12", visibility: "All Members", status: "Verified" },
  { id: "doc-02", title: "AGM Minutes - March 2025", category: "AGM Minutes", uploadedBy: "Chairman", uploadDate: "2025-03-28", visibility: "All Owners", status: "Verified" },
  { id: "doc-03", title: "Audited Financial Statement FY 2024-25", category: "Financial Reports", uploadedBy: "Treasurer", uploadDate: "2025-06-15", visibility: "All Owners", status: "Verified" },
  { id: "doc-04", title: "Fire Safety Certificate", category: "Legal Documents", uploadedBy: "Admin", uploadDate: "2024-11-20", visibility: "Committee Only", status: "Verified" },
];

export const dashboardKPIs: KPIStat[] = [
  { title: "Total Flats", value: 248, change: 0, changeLabel: "No change", icon: "Building2", color: "primary" },
  { title: "Occupied Flats", value: 212, change: 2.4, changeLabel: "vs last month", icon: "Home", color: "success" },
  { title: "Vacant Flats", value: 28, change: -4.1, changeLabel: "vs last month", icon: "DoorOpen", color: "warning" },
  { title: "Total Members", value: 486, change: 1.8, changeLabel: "vs last month", icon: "Users", color: "info" },
  { title: "Total Tenants", value: 94, change: 5.2, changeLabel: "vs last month", icon: "UserCheck", color: "primary" },
  { title: "Current Month Collection", value: "₹8,42,500", change: 12.5, changeLabel: "vs last month", icon: "IndianRupee", color: "success" },
  { title: "Pending Maintenance", value: "₹2,18,400", change: -8.3, changeLabel: "vs last month", icon: "Clock", color: "warning" },
  { title: "Total Outstanding", value: "₹4,65,800", change: 3.1, changeLabel: "vs last month", icon: "AlertCircle", color: "danger" },
];

export const collectionChartData = [
  { month: "Mar", collected: 780000, pending: 120000 },
  { month: "Apr", collected: 820000, pending: 95000 },
  { month: "May", collected: 795000, pending: 145000 },
  { month: "Jun", collected: 860000, pending: 88000 },
  { month: "Jul", collected: 810000, pending: 135000 },
  { month: "Aug", collected: 842500, pending: 218400 },
];
