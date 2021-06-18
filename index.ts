import * as Commando from 'discord.js-commando';
import { config } from 'dotenv';

// import commands here
import PlayCommand from './commands/music/play.js';
import QueueCommand from './commands/music/queue.js';
import NextCommand from './commands/music/next.js';
import PreviousCommand from './commands/music/previous.js';
import PauseCommand from './commands/music/pause.js';
import ResumeCommand from './commands/music/resume.js';
import RemoveCommand from './commands/music/remove.js';
import ExitCommand from './commands/music/exit.js';
import SaveCommand from './commands/music/save.js';
import LoadCommand from './commands/music/load.js';
import SeekCommand from './commands/music/seek.js';

// set up env vars
config();
const { OWNER, TOKEN, PREFIX } = process.env;

if (!OWNER || !TOKEN || !PREFIX) {
    console.error('Env variables not set up correctly');
    process.exit(1);
}

// set up client
const client = new Commando.Client({
    owner: OWNER,
    commandPrefix: PREFIX,
});

client.on('ready', () => {
    console.log('The bot is up and running!');
});

// register commands
client.registry
    .registerGroups([['music', 'music commands']])
    .registerDefaults()
    .registerCommands([
        PlayCommand,
        QueueCommand,
        NextCommand,
        PreviousCommand,
        PauseCommand,
        ResumeCommand,
        RemoveCommand,
        ExitCommand,
        SaveCommand,
        LoadCommand,
        SeekCommand,
    ]);

client.login(TOKEN).catch(err => console.log(err));
