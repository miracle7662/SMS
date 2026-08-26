import {
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
  Visitor,
  Amenity,
  Booking,
  Vendor,
  Expense,
  SocietyDocument,
  Notification,
  User,
  Society,
} from "@/types";

const firstNames = [
  "Rajesh", "Sunita", "Amit", "Priya", "Vikram", "Neha", "Suresh", "Anjali",
  "Manoj", "Kavita", "Rahul", "Deepa", "Sanjay", "Pooja", "Arun", "Meena",
  "Vijay", "Rekha", "Ashok", "Shalini", "Ramesh", "Nita", "Kiran", "Swati",
  "Prakash", "Geeta", "Dinesh", "Lata", "Mahesh", "Usha", "Nitin", "Seema",
  "Ravi", "Anita", "Sachin", "Vandana", "Ajay", "Sarita", "Rohit", "Madhuri",
];
const lastNames = [
  "Deshmukh", "Patil", "Kulkarni", "Sharma", "Joshi", "Kadam", "Shah", "Gupta",
  "Pawar", "Rane", "Chavan", "Mehta", "Naik", "Bhosale", "Iyer", "Nair",
  "Jadhav", "Kale", "Sawant", "More", "Salunkhe", "Thakur", "Gaikwad", "Bhatt",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function fullName(i: number): string {
  return `${pick(firstNames, i)} ${pick(lastNames, i * 3 + 7)}`;
}

function mobile(i: number): string {
  return `9${(800000000 + i * 137).toString().slice(0, 9)}`;
}

const BUILDINGS = ["Sunrise Tower A", "Sunrise Tower B", "Palm Residency", "Orchid Wing", "Willow Court"];
const WINGS = ["A", "B", "C"];
const FLAT_TYPES = ["1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK"];

export const society: Society = {
  id: "SOC001",
  name: "Green Valley Co-operative Housing Society",
  registrationNo: "MH/PUNE/2011/00458",
  address: "Survey No. 42, Baner-Pashan Link Road",
  city: "Pune, Maharashtra",
  totalBuildings: 5,
  totalFlats: 240,
};

export const societies: Society[] = [
  society,
  {
    id: "SOC002",
    name: "Riverside Residency Society",
    registrationNo: "MH/PUNE/2015/01122",
    address: "Sinhagad Road",
    city: "Pune, Maharashtra",
    totalBuildings: 3,
    totalFlats: 144,
  },
  {
    id: "SOC003",
    name: "Emerald Heights CHS",
    registrationNo: "MH/MUM/2009/00792",
    address: "Andheri West",
    city: "Mumbai, Maharashtra",
    totalBuildings: 2,
    totalFlats: 96,
  },
];

export const buildings: Building[] = BUILDINGS.map((name, i) => ({
  id: `BLD${i + 1}`,
  societyId: "SOC001",
  name,
  wings: WINGS.slice(0, ((i % 3) + 1)),
  totalFloors: 12 + (i % 4) * 2,
  totalFlats: 48,
}));

export const flats: Flat[] = Array.from({ length: 60 }).map((_, i) => {
  const building = pick(BUILDINGS, i);
  const wing = pick(WINGS, i * 2);
  const floor = (i % 14) + 1;
  const flatNo = `${wing}-${floor.toString().padStart(2, "0")}${(i % 4) + 1}`;
  const owner = fullName(i);
  const occ = i % 5 === 0 ? "Vacant" : i % 3 === 0 ? "Rented" : "Owner Occupied";
  return {
    id: `FLT${1000 + i}`,
    flatNo,
    building,
    wing,
    floor,
    type: pick(FLAT_TYPES, i),
    areaSqft: 550 + (i % 6) * 175,
    ownerId: `OWN${2000 + i}`,
    ownerName: owner,
    occupancy: occ as Flat["occupancy"],
    status: occ === "Vacant" ? "Vacant" : "Occupied",
  };
});

export const members: Member[] = flats.slice(0, 40).map((f, i) => ({
  id: `MEM${3000 + i}`,
  name: f.ownerName,
  flatNo: f.flatNo,
  building: f.building,
  mobile: mobile(i),
  email: `${f.ownerName.toLowerCase().replace(/\s/g, ".")}@gmail.com`,
  type: i % 4 === 0 ? "Co-Owner" : "Owner",
  status: "Active",
}));

const broker = ["Sanjay Estate Agency", "City Property Consultants", "Metro Realtors", "Prime Housing Brokers", undefined];

export const tenants: Tenant[] = flats
  .filter((f) => f.occupancy === "Rented")
  .map((f, i) => {
    const rentStart = new Date(2024, (i % 12), 1 + (i % 20));
    const rentEnd = new Date(rentStart);
    rentEnd.setMonth(rentEnd.getMonth() + 11);
    return {
      id: `TEN${4000 + i}`,
      name: fullName(i + 50),
      flatNo: f.flatNo,
      building: f.building,
      mobile: mobile(i + 100),
      email: `${fullName(i + 50).toLowerCase().replace(/\s/g, ".")}@gmail.com`,
      address: `${f.flatNo}, ${f.building}, ${society.city}`,
      rentStart: rentStart.toISOString(),
      rentEnd: rentEnd.toISOString(),
      brokerName: pick(broker, i),
      brokerMobile: pick(broker, i) ? mobile(i + 200) : undefined,
      agreementStatus: i % 6 === 0 ? "Expired" : i % 3 === 0 ? "Pending" : "Verified",
      policeNoc: i % 5 === 0 ? "Pending" : "Verified",
      ownerName: f.ownerName,
      status: "Active",
    };
  });

const chargeBreakupTemplate = [
  { label: "Monthly Maintenance", amount: 3200 },
  { label: "Sinking Fund", amount: 450 },
  { label: "Repair Fund", amount: 350 },
  { label: "Water Charge", amount: 500 },
];

export const maintenanceBills: MaintenanceBill[] = flats.slice(0, 45).map((f, i) => {
  const amount = chargeBreakupTemplate.reduce((s, c) => s + c.amount, 0) + (f.type.includes("3") ? 800 : 0);
  const due = new Date(2026, 7, 10);
  const statusRoll = i % 5;
  return {
    id: `BILL${5000 + i}`,
    billNo: `GVH/2026-27/${(1000 + i)}`,
    flatNo: f.flatNo,
    building: f.building,
    ownerName: f.ownerName,
    month: "August 2026",
    financialYear: "2026-27",
    amount,
    dueDate: due.toISOString(),
    status: statusRoll === 0 ? "Overdue" : statusRoll === 1 ? "Unpaid" : "Paid",
    chargeBreakup: chargeBreakupTemplate,
  };
});

export const payments: Payment[] = maintenanceBills
  .filter((b) => b.status === "Paid")
  .map((b, i) => ({
    id: `PAY${6000 + i}`,
    receiptNo: `RCT/26-27/${(500 + i)}`,
    flatNo: b.flatNo,
    payerName: b.ownerName,
    amount: b.amount,
    mode: pick(["UPI", "NEFT", "Cash", "Cheque", "Online"], i) as Payment["mode"],
    date: new Date(2026, 7, 2 + (i % 10)).toISOString(),
    status: "Success",
    billNo: b.billNo,
  }));

const complaintCategories = ["Plumbing", "Electrical", "Housekeeping", "Security", "Lift", "Parking", "Noise", "Civil Work"];

export const complaints: Complaint[] = Array.from({ length: 24 }).map((_, i) => {
  const f = pick(flats, i);
  const statuses: Complaint["status"][] = ["Open", "In Progress", "Resolved", "Closed"];
  return {
    id: `CMP${7000 + i}`,
    complaintNo: `CMP/26-27/${(300 + i)}`,
    complainant: f.ownerName,
    flatNo: f.flatNo,
    type: i % 3 === 0 ? "Tenant" : "Owner",
    category: pick(complaintCategories, i),
    priority: pick(["Low", "Medium", "High", "Urgent"], i) as Complaint["priority"],
    status: pick(statuses, i),
    createdDate: new Date(2026, 6 + (i % 2), 1 + (i % 27)).toISOString(),
    assignedTo: pick(["Rohit (Plumber)", "Santosh (Electrician)", "Housekeeping Team", "Security Head", undefined], i),
    description: `${pick(complaintCategories, i)} issue reported at flat ${f.flatNo}. Needs inspection and resolution at the earliest.`,
  };
});

export const notices: Notice[] = [
  {
    id: "NTC001",
    title: "Annual General Meeting - AGM 2026",
    description: "All members are requested to attend the AGM on 30th August 2026 at the clubhouse, 6:00 PM.",
    noticeType: "All Members",
    publishDate: new Date(2026, 7, 5).toISOString(),
    expiryDate: new Date(2026, 7, 30).toISOString(),
    status: "Published",
    recipients: "All Members (240)",
  },
  {
    id: "NTC002",
    title: "Water Supply Interruption - 18th August",
    description: "Water supply will be interrupted between 10 AM - 2 PM for tank cleaning.",
    noticeType: "All Members",
    publishDate: new Date(2026, 7, 12).toISOString(),
    expiryDate: new Date(2026, 7, 19).toISOString(),
    status: "Published",
    recipients: "All Members (240)",
  },
  {
    id: "NTC003",
    title: "Tenant Police Verification Reminder",
    description: "Tenants yet to submit Police NOC are requested to do so before 25th August 2026.",
    noticeType: "Tenant Notice",
    publishDate: new Date(2026, 7, 10).toISOString(),
    expiryDate: new Date(2026, 7, 25).toISOString(),
    status: "Published",
    recipients: "All Tenants (18)",
  },
  {
    id: "NTC004",
    title: "Diwali Cultural Committee Meeting",
    description: "Committee meeting to plan Diwali celebrations - 22nd August, Society Hall.",
    noticeType: "All Members",
    publishDate: new Date(2026, 7, 18).toISOString(),
    expiryDate: new Date(2026, 8, 5).toISOString(),
    status: "Scheduled",
    recipients: "All Members (240)",
  },
  {
    id: "NTC005",
    title: "Parking Sticker Renewal - Draft",
    description: "New parking stickers to be issued for FY 2026-27.",
    noticeType: "All Members",
    publishDate: new Date(2026, 8, 1).toISOString(),
    expiryDate: new Date(2026, 8, 30).toISOString(),
    status: "Draft",
    recipients: "All Members (240)",
  },
];

const vehicleBrands = [
  { brand: "Maruti Suzuki", model: "Swift", type: "Car" },
  { brand: "Hyundai", model: "Creta", type: "Car" },
  { brand: "Honda", model: "City", type: "Car" },
  { brand: "Tata", model: "Nexon", type: "Car" },
  { brand: "Honda", model: "Activa", type: "Scooter" },
  { brand: "TVS", model: "Jupiter", type: "Scooter" },
  { brand: "Royal Enfield", model: "Classic 350", type: "Bike" },
  { brand: "Bajaj", model: "Pulsar", type: "Bike" },
];

export const vehicles: Vehicle[] = flats.slice(0, 35).map((f, i) => {
  const v = pick(vehicleBrands, i);
  return {
    id: `VEH${8000 + i}`,
    vehicleNo: `MH12${pick(["AB", "CD", "EF", "GH"], i)}${(1000 + i * 7) % 9999}`,
    type: v.type as Vehicle["type"],
    brand: v.brand,
    model: v.model,
    color: pick(["White", "Silver", "Black", "Red", "Grey", "Blue"], i),
    ownerName: f.ownerName,
    flatNo: f.flatNo,
  };
});

export const parkingSlots: ParkingSlot[] = Array.from({ length: 40 }).map((_, i) => {
  const status = i % 4 === 0 ? "Available" : i % 7 === 0 ? "Reserved" : "Occupied";
  const v = status !== "Available" ? vehicles[i % vehicles.length] : undefined;
  return {
    id: `PS${9000 + i}`,
    slotNo: `${i < 25 ? "B1" : "B2"}-${(i % 25) + 1}`,
    type: i % 3 === 0 ? "Two Wheeler" : "Four Wheeler",
    status: status as ParkingSlot["status"],
    flatNo: v?.flatNo,
    vehicleNo: v?.vehicleNo,
  };
});

export const visitors: Visitor[] = Array.from({ length: 18 }).map((_, i) => {
  const f = pick(flats, i * 2);
  const checkIn = new Date(2026, 7, 15, 8 + (i % 12), (i * 7) % 60);
  const isOut = i % 3 !== 0;
  return {
    id: `VIS${10000 + i}`,
    name: fullName(i + 300),
    mobile: mobile(i + 400),
    purpose: pick(["Guest", "Delivery", "Cab/Auto", "Domestic Help", "Vendor", "Courier"], i),
    flatNo: f.flatNo,
    checkIn: checkIn.toISOString(),
    checkOut: isOut ? new Date(checkIn.getTime() + 45 * 60000).toISOString() : undefined,
    status: isOut ? "Out" : "In",
  };
});

export const amenities: Amenity[] = [
  { id: "AMN001", name: "Clubhouse Banquet Hall", description: "AC hall for functions, capacity 150", capacity: 150, bookable: true, status: "Active" },
  { id: "AMN002", name: "Swimming Pool", description: "Adult & kids pool, 6 AM - 9 PM", capacity: 30, bookable: true, status: "Active" },
  { id: "AMN003", name: "Gymnasium", description: "Fully equipped gym", capacity: 20, bookable: false, status: "Active" },
  { id: "AMN004", name: "Badminton Court", description: "Indoor synthetic court", capacity: 4, bookable: true, status: "Active" },
  { id: "AMN005", name: "Terrace Garden", description: "Open garden seating area", capacity: 40, bookable: true, status: "Active" },
  { id: "AMN006", name: "Kids Play Area", description: "Outdoor play equipment", capacity: 15, bookable: false, status: "Inactive" },
];

export const bookings: Booking[] = Array.from({ length: 14 }).map((_, i) => {
  const f = pick(flats, i * 3);
  const a = pick(amenities.filter((x) => x.bookable), i);
  return {
    id: `BKG${11000 + i}`,
    amenityName: a.name,
    flatNo: f.flatNo,
    bookedBy: f.ownerName,
    date: new Date(2026, 7, 15 + (i % 15)).toISOString(),
    slot: pick(["6:00 AM - 8:00 AM", "5:00 PM - 7:00 PM", "7:00 PM - 9:00 PM", "10:00 AM - 12:00 PM"], i),
    status: pick(["Pending", "Active", "Closed"] as const, i) as Booking["status"],
  };
});

export const vendors: Vendor[] = [
  { id: "VND001", name: "Suresh Plumbing Works", service: "Plumbing", contact: "Suresh Kadam", mobile: mobile(501), email: "sureshplumbing@gmail.com", status: "Active" },
  { id: "VND002", name: "PowerFix Electricals", service: "Electrical", contact: "Nilesh Rane", mobile: mobile(502), email: "powerfix@gmail.com", status: "Active" },
  { id: "VND003", name: "Sparkle Housekeeping Services", service: "Housekeeping", contact: "Anita More", mobile: mobile(503), email: "sparkle.hk@gmail.com", status: "Active" },
  { id: "VND004", name: "SecureGuard Security Agency", service: "Security", contact: "Vinod Pawar", mobile: mobile(504), email: "secureguard@gmail.com", status: "Active" },
  { id: "VND005", name: "GreenScape Gardeners", service: "Gardening", contact: "Bharat Jadhav", mobile: mobile(505), email: "greenscape@gmail.com", status: "Inactive" },
  { id: "VND006", name: "OTIS Elevators Service", service: "Lift Maintenance", contact: "Client Desk", mobile: mobile(506), email: "service@otis.com", status: "Active" },
];

export const expenses: Expense[] = Array.from({ length: 20 }).map((_, i) => {
  const v = pick(vendors, i);
  return {
    id: `EXP${12000 + i}`,
    category: v.service,
    description: `${v.service} services for ${pick(BUILDINGS, i)} - August 2026`,
    vendor: v.name,
    amount: 3500 + (i % 8) * 2200,
    date: new Date(2026, 7, 1 + (i % 27)).toISOString(),
    paymentStatus: i % 4 === 0 ? "Pending" : "Paid",
  };
});

export const documents: SocietyDocument[] = [
  { id: "DOC001", title: "Society Bye-Laws 2024", category: "Bye-Laws", uploadedBy: "Secretary", uploadDate: new Date(2024, 3, 12).toISOString(), visibility: "All Members", status: "Active" },
  { id: "DOC002", title: "AGM Minutes - FY 2025-26", category: "AGM Documents", uploadedBy: "Secretary", uploadDate: new Date(2026, 4, 2).toISOString(), visibility: "All Owners", status: "Active" },
  { id: "DOC003", title: "Audited Financial Statement FY24-25", category: "Financial Documents", uploadedBy: "Treasurer", uploadDate: new Date(2025, 6, 20).toISOString(), visibility: "Committee Only", status: "Active" },
  { id: "DOC004", title: "Society Registration Certificate", category: "Society Rules", uploadedBy: "Admin", uploadDate: new Date(2022, 1, 15).toISOString(), visibility: "Admin Only", status: "Active" },
  { id: "DOC005", title: "Fire Safety NOC 2026", category: "Other Documents", uploadedBy: "Admin", uploadDate: new Date(2026, 5, 8).toISOString(), visibility: "All Members", status: "Active" },
  { id: "DOC006", title: "Managing Committee Election Notice", category: "Society Rules", uploadedBy: "Secretary", uploadDate: new Date(2023, 10, 1).toISOString(), visibility: "All Members", status: "Expired" },
];

export const notifications: Notification[] = [
  { id: "N1", type: "Payment", title: "Payment Received", message: "₹4,500 received from Flat A-1203 towards maintenance.", time: new Date(2026, 7, 15, 9, 20).toISOString(), read: false, module: "Payments" },
  { id: "N2", type: "Complaint", title: "New Complaint Raised", message: "Plumbing complaint raised for Flat B-0502.", time: new Date(2026, 7, 15, 8, 5).toISOString(), read: false, module: "Complaints" },
  { id: "N3", type: "Tenant Agreement Expiry", title: "Agreement Expiring Soon", message: "Tenant agreement for Flat C-0801 expires in 5 days.", time: new Date(2026, 7, 14, 18, 0).toISOString(), read: false, module: "Members" },
  { id: "N4", type: "Notice", title: "Notice Published", message: "AGM 2026 notice has been published to all members.", time: new Date(2026, 7, 14, 11, 30).toISOString(), read: true, module: "Communication" },
  { id: "N5", type: "Maintenance Bill", title: "Bills Generated", message: "August 2026 maintenance bills generated for 240 flats.", time: new Date(2026, 7, 1, 10, 0).toISOString(), read: true, module: "Maintenance" },
  { id: "N6", type: "Visitor", title: "Pre-approved Visitor Expected", message: "Guest expected at Flat A-0904 today at 5 PM.", time: new Date(2026, 7, 15, 7, 45).toISOString(), read: true, module: "Visitors" },
  { id: "N7", type: "Document Expiry", title: "Document Expiring", message: "Fire Safety NOC renewal due in 30 days.", time: new Date(2026, 7, 13, 16, 0).toISOString(), read: true, module: "Documents" },
];

export const users: User[] = [
  { id: "USR001", name: "Anil Deshmukh", email: "anil.admin@greenvalley.org", mobile: mobile(1), role: "SOCIETY_ADMIN", status: "Active", lastLogin: new Date(2026, 7, 15, 8, 0).toISOString() },
  { id: "USR002", name: "Sunita Kulkarni", email: "sunita.chairman@greenvalley.org", mobile: mobile(2), role: "CHAIRMAN", status: "Active", lastLogin: new Date(2026, 7, 14, 20, 10).toISOString() },
  { id: "USR003", name: "Ramesh Patil", email: "ramesh.secretary@greenvalley.org", mobile: mobile(3), role: "SECRETARY", status: "Active", lastLogin: new Date(2026, 7, 15, 9, 30).toISOString() },
  { id: "USR004", name: "Kavita Joshi", email: "kavita.treasurer@greenvalley.org", mobile: mobile(4), role: "TREASURER", status: "Active", lastLogin: new Date(2026, 7, 14, 17, 45).toISOString() },
  { id: "USR005", name: "Suresh Rane", email: "suresh.accounts@greenvalley.org", mobile: mobile(5), role: "ACCOUNTANT", status: "Active", lastLogin: new Date(2026, 7, 15, 7, 55).toISOString() },
  { id: "USR006", name: "Vinod Pawar", email: "vinod.security@greenvalley.org", mobile: mobile(6), role: "SECURITY", status: "Active", lastLogin: new Date(2026, 7, 15, 6, 0).toISOString() },
  { id: "USR007", name: "Priya Shah", email: "priya.shah@gmail.com", mobile: mobile(7), role: "RESIDENT", status: "Inactive", lastLogin: new Date(2026, 6, 28, 12, 0).toISOString() },
];

export const collectionTrend = [
  { month: "Mar", collected: 680000, target: 720000 },
  { month: "Apr", collected: 705000, target: 720000 },
  { month: "May", collected: 690000, target: 720000 },
  { month: "Jun", collected: 715000, target: 720000 },
  { month: "Jul", collected: 698000, target: 720000 },
  { month: "Aug", collected: 612000, target: 720000 },
];

export const kpis = {
  totalFlats: 240,
  occupiedFlats: 214,
  vacantFlats: 26,
  totalMembers: 421,
  totalTenants: 68,
  currentMonthCollection: 612000,
  pendingMaintenance: 108000,
  totalOutstanding: 286500,
};
