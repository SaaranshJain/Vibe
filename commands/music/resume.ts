import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { getQ } from '../../queue-class.js';

export default class ResumeCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'resume',
            aliases: ['r', 're'],
            group: 'music',
            memberName: 'resume',
            description: 'Resumes the paused song',
            examples: ['resume'],
        });
    }

    async run(msg: Message) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        if (queue.items.length <= 0) {
            return msg.lineReply('No songs playing');
        }

        queue.dispatcher.resume();
        queue.dispatcher.pause();
        queue.dispatcher.resume();

        return null;
    }
}
