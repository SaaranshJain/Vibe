import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { Queue } from '../../queue-class.js';
import { Collection } from 'discord.js';
import * as fs from 'fs/promises';

export default (queues: Collection<string, Queue>) =>
    class LoadCommand extends Commando.Command {
        constructor(client: Commando.CommandoClient) {
            super(client, {
                name: 'import',
                aliases: ['i', 'im'],
                group: 'music',
                memberName: 'import',
                description: 'Imports the queue for this guild',
                examples: ['import'],
            });
        }

        async run(msg: Message) {
            if (!msg.member?.voice.channel) {
                return msg.lineReply('You need to be in a voice channel lmao');
            }

            const queue =
                queues.get(msg.guild.id) ?? (queues.set(msg.guild.id, new Queue()).get(msg.guild.id) as Queue);

            try {
                const data = await fs.readFile('./saved-queues.json', { encoding: 'utf-8' });
                const existingQueues = JSON.parse(data);

                if (!existingQueues[msg.author.id] || !existingQueues[msg.author.id][msg.guild.id]) {
                    return msg.lineReply('You have no saved queues for this server lol save something first');
                }

                queue.items = existingQueues[msg.author.id][msg.guild.id];
                queue.channel = await msg.member.voice.channel.join();
                
                
                queue.channel.on("disconnect", () => {
                    queues.delete(msg.guild?.id);
                });

                queue.msgChannel = msg.channel;
                queue.recalcQueue();
                
                return msg.lineReply('Loaded saved queue!');
            } catch (err) {
                console.log(err);
            }

            return null;
        }
    };
