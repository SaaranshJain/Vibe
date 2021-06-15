type Message = import("discord.js-commando").CommandoMessage & {
    lineReply: (...args: any[]) => Promise<import("discord.js").Message>
    lineReplyNoMention: (...args: any[]) => Promise<import("discord.js").Message>
}