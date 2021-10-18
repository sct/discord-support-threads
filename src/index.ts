import { Client, Intents } from 'discord.js';
import config from './config';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.once('ready', () => {
  console.log('Connected to discord!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.type !== 'GUILD_TEXT') {
    return;
  }

  if (message.channel.id !== config.monitorChannelId) {
    return;
  }

  const guild = client.guilds.cache.get(message.guild.id);

  const displayName =
    guild.members.cache.get(message.author.id).displayName ??
    message.author.username;

  const thread = await message.startThread({
    name: displayName,
    autoArchiveDuration: 'MAX',
    reason: 'Creating a support thread',
  });

  // Not necessary if its a reply thread
  // await thread.members.add(message.author.id);
  thread.send(
    `Hi there! I have created this support thread for you. While awaiting a response, please be sure to review the Overseerr support guide and share any relevant logs/details: https://docs.overseerr.dev/support/need-help`
  );

  console.log(`Created a thread: ${thread.name}`);
});

client.login(config.botToken);
