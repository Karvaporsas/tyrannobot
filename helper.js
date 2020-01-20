/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const utils = require('./utils');

function getIndentedColMessage(message, maxLength) {
    const countValue = maxLength + 1 - message.toString().length;
    return '' + message + (' ').repeat(countValue);
}

/**
 * Helper
 */
module.exports = {
    getFeedBackKeyboard(command, id) {
        var keyboardButtons = [];
        var commandString = `${command},${id}`;

        keyboardButtons.push({callback_data: commandString + ',up', text: (command === utils.modes.vet ? '\u2714\ufe0f' : '\uD83D\uDC4D')});
        keyboardButtons.push({callback_data: commandString + ',down', text: (command === utils.modes.vet ? '\u274c' : '\uD83D\uDC4E')});

        return keyboardButtons;
    },
    createKeyboardLayout(keys, columnAmount) {
        var keyboard = [];
        var col = 0;
        var row = 0;
        for (let i = 0; i < keys.length; i++) {
            if (col === 0) keyboard.push([]);
            keyboard[row].push(keys[i]);

            if (col === (columnAmount - 1)) row++;
            col = (col + 1) % columnAmount;
        }

        return keyboard;
    },
    isCallback(event) {
        if (!event.body.message && event.body.callback_query) return true;
        return false;
    },
    getCallbackData(event) {
        var result = "";

        if (event.body.callback_query) result = event.body.callback_query.data;

        return result;
    },
    parseCallbackData(dataString) {
        if (!dataString || !dataString.trim()) return [];

        return dataString.split(',');
    },
    getCallbackId(event) {
        var id = null;

        if (event.body.callback_query) id = event.body.callback_query.id;

        return id;
    },
    parseCommand(message) {
        const tokens = message.split(' ');
        if (!tokens[0].match(/^\//)) {
            return {name: ''};
        }
        var c = {};
        const cmd = tokens.shift();
        const match = cmd.match(/\/(\w*)/);
        if (match.length > 0) {
            c.args = tokens;
            c.name = match[1];
        }

        return c;
    },
    /**
     * Formats quote to nice form for sending
     * @param {string} title of quote
     * @param {string} quote to send
     * @param {string} suffix of quote. Typically Author
     *
     * @returns string quote
     */
    formatMessage(title, quote, suffix) {
        let message = '';

        if (title.length > 0) {
            message = `<strong>${title}</strong>`;
        }
        if (quote && quote.length > 0) {
            message += `\n<em>${quote}</em>`;
        }

        if(suffix && suffix.length > 0) {
            message += `\n - ${suffix}`;
        }

        return message;
    },
    getEventUserId(event) {
        var userId = 0;

        if (event.body.message && event.body.message.from) userId = event.body.message.from.id;

        return userId;
    },
    /**
     * Creates list type message to show to user
     * @param {string} title of message
     * @param {string} description of message
     * @param {Array} rows to show as list
     * @param {Array} cols to show from rows
     *
     * @returns Listing kind message as string
     */
    formatListMessage(title, description, rows, cols) {
        let message = '';

        if (title.length > 0) {
            message = `<strong>${title}</strong>`;
        }

        var colLenghts = {};
        for (const col of cols) {
            var maxLength = col.headerName.length;
            for (const row of rows) {
                var rowLenght = row[col.colProperty].toString().length;
                if (rowLenght > maxLength) maxLength = rowLenght;
            }
            colLenghts[col.colProperty] = maxLength;
        }

        if (description && description.length > 0) {
            message += `\n<em>${description}</em>`;
        }

        if(rows && rows.length > 0) {
            message += '\n<pre>';
            var header = '';
            for (const col of cols) {
                header += getIndentedColMessage(col.headerName, colLenghts[col.colProperty]);
            }
            message += header + '\n';
            for (const row of rows) {
                var rowString = '';
                for (const col of cols) {
                    rowString += getIndentedColMessage(row[col.colProperty], colLenghts[col.colProperty]);
                }
                message += rowString + '\n';
            }
            message += '</pre>';
        }

        return message;
    },
    getEventChatId(event) {
        var chatId = 0;
        if (event.body.message && event.body.message.chat && event.body.message.chat.id) {
            chatId = event.body.message.chat.id;
        } else if (event.body.channel_post && event.body.channel_post.chat && event.body.channel_post.chat.id) {
            chatId = event.body.channel_post.chat.id;
        }

        return chatId;
    },
    getEventMessageText(event) {
        var message = '';
        if (event.body.channel_post && event.body.channel_post.text) {
            message = event.body.channel_post.text;
        } else if (event.body.message && event.body.message.text) {
            message = event.body.message.text;
        }

        return message;
    },
    getCallbackChatId(event) {
        var id = 0;

        if (event.body.callback_query && event.body.callback_query.message && event.body.callback_query.message.chat) {
            id = event.body.callback_query.message.chat.id;
        }

        return id;
    },
};
