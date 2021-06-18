import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { getQ } from '../../queue-class.js';

export default class PauseCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'pause',
            aliases: ['pa', 'stop'],
            group: 'music',
            memberName: 'pause',
            description: 'Pauses the current song',
            examples: ['pause'],
        });
    }

    async run(msg: Message) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        if (!queue.dispatcher) {
            return msg.lineReply('Not even connected bruh');
        }

        if (queue.items.length <= 0) {
            return msg.lineReply('Nothing in queue to pause rn tho');
        }

        queue.dispatcher.pause();
        return null;
    }
}
