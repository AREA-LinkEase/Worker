import * as dotenv from "dotenv"
import Automate from "./Automate.js";

dotenv.config();

let url = process.env.URL_API

setInterval(async () => {
  console.log("search new Automate")
  try {
    let response = await fetch(url + "/worker/@next", {
      headers: {
        "authorization": process.env.WORKER_API
      }
    })
    if (!response.ok) {
      console.log("Error request, code : " + response.status)
      return;
    }
    console.log("start executing an Automate ...")
    let json = await response.json();

    console.log("Automate name : " + json.automate.title)
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
  } catch (e) {
    console.log(e)
  }
}, 1000)