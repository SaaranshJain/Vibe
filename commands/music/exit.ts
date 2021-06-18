import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { getQ } from '../../queue-class.js';

export default class ExitCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'exit',
            aliases: ['x', 'quit'],
            group: 'music',
            memberName: 'exit',
            description: 'Disconnects the bot from vc',
            examples: ['exit'],
        });
    }

    async run(msg: Message) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        if (!queue.channel) {
            return msg.lineReply('Not connected bruh');
        }

        queue.channel.disconnect();
        return null;
    }
}
