import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { Queue } from '../../queue-class.js';
import { Collection } from 'discord.js';

export default (queues: Collection<string, Queue>) =>
    class ResumeCommand extends Commando.Command {
        constructor(client: Commando.CommandoClient) {
            super(client, {
                name: 'resume',
                aliases: ['r', 're'],
                group: 'music',
                memberName: 'resume',
                description: 'Resumes the paused song',
                examples: ['resume'],
            });
        }

        async run(msg: Message) {
            if (!msg.member?.voice.channel) {
                return msg.lineReply('You need to be in a voice channel lmao');
            }

            const queue =
                queues.get(msg.guild.id) ?? (queues.set(msg.guild.id, new Queue()).get(msg.guild.id) as Queue);

            queue.dispatcher.resume();
            queue.dispatcher.pause();
            queue.dispatcher.resume();
            
            return null;
        }
    };
