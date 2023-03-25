const axios = require('axios');
const Discord = require('discord.js');
const mySecret = process.env['TOKEN']
const fs = require('fs');

const {Client, GatewayIntentBits} = require("discord.js")
const client = new Client({ intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent] });

function obfuscateLua(code) {
  // Split the code into individual lines
  const lines = code.split('\n');

  // Replace variable and function names with random strings
  const obfuscatedLines = lines.map(line => {
    let obfuscatedLine = line;

    // Replace variable names
    obfuscatedLine = obfuscatedLine.replace(/([\w\d]+)\s*=/g, (_, name) => {
      const obfuscatedName = generateObfuscatedName();
      return `${obfuscatedName} =`;
    });

    // Replace function names
    obfuscatedLine = obfuscatedLine.replace(/function\s+([\w\d]+)\(/g, (_, name) => {
      const obfuscatedName = generateObfuscatedName();
      return `function ${obfuscatedName}(`;
    });

    return obfuscatedLine;
  });

  // Join the lines back together
  return obfuscatedLines.join('\n');
}

function generateObfuscatedName() {
  // Generate a random string of characters
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let obfuscatedName = '';
  for (let i = 0; i < 8; i++) {
    obfuscatedName += characters[Math.floor(Math.random() * characters.length)];
  }
  return obfuscatedName;
}

client.on('messageCreate', async (message) => {
    console.log(message.attachments.toJSON())
  if (message.content.startsWith('!obfuscateLua')) {
    const attachments = message.attachments;
    if (attachments.size === 0) {
      message.reply('Please attach a Lua file to obfuscate.');
      return;
    }
    const luaFile = attachments.toJSON()[0];
    if (!luaFile.name.endsWith('.lua')) {
      message.reply('Invalid file type. Please attach a Lua file.');
      return;
    }
    const luaCode = await downloadFile(luaFile.url);
    const obfuscatedCode = obfuscateLua(luaCode);
    const obfuscatedFile = new Discord.AttachmentBuilder(Buffer.from(obfuscatedCode), luaFile.name);
    message.channel.send(`Here's your obfuscated Lua file:`, obfuscatedFile);
  }
});

async function downloadFile(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary').toString();
}

client.login(mySecret);