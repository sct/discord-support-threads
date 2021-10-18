import dotenv from 'dotenv';

dotenv.config();

const config = {
  botToken: process.env.BOT_TOKEN,
  monitorChannelId: process.env.CHANNEL_ID,
};

export default config;
