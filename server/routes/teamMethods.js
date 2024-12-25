import { Router } from "express";
const router = Router();
import { verifyToken, generateRandomString } from "../config/authMiddleware.js";
import userModel from "../models/userModel.js";
import teamModel from "../models/teamModel.js";
import taskModel from "../models/taskModel.js";

router.post("/create", verifyToken, async (req, res) => {
  const teamCode = generateRandomString(12);
  const user = await userModel.findById(req.userId).select("-password");
  const team = new teamModel({
    code: teamCode,
    participants: [user.email],
    admins: [user.email],
  });
  await team.save();
  if (!user["team"]) {
    user["team"] = teamCode;
    await user.save();
    res.json(teamCode);
  }
});

router.post("/exit", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    const team = await teamModel.findOne({ code: user.team });

    if (team) {
      team.participants = team.participants.filter((participant) => participant !== user.email);
      if (team.participants.length === 0) {
        await teamModel.findByIdAndDelete(team._id);
        await taskModel.deleteMany({ author: team.code });
      } else {
        await team.save();
      }
    }
    user["team"] = "";
    await user.save();
    res.json("");
  } catch (error) {
    res.status(500).send("Error exiting team");
  }
});

router.post("/join", verifyToken, async (req, res) => {
  const { teamCode } = req.body;

  try {
    const team = await teamModel.findOne({ code: teamCode });

    if (!team) {
      return res.status(404).send("Команда не знайдена");
    }

    const user = await userModel.findById(req.userId).select("-password");
    if (team.participants.includes(user.email)) {
      return res.status(400).send("Ви вже є учасником цієї команди");
    }

    team.participants.push(user.email);
    await team.save();

    user.team = teamCode;
    await user.save();

    res.status(200).send("Ви успішно приєдналися до команди");
  } catch (error) {
    res.status(500).send("Помилка приєднання до команди");
  }
});

router.put("/edit", verifyToken, async (req, res) => {
  const { fieldName, fieldValue, teamCode } = req.body;
  try {
    const team = await teamModel.findOne({ code: teamCode });
    team[fieldName] = fieldValue;
    await team.save();
    res.status(200).send("Поле команди успішно оновлено");
  } catch (error) {
    res.status(500).send("Помилка оновлення команди");
  }
});

router.get("/all-members", verifyToken, async (req, res) => {
  const { teamCode } = req.query;
  try {
    const team = await teamModel.findOne({ code: teamCode });
    const participants = await userModel
      .find({ email: { $in: team.participants } })
      .select("email name picture");
    res.status(200).json(participants);
  } catch (error) {
    res.status(500).send("Помилка відображення учасників команди");
  }
});

export default router;
