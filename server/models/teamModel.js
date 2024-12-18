const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    participants: { type: [String] },
    admins: { type: [String] },
    categories: { type: [String] },
  },
  { default: [] }
);

module.exports = mongoose.model("Team", teamSchema);
