require("dotenv").config();
const { Console } = require("console");
const fs = require("fs");
const dbUtil = require("./util/db")
const { Group, Character } = require("./models");

const logger = new Console({
    stdout: process.stdout,
    stderr: process.stderr
});

//TODO: Fix ./data folders permission so wen can move out dataset in there
async function runImport() {
    dbUtil.syncDb();
    db = dbUtil.getDb();
    await importGroups();
    await importCharacters();
}

async function importGroups() {
    const groupFiles = fs.readdirSync("./assets/import/groups").filter(file => file.endsWith(".json"));
    //read json file and parse it into a javascript object
    for (const file of groupFiles) {
        let group = fs.readFileSync(`./assets/import/groups/${file}`);
        group = JSON.parse(group);
        logger.log(`Importing group: ${group.name}`);
        //check if group exists in database
        let existingGroup = await db.Group.findOne({
            where: {
                name: group.name
            }
        })

        if (existingGroup) {
            logger.log(`Group ${group.name} already exists in database`);
            continue;
        } else {
            //create group in database
            await db.Group.create({
                id: group.id,
                name: group.name,
                description: group.description,
                imageURL: group.imageURL,
                enabled: group.enabled
            });
            logger.log(`Created group ${group.name} in database`);
        }
    }
}


async function importCharacters() {
    const characterFiles = fs.readdirSync("./assets/import/characters").filter(file => file.endsWith(".json"));
    //read json file and parse it into a javascript object
    for (const file of characterFiles) {
        let characters = fs.readFileSync(`./assets/import/characters/${file}`);
        characters = JSON.parse(characters);
        for (character of characters) {
            logger.log(`Importing character: ${character.name}`);
            //check if character exists in database
            let existingCharacter = await db.Character.findOne({
                where: {
                    id: character.id
                }
            })
            if (existingCharacter) {
                logger.log(`Character ${character.name} already exists in database`);
                continue;
            } else {
                //create group in database
                await db.Character.create({
                    id: character.id,
                    groupId: character.groupId,
                    name: character.name,
                    description: character.description,
                    imageIdentifier: character.imageIdentifier,
                    enabled: character.enabled
                });
                logger.log(`Created character ${character.name} in database`);
            }
        }
    }
}

logger.log("Importing...");
runImport().then(() => {
    logger.log("Import complete");
    process.exit(0);
}).catch((err) => {
    logger.error(err);
    process.exit(1);
});

