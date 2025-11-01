module.exports = {
    botToken: "DISCORD_BOT_TOKEN", // discord bot token
    disChannel: "DISCORD_CHANNEL_ID", // discord channel id that the message will be sent in
    messageTemplate: "@everyone [message you would like to accompany] \nhttps://www.youtube.com/watch?v=", // template for message to send
    channelID: "YOUTUBE_CHANNEL_ID", // Youtube channel ID (is not a url, I used this website to find them - https://commentpicker.com/youtube-channel-id.php)
    checkInterval: 30000, // checks every 30 seconds
    includeShorts: false,

    // livestream settings
    youtubeApiKey: "YOUTUBE_API_KEY", // this is required if you want to filter out livestreams as you need to read YouTube video metadata
    includeLives: false,
    includeUpcoming: false, // works in tandem with includeLives. Upcoming is technically live but you may want to promote an upcoming video
}