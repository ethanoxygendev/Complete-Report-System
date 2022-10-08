const { CommandInteraction, EmbedBuilder } = require('discord.js')

module.exports = {
    id: 'archive-current-thread',
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        interaction.deferUpdate()

        const thread = interaction.channel
        const embed = new EmbedBuilder().setColor('Purple') // Change for any acceptable embed color
            .setDescription(`Thread has been archived by <@${interaction.user.id}>`)

        await thread.setLocked(true)
        thread.send({ embeds: [embed] })
    }
}
