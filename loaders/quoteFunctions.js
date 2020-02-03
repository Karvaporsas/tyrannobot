/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const T_QUOTES = process.env.TABLE_QUOTES;
const AUTHOR_MAP_INDEX = process.env.AUTHOR_MAP_INDEX;
const AUTHOR_CLASS_INDEX = process.env.AUTHOR_CLASS_INDEX;
const ID_INDEX = process.env.ID_INDEX;
const SHOW_ONLY_VETTED = process.env.SHOW_ONLY_VETTED === 'ON';
const DISABLE_DISCARDED = process.env.DISABLE_DISCARDED === 'ON';
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
                params.FilterExpression = '#reviewed <> :success and #reviewed <> :failure';
                params.ExpressionAttributeNames['#reviewed'] = 'reviewed';
                params.ExpressionAttributeValues[':success'] = 1;
                params.ExpressionAttributeValues[':failure'] = -1;
            } else if (SHOW_ONLY_VETTED) {
                params.FilterExpression = '#reviewed = :success';
                params.ExpressionAttributeNames['#reviewed'] = 'reviewed';
                params.ExpressionAttributeValues[':success'] = 1;
            } else if (DISABLE_DISCARDED) {
                params.FilterExpression = '#reviewed <> :failure';
                params.ExpressionAttributeNames['#reviewed'] = 'reviewed';
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
    getQuoteKeysByClass(dynamoDb, authorClass, mode) {
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

            if (mode === utils.modes.vet) {
                params.FilterExpression = '#reviewed <> :success and #reviewed <> :failure';
                params.ExpressionAttributeNames['#reviewed'] = 'reviewed';
                params.ExpressionAttributeValues[':success'] = 1;
                params.ExpressionAttributeValues[':failure'] = -1;
            } else if (SHOW_ONLY_VETTED) {
                params.FilterExpression = '#reviewed = :success';
                params.ExpressionAttributeNames['#reviewed'] = 'reviewed';
                params.ExpressionAttributeValues[':success'] = 1;
            } else if (DISABLE_DISCARDED) {
                params.FilterExpression = '#reviewed <> :failure';
                params.ExpressionAttributeNames['#reviewed'] = 'reviewed';
                params.ExpressionAttributeValues[':failure'] = -1;
            }

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
            var self = this;
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
                    if (quotes && quotes.length) {
                        var promises = [];

                        if (quotes.length > 1) {
                            for (const q of quotes) {
                                q.isDuplicate = true;
                                promises.push(self.updateIsQuoteDuplicate(dynamoDb, q));
                            }
                        } else {
                            var promise = new Promise((ok, nok) => {
                                ok();
                            });

                            promises.push(promise);
                        }

                        Promise.all(promises).then(() => {
                            resolve(quotes[0]);
                        }).catch((e) => {
                            reject(e);
                        });
                    } else {
                        reject('No quote found ');
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
                params.UpdateExpression = 'set #reviewed = :reviewed, #reviewer = :reviewer';
                params.ExpressionAttributeNames = {
                    '#reviewed': 'reviewed',
                    '#reviewer': 'reviewer'
                };
                params.ExpressionAttributeValues = {
                    ':reviewed': quote.reviewed,
                    ':reviewer': quote.reviewer
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
    },
    updateIsQuoteDuplicate(dynamoDb, quote) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: T_QUOTES,
                Key: {
                    author: quote.author,
                    id: quote.id
                },
                UpdateExpression: 'set #duplicate = :duplicate',
                ExpressionAttributeNames: {
                    '#duplicate': 'duplicate'
                },
                ExpressionAttributeValues: {
                    ':duplicate': (quote.isDuplicate === true)
                }
            };

            dynamoDb.update(params, function (err, data) {
                if (err) {
                    console.log(`Error updating quote duplicacy for quote ${quote.id}`);
                    console.log(err);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
};