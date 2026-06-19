const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const { uploadEmployeeFiles } = require("../controllers/uploadController");

router.post("/", upload.array("files", 5), uploadEmployeeFiles);

module.exports = router;