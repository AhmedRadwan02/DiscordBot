// Imports
import {
	Client,
	Intents
} from "discord.js"

import dotenv from 'dotenv'

import {
	joinVoiceChannel,
	VoiceConnectionStatus,
	entersState,
	getVoiceConnection
} from '@discordjs/voice'

// dotenv connection
dotenv.config()

// Create a new client instance
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

// token
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
	// Commands
	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	} else if (commandName === 'play') {
		playAudio(interaction);
		await interaction.reply('Song Playing: ');
	} else if (commandName === 'stop'){
		stop(interaction);
		await interaction.reply(`I\'m sad :c `);
	}
});

function stop(interaction){
	const voiceChannel = interaction.member.voice.channel;

	if (voiceChannel) {
		const connection = getVoiceConnection(voiceChannel.guild.id)
		connection.destroy()
	}

}
const playAudio = (interaction) => {
	// declare vc
	const voiceChannel = interaction.member.voice.channel;
	if (voiceChannel) {
		const permissions = voiceChannel.permissionsFor(interaction.client.user);
		if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
			return interaction.channel.send(
				"I need the permissions to join and speak in your voice channel!"
			);
		}
		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		// handle disconnecting?
		connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
			try {
				await Promise.race([
					entersState(connection, VoiceConnectionStatus.Signalling, 5000),
					entersState(connection, VoiceConnectionStatus.Connecting, 5000),
				]);
				// Seems to be reconnecting to a new channel - ignore disconnect
			} catch (error) {
				// Seems to be a real disconnect which SHOULDN'T be recovered from
			}
		});



	}
	else {
		return interaction.channel.send("You need to be in a voice channel to play music!");
	}
}
// Login to Discord with your client's token
client.login(token);