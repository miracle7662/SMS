import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import platformRoutes from './platform.routes.js';
import societyProfileRoutes from './society-profile.routes.js';
import buildingRoutes from './building.routes.js';
import floorRoutes from './floor.routes.js';
import flatRoutes from './flat.routes.js';
import societyUserRoutes from './society-user.routes.js';
import memberRoutes from './member.routes.js';
import familyDocumentRoutes from './family-document.routes.js';
import societySettingRoutes from './society-setting.routes.js';
import chargeTypeRoutes from './charge-type.routes.js';
import chargeRuleRoutes from './charge-rule.routes.js';
import maintenancePreviewRoutes from './maintenance-preview.routes.js';
import maintenanceBillRoutes from './maintenance-bill.routes.js';
import paymentRoutes from './payment.routes.js';
import duesRoutes from './dues.routes.js';
import maintenanceReportRoutes from './maintenance-report.routes.js';
import noticeRoutes from './notice.routes.js';
import complaintRoutes from './complaint.routes.js';
import visitorRoutes from './visitor.routes.js';
import parkingRoutes from './parking.routes.js';
import amenityRoutes from './amenity.routes.js';
import expenseRoutes from './expense.routes.js';
import vendorOperationRoutes from './vendor-operation.routes.js';

const router = express.Router();

// Health check route
router.use('/', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);
router.use('/platform', platformRoutes);
router.use('/society/buildings', buildingRoutes);
router.use('/society/floors', floorRoutes);
router.use('/society/flats', flatRoutes);
router.use('/society/users', societyUserRoutes);
router.use('/society/members', memberRoutes);
router.use('/society/member-management', familyDocumentRoutes);
router.use('/society/settings', societySettingRoutes);
router.use('/society/maintenance/charge-types', chargeTypeRoutes);
router.use('/society/maintenance/charge-rules', chargeRuleRoutes);
router.use('/society/maintenance/preview', maintenancePreviewRoutes);
router.use('/society/maintenance/bills', maintenanceBillRoutes);
router.use('/society/payments', paymentRoutes);
router.use('/society/maintenance/dues', duesRoutes);
router.use('/society/reports', maintenanceReportRoutes);
router.use('/society/notices', noticeRoutes);
router.use('/society/complaints', complaintRoutes);
router.use('/society/visitors', visitorRoutes);
router.use('/society/parking', parkingRoutes);
router.use('/society/amenities', amenityRoutes);
router.use('/society/expenses', expenseRoutes);
router.use('/society/vendor-operations', vendorOperationRoutes);
router.use('/society', societyProfileRoutes);

export default router;
