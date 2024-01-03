let body_example = {
  "workflow": {
    "nodes": [
      {
        "id": "1",
        "type": "start"
      },
      {
        "id": "2",
        "type": "if"
      },
      {
        "id": "3",
        "type": "isListening"
      },
      {
        "id": "4",
        "type": "addToQueue"
      },
      {
        "id": "5",
        "type": "variableString",
        "value": "spotify:track:4iV5W9uYEdYUVa79Axb7Rh"
      }
    ],
    "edges": [
      {
        "id": "exit#entry",
        "source": "1",
        "target": "2"
      },
      {
        "id": "exit#condition",
        "source": "3",
        "target": "2"
      },
      {
        "id": "success#entry",
        "source": "2",
        "target": "4"
      },
      {
        "id": "exit#argument_1",
        "source": "5",
        "target": "4"
      }
    ]
  },
  "events": {
    "isListening": {
      "nodes": [
        {
          "id": "5",
          "type": "start"
        },
        {
          "id": "1",
          "type": "request",
          "value": "GET",
          "service": "spotify"
        },
        {
          "id": "2",
          "type": "at",
          "value": "is_playing"
        },
        {
          "id": "3",
          "type": "end",
          "value": "exit"
        },
        {
          "id": "4",
          "type": "variableString",
          "value": "https://api.spotify.com/v1/me/player/currently-playing"
        }
      ],
      "edges": [
        {
          "id": "exit#entry",
          "source": "5",
          "target": "1"
        },
        {
          "id": "exit#url",
          "source": "4",
          "target": "1"
        },
        {
          "id": "exit#entry",
          "source": "1",
          "target": "2"
        },
        {
          "id": "exit#entry",
          "source": "2",
          "target": "3"
        }
      ]
    },
    "addToQueue": {
      "nodes": [
        {
          "id": "1",
          "type": "start"
        },
        {
          "id": "2",
          "type": "request",
          "value": "POST",
          "service": "spotify"
        },
        {
          "id": "3",
          "type": "stringBuilder",
          "value": `https://api.spotify.com/v1/me/player/queue?uri=%option%`
        },
        {
          "id": "4",
          "type": "argument",
          "value": "1"
        },
        {
          "id": "5",
          "type": "end"
        }
      ],
      "edges": [
        {
          "id": "exit#entry",
          "source": "1",
          "target": "2"
        },
        {
          "id": "exit#url",
          "source": "3",
          "target": "2"
        },
        {
          "id": "exit#option",
          "source": "4",
          "target": "3"
        },
        {
          "id": "exit#entry",
          "source": "2",
          "target": "5"
        }
      ]
    }
  },
  "tokens": {
    "spotify": "access_token",
    "discord": "access_token"
  }
}

