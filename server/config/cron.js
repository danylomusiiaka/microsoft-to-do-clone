import { CronJob } from "cron";
import { get } from "https";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const backendUrl = process.env.SERVER_URL;

const job = new CronJob("*/13 * * * *", function () {
  get(backendUrl, (res) => {
    if (res.statusCode === 200) {
      console.log("Server restarted");
    } else {
      console.error(`Failed to restart server with status code: ${res.statusCode}`);
    }
  }).on("error", (err) => {
    console.error("Error during restart ", err.message);
  });
});

export default {
  job,
};
