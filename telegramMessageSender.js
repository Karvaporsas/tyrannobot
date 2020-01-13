/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const DEBUG_MODE = process.env.DEBUG_MODE === 'ON';
const rp = require('request-promise');

module.exports = {
    sendMessageToTelegram(chatId, messageObject) {
        var method = '';
        var form = {
            chat_id: chatId
        };
        console.log("Constructing message");
        if (DEBUG_MODE) {
            console.log(messageObject);
        }

        switch (messageObject.type) {
            case 'text':
                method = 'sendMessage';
                form.text = messageObject.message;
                form.parse_mode = 'HTML';
                break;
            case 'photo':
                method = 'sendPhoto';
                form.photo = messageObject.photo;
                form.caption = messageObject.caption;
                break;
            default:
                console.error(`Tried to send message with unknown type ${messageObject.type}`);
                return;
        }
        var url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
        var message = {
            method: 'POST',
            uri: `${url}/${method}`,
            form: form
        };
        console.log("Sending message");
        if (DEBUG_MODE) {
            console.log(message);
        }

        return new Promise((resolve, reject) =>{
            rp(message).then((response) => {
                if (DEBUG_MODE) {
                    console.log("Response from telegram:");
                    console.log(response);
                }

                resolve(response);
            }).catch((e) => {
                console.log('Error sending message');
                console.log(e);
                reject();
            });
        });
    }
};