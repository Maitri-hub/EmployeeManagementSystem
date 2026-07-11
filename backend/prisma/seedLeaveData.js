const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function getOrCreateDepartment(departmentName) {
  const existing = await prisma.department.findFirst({
    where: { departmentName },
  });

  if (existing) return existing;

  return prisma.department.create({
    data: { departmentName },
  });
}

async function getOrCreateSkill(skillName) {
  const existing = await prisma.skill.findFirst({
    where: { skillName },
  });

  if (existing) return existing;

  return prisma.skill.create({
    data: { skillName },
  });
}

async function main() {
  console.log("Resetting old Task 4 leave data...");

  await prisma.approvalHistory.deleteMany();
  await prisma.leaveApplication.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveType.deleteMany();

  console.log("Seeding Task 4 company data...");

  const password = await bcrypt.hash("123456", 10);

  const departments = {};
  for (const name of [
    "Software Development",
    "Quality Assurance",
    "Human Resources",
    "Finance",
    "Digital Marketing",
    "Sales",
    "Operations",
    "Technical Support",
  ]) {
    departments[name] = await getOrCreateDepartment(name);
  }

  console.log("Departments ready");

  const usersData = [
    ["Pranay Gupta", "pranay@isoftzone.com", "admin"],
    ["Rahul Sharma", "rahul@isoftzone.com", "manager"],
    ["Priya Verma", "priya@isoftzone.com", "hr"],
    ["Amit Patel", "amit@isoftzone.com", "employee"],
    ["Neha Jain", "neha@isoftzone.com", "employee"],
    ["Rohit Singh", "rohit@isoftzone.com", "employee"],
    ["Anjali Gupta", "anjali@isoftzone.com", "employee"],
    ["Vikas Mehta", "vikas@isoftzone.com", "employee"],
    ["Pooja Shah", "pooja@isoftzone.com", "employee"],
    ["Sandeep Kumar", "sandeep@isoftzone.com", "employee"],
  ];

  const users = {};

  for (const [name, email, role] of usersData) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: {
        name,
        email,
        password,
        role,
        verified: true,
      },
    });

    users[email] = user;
  }

  console.log("Users ready");

  const profileData = [
    ["pranay@isoftzone.com", "Software Development", "9876543210", "Indore", "Director", 150000],
    ["rahul@isoftzone.com", "Software Development", "9876543211", "Indore", "Project Manager", 85000],
    ["priya@isoftzone.com", "Human Resources", "9876543212", "Indore", "HR Manager", 70000],
    ["amit@isoftzone.com", "Software Development", "9876543213", "Indore", "React Developer", 45000],
    ["neha@isoftzone.com", "Software Development", "9876543214", "Indore", "Node Developer", 50000],
    ["rohit@isoftzone.com", "Quality Assurance", "9876543215", "Indore", "QA Engineer", 40000],
    ["anjali@isoftzone.com", "Digital Marketing", "9876543216", "Indore", "Marketing Executive", 35000],
    ["vikas@isoftzone.com", "Sales", "9876543217", "Indore", "Sales Executive", 38000],
    ["pooja@isoftzone.com", "Technical Support", "9876543218", "Indore", "Support Engineer", 32000],
    ["sandeep@isoftzone.com", "Finance", "9876543219", "Indore", "Accountant", 42000],
  ];

  const profiles = {};

  for (const [email, deptName, phone, address, designation, salary] of profileData) {
    const user = users[email];

    let profile = await prisma.employeeProfile.findFirst({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.employeeProfile.create({
        data: {
          userId: user.id,
          departmentId: departments[deptName].id,
          phone,
          address,
          designation,
          salary,
        },
      });
    } else {
      profile = await prisma.employeeProfile.update({
        where: { id: profile.id },
        data: {
          departmentId: departments[deptName].id,
          phone,
          address,
          designation,
          salary,
        },
      });
    }

    profiles[email] = profile;
  }

  console.log("Employee profiles ready");

  const skills = {};
  for (const name of [
    "React",
    "NodeJS",
    "PostgreSQL",
    "JavaScript",
    "HTML",
    "CSS",
    "MongoDB",
    "Python",
    "Testing",
    "Salesforce",
  ]) {
    skills[name] = await getOrCreateSkill(name);
  }

  console.log("Skills ready");

  const seededProfileIds = Object.values(profiles).map((p) => p.id);

  await prisma.employeeSkill.deleteMany({
    where: { employeeId: { in: seededProfileIds } },
  });

  const skillLinks = [
    ["amit@isoftzone.com", "React"],
    ["amit@isoftzone.com", "JavaScript"],
    ["amit@isoftzone.com", "HTML"],

    ["neha@isoftzone.com", "NodeJS"],
    ["neha@isoftzone.com", "PostgreSQL"],
    ["neha@isoftzone.com", "JavaScript"],

    ["rohit@isoftzone.com", "Testing"],

    ["anjali@isoftzone.com", "JavaScript"],

    ["vikas@isoftzone.com", "Salesforce"],

    ["pooja@isoftzone.com", "NodeJS"],
    ["pooja@isoftzone.com", "PostgreSQL"],

    ["sandeep@isoftzone.com", "Python"],
  ];

  await prisma.employeeSkill.createMany({
    data: skillLinks.map(([email, skillName]) => ({
      employeeId: profiles[email].id,
      skillId: skills[skillName].id,
    })),
  });

  console.log("Employee skills ready");

  const casualLeave = await prisma.leaveType.create({
    data: { leaveName: "Casual Leave", totalDays: 12 },
  });

  const sickLeave = await prisma.leaveType.create({
    data: { leaveName: "Sick Leave", totalDays: 10 },
  });

  const earnedLeave = await prisma.leaveType.create({
    data: { leaveName: "Earned Leave", totalDays: 15 },
  });

  const maternityLeave = await prisma.leaveType.create({
    data: { leaveName: "Maternity Leave", totalDays: 90 },
  });

  console.log("Leave types ready");

  await prisma.leaveBalance.createMany({
    data: [
      { employeeId: profiles["amit@isoftzone.com"].id, leaveTypeId: casualLeave.id, availableDays: 10 },
      { employeeId: profiles["amit@isoftzone.com"].id, leaveTypeId: sickLeave.id, availableDays: 8 },

      { employeeId: profiles["neha@isoftzone.com"].id, leaveTypeId: casualLeave.id, availableDays: 12 },
      { employeeId: profiles["neha@isoftzone.com"].id, leaveTypeId: sickLeave.id, availableDays: 10 },

      { employeeId: profiles["rohit@isoftzone.com"].id, leaveTypeId: casualLeave.id, availableDays: 8 },
      { employeeId: profiles["rohit@isoftzone.com"].id, leaveTypeId: sickLeave.id, availableDays: 6 },

      { employeeId: profiles["anjali@isoftzone.com"].id, leaveTypeId: casualLeave.id, availableDays: 10 },
      { employeeId: profiles["anjali@isoftzone.com"].id, leaveTypeId: sickLeave.id, availableDays: 7 },

      { employeeId: profiles["vikas@isoftzone.com"].id, leaveTypeId: casualLeave.id, availableDays: 12 },
      { employeeId: profiles["vikas@isoftzone.com"].id, leaveTypeId: sickLeave.id, availableDays: 10 },
    ],
  });

  console.log("Leave balances ready");

  const leave1 = await prisma.leaveApplication.create({
    data: {
      employeeId: profiles["amit@isoftzone.com"].id,
      leaveTypeId: casualLeave.id,
      fromDate: new Date("2026-06-01"),
      toDate: new Date("2026-06-03"),
      totalDays: 3,
      reason: "Family Function",
      status: "Approved",
    },
  });

  await prisma.leaveApplication.create({
    data: {
      employeeId: profiles["neha@isoftzone.com"].id,
      leaveTypeId: sickLeave.id,
      fromDate: new Date("2026-06-10"),
      toDate: new Date("2026-06-11"),
      totalDays: 2,
      reason: "Fever",
      status: "Pending",
    },
  });

  const leave3 = await prisma.leaveApplication.create({
    data: {
      employeeId: profiles["rohit@isoftzone.com"].id,
      leaveTypeId: casualLeave.id,
      fromDate: new Date("2026-05-20"),
      toDate: new Date("2026-05-21"),
      totalDays: 2,
      reason: "Personal Work",
      status: "Approved",
    },
  });

  await prisma.leaveApplication.create({
    data: {
      employeeId: profiles["anjali@isoftzone.com"].id,
      leaveTypeId: casualLeave.id,
      fromDate: new Date("2026-06-15"),
      toDate: new Date("2026-06-17"),
      totalDays: 3,
      reason: "Travel",
      status: "Pending",
    },
  });

  const leave5 = await prisma.leaveApplication.create({
    data: {
      employeeId: profiles["vikas@isoftzone.com"].id,
      leaveTypeId: sickLeave.id,
      fromDate: new Date("2026-06-18"),
      toDate: new Date("2026-06-20"),
      totalDays: 3,
      reason: "Medical",
      status: "Rejected",
    },
  });

  console.log("Leave applications ready");

  await prisma.approvalHistory.createMany({
    data: [
      {
        leaveId: leave1.id,
        approvedBy: users["rahul@isoftzone.com"].id,
        action: "Approved",
        remarks: "Manager Approved",
      },
      {
        leaveId: leave1.id,
        approvedBy: users["priya@isoftzone.com"].id,
        action: "Approved",
        remarks: "HR Approved",
      },
      {
        leaveId: leave3.id,
        approvedBy: users["rahul@isoftzone.com"].id,
        action: "Approved",
        remarks: "Manager Approved",
      },
      {
        leaveId: leave3.id,
        approvedBy: users["priya@isoftzone.com"].id,
        action: "Approved",
        remarks: "HR Approved",
      },
      {
        leaveId: leave5.id,
        approvedBy: users["rahul@isoftzone.com"].id,
        action: "Rejected",
        remarks: "Insufficient Reason",
      },
    ],
  });

  console.log("Approval history ready");
  console.log("Task 4 seed completed successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });