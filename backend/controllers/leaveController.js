const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* =========================
   GET LEAVE TYPES
========================= */
exports.getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(leaveTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leave types" });
  }
};

/* =========================
   GET LEAVE BALANCES
========================= */
exports.getLeaveBalances = async (req, res) => {
  try {
    const balances = await prisma.leaveBalance.findMany({
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        leaveType: true,
      },
    });

    res.json(balances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leave balances" });
  }
};

/* =========================
   GET ALL APPLICATIONS
========================= */
exports.getLeaveApplications = async (req, res) => {
  try {
    const applications = await prisma.leaveApplication.findMany({
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        leaveType: true,
        approvalHistory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leave applications" });
  }
};

/* =========================
   CREATE LEAVE APPLICATION
========================= */
exports.createLeaveApplication = async (req, res) => {
  try {
    const {
      employeeId,
      leaveTypeId,
      fromDate,
      toDate,
      totalDays,
      reason,
    } = req.body;

    const application = await prisma.leaveApplication.create({
      data: {
        employeeId: Number(employeeId),
        leaveTypeId: Number(leaveTypeId),
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        totalDays: Number(totalDays),
        reason,
        status: "Pending",
      },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create leave application" });
  }
};

/* =========================
   APPROVE / REJECT
========================= */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leaveId = Number(req.params.id);

    const {
      status,
      approvedBy,
      remarks,
    } = req.body;

    const updatedLeave = await prisma.leaveApplication.update({
      where: {
        id: leaveId,
      },
      data: {
        status,
      },
    });

    await prisma.approvalHistory.create({
      data: {
        leaveId,
        approvedBy: Number(approvedBy),
        action: status,
        remarks,
      },
    });

    res.json(updatedLeave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update leave status" });
  }
};

/* =========================
   DASHBOARD STATS
========================= */
exports.getLeaveDashboardStats = async (req, res) => {
  try {
    const pendingLeaves = await prisma.leaveApplication.count({
      where: {
        status: "Pending",
      },
    });

    const approvedLeaves = await prisma.leaveApplication.count({
      where: {
        status: "Approved",
      },
    });

    const rejectedLeaves = await prisma.leaveApplication.count({
      where: {
        status: "Rejected",
      },
    });

    res.json({
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load leave dashboard statistics",
    });
  }
};
