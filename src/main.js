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

import ytdl from 'ytdl-core-discord';
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

// Create Audio Player
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
				const stringIn = interaction.options.getString('input');
				const ytID = youtube_parser(stringIn);
				await interaction.reply('Enjoi!');
				playAudio(interaction,stringIn);
                break;
            case "stop":
                await interaction.reply(`I\'m sad :c `);
				stop(interaction);
                break;
        }
});

//	Stop commaned
function stop(interaction){
	const voiceChannel = interaction.member.voice.channel;

	if (voiceChannel) {
		const connection = getVoiceConnection(voiceChannel.guild.id)
		connection.destroy()
	}

}

const playAudio = async(interaction, url) => {
	// declare vc
	const voiceChannel = interaction.member.voice.channel;
	if (voiceChannel) {
		const permissions = voiceChannel.permissionsFor(interaction.client.user);
		if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
			return interaction.channel.send(
				"I need the permissions to join and speak in your voice channel!"
			);
		}
		// Create resource
		const resource = createAudioResource(await ytdl(url));
		
		// Play Audio
		player.play(resource,{ inlineVolume: true });
		// Catch Error 
		player.on('error', error => {
			console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
			player.play(getNextResource());
		});

		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		// subscribe
		const subscription = connection.subscribe(player);

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

// Get youtube video ID
function youtube_parser(url){
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	   var match = url.match(regExp);
	return (match&&match[7].length==11)? match[7] : false;
}
// Login to Discord with your client's token
client.login(token);