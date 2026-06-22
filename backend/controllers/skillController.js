const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { id: "asc" },
    });

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch skills", error: error.message });
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
    res.status(500).json({ message: "Failed to create skill", error: error.message });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const { skillName } = req.body;

    const skill = await prisma.skill.update({
      where: { id: Number(req.params.id) },
      data: { skillName },
    });

    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: "Failed to update skill", error: error.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    await prisma.skill.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete skill", error: error.message });
  }
};