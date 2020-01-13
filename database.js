/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const AWS = require('aws-sdk');
const quoteFunctions = require('./loaders/quoteFunctions');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = {
    getQuoteKeys(authors) {
        return quoteFunctions.getQuoteKeys(dynamoDb, authors);
    },
    getQuoteKeysByClass(authorClass) {
        return quoteFunctions.getQuoteKeysByClass(dynamoDb, authorClass);
    },
    getQuote(id, author) {
        return quoteFunctions.getQuote(dynamoDb, id, author);
    }
};
