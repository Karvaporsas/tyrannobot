/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const commands = require('./commands');
const helper = require('./helper');
const telegramMessageSender = require('./telegramMessageSender');
const DEBUG_MODE = process.env.DEBUG_MODE === 'ON';

/**
 * Basic AWS Lambda handler. This is called when Telegram sends any messages to AWS API
 * @param event Message from Telegram
 * @param context Lambda context
 * @returns HTML status response with statusCode 200
 */
exports.handler = (event, context) => {
    console.log('starting to process message');

    const chatId = helper.getEventChatId(event);
    const standardResponse = {
        statusCode: 200,
    };

    if (DEBUG_MODE) {
        console.log(event.body);
    }

    commands.processCommand(event, chatId).then((result) => {
        console.log("Command handled properly");
        if (DEBUG_MODE) {
            console.log(result);
        }

        if(result.status === 1) {
            telegramMessageSender.sendMessageToTelegram(chatId, result).then(() => {
                context.succeed('Message sent');
            }).catch((e) => {
                console.error("Failed to send message");
                console.log(e);
                context.fail(e);
            });
        } else {
            //Not error, but not a success
            context.succeed('No need to send message');
        }
    }).catch((e) => {
        console.log("Error handling command");
        console.log(e);
        context.fail(e);
    });

    return standardResponse;
};