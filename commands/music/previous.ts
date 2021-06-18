import * as Commando from 'discord.js-commando';
import 'discord-reply';
import { MessageEmbed } from 'discord.js';
import { getQ } from '../../queue-class.js';

export default class PreviousCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'previous',
            aliases: ['pre', 'before'],
            group: 'music',
            memberName: 'previous',
            description: 'Goes back to the previous song.',
            examples: ['previous'],
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
            await msg.lineReply('Nothing currently playing, starting from the end');
            queue.items[queue.items.length - 1].state = 'playing';
            queue.channel = await msg.member.voice.channel.join();
            await queue.recalcQueue();
            return null;
        }

        if (indOfPlaying === 0) {
            return msg.lineReply('Already on the first song!');
        }

        queue.items[indOfPlaying].state = 'queued';

        const nowPlaying = queue.items[indOfPlaying - 1];
        nowPlaying.state = 'playing';

        await queue.recalcQueue();
        return null;
    }
}
