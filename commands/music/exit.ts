import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { Queue } from '../../queue-class.js';
import { MessageEmbed, Collection } from 'discord.js';

export default (queues: Collection<string, Queue>) =>
    class ExitCommand extends Commando.Command {
        constructor(client: Commando.CommandoClient) {
            super(client, {
                name: 'exit',
                aliases: ['x', 'quit'],
                group: 'music',
                memberName: 'exit',
                description: 'Disconnects the bot from vc',
                examples: ['exit'],
            });
        }

        async run(msg: Message) {
            if (!msg.member?.voice.channel) {
                return msg.lineReply('You need to be in a voice channel lmao');
            }

            const queue =
                queues.get(msg.guild.id) ?? (queues.set(msg.guild.id, new Queue()).get(msg.guild.id) as Queue);

            queue.channel.disconnect();
            return null;
        }
    };
