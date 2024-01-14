export default class Automate {
  executeType = {
    "if": async (workflow, block) => {
      if ("condition" in block.entries && block.entries.condition === true) {
        await this.executeNextBlock(workflow, block, "success")
      } else {
        await this.executeNextBlock(workflow, block, "failure")
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "for": async (workflow, block) => {
      if (typeof block.entries.count === "number") {
        for (let i = 0; i < parseInt(block.entries.count); i++) {
          block.action = i
          await this.executeNextBlock(workflow, block, "action")
          this.resetNextBlock(workflow, block, "action")
        }
      } else {
        this.addLog("warning", "'count' is not a number")
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "forEach": async (workflow, block) => {
      if (Array.isArray(block.entries.argument)) {
        for (const value of block.entries.argument) {
          block.action = value
          await this.executeNextBlock(workflow, block, "action")
          this.resetNextBlock(workflow, block, "action")
        }
      } else {
        this.addLog("warning", "'argument' is not an array")
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "on": async (workflow, block) => {
      if ("condition" in block.entries) {
        let condition = block.entries.condition;
        console.log(condition)
        if ("day" in condition) {
          let now = new Date();
          if (condition.day === "All") {
            if (now.getHours() === condition.hours && now.getMinutes() === condition.minutes) {
              await this.executeNextBlock(workflow, block, "success")
            }
          } else {
            let day = now.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
            if (day === condition.day.toLowerCase()) {
              if (now.getHours() === condition.hours && now.getMinutes() === condition.minutes) {
                await this.executeNextBlock(workflow, block, "success")
              }
            }
          }
        }
        if ("timestamp" in condition) {
          let now = Date.now();

          if (condition.timestamp <= now)
            await this.executeNextBlock(workflow, block, "success")
        }
      } else {
        await this.executeNextBlock(workflow, block, "failure")
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "NumberToBool": async (workflow, block) => {
      if (typeof block.entries.entry === "number")
        block.exit = !!(block.entries.entry)
      else
        this.addLog("warning", "Bad type in NumberToBool")
      await this.executeNextBlock(workflow, block, "exit")
    },
    "NumberToString": async (workflow, block) => {
      if (typeof block.entries.entry === "number")
        block.exit = block.entries.entry.toString()
      else
        this.addLog("warning", "Bad type in NumberToBool")
      await this.executeNextBlock(workflow, block, "exit")
    },
    "StringToNumber": async (workflow, block) => {
      if (typeof block.entries.entry === "string") {
        let value = parseInt(block.entries.entry)
        if (!Number.isNaN(value))
          block.exit = value;
        else
          this.addLog("warning", "The string cannot be converted in StringToNumber")
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "ObjectToString": async (workflow, block) => {
      try {
        block.exit = JSON.stringify(block.entries.entry)
      } catch (e) {
        this.addLog("warning", "Bad type in ObjectToString")
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "StringToObject": async (workflow, block) => {
      try {
        block.exit = JSON.parse(block.entries.entry)
      } catch (e) {
        this.addLog("warning", "Bad type in StringToObject")
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "start": async (workflow, block) => {
      await this.executeNextBlock(workflow, block, "exit")
    },
    "end": async (workflow, block) => {
      block.exit = block.entries.entry
    },
    "environment": async (workflow, block) => {
      if (typeof block.entries.entry === "string") {
        this.variables[block.data.value] = block.entries.entry;
        this.isEdited = true;
        block.exit = this.variables[block.data.value];
      } else if (block.data.value in this.variables) {
        block.exit = this.variables[block.data.value];
      } else {
        this.addLog("warning", "The ENV variable " + block.data.value + " doesn't exist")
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "variableString": async (workflow, block) => {
      block.exit = block.data.value;
    },
    "variableBoolean": async (workflow, block) => {
      block.exit = block.data.value === "YES";
    },
    "variableNumber": async (workflow, block) => {
      let value = parseInt(block.data.value);
      if (!Number.isNaN(value))
        block.exit = value;
      else
        this.addLog("warning", "The string cannot be converted in variableNumber")
    },
    "variableArray": async (workflow, block) => {
      try {
        block.exit = JSON.parse(block.data.value);
      } catch (e) {
        this.addLog("warning", "The string cannot be converted into an array in variableArray")
      }
    },
    "variableObject": async (workflow, block) => {
      try {
        block.exit = JSON.parse(block.data.value);
      } catch (e) {
        this.addLog("warning", "The string cannot be converted into an object in variableObject")
      }
    },
    "variableRecurrence": async (workflow, block) => {
      try {
        block.exit = block.data.value;
      } catch (e) {
        this.addLog("warning", "The string cannot be converted in variableRecurrence")
      }
    },
    "variableDate": async (workflow, block) => {
      try {
        block.exit = block.data.value;
      } catch (e) {
        this.addLog("warning", "The string cannot be converted in Date")
      }
    },
    "!=": async (workflow, block) => {
      try {
        block.exit = block.entries.first !== block.entries.second;
      } catch (e) {
        this.addLog("warning", "The string cannot be compared in !=")
      }
    },
    "<": async (workflow, block) => {
      try {
        block.exit = block.entries.first < block.entries.second;
      } catch (e) {
        this.addLog("warning", "The string cannot be compared in <")
      }
    },
    "<=": async (workflow, block) => {
      try {
        block.exit = block.entries.first <= block.entries.second;
      } catch (e) {
        this.addLog("warning", "The string cannot be compared in <=")
      }
    },
    ">=": async (workflow, block) => {
      try {
        block.exit = block.entries.first >= block.entries.second;
      } catch (e) {
        this.addLog("warning", "The string cannot be compared in >=")
      }
    },
    "==": async (workflow, block) => {
      try {
        block.exit = block.entries.first === block.entries.second;
      } catch (e) {
        this.addLog("warning", "The string cannot be compared in ==")
      }
    },
    ">": async (workflow, block) => {
      try {
        block.exit = block.entries.first > block.entries.second;
      } catch (e) {
        this.addLog("warning", "The string cannot be compared in >")
      }
    },
    "request": async (workflow, block) => {
      try {
        let access_token = this.tokens[block.entries.service] || "";
        let body = (block.entries.body !== null) ? block.entries.body : null;
        let init = {
          method: block.data.value,
          headers: {
            "Authorization": "Bearer " + access_token
          }
        }
        if (body !== null) {
          if (typeof body === "object")
            body = JSON.stringify(body)
          init["body"] = body;
          init["headers"]["Content-Type"] = "application/json";
        }
        let response = await fetch(block.entries.url, init)
        try {
          block.exit = await response.json();
          console.log(block.exit)
        } catch (e) {}
        console.log(response.status)
        block.status = response.status;
      } catch (e) {
        console.log(e)
        this.addLog("danger", "Error with request -> " + e)
      }
      await this.executeNextBlock(workflow, block, "exit")
    },
    "argument": async () => {},
    "stringBuilder": async (workflow, block) => {
      try {
        const extractVariables = (text) => {
          const regex = /%([^%]+)%/g;
          const correspondences = [];
          let correspondence;

          while ((correspondence = regex.exec(text)) !== null) {
            correspondences.push(correspondence[1]);
          }
          return correspondences
        }

        let variables = extractVariables(block.data.value)
        let exit = block.data.value;

        for (const [i, variable] of variables.entries()) {
          let value = (typeof block.entries["argument_" + (i + 1)] !== "string") ? "" : block.entries["argument_" + (i + 1)];
          if (exit.includes("http"))
            value = encodeURIComponent(value)
          exit = exit.replace(`%${variable}%`, value)
        }
        block.exit = exit;
      } catch (e) {
        console.log(e)
        this.logs("danger", "Error with stringBuilder -> " + e)
      }
    },
    "at": async (workflow, block) => {
      try {
        let value = (Array.isArray(block.entries.element)) ? parseInt(block.entries.key) : block.entries.key
        if (Number.isNaN(value)) throw "Invalid number"
        block.exit = block.entries.element[value]
        await this.executeNextBlock(workflow, block, "exit")
      } catch (e) {
        this.addLog("danger", "Error with at -> " + e)
      }
    }
  }

  constructor(body, userId) {
    this.tokens = body.tokens;
    this.mainWorkflow = body.workflow;
    this.variables = body.variables;
    this.logs = [];
    this.userId = userId;
    this.isEdited = false;
  }

  async executeEvent(workflow, block) {
    // mettre tout les entries dans les nodes argument qui correspond en fonction de son nom (argument_1, argument_2) dans la valeur "exit"
    let workflowEvent;

    try {
      let response = await fetch(process.env.URL_API + "/worker/events/" + block.data.eventID + "/workflow", {
        headers: {
          "authorization": process.env.WORKER_API
        }
      })
      if (!response.ok) return;
      workflowEvent = await response.json();
    } catch (e) {
      this.logs("danger", "Error with at -> " + e)
      await this.executeNextBlock(workflow, block, "exit")
      return;
    }

    for (let i = 1; block.entries["argument_" + i] !== undefined; i++) {
      let argumentBlock = this.getBlockByType(workflowEvent, "argument", i.toString());

      if (argumentBlock === null) continue;
      argumentBlock.exit = block.entries["argument_" + i]
      argumentBlock.executed = true;
    }

    // executer le workflow en mettant bien l'object tokens à l'intérieur
    let startBlock = this.getBlockByType(workflowEvent, "start")

    if (startBlock === null) return;
    await this.executeBlock(workflowEvent, startBlock)
    // prendre chaque valeur de sorti et mettre à jour le node
    let endBlock = this.getBlockByType(workflowEvent, "end")
    if (endBlock !== null)
      block.exit = endBlock.entries["entry"]
    await this.executeNextBlock(workflow, block, "exit")
  }

  getBlockById(workflow, id) {
    for (const block of workflow.nodes) {
      if (block.id === id)
        return block;
    }
    return null;
  }

  getBlockByType(workflow, type, value = null) {
    for (const block of workflow.nodes) {
      if (block.data.label === type) {
        if (value !== null) {
          if ("value" in block.data && block.data.value === value)
            return block;
        } else
          return block;
      }
    }
    return null;
  }

  async executeBlock(workflow, block) {
    let entries = {};

    if ("executed" in block && block.executed) return;
    block.executed = true;
    console.log("executing block - " + block.data.label)
    for (const edge of workflow.edges) {
      if (edge.target !== block.id) continue;
      let [idSource, idTarget] = edge.link.split("#")
      let otherBlock = this.getBlockById(workflow, edge.source);
      await this.executeBlock(workflow, otherBlock)
      entries[idTarget] = (otherBlock[idSource] === undefined) ? null : otherBlock[idSource]
    }
    block.entries = entries;
    block.executed = true;
    if (block.data.label in this.executeType)
      await this.executeType[block.data.label](workflow, block)
    else
      await this.executeEvent(workflow, block)
  }

  async executeNextBlock(workflow, block, edgeId) {
    for (const edge of workflow.edges) {
      if (edge.source !== block.id) continue;
      let [idSource] = edge.link.split("#")
      if (idSource !== edgeId) continue;
      let nextBlock = this.getBlockById(workflow, edge.target)
      await this.executeBlock(workflow, nextBlock)
    }
  }

  resetNextBlock(workflow, block, edgeId = null) {
    for (const edge of workflow.edges) {
      if (edge.source !== block.id) continue;
      let [idSource] = edge.link.split("#")
      if (edgeId !== null && idSource !== edgeId) continue;
      let nextBlock = this.getBlockById(workflow, edge.target)
      if (nextBlock.executed === true)
        nextBlock.executed = false;
      this.resetNextBlock(workflow, nextBlock)
    }
  }

  async start() {
    try {
      let startBlock = this.getBlockByType(this.mainWorkflow, "start")

      if (startBlock === null) return;

      await this.executeBlock(this.mainWorkflow, startBlock)
    } catch (e) {
      console.log(e)
      this.addLog("error", "error when starting process")
    }
  }

  getLogs() {
    return this.logs;
  }

  getVariables() {
    return this.variables;
  }

  getIsEdited() {
    return this.isEdited
  }

  addLog(status, message) {
    this.logs.push({status, message, "userId": this.userId})
  }
}