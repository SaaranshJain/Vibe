import * as Commando from 'discord.js-commando';
import { Collection } from 'discord.js';

// import commands here
import PlayCommand from './commands/music/play.js';
import QueueCommand from './commands/music/queue.js';
import NextCommand from './commands/music/next.js';
import PreviousCommand from './commands/music/previous.js';
import PauseCommand from './commands/music/pause.js';
import ResumeCommand from './commands/music/resume.js';
import RemoveCommand from './commands/music/remove.js';

import { Queue } from './queue-class.js';

// set up env vars
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

const queues = new Collection<string, Queue>();

// register commands
client.registry
    .registerGroups([['music', 'music commands']])
    .registerDefaults()
    .registerCommands([
        PlayCommand(queues),
        QueueCommand(queues),
        NextCommand(queues),
        PreviousCommand(queues),
        PauseCommand(queues),
        ResumeCommand(queues),
        RemoveCommand(queues),
    ]);

client.login(TOKEN).catch(err => console.log(err));
