import { Schema, model } from "mongoose";

const teamSchema = new Schema(
  {
    code: { type: String, required: true },
    participants: { type: [String] },
    admins: { type: [String] },
    categories: { type: [String] },
    statuses: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
        _id: false,
      },
    ],
  },
  { default: [] }
);

export default model("Team", teamSchema);
