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
        "type": "isListening",
        "eventID": 1
      },
      {
        "id": "4",
        "type": "addToQueue",
        "eventID": 2
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