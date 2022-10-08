const {
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    ApplicationCommandType,
    EmbedBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    SelectMenuBuilder,
    Client,
    ButtonStyle,
    ButtonBuilder
} = require('discord.js')

module.exports = {
    data: new ContextMenuCommandBuilder().setName('report').setType(ApplicationCommandType.User),
    /**
     * @param {ContextMenuCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const report_channel_id = 1234567890123456789 // Here you must use the channel's id you want the reports to arrive in [Your bot must have access to it]
        const role_to_notify = 1234567890123456789 // Here you must use the role's id you want to notify
        const embed_color = 'Purple' // Change for any acceptable embed color

        const target = await interaction.guild.members.fetch(interaction.targetId)
        const report_channel = client.channels.cache.get(report_channel_id)
        const embed = new EmbedBuilder().setColor(embed_color).setDescription(`Thank you for your anonymous report <@${interaction.user.id}>`)

        const modal = new ModalBuilder().setCustomId('report-modal').setTitle('❗ Report a User')
        const message = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('report-message')
                .setLabel('Report Message')
                .setPlaceholder('Describe in few words why do you report this user.')
                .setStyle(TextInputStyle.Paragraph)
                .setMinLength(10)
                .setMaxLength(500)
                .setRequired(true)
        )
        modal.addComponents(message)
        await interaction.showModal(modal)

        const modal_submit = await interaction.awaitModalSubmit({
            filter: (i) => {
                embed.addFields(
                    { name: 'Reported user', value: `<@${target.user.id}>`, inline: true },
                    { name: 'Reason', value: `${i.fields.getTextInputValue('report-message')}`, inline: true }
                )
                return true
            }, time: 60 * 60 * 1000
        })
        await modal_submit.reply({ embeds: [embed], ephemeral: true })

        const report = new EmbedBuilder().setColor(embed_color)
            .setTitle('A new report has arrived !')
            .setDescription(`Hello <@${role_to_notify}>, a new report has arrived in our server.`)
            .addFields(
                { name: 'From', value: `<@${interaction.user.id}>`, inline: true }, 
                { name: 'To', value: `<@${target.user.id}>`, inline: true }, 
                { name: 'Reason', value: modal_submit.fields.getTextInputValue('report-message'), inline: true }, 
                { name: 'Date', value: `<t:${parseInt(Date.now() / 1000)}:F>`, inline: true }, 
                { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true }
            )
        const report_message = await report_channel.send({ embeds: [report], fetchReply: true })
        try {
            report_message.react(':white_check_mark:')
            report_message.react(':x:')
       } catch (error) { console.error(error) } 

        const thread = await report_message.startThread({
            name: `'${interaction.user.username}' reported '${target.user.username}' for '${modal_submit.fields.getTextInputValue('report-message')}'`,
            autoArchiveDuration: 10080,
            reason: modal_submit.fields.getTextInputValue('report-message'),
        })
        const component = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('archive-current-thread')
                .setLabel('Archive Current Thread')
                .setStyle(ButtonStyle.Primary)
                .setEmoji({ name: 'x' })
        )
        thread.send({ content: `||<@${role_to_notify}>||`, components: [component] })
    }
}
