const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { id: "asc" },
    });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { departmentName } = req.body;

    const department = await prisma.department.create({
      data: { departmentName },
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: "Failed to create department" });
  }
};