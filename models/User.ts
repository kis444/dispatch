import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,

  role: {
    type: String,
    default: "dispatcher"
  },

  commission_rate: { type: Number, default: 1.3 },
  cut_percentage: { type: Number, default: 4 },
  tax_percentage: { type: Number, default: 7 },

  monthly_goal: Number,

  default_after_hours_value: {
    type: Number,
    default: 100
  }
})

export default mongoose.models.User || mongoose.model("User", UserSchema)