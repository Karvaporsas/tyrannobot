/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const database = require('./../database');
const helper = require('./../helper');
const AUTHOR_CLASS = process.env.AUTHOR_CLASS || '';
const AUTHOR_MAP = process.env.AUTHOR_MAP || '';
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'ON';
const DEBUG_MODE = process.env.DEBUG_MODE === 'ON';
const localQuotes = require('./../resources/quotes.json');
const SUPRESSED_USERS = process.env.SUPRESSED_USERS;
const _supressionTreshold = 0.1;

function _getRandomQuote(authorKeys) {
    const idx = Math.floor(Math.random() * authorKeys.length);
    return authorKeys[idx];
}

module.exports = {
    getQuote(args, userId, resolve, reject) {
        if (DEBUG_MODE) {
            console.log('Fetching quote. USE_LOCAL_STORAGE is ' + USE_LOCAL_STORAGE);
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
                promises.push(database.getQuoteKeysByClass(AUTHOR_CLASS));
            } else if (AUTHOR_MAP) {
                promises.push(database.getQuoteKeysByMap(AUTHOR_MAP));
            } else {
                reject('No author identification method given');
            }

            Promise.all(promises).then((resultArray) => {
                var quoteInfo = _getRandomQuote(resultArray[0]);
                database.getQuote(quoteInfo.id, quoteInfo.author).then((quote) => {
                    resolve({status: 1, type: 'text', message: helper.formatMessage('', quote.quote, quote.author)});
                }).catch((e) => {
                    reject(e);
                });
            }).catch((e) => {
                reject(e);
            });
        }
    }
};