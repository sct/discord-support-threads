# Discord Support Thread Bot

Super simple bot that will monitor a channel and create threads automatically on any new messages.

## Setup

- Configure your support channel to use "slow mode" with whatever limit you want for new support threads
- Run the bot:

```docker
docker run -d \
  --name discord-support-threads \
  -e BOT_TOKEN=YourDiscordBotToken \
  -e CHANNEL_ID=SupportChannelID \
  -e GUILD_ID=ServerID \ # Optional, only needed if you have trouble registering slash commands
  -v /path/to/appdata/config:/app/config \
  --restart unless-stopped \
  ghcr.io/sct/discord-support-threads
```

- The bot will create a `settings.json` file in your mounted folder which you can edit to customize the support messages the bot will send.
- Restart the bot after customizing the messages and invite the bot to your server. (There should be an invite link ready for you in the stdout logs!)
