import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { MessageEmbed } from 'discord.js';
import { getQ } from '../../queue-class.js';

export default class NextCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'next',
            aliases: ['n', 'skip'],
            group: 'music',
            memberName: 'next',
            description: 'Skips the current song',
            examples: ['next'],
        });
    }

    async run(msg: Message) {
        if (!msg.member?.voice.channel) {
            return msg.lineReply('You need to be in a voice channel lmao');
        }

        const queue = getQ(msg.guild.id);

        if (queue.items.length <= 0) {
            return msg.lineReply('Queue is empty tho');
        }

        const indOfPlaying = queue.items.findIndex(song => song.state === 'playing');

        if (indOfPlaying === -1) {
            await msg.lineReply('Nothing currently playing, starting from beginning');
            queue.items[0].state = 'playing';
            await queue.recalcQueue();
            return null;
        }

        queue.items[indOfPlaying].state = 'played';

        if (indOfPlaying === queue.items.length - 1) {
            return msg.lineReply('Already on the last song');
        }

        const nowPlaying = queue.items[indOfPlaying + 1];
        nowPlaying.state = 'playing';

        await queue.recalcQueue();
        return null;
    }
}
