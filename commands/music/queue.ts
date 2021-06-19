import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { getQ } from '../../queue-class.js';

const milliToStr = (millis: number) => {
    const totalSeconds = Math.round(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString();
    const seconds = (totalSeconds % 60).toString();
    return `${minutes}:${(seconds.length < 2 ? '0' : '') + seconds}`;
};

export default class QueueCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'queue',
            aliases: ['q', 'qu'],
            group: 'music',
            memberName: 'queue',
            description: 'Displays the current queue',
            examples: ['queue'],
        });
    }

    async run(msg: Message) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        if (queue.items.length <= 0) {
            return msg.lineReply('Queue is empty');
        }

        return msg.lineReply(
            '```diff' +
                '\n' +
                `${queue.items.reduce(
                    (a, v) =>
                        a +
                        (v.state === 'playing' ? '+ ' : '  ') +
                        v.name +
                        '\n' +
                        (v.state === 'playing' ? '+ ' : '  ') +
                        '\t' +
                        (v.state === 'playing' ? milliToStr(queue.dispatcher.streamTime) + ' / ' : '') +
                        `${v.totalLength}\n`,
                    ''
                )}` +
                '```'
        );
    }
}
