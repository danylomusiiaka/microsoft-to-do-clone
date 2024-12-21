import { Schema, model } from "mongoose";

const teamSchema = new Schema(
  {
    code: { type: String, required: true },
    participants: { type: [String] },
    admins: { type: [String] },
    categories: { type: [String] },
  },
  { default: [] }
);

export default model("Team", teamSchema);
