import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { Queue } from '../../queue-class.js';
import { Collection } from 'discord.js';

export default (queues: Collection<string, Queue>) =>
    class SeekCommand extends Commando.Command {
        constructor(client: Commando.CommandoClient) {
            super(client, {
                name: 'seek',
                group: 'music',
                memberName: 'seek',
                description: 'Seeks forward',
                examples: ['seek 10'],
                args: [{
                    key: "time",
                    type: "string",
                    prompt: "Please enter the time jump",
                    label: "time"
                }]
            });
        }

        async run(msg: Message, { time }: { time: string }) {
            if (!msg.member?.voice.channel) {
                return msg.lineReply('You need to be in a voice channel lmao');
            }

            const queue =
                queues.get(msg.guild.id) ?? (queues.set(msg.guild.id, new Queue()).get(msg.guild.id) as Queue);

            queue.recalcQueue(parseInt(time));
            
            return null;
        }
    };
