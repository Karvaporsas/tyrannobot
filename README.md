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
**VETTING_MODE** | ON / OFF | Enables vetting ability
**VETTING_GROUPS** | string | Comma separated string of telegram groups that are allowed to review quotes. If not set, everyone is allowed.
**TELEGRAM_TOKEN** | string | Needed to send messages to telegram bot api
**TABLE_QUOTES** | string | Specifies in which table quotes are stored
**AUTHOR_CLASS** | string | Class specifying what kind of authors are pooled, like "dictator"
**AUTHOR_MAP** | string | Mapping defining a single author and all it's name variations
**USE_LOCAL_STORAGE** | ON / OFF | Determines if quotes are to be fetched from local json-file or from a database
**SUPRESSED_USERS** | string | Comma separated string of telegram users whose commands are supressed by a ratio
**ASK_FEEDBACK** | ON / OFF | If active, will send inline keyboard with thumbs up or down and collect likes and dislikes
**SHOW_ONLY_VETTED** | ON / OFF | Shows only vetted quotes when calling /speak.

## Activate webook

```
curl --data "url=<INVOKE_URL>" "https://api.telegram.org/bot<ACCESS_TOKEN>/setWebhook"
```

INVOKE_URL = Api endpoint where to send event (AWS Lambda API address)<br />
ACCESS_TOKEN = Telegram access token of bot

Result will be something like:

```
{"ok":true,"result":true,"description":"Webhook was set"}
```

## Commands

/speak - Bot quotes an author <br />
/vet - User can review random quote
