import {
    DMChannel,
    GuildMember,
    MessageEmbed,
    NewsChannel,
    StreamDispatcher,
    TextChannel,
    VoiceConnection,
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

    getLengthInMillis() {
        const timeData = this.totalLength.split(':');
        let millis = 0;

        if (timeData.length === 1) {
            millis = parseInt(timeData[0]) * 1000;
        } else if (timeData.length === 2) {
            millis = parseInt(timeData[0]) * 60 * 1000 + parseInt(timeData[1]) * 1000;
        } else if (timeData.length === 3) {
            millis =
                parseInt(timeData[2]) * 60 * 60 * 1000 +
                parseInt(timeData[1]) * 60 * 1000 +
                parseInt(timeData[0]) * 1000;
        }

        return millis;
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
        this.items = []
    }

    recalcQueue() {
        if (this.items.length === 0) return;

        let indOfPlaying = this.items.findIndex(val => val.state === 'playing');
        const firstIndOfQueued = this.items.findIndex(val => val.state === 'queued');

        if (indOfPlaying === -1) {
            if (firstIndOfQueued === -1) {
                return;
            }

            indOfPlaying = firstIndOfQueued;
            this.items[indOfPlaying].state = 'playing';
        }

        ytdl(this.items[indOfPlaying].url, { quality: 'highestaudio' })
            .then(val => this.channel.play(val, { type: 'opus' }))
            .then(dispatcher => {
                this.dispatcher = dispatcher;
                this.dispatcher.on('finish', () => {
                    this.items[indOfPlaying].state = 'played';

                    if (indOfPlaying !== this.items.length - 1) {
                        this.items[indOfPlaying + 1].state = 'playing';
                        this.msgChannel.send(
                            new MessageEmbed({
                                title: this.items[indOfPlaying + 1].name,
                                image: { url: this.items[indOfPlaying + 1].thumbnail },
                                description: 'Now playing',
                                url: this.items[indOfPlaying + 1].url,
                            })
                        );
                        this.recalcQueue();
                    } else {
                        this.msgChannel.send('Queue is now complete');
                        this.channel.disconnect();
                    }
                });
                this.dispatcher.on('error', err => console.log({ err }));
                this.dispatcher.on('debug', info => console.log({ info }));
            });

        for (let i = 0; i < indOfPlaying; i++) {
            this.items[i].state = 'played';
        }

        for (let i = indOfPlaying + 1; i < this.items.length; i++) {
            this.items[i].state = 'queued';
        }
    }

    addSong(toAdd: Song) {
        this.items.push(new Song({ ...toAdd }));

        if (!this.items.find(item => item.state === 'playing')) {
            this.recalcQueue();
        }
    }

    remove(toRemove: Song) {
        this.items = this.items.filter(item => item.url !== toRemove.url);

        if (toRemove.state === 'playing') {
            this.dispatcher.destroy();
            this.recalcQueue();
        }
    }

    next() {
        const indOfPlaying = this.items.findIndex(val => val.state === 'playing');
        const indOfQueued = this.items.findIndex(val => val.state === 'queued');
        const playing = this.items[indOfPlaying];
        const queuedFirst = this.items[indOfQueued];
        let toReturn;

        playing.state = 'played';
        this.dispatcher.destroy();

        if (indOfPlaying !== this.items.length - 1) {
            queuedFirst.state = 'playing';
            toReturn = {
                title: queuedFirst.name,
                image: { url: queuedFirst.thumbnail },
                description: 'Now playing',
                url: queuedFirst.url,
            };
        }

        this.recalcQueue();

        return toReturn;
    }

    prev() {
        const indOfPlaying = this.items.findIndex(val => val.state === 'playing');
        const indOfPlayed = this.items.findIndex(val => val.state === 'played');
        const playing = this.items[indOfPlaying];
        const playedLast = this.items[indOfPlayed];

        playing ? playing.state = 'queued' : null;
        playedLast ? playedLast.state = 'playing' : null;

        this.dispatcher.destroy();
        this.recalcQueue();

        return {
            title: playedLast.name,
            image: { url: playedLast.thumbnail },
            description: 'Now playing',
            url: playedLast.url,
        };
    }
}
