# tyrannobot
Bot that sends quotes from dictators and such to telegram (at first)

## how to start

```
npm init
```

```
npm install --save aws-sdk request request-promise
```
## Environment variables

Variable name | Value | Note
--- | --- | ---
**DEBUG_MODE** | ON / OFF | Increases amount of logging
**TELEGRAM_TOKEN** | string | Needed to send messages to telegram bot api
**TABLE_QUOTES** | string | Specifies in which table quotes are stored
**TYRANTS** | string | List of names of tyrants to include in search. Comma separated

## Activate webook

```
curl --data "url=<INVOKE_URL>" "https://api.telegram.org/bot<ACCESS_TOKEN>/setWebhook"
```

INVOKE_URL = Api endpoint where to send event (AWS Lambda API address)
ACCESS_TOKEN = Telegram access token of bot

Result will be something like:

```
{"ok":true,"result":true,"description":"Webhook was set"}
```

## Commands

/speak - Bot quotes a tyrant