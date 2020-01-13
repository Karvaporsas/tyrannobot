/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const database = require('./../database');
const helper = require('./../helper');
const AUTHOR_CLASS = process.env.AUTHOR_CLASS || 'dictator';

function _getRandomQuote(authorKeys) {
    const idx = Math.floor(Math.random() * authorKeys.length);
    return authorKeys[idx];
}

module.exports = {
    getQuote(args, resolve, reject) {
        database.getQuoteKeysByClass(AUTHOR_CLASS).then((authorKeys) => {
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