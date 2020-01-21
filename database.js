/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const AWS = require('aws-sdk');
const quoteFunctions = require('./loaders/quoteFunctions');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = {
    getQuoteKeysByClass(authorClass, mode) {
        return quoteFunctions.getQuoteKeysByClass(dynamoDb, authorClass, mode);
    },
    getQuoteKeysByMap(authorMap, mode) {
        return quoteFunctions.getQuoteKeysByMap(dynamoDb, authorMap, mode);
    },
    getQuote(id, author) {
        return quoteFunctions.getQuote(dynamoDb, id, author);
    },
    getQuoteById(id) {
        return quoteFunctions.getQuoteById(dynamoDb, id);
    },
    updateQuoteReactions(quote, mode) {
        return quoteFunctions.updateQuoteReactions(dynamoDb, quote, mode);
    }
};
