import {SlashCommandBuilder} from '@discordjs/builders'
import {REST} from "@discordjs/rest"
import {Routes} from "discord-api-types/v9"
import dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
// configuration
const clientId = process.env.clientID
const guildId = process.env.guildID
const token = process.env.token
console.log({token})
// /ping /server /user
const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);