export class Automate {
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
        if (condition.type === "recurrence") {
          let now = new Date();
          if (condition.day === "all") {
            if (now.getHours() === condition.hours && now.getMinutes() === condition.minutes) {
              await this.executeNextBlock(workflow, block, "success")
            }
          } else {
            let day = now.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
            if (day === condition.day) {
              if (now.getHours() === condition.hours && now.getMinutes() === condition.minutes) {
                await this.executeNextBlock(workflow, block, "success")
              }
            }
          }
        }
        if (condition.type === "date") {
          let now = Date.now();

          if (condition.timestamp <= now)
            await this.executeNextBlock(workflow, block, "success")
        }
        await this.executeNextBlock(workflow, block, "success")
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
    "start": async (workflow, block) => {
      await this.executeNextBlock(workflow, block, "exit")
    },
    "end": async (workflow, block) => {
      block.exit = block.entries.entry
    },
    "variableString": async (workflow, block) => {
      block.exit = block.value;
    },
    "variableBoolean": async (workflow, block) => {
      block.exit = block.value === "true";
    },
    "variableNumber": async (workflow, block) => {
      let value = parseInt(block.value);
      if (Number.isNaN(value))
        block.exit = value;
      else
        this.addLog("warning", "The string cannot be converted in variableNumber")
    },
    "variableArray": async (workflow, block) => {
      try {
        block.exit = JSON.parse(block.value);
      } catch (e) {
        this.addLog("warning", "The string cannot be converted into an array in variableArray")
      }
    },
    "variableObject": async (workflow, block) => {
      try {
        block.exit = JSON.parse(block.value);
      } catch (e) {
        this.addLog("warning", "The string cannot be converted into an object in variableObject")
      }
    },
    "variableRecurrence": async (workflow, block) => {
      try {
        block.exit = JSON.parse(block.value);
      } catch (e) {
        this.addLog("warning", "The string cannot be converted in variableRecurrence")
      }
    },
    "variableDate": async (workflow, block) => {
      try {
        block.exit = JSON.parse(block.value);
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
        if (block.service in this.tokens) {
          let access_token = this.tokens[block.service];
          let body = (block.entries.body !== null) ? block.entries.body : null;
          let init = {
            method: block.value,
            headers: {
              "Authorization": "Bearer " + access_token
            }
          }
          if (body !== null) {
            if (typeof body === "object")
              init["body"] = body;
            else
              this.addLog("warning", "body cannot be used with this type, the body need to be an object or array")
          }
          let response = await fetch(block.entries.url, init)
          if (response.ok) {
            if (response.status !== 204)
              block.exit = await response.json();
          } else {
            this.logs("danger", "request " + block.entries.url + " return " + response.status)
          }
        } else {
          this.logs("warning", "You are not connected to " + block.service)
        }
      } catch (e) {
        console.log(e)
        this.logs("danger", "Error with request -> " + e)
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

        let variables = extractVariables(block.value)
        let exit = block.value;

        for (const variable of variables) {
          exit = exit.replace(`%${variable}%`, (typeof block.entries[variable] !== "string") ? "" : encodeURIComponent(block.entries[variable]))
        }
        block.exit = exit;
      } catch (e) {
        console.log(e)
        this.logs("danger", "Error with stringBuilder -> " + e)
      }
    },
    "at": async (workflow, block) => {
      try {
        let value = (Array.isArray(block.entries.entry)) ? parseInt(block.value) : block.value
        if (Number.isNaN(value)) throw "Invalid number"
        block.exit = block.entries.entry[block.value]
        await this.executeNextBlock(workflow, block, "exit")
      } catch (e) {
        this.logs("danger", "Error with at -> " + e)
      }
    }
  }

  constructor(body, userId) {
    this.events = body.events;
    this.tokens = body.tokens;
    this.mainWorkflow = body.workflow;
    this.logs = [];
    this.userId = userId;
  }

  async executeEvent(workflow, block) {
    // mettre tout les entries dans les nodes argument qui correspond en fonction de son nom (argument_1, argument_2) dans la valeur "exit"
    let workflowEvent = this.events[block.type];

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
    let toExecutePin = [];
    for (const node of workflowEvent.nodes)
      if (node.type === "end") {
        block[node.value] = node.exit;
        toExecutePin.push(node.value)
      }
    await this.executeNextBlock(workflow, block, "exit")
    for (const pin of toExecutePin)
      await this.executeNextBlock(workflow, block, pin)
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
      if (block.type === type) {
        if (value !== null) {
          if ("value" in block && block.value === value)
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
    console.log("executing block - " + block.type)
    for (const edge of workflow.edges) {
      if (edge.target !== block.id) continue;
      let [idSource, idTarget] = edge.id.split("#")
      let otherBlock = this.getBlockById(workflow, edge.source);
      await this.executeBlock(workflow, otherBlock)
      entries[idTarget] = (otherBlock[idSource] === undefined) ? null : otherBlock[idSource]
    }
    block.entries = entries;
    block.executed = true;
    if (block.type in this.executeType)
      await this.executeType[block.type](workflow, block)
    else
      await this.executeEvent(workflow, block)
  }

  async executeNextBlock(workflow, block, edgeId) {
    for (const edge of workflow.edges) {
      if (edge.source !== block.id) continue;
      let [idSource] = edge.id.split("#")
      if (idSource !== edgeId) continue;
      let nextBlock = this.getBlockById(workflow, edge.target)
      await this.executeBlock(workflow, nextBlock)
    }
  }

  resetNextBlock(workflow, block, edgeId = null) {
    for (const edge of workflow.edges) {
      if (edge.source !== block.id) continue;
      let [idSource] = edge.id.split("#")
      if (edgeId !== null && idSource !== edgeId) continue;
      let nextBlock = this.getBlockById(workflow, edge.target)
      if (nextBlock.executed === true)
        nextBlock.executed = false;
      this.resetNextBlock(workflow, nextBlock)
    }
  }

  async start() {
    let startBlock = this.getBlockByType(this.mainWorkflow, "start")

    if (startBlock === null) return;

    await this.executeBlock(this.mainWorkflow, startBlock)
  }

  getLogs() {
    return this.logs;
  }

  addLog(status, message) {
    this.logs.push({status, message, "userId": this.userId})
  }
}

let automate = new Automate(body_example);


(async () => {
  await automate.start();
})()
