import {
	Client,
	Intents
} from "discord.js"
import dotenv from 'dotenv'
dotenv.config()

// Create a new client instance
const client = new Client({
	intents: [Intents.FLAGS.GUILDS]
});

const token = process.env.token

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const {
		commandName
	} = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	} else if (commandName === 'play') {
		 //If you are not in the voice channel, then return a message
		//if (!message.member.voice.channel) return message.channel.send("Please connect to a voice channel :c !");
		//message.member.voice.channel.join();
	}
});

// Login to Discord with your client's token
client.login(token);