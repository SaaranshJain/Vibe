import * as Commando from 'discord.js-commando';
import 'discord-reply';
import * as fs from 'fs';
import { getQ } from '../../queue-class.js';

export default class SaveCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'save',
            aliases: ['s', 'sav'],
            group: 'music',
            memberName: 'save',
            description: 'Saves the current queue for re-use',
            examples: ['save'],
        });
    }

    async run(msg: Message) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        if (queue.items.length <= 0) {
            return msg.lineReply('Saving empty q??????');
        }

        fs.readFile('./saved-queues.json', { encoding: 'utf-8' }, (err, data: string) => {
            if (err) {
                console.log(err);
            } else {
                const existingQueues = JSON.parse(data);

                existingQueues[msg.author.id]
                    ? null
                    : (existingQueues[msg.author.id] = {
                          [msg.guild.id]: [],
                      });

                existingQueues[msg.author.id][msg.guild.id] = queue.items.map((v, i) => {
                    i === 0 ? (v.state = 'playing') : (v.state = 'queued');
                    return v;
                });

                fs.writeFile('./saved-queues.json', JSON.stringify(existingQueues), { encoding: 'utf-8' }, err => {
                    if (err) console.log(err);
                });
            }
        });

        return msg.lineReply('Saved queue!');
    }
}
