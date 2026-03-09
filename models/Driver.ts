import mongoose from "mongoose"

const DriverSchema = new mongoose.Schema({
  user_id: String,

  name: String,
  phone: String,
  truck_type: String,
  notes: String
})

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema)