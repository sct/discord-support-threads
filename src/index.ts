import {
  Client,
  Intents,
  Permissions,
  Snowflake,
  ThreadChannel,
} from 'discord.js';
import config from './config';
import { registerSlashCommands } from './registerSlashCommands';

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
    autoArchiveDuration: 'MAX',
    reason: 'Creating a support thread',
  });

  await thread.send(
    `Hi there! I have created this support thread for you. While awaiting a response, please be sure to review the Overseerr support guide and share any relevant logs/details: https://docs.overseerr.dev/support/need-help`
  );
  await thread.send(
    'If you created this thread by mistake or if you feel your issue is reolved please close this thread by typing **/resolve**'
  );

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
        content: 'You can only use this command inside of a support thread.',
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
        content:
          'You do not have permission to perform this action. Is this your support thread?',
        ephemeral: true,
      });
    }

    await interaction.reply({
      content:
        'Marking this support thread as resolved. Any further messages in this thread will re-open the support thread. If you have a new question, please open a new thread!',
    });

    await threadChannel.setArchived(true);
  }
});

client.login(config.botToken);
