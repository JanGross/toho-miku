require("dotenv").config();
const { Console } = require("console");
const fs = require("fs");
const {Client, GatewayIntentBits, Collection} = require("discord.js");
const dbUtil = require("./util/db")

const logger = new Console({
    stdout: process.stdout,
    stderr: process.stderr
});
const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
]});

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const commands = [];
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
    logger.log(`Registered command: ${command.data.name}`);
}

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, commands));
    } else {
        client.on(event.name, (...args) => event.execute(...args, commands));
    }
    
    logger.log(`Registered event: ${event.name}`);
}



logger.log("Syncing database...");
dbUtil.syncDb();
client.login(process.env.TOKEN);




