/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const database = require('./../database');
const helper = require('./../helper');
const TYRANT_NAMES = process.env.TYRANTS || 'Josef Stalin';

function _getRandomQuote(authorKeys) {
    const idx = Math.floor(Math.random() * authorKeys.length);
    return authorKeys[idx];
}

module.exports = {
    getQuote(args, resolve, reject) {
        var authors = TYRANT_NAMES.split(',');
        database.getQuoteKeys(authors).then((authorKeys) => {
            var quoteInfo = _getRandomQuote(authorKeys);
            database.getQuote(quoteInfo.id, quoteInfo.author).then((quote) => {
                resolve({status: 1, type: 'text', message: helper.formatMessage('', quote.quote, quote.author)});
            }).catch((e) => {
                reject(e);
            });
        }).catch((e) => {
            reject(e);
        });
    }
};