/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const T_QUOTES = process.env.TABLE_QUOTES;
const utils = require('./../utils');

module.exports = {
    getQuoteKeys(dynamoDb, authors) {
        return new Promise((resolve, reject) => {
            var promises = [];
            for (const author of authors) {
                promises.push(this.getAuthorKeys(dynamoDb, author));
            }

            Promise.all(promises).then((allResults) => {
                var allKeys = [];
                for (const authorKeys of allResults) {
                    allKeys = allKeys.concat(authorKeys);
                }
                resolve(allKeys);
            }).catch((e) => {
                console.log('Error getting quote keys');
                console.log(e);
                reject(e);
            });
        });
    },
    getQuoteKeysByMap(dynamoDb, authorMap) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                ProjectionExpression: '#id, #author',
                FilterExpression: '#telegram_author_mapping = :telegram_author_mapping',
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#author': 'author',
                    '#telegram_author_mapping': 'telegram_author_mapping'
                },
                ExpressionAttributeValues: {
                    ':telegram_author_mapping': authorMap
                }
            };

            utils.performScan(dynamoDb, params).then((quoteKeys) => {
                resolve(quoteKeys);
            }).catch((e) => {
                console.log('Error scannin quotes by map');
                console.log(e);
                reject(e);
            });
        });
    },
    getQuoteKeysByClass(dynamoDb, authorClass) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                ProjectionExpression: '#id, #author',
                FilterExpression: '#telegram_bot_category = :telegram_bot_category',
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#author': 'author',
                    '#telegram_bot_category': 'telegram_bot_category'
                },
                ExpressionAttributeValues: {
                    ':telegram_bot_category': authorClass
                }
            };

            utils.performScan(dynamoDb, params).then((quoteKeys) => {
                resolve(quoteKeys);
            }).catch((e) => {
                console.log('Error scanning quotes');
                console.log(e);
                reject(e);
            });
        });
    },
    getAuthorKeys(dynamoDb, author) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                KeyConditionExpression: '#author = :author',
                ProjectionExpression: '#id, #author',
                ExpressionAttributeNames: {
                    '#author': 'author',
                    '#id': 'id'
                },
                ExpressionAttributeValues: {
                    ':author': author
                }
            };

            dynamoDb.query(params, function (err, data) {
                if (err) {
                    console.log(`Error fetching keys for ${author}`);
                    console.log(err);
                    reject(err);
                } else {
                    if (data && data.Items) {
                        resolve(data.Items);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    },
    getQuote(dynamoDb, id, author) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                Key: {
                    author: author,
                    id: id
                }
            };

            dynamoDb.get(params, function (err, result) {
                if (err) {
                    console.log(`Error getting quote ${id} from ${author}`);
                    console.log(err);
                    reject(err);
                } else {
                    if (result && result.Item) {
                        resolve(result.Item);
                    } else {
                        reject();
                    }
                }
            });
        });
    }
};