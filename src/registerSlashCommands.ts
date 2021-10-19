import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Snowflake } from 'discord.js';
import config from './config';

const commands = [
  new SlashCommandBuilder()
    .setName('resolve')
    .setDescription(
      'Resolve an active support thread. Must be ran from inside support thread.'
    ),
].map((command) => command.toJSON());

export const registerSlashCommands = (clientId: Snowflake) => {
  const rest = new REST({ version: '9' }).setToken(config.botToken);
  rest
    .put(
      config.applicationGuildId
        ? Routes.applicationGuildCommands(clientId, config.applicationGuildId)
        : Routes.applicationCommands(clientId),
      {
        body: commands,
      }
    )
    .then(() =>
      console.log(
        config.applicationGuildId
          ? 'Registered guild-specific slash commands.'
          : 'Registered slash commands.'
      )
    )
    .catch(console.error);
};
