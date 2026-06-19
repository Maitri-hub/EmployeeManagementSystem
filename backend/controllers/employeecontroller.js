const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createEmployee = async (req, res) => {
  try {
    const { userId, departmentId, phone, address, designation, salary, skillIds } = req.body;

    const employee = await prisma.employeeProfile.create({
      data: {
        userId: Number(userId),
        departmentId: Number(departmentId),
        phone,
        address,
        designation,
        salary: salary ? Number(salary) : null,
        employeeSkills: {
          create: skillIds?.map((id) => ({
            skillId: Number(id),
          })) || [],
        },
      },
      include: {
        user: true,
        department: true,
        employeeSkills: {
          include: { skill: true },
        },
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Failed to create employee", error: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employeeProfile.findMany({
      include: {
        user: true,
        department: true,
        images: true,
        employeeSkills: {
          include: { skill: true },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error: error.message });
  }
}; 

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: true,
        department: true,
        images: true,
        employeeSkills: { include: { skill: true } },
      },
    });

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee", error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await prisma.employeeProfile.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete employee", error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { departmentId, phone, address, designation, salary } = req.body;

    const employee = await prisma.employeeProfile.update({
      where: { id: Number(req.params.id) },
      data: {
        departmentId: departmentId ? Number(departmentId) : undefined,
        phone,
        address,
        designation,
        salary: salary ? Number(salary) : undefined,
      },
      include: {
        user: true,
        department: true,
        images: true,
        employeeSkills: {
          include: { skill: true },
        },
      },
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Failed to update employee", error: error.message });
  }
};