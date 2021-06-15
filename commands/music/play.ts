import * as Commando from 'discord.js-commando';
import axios from 'axios';
import 'discord-reply';
import { Queue, Song } from '../../queue-class.js';
import { MessageEmbed, Collection } from 'discord.js';

export default (queues: Collection<string, Queue>) =>
    class PlayCommand extends Commando.Command {
        constructor(client: Commando.CommandoClient) {
            super(client, {
                name: 'play',
                aliases: ['p', 'start'],
                group: 'music',
                memberName: 'play',
                description: 'Plays the song if queue is empty or adds the song to queue',
                examples: ['play Never gonna give you up'],
                args: [
                    {
                        key: 'name',
                        label: 'name',
                        prompt: 'Please provide the name of the song you would like to play',
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

            const urlSearchPattern = /"videoId"\s*:\s*"(.*?)"/i;
            const titleSearchPattern = /"title":{"runs":\[{"text":"(.*?)"[,}]/i;
            const videoLengthSearchPattern = /"simpletext"\s*:\s*"((\d+:)?\d+:\d+)"/i;
            const thumbnailSearchPattern =
                /"thumbnails"\s*:\s*\[\{"url"\s*:\s*"(.*?)"\s*,\s*"width"\s*:\s*(\d+)\s*,\s*"height"\s*:\s*(\d+)/i;

            const res = await axios.get<string>(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`
            );

            const data = {
                url: `https://www.youtube.com/watch?v=${res.data.match(urlSearchPattern)?.[1]}`,
                title: `${res.data.match(titleSearchPattern)?.[1]}`,
                length: `${res.data.match(videoLengthSearchPattern)?.[1]}`,
                thumbnail: `${res.data.match(thumbnailSearchPattern)?.[1]}`,
            };

            if (!data.url || !data.title || !data.length || !data.thumbnail || data.title === 'No results found') {
                return msg.lineReply("What are you searching smh I couldn't even find it");
            }

            if (queue.items.length <= 0) {
                const chan = await msg.member?.voice.channel?.join();

                if (!chan) {
                    return msg.lineReply("Couldn't connect to voice channel ono");
                }

                queue.channel = chan;
                queue.msgChannel = msg.channel;
            }

            const description = queue.items.find(val => val.state === 'playing') ? 'Added to queue' : 'Now playing';

            const imgState = queue.items.find(val => val.state === 'playing')
                ? {
                      thumbnail: { url: data.thumbnail },
                  }
                : {
                      image: { url: data.thumbnail },
                  };

            queue.addSong(
                new Song({
                    caller: msg.member,
                    elapsed: 0,
                    name: data.title,
                    state: 'queued',
                    thumbnail: data.thumbnail,
                    totalLength: data.length,
                    url: data.url,
                })
            );

            return msg.channel.send(
                new MessageEmbed({
                    title: data.title,
                    ...imgState,
                    description,
                    url: data.url,
                })
            );
        }
    };
