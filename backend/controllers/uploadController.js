const { PrismaClient } = require("@prisma/client");
const prisma = require("../config/prisma");

exports.uploadEmployeeFiles = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "employeeId is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    console.log("EMPLOYEE ID:", req.body.employeeId);
    console.log("FILES:", req.files);
    console.log("FILES COUNT:", req.files?.length);

    const filesData = req.files.map((file) => ({
      employeeId: Number(employeeId),
      imageUrl: `/uploads/${file.filename}`,
    }));

    const savedFiles = await prisma.employeeImage.createMany({
      data: filesData,
    });

    res.status(200).json({
      message: "Files uploaded and saved successfully",
      count: savedFiles.count,
      files: filesData,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.deleteEmployeeFile = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.employeeImage.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete file",
      error: error.message,
    });
  }
};