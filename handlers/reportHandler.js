// events/reportHandler.js

const { ChannelType, EmbedBuilder } = require('discord.js')
const botTestChannelId = process.env.MODERATORCHANNELID
const modRoleId = process.env.ADMINROLEID

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return

    if (interaction.customId === 'anonymousReport') {
      const reportInfo = interaction.fields.getTextInputValue('reportInfo')
      const reportLinks = interaction.fields.getTextInputValue('reportLinks') || 'No links provided'
      const reportVisibility = interaction.fields.getTextInputValue('reportVisibility').trim()

      const reportEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Anonymous Report')
        .addFields(
          { name: 'Information', value: reportInfo },
          { name: 'Links', value: reportLinks },
          { name: 'Reported By', value: reportVisibility ? `<@${interaction.user.id}>` : 'Anonymous' }
        )
        .setTimestamp()

      if (reportVisibility) {
        // Generate a random 4-digit number for a unique channel name
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        const channelName = `${randomNum}-${interaction.user.username}-report`

        const guild = interaction.guild

        const reportChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          topic: 'Anonymous report channel',
          permissionOverwrites: [
            {
              id: interaction.user.id,
              allow: ['ViewChannel', 'SendMessages'],
            },
            {
              id: modRoleId,
              allow: ['ViewChannel', 'SendMessages'],
            },
            {
              id: guild.roles.everyone.id,
              deny: ['ViewChannel'],
            },
          ],
        })

        // Send a welcome message to the user
        await reportChannel.send({
          content: `Thank you for taking the time to file this report. A moderator will join you shortly to address the matter.`,
        })

        // Send the report embed
        await reportChannel.send({ embeds: [reportEmbed] })
        await interaction.reply({ content: 'Your report has been sent to the staff in a private channel.', ephemeral: true })
      } else {
        // Post anonymously in the bot test channel
        const botTestChannel = client.channels.cache.get(botTestChannelId)
        if (botTestChannel) {
          await botTestChannel.send({ embeds: [reportEmbed] })
          await interaction.reply({ content: 'Your anonymous report has been submitted to the staff.', ephemeral: true })
        } else {
          console.error('Bot test channel not found.')
          await interaction.reply({ content: 'An error occurred while submitting your report.', ephemeral: true })
        }
      }
    }
  })
}
