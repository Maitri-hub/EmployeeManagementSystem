const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

const {
  uploadEmployeeFiles,
  deleteEmployeeFile,
} = require("../controllers/uploadController");

router.post(
  "/",
  upload.array("files", 5),
  uploadEmployeeFiles
);

router.delete("/:id", deleteEmployeeFile);

module.exports = router;