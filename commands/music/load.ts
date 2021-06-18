import * as Commando from 'discord.js-commando';
import 'discord-reply';
import * as fs from 'fs/promises';
import { getQ } from '../../queue-class.js';

export default class LoadCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'import',
            aliases: ['i', 'im'],
            group: 'music',
            memberName: 'import',
            description: 'Imports the queue for this guild',
            examples: ['import'],
        });
    }

    async run(msg: Message) {
        if (!msg.member?.voice.channel?.id) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const voiceID = msg.guild.id;
        const queue = getQ(voiceID);

        try {
            const data = await fs.readFile('./saved-queues.json', { encoding: 'utf-8' });
            const existingQueues = JSON.parse(data);

            if (!existingQueues[msg.author.id] || !existingQueues[msg.author.id][msg.guild.id]) {
                return msg.lineReply('You have no saved queues for this server lol save something first');
            }

            queue.items = existingQueues[msg.author.id][msg.guild.id];
            queue.channel = await msg.member.voice.channel.join();

            queue.msgChannel = msg.channel;
            await queue.recalcQueue();

            return msg.lineReply('Loaded saved queue!');
        } catch (err) {
            console.log(err);
        }

        return null;
    }
}
