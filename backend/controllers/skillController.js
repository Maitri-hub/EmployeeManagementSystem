const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { id: "asc" },
    });

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch skills" });
  }
};

exports.createSkill = async (req, res) => {
  try {
    const { skillName } = req.body;

    const skill = await prisma.skill.create({
      data: { skillName },
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: "Failed to create skill" });
  }
};