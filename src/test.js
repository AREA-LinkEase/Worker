import * as dotenv from "dotenv"
import Automate from "./Automate.js";

dotenv.config();

(async () => {
  console.log("search new Automate")
  try {
    let response = await fetch(process.env.URL_API + "/worker/@next", {
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
    console.log(json.automate.workflow)

    if (!json.workspace.is_enabled) {
      console.log("Workspace disabled")
      return;
    }
    if (!json.automate.is_enabled) {
      console.log("Automate disabled")
      return;
    }
    for (const user of json.users) {
      console.log(user)
      let automate = new Automate({
        "workflow": json.automate.workflow,
        "variables": json.workspace.variables,
        "tokens": user.tokens
      }, user.id)

      await automate.start();
      console.log(automate.getLogs())
    }
  } catch (e) {
    console.log(e)
  }
})()