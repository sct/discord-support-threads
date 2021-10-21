import {
  Client,
  Intents,
  Permissions,
  Snowflake,
  ThreadChannel,
} from 'discord.js';
import fs from 'fs';
import merge from 'lodash/merge';
import path from 'path';
import config from './config';
import { registerSlashCommands } from './registerSlashCommands';

const MESSAGES_PATH = path.join(__dirname, '../config/messages.json');

const defaultMessages = {
  threadCreated:
    'Hi there! I have created this support thread for you. While awaiting a response, please be sure to review the Overseerr support guide and share any relevant logs/details: https://docs.overseerr.dev/support/need-help',
  threadResolveHint:
    'If you no longer need assistance, please use the `/resolve` command to archive this thread.',
  threadResolved:
    "It appears that your problem has been resolved, so I've archived this thread. If you require further assistance with this issue, simply reply to unarchive the thread. If you have a question unrelated to your original inquiry, please open a new thread by posting in #support!",
  errorNotThread: 'You can only use this command inside of a support thread.',
  errorNoPermission:
    'You do not have permission to perform this action. Is this your support thread?',
};

const loadMessages = (): typeof defaultMessages => {
  let data = {};
  if (fs.existsSync(MESSAGES_PATH)) {
    data = JSON.parse(fs.readFileSync(MESSAGES_PATH, 'utf-8'));
  }

  let messages = defaultMessages;

  messages = merge(defaultMessages, data);

  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, undefined, ' '));

  return messages;
};

const messages = loadMessages();
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const getInviteLink = (clientId: Snowflake) => {
  const permissions = 397284861952;

  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=applications.commands%20bot`;
};

client.once('ready', (client) => {
  console.log('Connected to discord!');
  console.log(`Invite me: ${getInviteLink(client.user.id)}`);

  // Register slash commands
  registerSlashCommands(client.user.id);
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
    autoArchiveDuration: 1440,
    reason: 'Creating a support thread',
  });

  await thread.send(messages.threadCreated);
  await thread.send(messages.threadResolveHint);

  console.log(`Created a thread: ${thread.name}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  if (interaction.commandName === 'resolve') {
    if (
      !interaction.channel.isThread() ||
      interaction.channel.parent.id !== config.monitorChannelId
    ) {
      await interaction.reply({
        content: messages.errorNotThread,
        ephemeral: true,
      });
    }

    const threadChannel = interaction.channel as ThreadChannel;
    const originalMessage = await threadChannel.fetchStarterMessage();

    if (
      originalMessage.author.id !== interaction.user.id &&
      !(interaction.member.permissions as Permissions).has([
        Permissions.FLAGS.MANAGE_MESSAGES,
      ])
    ) {
      return await interaction.reply({
        content: messages.errorNoPermission,
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: messages.threadResolved,
    });

    await threadChannel.setArchived(true);
  }
});

client.login(config.botToken);
