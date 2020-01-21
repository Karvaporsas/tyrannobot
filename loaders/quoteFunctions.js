/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const T_QUOTES = process.env.TABLE_QUOTES;
const AUTHOR_MAP_INDEX = process.env.AUTHOR_MAP_INDEX;
const AUTHOR_CLASS_INDEX = process.env.AUTHOR_CLASS_INDEX;
const ID_INDEX = process.env.ID_INDEX;
const utils = require('./../utils');

module.exports = {
    getQuoteKeysByMap(dynamoDb, authorMap, mode) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                IndexName: AUTHOR_MAP_INDEX,
                KeyConditionExpression: '#telegram_author_mapping = :telegram_author_mapping',
                ProjectionExpression: '#id, #author',
                ExpressionAttributeNames: {
                    '#telegram_author_mapping': 'telegram_author_mapping',
                    '#id': 'id',
                    '#author': 'author'
                },
                ExpressionAttributeValues: {
                    ':telegram_author_mapping': authorMap
                }
            };

            if (mode === utils.modes.vet) {
                params.FilterExpression = '#reviewed <> :success or #reviewed <> :failure';
                params.ExpressionAttributeNames['#reviewed'] = 'reviewed';
                params.ExpressionAttributeValues[':success'] = 1;
                params.ExpressionAttributeValues[':failure'] = -1;
            }

            dynamoDb.query(params, function(err, data) {
                if (err) {
                    console.log('Error querying quotes by map ' + authorMap);
                    console.log(err);
                    reject(err);
                } else {
                    resolve(data.Items);
                }
            });
        });
    },
    getQuoteKeysByClass(dynamoDb, authorClass) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                IndexName: AUTHOR_CLASS_INDEX,
                ProjectionExpression: '#id, #author',
                KeyConditionExpression: '#telegram_bot_category = :telegram_bot_category',
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#author': 'author',
                    '#telegram_bot_category': 'telegram_bot_category'
                },
                ExpressionAttributeValues: {
                    ':telegram_bot_category': authorClass
                }
            };

            dynamoDb.query(params, function (err, data) {
                if (err) {
                    console.log(`Error querying quote keys wiht class ${authorClass}`);
                    console.log(err);
                    reject(err);
                } else {
                    resolve(data.Items);
                }
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
    },
    getQuoteById(dynamoDb, id) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                IndexName: ID_INDEX,
                KeyConditionExpression: '#id = :id',
                ExpressionAttributeNames: {
                    '#id': 'id'
                },
                ExpressionAttributeValues: {
                    ':id': id
                }
            };

            dynamoDb.query(params, function(err, data) {
                if (err) {
                   console.log(`Error querying quote by id ${id}`);
                   console.log(err);
                   reject(err);
                } else {
                    var quotes = data.Items;
                    if (quotes && quotes.length === 1) {
                        resolve(quotes[0]);
                    } else {
                        reject('No quote found or multiple found with same id');
                    }
                }
            });
        });
    },
    updateQuoteReactions(dynamoDb, quote, mode) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                Key: {
                    author: quote.author,
                    id: quote.id
                },
                UpdateExpression: 'set #likes = :likes, #dislikes = :dislikes',
                ExpressionAttributeNames: {
                    '#likes': 'likes',
                    '#dislikes': 'dislikes'
                },
                ExpressionAttributeValues: {
                    ':likes': quote.likes,
                    ':dislikes': quote.dislikes
                }
            };
            if (mode === utils.modes.vet) {
                params.UpdateExpression = 'set #reviewed = :reviewed';
                params.ExpressionAttributeNames = {
                    '#reviewed': 'reviewed'
                };
                params.ExpressionAttributeValues = {
                    ':reviewed': quote.reviewed
                };
            }

            dynamoDb.update(params, function (err, data) {
                if (err) {
                    console.log('Error updating quote reactions');
                    console.log(err);
                    reject(err);
                } else {
                    resolve(quote);
                }
            });
        });
    }
};