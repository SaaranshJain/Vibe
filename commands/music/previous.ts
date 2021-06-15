import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { Queue } from '../../queue-class.js';
import { Collection, MessageEmbed } from 'discord.js';

export default (queues: Collection<string, Queue>) =>
    class PreviousCommand extends Commando.Command {
        constructor(client: Commando.CommandoClient) {
            super(client, {
                name: 'previous',
                aliases: ['prev', 'before'],
                group: 'music',
                memberName: 'previous',
                description: 'Goes back to the previous song.',
                examples: ['previous'],
            });
        }

        async run(msg: Message) {
            if (!msg.member?.voice.channel) {
                return msg.lineReply('You need to be in a voice channel lmao');
            }

            const queue =
                queues.get(msg.guild.id) ?? (queues.set(msg.guild.id, new Queue()).get(msg.guild.id) as Queue);

            return msg.channel.send(new MessageEmbed(queue.prev()));
        }
    };