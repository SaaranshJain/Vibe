import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { Queue } from '../../queue-class.js';
import { MessageEmbed, Collection } from 'discord.js';

export default (queues: Collection<string, Queue>) =>
    class NextCommand extends Commando.Command {
        constructor(client: Commando.CommandoClient) {
            super(client, {
                name: 'next',
                aliases: ['n', 'skip'],
                group: 'music',
                memberName: 'next',
                description: 'Skips the current song',
                examples: ['next'],
            });
        }

        async run(msg: Message) {
            if (!msg.member?.voice.channel) {
                return msg.lineReply('You need to be in a voice channel lmao');
            }

            const queue =
                queues.get(msg.guild.id) ?? (queues.set(msg.guild.id, new Queue()).get(msg.guild.id) as Queue);

            if (queue.items.length <= 0) {
                return msg.lineReply('Queue is empty tho');
            }

            const nextDeets = queue.next();

            if (nextDeets) {
                return msg.channel.send(new MessageEmbed(nextDeets));
            }

            await msg.channel.send('Queue is now complete');
            queue.channel.disconnect();
            return null;
        }
    };
