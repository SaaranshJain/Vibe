import * as Commando from 'discord.js-commando';
import 'discord-reply';
import * as fs from 'fs/promises';

export default class ViewCommand extends Commando.Command {
    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'view',
            aliases: ['v', 'weuew'],
            group: 'music',
            memberName: 'view',
            description: 'Displays all your saved queues',
            examples: ['view'],
        });
    }

    async run(msg: Message) {
        try {
            const data = await fs.readFile('./saved-queues.json', { encoding: 'utf-8' });
            const existingQueues = JSON.parse(data);

            if (!existingQueues[msg.author.id]) {
                return msg.lineReply('You have no saved queues lol save something first');
            }

            return msg.lineReply(
                'Your saved queues - ' +
                    '\n' +
                    '```\n' +
                    Object.keys(existingQueues[msg.author.id]).reduce((a, v) => `${a}\n${v}`) +
                    '\n```'
            );
        } catch (err) {
            console.log(err);
        }

        return null;
    }
}
