const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { id: "asc" },
    });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments", error: error.message });
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
    res.status(500).json({ message: "Failed to create department", error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { departmentName } = req.body;

    const department = await prisma.department.update({
      where: { id: Number(req.params.id) },
      data: { departmentName },
    });

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Failed to update department", error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await prisma.department.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete department", error: error.message });
  }
};