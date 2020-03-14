const fs = require("fs");
const sdk = require("matrix-bot-sdk");
const MatrixClient = sdk.MatrixClient;
const SimpleFsStorageProvider = sdk.SimpleFsStorageProvider;

const trigger = "+";

class TestingBot {
	constructor(homeserverUrl, accessToken) {
		this.homeserverUrl = homeserverUrl;
		this.accessToken = accessToken;
		this.AutojoinRoomsMixin = sdk.AutojoinRoomsMixin;
		this.storage = new SimpleFsStorageProvider("bot.json");
		this.client = new MatrixClient(homeserverUrl, accessToken, this.storage);
	}

	init() {
		const client = this.client;
		client.start().then(() => console.log("Client started!"));	
		client.on("room.message", (roomId, event) => {
			this.messageHandler(roomId, event);
		});
	}

	messageHandler(roomId, event) {
			const client = this.client;
    		if (! event["content"]){
				return;
			}
    		const sender = event.sender;
    		const body = event.content.body;
    		console.log(`${roomId}: ${sender} says '${body}`);
    		if (body.startsWith("!echo")) {
        		const replyText = body.substring("!echo".length).trim();
        		client.sendMessage(roomId, {
            		"msgtype": "m.notice",
            		"body": replyText,
        		});
			} else if (body.startsWith(trigger)) {
				client.sendMessage(roomId, {
					"msgtype": "m.notice",
					"body": "Oh look, a trigger!"
				});
			}
	}
}


function read() {
	fs.readFile('./config.json', 'utf8', (err, jsonString) => {
    	if (err) {
        	console.log("File read failed:", err)
        	process.exit(0);
    	}
		try {
			const config = JSON.parse(jsonString);
			setup(config);
		}
		catch(err){
			console.log("Error parsing JSON data: ", err);
		} 
	})
}

function setup(config) {
	const homeserverUrl = config.homeserverUrl;
	const accessToken = config.accessToken;
	const bot = new TestingBot(homeserverUrl, accessToken);
	bot.init();
}

read();
