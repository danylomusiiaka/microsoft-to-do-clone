import { Schema, model } from "mongoose";
import { TWO_DAYS } from "../config/constants.js";

const authAttemptsSchema = new Schema({
  userIp: { type: String, required: true },
  email: { type: String, required: true },
  loginCount: { type: Number },
  registerCount: { type: Number },
  teamJoinCount: { type: Number },
  waitUntilNextRegister: { type: Date },
  waitUntilNextLogin: { type: Date },
  waitUntilNextTeamJoin: { type: Date },
  clearTime: { type: Date, default: () => new Date(Date.now() + TWO_DAYS) },
});

export default model("auth_attempts", authAttemptsSchema);
