import mongoose from "mongoose"

const AfterHoursSchema = new mongoose.Schema({
  user_id: String,
  driver_id: String,

  shift_value: Number,

  date: Date,
  notes: String
})

export default mongoose.models.AfterHours || mongoose.model("AfterHours", AfterHoursSchema)