'use strict';


let redis = require('redis');
let Promise = require("bluebird");
let co = require('co');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);


let SoloQueue = function(config) {
        let _this = this;

        // Create local redis connection to store uncompleted messages
        this.redisClientConfig = config.redisConfig;
        this.redisClient = redis.createClient(this.redisClientConfig);

        this.redisLocalPrefix = config.serverName;
        this.soloQueueAdapter = config.adapter;


        /**
         * Methods
         */

        /**
         * Test connection to local redis
         * @return {Promise}
         */
        this.onConnected = () => {
                return new Promise((resolve, reject) => {
                        this.redisClient.on('connect', function() {
                                return resolve();
                        });

                        this.redisClient.on('error', function(err) {
                                return reject(err);
                        });
                });
        };


        /**
         * Load uncompleted messaages
         * @return {Promise}
         */
        this.loadUncompletedMessages = co.wrap(function*() {
                yield _this.onConnected();

                let cursor = 0;
                let unCompletedMessages = [];

                // Get all keys with prefix name
                let unCompletedKeys = yield _this.redisClient.keysAsync(_this.redisLocalPrefix + '-*');

                // Get key's value, return array of promise
                let unCompletedMessagesPromise = unCompletedKeys.map((key) => {
                	return new Promise((resolve, reject) => {
                		return _this.redisClient
                			.getAsync(key)
                			.then((message) => {
                				return resolve({[key]: message});
                			})
                			.catch(reject);
                	});
                });

                unCompletedMessages = yield Promise.all(unCompletedMessagesPromise);
                return unCompletedMessages;
        });


        this.setCompleteMessage = co.wrap(function* (messageId) {
        	yield _this.redisClient.delAsync(messageId);
        	return null;
        });


        this.push = co.wrap(function* () {

        });

        this.pull = co.wrap(function* () {

        });

};


module.exports = SoloQueue;
