import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import mongoose from "mongoose";

// Prevent mongoose buffering
mongoose.set("bufferCommands", false);

// Change doctor availability
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId).maxTimeMS(10000);
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    await doctorModel.findByIdAndUpdate(
      docId,
      {
        available: !docData.available,
      },
      { maxTimeMS: 10000 }
    );
    res.json({ success: true, message: "Availability changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// List doctors (without password and email)
const doctorList = async (_req, res) => {
  try {
    const doctors = await doctorModel
      .find({})
      .select("-password -email")
      .maxTimeMS(10000);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email }).maxTimeMS(10000);
    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get appointments for doctor
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel
      .find({ docId })
      .maxTimeMS(10000);
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Mark appointment as completed
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId, docId } = req.body;
    const appointmentData = await appointmentModel
      .findById(appointmentId)
      .maxTimeMS(10000);
    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(
        appointmentId,
        {
          isCompleted: true,
        },
        { maxTimeMS: 10000 }
      );
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Cancel appointment
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId, docId } = req.body;
    const appointmentData = await appointmentModel
      .findById(appointmentId)
      .maxTimeMS(10000);
    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(
        appointmentId,
        {
          cancelled: true,
        },
        { maxTimeMS: 10000 }
      );
      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Cancellation Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Doctor dashboard data
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel
      .find({ docId })
      .maxTimeMS(10000);

    let earnings = 0;
    let patients = [];

    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount || 0;
      }
      if (!patients.includes(item.userId.toString())) {
        patients.push(item.userId.toString());
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.slice(-5).reverse(),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get doctor profile
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel
      .findById(docId)
      .select("-password")
      .maxTimeMS(10000);
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;
    await doctorModel.findByIdAndUpdate(
      docId,
      { fees, address, available },
      { maxTimeMS: 10000 }
    );
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
