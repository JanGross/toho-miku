require("dotenv").config();
const { Console } = require("console");
const fs = require("fs");
const dbUtil = require("./util/db")
const { Band, Character } = require("./models");

const logger = new Console({
    stdout: process.stdout,
    stderr: process.stderr
});

//TODO: Fix ./data folders permission so wen can move out dataset in there
async function runImport() {
    dbUtil.syncDb();
    db = dbUtil.getDb();
    await importBands();
    await importCharacters();
}

async function importBands() {
    const bandFiles = fs.readdirSync("./assets/import/bands").filter(file => file.endsWith(".json"));
    //read json file and parse it into a javascript object
    for (const file of bandFiles) {
        let band = fs.readFileSync(`./assets/import/bands/${file}`);
        band = JSON.parse(band);
        logger.log(`Importing band: ${band.name}`);
        //check if band exists in database
        let existingBand = await db.Band.findOne({
            where: {
                name: band.name
            }
        })

        if (existingBand) {
            logger.log(`Band ${band.name} already exists in database`);
            continue;
        } else {
            //create band in database
            await db.Band.create({
                id: band.id,
                name: band.name,
                description: band.description,
                imageURL: band.imageURL,
                enabled: band.enabled
            });
            logger.log(`Created band ${band.name} in database`);
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
                //create band in database
                await db.Character.create({
                    id: character.id,
                    bandId: character.bandId,
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

