// handlers/reportHandler.js

const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js')
const botTestChannelId = process.env.BOTTESTCHANNELID
const adminRoleId = process.env.ADMINROLEID
const supportCategoryId = process.env.SUPPORTCATID

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
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        const channelName = `${interaction.user.username}-report-${randomNum}`
        const guild = interaction.guild
        const category = guild.channels.cache.get(supportCategoryId)

        const reportChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          topic: 'Anonymous report channel',
          parent: category || null,
          permissionOverwrites: [
            {
              id: interaction.user.id,
              allow: ['ViewChannel', 'SendMessages'],
            },
            {
              id: adminRoleId,
              allow: ['ViewChannel', 'SendMessages'],
            },
            {
              id: guild.roles.everyone.id,
              deny: ['ViewChannel'],
            },
          ],
        })

        // Start with a "Claim Ticket" button
        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('Claim Ticket')
            .setStyle(ButtonStyle.Primary)
        )

        await reportChannel.send({
          content: `Thank you for taking the time to file this report. A moderator will join you shortly to address the matter.`,
          components: [actionRow],
        })

        await reportChannel.send({ embeds: [reportEmbed] })
        await interaction.reply({ content: 'Your report has been sent to the staff in a private channel.', ephemeral: true })
      } else {
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

    client.on('interactionCreate', async (buttonInteraction) => {
      if (!buttonInteraction.isButton()) return
      const channel = buttonInteraction.channel
      const adminChannel = client.channels.cache.get(botTestChannelId)

      // Ensure only admins can interact with the buttons
      if (!buttonInteraction.member.roles.cache.has(adminRoleId)) {
        await buttonInteraction.reply({ content: 'Only admins can interact with this button.', ephemeral: true })
        return
      }

      if (buttonInteraction.customId === 'claim_ticket') {
        await buttonInteraction.reply({ content: `This ticket has been claimed by ${buttonInteraction.user.tag}.`, ephemeral: true })
        await channel.send(`<@${buttonInteraction.user.id}> has claimed this ticket.`)

        // Change the button to "Close Ticket"
        const closeActionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Secondary)
        )
        await buttonInteraction.message.edit({ components: [closeActionRow] })
      }

      if (buttonInteraction.customId === 'close_ticket') {
        await buttonInteraction.reply({ content: `The ticket is being closed by ${buttonInteraction.user.tag}.`, ephemeral: true })
        await channel.send(`🔒 Ticket closed by <@${buttonInteraction.user.id}>.`)

        // Lock the channel from non-admins
        await channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: false })

        const ticketClosedEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('🔒 Ticket Closed')
          .addFields(
            { name: 'ID', value: channel.name, inline: true },
            { name: 'Opened By', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Closed By', value: `<@${buttonInteraction.user.id}>`, inline: true },
            { name: 'Open Time', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: true },
            { name: 'Ticket Name', value: channel.name, inline: true },
            { name: 'Claimed By', value: `${buttonInteraction.user.tag}`, inline: true },
            { name: 'Users', value: `<@${interaction.user.id}>` }
          )
          .setTimestamp()

        await adminChannel.send({ embeds: [ticketClosedEmbed] })

        // Change the button to "Delete Ticket"
        const deleteActionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('delete_ticket')
            .setLabel('Delete Ticket')
            .setStyle(ButtonStyle.Danger)
        )
        await buttonInteraction.message.edit({ components: [deleteActionRow] })
      }

      if (buttonInteraction.customId === 'delete_ticket') {
        await buttonInteraction.reply({ content: `This ticket is being deleted by ${buttonInteraction.user.tag}.`, ephemeral: true })
        await channel.delete()
      }
    })
  })
}
