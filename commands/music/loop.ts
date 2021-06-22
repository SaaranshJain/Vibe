import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { getQ } from '../../queue-class.js';

export default class LoopCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'loop',
            aliases: ['loo'],
            group: 'music',
            memberName: 'loop',
            description: 'Loops the specified argument',
            examples: ['loop song', 'loop queue'],
            args: [
                {
                    key: 'type',
                    label: 'type',
                    prompt: 'Please tell me if you would like to loop the queue or the current song (song/queue)',
                    type: 'string',
                },
            ],
        });
    }

    async run(msg: Message, { type }: { type: string }) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        if (type === 'song' || type === 'queue') {
            const queue = getQ(msg.guild.id);
            queue.recalcQueue(undefined, type);
            return null;
        }

        return msg.lineReply('Not a valid argument - must be `song` or `queue`');
    }
}
