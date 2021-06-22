import {
    DMChannel,
    MessageEmbed,
    NewsChannel,
    StreamDispatcher,
    TextChannel,
    VoiceConnection,
    Collection,
} from 'discord.js';

import * as ytdl from 'ytdl-core-discord';

type SongState = 'queued' | 'playing' | 'paused' | 'played';

interface SongInterface {
    name: string;
    url: string;
    thumbnail: string;
    totalLength: string;
    elapsed: number;
    caller: string | null;
    state: SongState;
}

export class Song implements SongInterface {
    public name: string;
    public url: string;
    public thumbnail: string;
    public totalLength: string;
    public caller: string | null;
    public state: SongState;
    public elapsed: number;

    constructor(props: SongInterface) {
        this.name = props.name;
        this.url = props.url;
        this.thumbnail = props.thumbnail;
        this.totalLength = props.totalLength;
        this.caller = props.caller;
        this.state = props.state ?? 'queued';
        this.elapsed = props.elapsed ?? 0;
    }
}

interface QueueInterface {
    items: Song[];
    channel: VoiceConnection;
    dispatcher: StreamDispatcher;
    msgChannel: TextChannel | DMChannel | NewsChannel;
}

export class Queue implements QueueInterface {
    public items!: Song[];
    public channel!: VoiceConnection;
    public dispatcher!: StreamDispatcher;
    public msgChannel!: TextChannel | DMChannel | NewsChannel;

    constructor() {
        this.items = [];
    }

    async recalcQueue(time?: number, loop?: 'song' | 'queue') {
        if (this.items.length === 0) return;

        const firstIndOfQueued = this.items.findIndex(val => val.state === 'queued');

        let indOfPlaying = this.items.findIndex(val => val.state === 'playing');
        let playing = this.items[indOfPlaying];

        if (indOfPlaying === -1) {
            if (firstIndOfQueued === -1) {
                if (loop !== 'queue') {
                    await this.msgChannel.send('Queue is now complete');
                    this.channel.disconnect();
                    return;
                }

                await this.msgChannel.send('Queue complete, looping');
                this.items[0].state = 'playing';
            }

            indOfPlaying = firstIndOfQueued;
            playing = this.items[firstIndOfQueued];
            playing.state = 'playing';
        }

        for (const song of this.items.slice(0, indOfPlaying)) {
            song.state = 'played';
        }

        for (const song of this.items.slice(indOfPlaying + 1)) {
            song.state = 'queued';
        }

        const stream = await ytdl(playing.url, { quality: 'highestaudio' });
        this.dispatcher = this.channel.play(stream, { type: 'opus', seek: time });

        await this.msgChannel.send(
            new MessageEmbed({
                title: playing.name,
                image: { url: playing.thumbnail },
                description: 'Now playing',
                url: playing.url,
            })
        );

        this.dispatcher.on('finish', () => {
            loop === 'song' ? null : (playing.state = 'played');
            this.recalcQueue();
        });

        this.dispatcher.on('error', console.log);
        this.dispatcher.on('debug', console.log);
    }

    async addSong(toAdd: Song) {
        this.items.push(new Song({ ...toAdd }));

        if (!this.items.find(item => item.state === 'playing')) {
            await this.recalcQueue();
        }
    }

    async remove(toRemove: Song) {
        this.items = this.items.filter(item => item.url !== toRemove.url);

        if (toRemove.state === 'playing') {
            this.dispatcher.destroy();
            await this.recalcQueue();
        }
    }
}

export const queues = new Collection<string, Queue>();

export const getQ = (key: string) => {
    const existingQ = queues.get(key);
    if (existingQ) {
        return existingQ;
    }

    const newQ = new Queue();
    queues.set(key, newQ);
    return newQ;
};
