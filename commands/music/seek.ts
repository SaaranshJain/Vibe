import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { getQ } from '../../queue-class';

export default class SeekCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'seek',
            group: 'music',
            memberName: 'seek',
            description: 'Seeks forward',
            examples: ['seek 10'],
            args: [
                {
                    key: 'time',
                    type: 'string',
                    prompt: 'Please enter the time jump',
                    label: 'time',
                },
            ],
        });
    }

    async run(msg: Message, { time }: { time: string }) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);
        await queue.recalcQueue(parseInt(time));

        return null;
    }
}
