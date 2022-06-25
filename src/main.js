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
	getVoiceConnection,
	createAudioPlayer,
	createAudioResource,
	StreamType,
	AudioPlayerStatus
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

/**
 * Create the audio player. We will use this for all of our connections.
 */
 const player = createAudioPlayer();

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const {
		commandName
	} = interaction;
	// Commands
        switch (commandName) {
            case "ping":
                await interaction.reply("Pong!");
                break;
            case "server":
                await interaction.reply("Server info.");
                break;
            case "user":
                await interaction.reply("User info.");
                break;
            case "play":
                await interaction.reply("Song Playing: ");
				playAudio(interaction);
                break;
            case "stop":
                await interaction.reply(`I\'m sad :c `);
				stop(interaction);
                break;
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

		const resource = createAudioResource('https://file-examples.com/storage/fe2b8f87f462b62be9b9b8a/2017/11/file_example_MP3_1MG.mp3');

		player.play(resource);
		player.on('error', error => {
			console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
			player.play(getNextResource());
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