import { Schema, model } from "mongoose";
import { compare } from "bcrypt";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    picture: { type: String },
    team: { type: String },
    categories: { type: [String] },
  },
  { default: [] }
);

userSchema.methods.comparePassword = function (password) {
  return compare(password, this.password);
};

export default model("User", userSchema);
