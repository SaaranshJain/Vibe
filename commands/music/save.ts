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
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        if (queue.items.length <= 0) {
            return msg.lineReply('Saving empty q??????');
        }

        const qName = name.join(' ');

        fs.readFile('./saved-queues.json', { encoding: 'utf-8' }, (err, data: string) => {
            if (err) {
                console.log(err);
            } else {
                const qs = JSON.parse(data);

                qs[msg.author.id]
                    ? null
                    : (qs[msg.author.id] = {
                          [qName]: [],
                      });

                qs[msg.author.id][qName] = queue.items.map((v, i) => {
                    i === 0 ? (v.state = 'playing') : (v.state = 'queued');
                    return v;
                });

                fs.writeFile('./saved-queues.json', JSON.stringify(qs), { encoding: 'utf-8' }, err => {
                    if (err) console.log(err);
                });
            }
        });

        return msg.lineReply('Saved queue!');
    }
}
