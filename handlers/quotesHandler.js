/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const database = require('./../database');
const helper = require('./../helper');
const utils = require('./../utils');
const AUTHOR_CLASS = process.env.AUTHOR_CLASS || '';
const AUTHOR_MAP = process.env.AUTHOR_MAP || '';
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'ON';
const DEBUG_MODE = process.env.DEBUG_MODE === 'ON';
const localQuotes = require('./../resources/quotes.json');
const SUPRESSED_USERS = process.env.SUPRESSED_USERS;
const _supressionTreshold = 0.1;
const ASK_FEEDBACK = process.env.ASK_FEEDBACK === 'ON';
const VETTING_MODE = process.env.VETTING_MODE === 'ON';
const VETTING_GROUPS = process.env.VETTING_GROUPS || '';

function _getRandomQuote(authorKeys) {
    const idx = Math.floor(Math.random() * authorKeys.length);
    return authorKeys[idx];
}

module.exports = {
    getQuote(args, mode, chatId, userId, resolve, reject) {
        if (DEBUG_MODE) {
            console.log('Fetching quote. USE_LOCAL_STORAGE is ' + USE_LOCAL_STORAGE);
        }
        if (VETTING_MODE && mode == utils.modes.vet && VETTING_GROUPS.length) {
            var allowedGroups = VETTING_GROUPS.split(',');
            if (allowedGroups.length) {
                var isAllowed = false;
                for (const group of allowedGroups) {
                    if (parseInt(group) === chatId) isAllowed = true;
                }

                if (!isAllowed) {
                    resolve({status: 0, message: `Chat ${chatId} has no access`});
                    return;
                }
            }
        }

        if (SUPRESSED_USERS) {
            var supressedUsers = SUPRESSED_USERS.split(',');
            var supress = false;
            for (const userString of supressedUsers) {
                if (parseInt(userString) === userId) supress = true;
            }

            if (supress && Math.random() > _supressionTreshold) {
                resolve({status: 0, message: 'Message supressed'});
                return;
            }
        }
        if (USE_LOCAL_STORAGE) {
            var quote = _getRandomQuote(localQuotes.quotes);
            console.log(quote);
            resolve({status: 1, type: 'text', message: helper.formatMessage('', quote.quote, quote.author)});
        } else {
            var promises = [];

            if (AUTHOR_CLASS) {
                promises.push(database.getQuoteKeysByClass(AUTHOR_CLASS, mode));
            } else if (AUTHOR_MAP) {
                promises.push(database.getQuoteKeysByMap(AUTHOR_MAP, mode));
            } else {
                reject('No author identification method given');
            }

            Promise.all(promises).then((resultArray) => {
                var quoteInfo = _getRandomQuote(resultArray[0]);
                database.getQuote(quoteInfo.id, quoteInfo.author).then((quote) => {
                    var response = {status: 1, type: 'text', message: helper.formatMessage('', quote.quote, quote.author)};

                    if (ASK_FEEDBACK) {
                        response.keyboard = helper.getFeedBackKeyboard(mode, quoteInfo.id);
                    }

                    resolve(response);
                }).catch((e) => {
                    reject(e);
                });
            }).catch((e) => {
                reject(e);
            });
        }
    },
    handleQuoteFeedBack(callbackId, mode, chatId, data, resolve, reject) {
        if (VETTING_MODE && mode == utils.modes.vet) {
            var allowedGroups = VETTING_GROUPS.split(',');
            if (allowedGroups.length) {
                if(!chatId && chatId !== 0) {
                    resolve({status: 0, message: `Chat ${chatId} cannot have access`});
                    return;
                }

                var isAllowed = false;
                for (const group of allowedGroups) {
                    if (parseInt(group) === chatId) isAllowed = true;
                }

                if (!isAllowed) {
                    resolve({status: 0, message: `Chat ${chatId} has no access`});
                    return;
                }
            }
        }
        database.getQuoteById(data[0]).then((quote) => {
            var likes = quote.likes || 0;
            var dislikes = quote.dislikes || 0;
            var reviewResult = 0;
            const reaction = data[1];

            if (reaction === 'up') {
                likes++;
                reviewResult++;
            } else if (reaction === 'down') {
                dislikes++;
                reviewResult--;
            }
            quote.likes = likes;
            quote.dislikes = dislikes;
            quote.reviewed = reviewResult;

            database.updateQuoteReactions(quote, mode).then(() => {
                resolve({status: 1, callbackId: callbackId, type: 'callback', message: 'Thanks for the feedback!'});
            }).catch((e) => {
                reject(e);
            });
        }).catch((e) => {
            reject(e);
        });
    }
};