import pkg from "jsonwebtoken";
import userModel from "../models/userModel.js";
const { sign, verify } = pkg;

const generateAccess = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateTokens = async (id) => {
  const accessToken = sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  await userModel.findByIdAndUpdate(id, { refreshToken });
  return accessToken;
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Токен сесії відсутній");
  }

  verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).send("Термін дії токена закінчився. Будь ласка, залогуйтесь знову");
      }
      return res.status(401).send("Ви не є авторизованим");
    }

    req.userId = decoded.id;
    next();
  });
};

function generateRandomString(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

export { verifyToken, generateAccess, generateTokens, generateRandomString };
