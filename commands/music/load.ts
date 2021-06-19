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
            args: [
                {
                    key: 'name',
                    label: 'name',
                    prompt: 'Please enter name of the queue',
                    type: 'string',
                    infinite: true,
                },
            ],
        });
    }

    async run(msg: Message, { name }: { name: string[] }) {
        if (!msg.member?.voice.channel?.id) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        try {
            const qName = name.join(' ');
            const data = await fs.readFile('./saved-queues.json', { encoding: 'utf-8' });
            const existingQueues = JSON.parse(data);

            if (!existingQueues[msg.author.id] || !existingQueues[msg.author.id][qName]) {
                return msg.lineReply('This queue does not exist');
            }

            queue.items = existingQueues[msg.author.id][qName];
            queue.channel = await msg.member.voice.channel.join();

            queue.msgChannel = msg.channel;
            await queue.recalcQueue();

            return msg.lineReply(`Loaded saved queue - ${qName}`);
        } catch (err) {
            console.log(err);
        }

        return null;
    }
}
