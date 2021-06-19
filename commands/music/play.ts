import * as Commando from 'discord.js-commando';
import axios from 'axios';
import 'discord-reply';
import { Song } from '../../queue-class.js';
import { MessageEmbed } from 'discord.js';
import { getQ } from '../../queue-class.js';

export default class PlayCommand extends Commando.Command {
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

        const queue = getQ(msg.guild.id);

        const urlSearchPattern = /"videoId"\s*:\s*"(.*?)"/i;
        const titleSearchPattern = /"title":{"runs":\[{"text":"(.*?)"[,}]/i;
        const videoLengthSearchPattern = /"simpletext"\s*:\s*"((\d+:)?\d+:\d+)"/i;
        const thumbnailSearchPattern =
            /"thumbnails"\s*:\s*\[\{"url"\s*:\s*"(.*?)"\s*,\s*"width"\s*:\s*(\d+)\s*,\s*"height"\s*:\s*(\d+)/i;

        const res = await axios.get<string>(`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`);

        const data = {
            url: `https://www.youtube.com/watch?v=${res.data.match(urlSearchPattern)?.[1]}`,
            title: `${res.data.match(titleSearchPattern)?.[1]}`,
            length: `${res.data.match(videoLengthSearchPattern)?.[1]}`,
            thumbnail: `${res.data.match(thumbnailSearchPattern)?.[1]}`,
        };

        data.title = decodeURIComponent(JSON.parse(`"${data.title}"`));
        data.thumbnail = data.thumbnail.startsWith('//') ? 'https:' + data.thumbnail : data.thumbnail;

        if (!data.url || !data.title || !data.length || !data.thumbnail || data.title.startsWith('No results')) {
            return msg.lineReply("What are you searching smh I couldn't even find it");
        }

        if (queue.items.length <= 0) {
            queue.channel = await msg.member.voice.channel.join();
            queue.msgChannel = msg.channel;
        }

        if (queue.items.find(song => song.state === 'playing')) {
            await msg.channel.send(
                new MessageEmbed({
                    title: data.title,
                    thumbnail: { url: data.thumbnail },
                    description: 'Added to queue',
                    url: data.url,
                })
            );
        }

        await queue.addSong(
            new Song({
                caller: msg.member.id,
                elapsed: 0,
                name: data.title,
                state: 'queued',
                thumbnail: data.thumbnail,
                totalLength: data.length,
                url: data.url,
            })
        );

        return null;
    }
}
