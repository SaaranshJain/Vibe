import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { MessageEmbed } from 'discord.js';
import { getQ, queues } from '../../queue-class.js';

export default class RemoveCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'remove',
            aliases: ['rm', 'kicc'],
            group: 'music',
            memberName: 'remove',
            description: 'Removes the specified song',
            examples: ['remove Never gonna give you up'],
            args: [
                {
                    key: 'name',
                    label: 'name',
                    prompt: 'Please provide the name of the song you would like to remove',
                    type: 'string',
                },
            ],
        });
    }

    async run(msg: Message, { name }: { name: string }) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        if (queue.items.length <= 0) {
            return msg.lineReply('Queue is empty whatchu tryna remove?');
        }

        if (name === 'all') {
            queue.items = [];
            queue.dispatcher.destroy();
            queue.channel.disconnect();
            queues.delete(msg.guild.id);
            return msg.lineReply('Cleared queue!');
        }

        const toRemove = queue.items.find(val => val.name.toLowerCase().includes(name.toLowerCase()));

        if (toRemove) {
            queue.remove(toRemove);
            return msg.channel.send(
                new MessageEmbed({
                    title: toRemove.name,
                    description: 'Removed from queue',
                    thumbnail: { url: toRemove.thumbnail },
                    url: toRemove.url,
                })
            );
        }

        return msg.lineReply('Could not find song');
    }
}
