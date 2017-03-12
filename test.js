'use strict';

let config = {
	redisConfig: {},
	serverName: 'Instance 1'
};


let SoloQueue = require('./soloQueue');
let myQueue = new SoloQueue(config);

myQueue
	.loadMessages()
	.then((messages) => {
		console.log(messages);
	})
	.catch(err => console.log(err));