/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const helper = require('./helper');
const quotesHandler = require('./handlers/quotesHandler');
const utils = require('./utils');

/**
 * Commands
 */
module.exports = {
    /**
     * Creates error message
     * @param {Object} error To send
     * @returns Promise
     */
    error(error) {
        return new Promise((resolve, reject) => {
            if (error) {
                reject(error);
            }
            else {
                resolve({status: 1, message: "Mitä täällä tapahtuu?", type: "text"});
            }
        });
    },
    /**
     * Handles processing any command
     *
     * @param {Object} event Message from Telegram
     * @param {int} chatId Id of chat where it came from
     *
     * @returns Promise
     */
    processCommand(event, chatId) {
        return new Promise((resolve, reject) => {
            if (helper.isCallback(event)) {
                var data = helper.parseCallbackData(helper.getCallbackData(event));
                const callbackId = helper.getCallbackId(event);
                var first = data.shift();
                const callbackChatId = helper.getCallbackChatId(event);

                switch (first) {
                    case utils.modes.vet:
                    case utils.modes.speak:
                        quotesHandler.handleQuoteFeedBack(callbackId, first, callbackChatId, data, resolve, reject);
                        break;
                    default:
                        resolve({status: 0, message: `No such handler: ${first}`});
                        break;
                }

                return;
            }
            if (!chatId) {
                console.error("No chat id!");
                reject();
            } else {
                const messageText = helper.getEventMessageText(event);
                const command = helper.parseCommand(messageText);
                const userId = helper.getEventUserId(event);

                switch (command.name) {
                    case 'vet':
                    case 'speak':
                        quotesHandler.getQuote(command.args, utils.modes[command.name], chatId, userId, resolve, reject);
                        break;
                    default:
                        resolve({status: 0, message: 'Not a command'});
                        break;
                }
            }
        });
    }
};
