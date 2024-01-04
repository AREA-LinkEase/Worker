import * as dotenv from "dotenv"
import Automate from "./Automate.js";

dotenv.config();

let url = process.env.URL_API

setTimeout(async () => {
  let response = await fetch(url + "/worker/@next", {
    headers: {
      "authorization": process.env.WORKER_API
    }
  })
  if (!response.ok) return;
  let json = await response.json();

  for (const user of json.users) {
    let automate = new Automate({
      "workflow": json.automate.workflow,
      "tokens": user.tokens
    }, user.id)

    await automate.start();

    let logs = automate.getLogs();

    if (logs.length > 0) {
      await fetch(url + "/worker/automate/" + json.automate.id + "/logs", {
        headers: {
          "authorization": process.env.WORKER_API
        },
        method: "PUT",
        body: {
          logs
        }
      })
    }
  }
}, 1000)