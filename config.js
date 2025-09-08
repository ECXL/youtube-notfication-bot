module.exports = {
    botToken: "DISCORD_BOT_TOKEN", //discord bot token
    disChannel: "DISCORD_CHANNEL_ID", //discord channel id that the message will be sent in
    messageTemplate: "@everyone [message you would like to accompany] \nhttps://www.youtube.com/watch?v=", //template for message to send
    channelID: "YOUTUBE_CHANNEL_ID", //Youtube channel ID (is not a url, I used this website to find them - https://commentpicker.com/youtube-channel-id.php)
    checkInterval: 30000, //Checks every 30 seconds
    includeShorts: false,
}