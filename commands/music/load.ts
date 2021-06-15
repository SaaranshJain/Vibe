import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { Queue } from '../../queue-class.js';
import { Collection } from 'discord.js';
import * as fs from 'fs';

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

            fs.readFile('./saved-queues.json', { encoding: 'utf-8' }, (err, data: string) => {
                if (err) {
                    console.log(err);
                } else {
                    const existingQueues = JSON.parse(data);

                    if (!existingQueues[msg.author.id] || !existingQueues[msg.author.id][msg.guild.id]) {
                        msg.lineReply('You have no saved queues for this server lol save something first');
                    } else {
                        queue.items = existingQueues[msg.author.id][msg.guild.id];
                        queue.msgChannel = msg.channel;

                        msg.member?.voice.channel?.join().then(chan => {
                            if (!chan) {
                                msg.lineReply("Couldn't connect to voice channel ono");
                            } else {
                                queue.channel = chan;
                                queue.recalcQueue();
                                msg.lineReply('Loaded saved queue!');
                            }
                        });
                    }
                }
            });

            return null;
        }
    };
