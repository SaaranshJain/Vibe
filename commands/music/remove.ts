import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { Queue } from '../../queue-class.js';
import { Collection, MessageEmbed } from 'discord.js';

export default (queues: Collection<string, Queue>) =>
    class RemoveCommand extends Commando.Command {
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

            const queue =
                queues.get(msg.guild.id) ?? (queues.set(msg.guild.id, new Queue()).get(msg.guild.id) as Queue);

            if (name === 'all') {
                queue.items = [];
                queue.dispatcher.destroy();
                queue.channel.disconnect();
                return msg.lineReply('Cleared queue!');
            }

            outer: for (const corpusItem of queue.items) {
                let currIndex = corpusItem.name.toLowerCase().indexOf(name.toLowerCase()[0]);

                if (currIndex === -1) {
                    continue;
                }

                for (let i = 1; i < name.toLowerCase().length; i++) {
                    let nextIndex = corpusItem.name
                        .toLowerCase()
                        .slice(currIndex + 1)
                        .indexOf(name.toLowerCase()[i]);

                    if (nextIndex === -1) {
                        continue outer;
                    } else {
                        currIndex += nextIndex + 1;
                    }
                }

                queue.remove(corpusItem);

                return msg.channel.send(
                    new MessageEmbed({
                        title: corpusItem.name,
                        description: 'Removed from queue',
                        thumbnail: { url: corpusItem.thumbnail },
                        url: corpusItem.url,
                    })
                );
            }

            return msg.lineReply('Song not found');
        }
    };
