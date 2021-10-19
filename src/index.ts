import {
  Client,
  Intents,
  Permissions,
  Snowflake,
  ThreadChannel,
} from 'discord.js';
import config from './config';
import { registerSlashCommands } from './registerSlashCommands';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const messages = require('../config/messages.json');
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
