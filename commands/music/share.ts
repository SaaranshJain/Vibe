import * as Commando from 'discord.js-commando';
import 'discord-reply';
import * as fs from 'fs/promises';
import { getQ } from '../../queue-class.js';
import { MessageEmbed, User } from 'discord.js';

export default class ShareCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'share',
            aliases: ['sh'],
            group: 'music',
            memberName: 'share',
            description: 'Shares the mentioned queue',
            examples: ['share'],
            args: [
                {
                    key: 'user',
                    label: 'user',
                    type: 'user',
                    prompt: 'Please enter the user who you want to share with',
                },
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

    async run(msg: Message, { user, name }: { user: User; name: string[] }) {
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

            if (!existingQueues[user.id]) {
                existingQueues[user.id] = {
                    [qName]: [],
                };
            }

            existingQueues[user.id][qName] = existingQueues[msg.author.id][qName];
            await fs.writeFile('./saved-queues.json', JSON.stringify(existingQueues), { encoding: 'utf-8' });

            const dm = await user.createDM();
            await dm.send(
                new MessageEmbed({
                    title: `${msg.author.username} shared a queue!`,
                    description: qName,
                    color: 'purple',
                })
            );

            return msg.lineReply(`Shared saved queue - ${qName}`);
        } catch (err) {
            console.log(err);
        }

        return null;
    }
}
