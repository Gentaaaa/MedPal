require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ✅ KRIJIMI I APP
const app = express();

// ✅ MIDDLWARE
app.use(cors());
app.use(express.json());

// ✅ ROUTES
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const appointmentRoutes = require("./routes/appointments");
app.use("/api/appointments", appointmentRoutes);

const doctorRoutes = require("./routes/doctors");
app.use("/api/doctors", doctorRoutes); // ✅ Rregulluar

const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);

app.use("/uploads", express.static("uploads")); // për të shfaqur dokumentet

const documentRoutes = require("./routes/documents");
app.use("/api/documents", documentRoutes);

require("./reminderJob");


const workingHoursRoutes = require("./routes/workingHours");
app.use("/api/working-hours", workingHoursRoutes);


const adminRoutes = require("./routes/admin");

app.use("/api/admin", adminRoutes);

app.use("/api/clinic", require("./routes/clinic"));
// ✅ CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ Mongo error:', err));

// ✅ TEST ROUTE
app.get('/', (req, res) => res.send('MedPal API is running 🚀'));

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

