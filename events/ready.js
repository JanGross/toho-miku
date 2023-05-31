require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9")

module.exports = {
    name: "ready",
    once: true,
    async execute (client, commands) {
        console.log("Bot started.");

        const CLIENT_ID = client.user.id;
        const rest = new REST({
            version: 9
        }).setToken(process.env.TOKEN);

        (async () => {
            try {
                console.log("Registering commands...");
                if(process.env.ENV === "production") {
                    await rest.put(Routes.applicationCommands(CLIENT_ID), {body: commands });
                    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {body: [] }); //Clear Guild commands on prod
                    console.log("Global commands registered");
                } else {
                    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {body: commands });
                    console.log("Local commands registered");
                }
            } catch (err){
                if (err) console.log(err);
            }
        })();
    
    }
}