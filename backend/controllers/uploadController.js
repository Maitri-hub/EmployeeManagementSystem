exports.uploadEmployeeFiles = async (req, res) => {
  try {
    const files = req.files.map((file) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
    }));

    res.status(200).json({
      message: "Files uploaded successfully",
      files,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};