const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeDepartments,
  getEmployeeSkills,
} = require("../controllers/employeeController");

router.post("/", createEmployee);
router.get("/", getEmployees);
router.get("/departments/list", getEmployeeDepartments);
router.get("/skills/list", getEmployeeSkills);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;

 