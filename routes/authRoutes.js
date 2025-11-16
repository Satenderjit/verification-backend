// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { loginAdmin, registerAdmin } = require("../controllers/authController");

// POST /api/auth/login → handle admin login
router.post("/login", loginAdmin);

// POST /api/auth/register → Use this ONE TIME to create the first admin account
router.post("/register", registerAdmin);

module.exports = router;