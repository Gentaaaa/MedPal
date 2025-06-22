const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Service = require("../models/Service");

// 📥 Merr të gjithë mjekët për dropdown
router.get("/public", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("name _id");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së mjekëve." });
  }
});

// 📦 Merr shërbimet për një doktor (bazuar në departmentId)
router.get("/:id/services", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Mjeku nuk u gjet." });
    }

    // Kontrollo nëse doktori ka department të lidhur
    if (!doctor.departmentId) {
      return res.json([]);
    }

    // Gjej të gjitha shërbimet që i përkasin këtij departamenti
    const services = await Service.find({ departmentId: doctor.departmentId }).select("name price _id");

    res.json(services);
  } catch (err) {
    console.error("❌ Error te /doctors/:id/services:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së shërbimeve." });
  }
});
router.get("/search", async (req, res) => {
  try {
    const { name, departmentId, serviceId } = req.query;

    const query = { role: "doctor" };

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (departmentId) {
      query.departmentId = departmentId;
    }

    if (serviceId) {
      query.services = serviceId;
    }

    const doctors = await User.find(query).select("-password");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë kërkimit të mjekëve." });
  }
});


module.exports = router;
