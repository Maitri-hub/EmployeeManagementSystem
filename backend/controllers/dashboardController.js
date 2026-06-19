const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await prisma.employeeProfile.count();
    const totalDepartments = await prisma.department.count();
    const totalSkills = await prisma.skill.count();
    const totalImages = await prisma.employeeImage.count();

    res.json({
      totalEmployees,
      totalDepartments,
      totalSkills,
      totalImages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};