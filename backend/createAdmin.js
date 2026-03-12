import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // تأكد أن المسار صحيح

dotenv.config();

// ربط بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const existingAdmin = await User.findOne({ email: "mokhles.trading@gmail.com" });
    if (existingAdmin) {
      console.log("Admin موجود بالفعل");
      process.exit(0);
    }

    await User.create({
      name: "Admin",
      email: "mokhles.trading@gmail.com",
      password: hashedPassword,
      role: "admin"
    });

    console.log("✅ Admin تم إنشاؤه بنجاح");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();