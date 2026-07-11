const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getLeaveTypes,
  getLeaveBalances,
  getLeaveApplications,
  createLeaveApplication,
  updateLeaveStatus,
  getLeaveDashboardStats,
} = require("../controllers/leaveController");

router.get("/types", getLeaveTypes);
router.get("/balances", getLeaveBalances);
router.get("/applications", getLeaveApplications);
router.post("/applications", createLeaveApplication);
router.put("/applications/:id/status", updateLeaveStatus);
router.get("/dashboard/stats", getLeaveDashboardStats);

module.exports = router;