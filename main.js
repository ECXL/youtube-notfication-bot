const Discord = require("discord.js"); //npm npm i discord.js

const client = new Discord.Client({ intents: [] });

const rss = require('rss-converter'); //npm i rss-converter
const fs = require('fs'); //npm i fs
client.config = require('./config.js');


client.on('ready', () => { //once you turn on the bot it starts running this code
    console.log("Bot is online!");
    ytNotification();
});


function ytNotification() {
    setInterval(async () => {
        let ytFeed = await rss.toJson(`https://www.youtube.com/feeds/videos.xml?channel_id=` + client.config.channelID);
        let linksOpen = fs.readFileSync('links.json');
        let json = JSON.parse(linksOpen);
        if (linksOpen.includes(ytFeed.items[0].yt_videoId)) {
            return; //if the link is the same as the latest upload parsed then return
        }
        json.push(ytFeed.items[0].yt_videoId); //add any new latest uploads to links file
        let vidLink = JSON.stringify(json);
        fs.writeFileSync('links.json',vidLink); //write it into file as string
        let message = client.config.messageTemplate + ytFeed.items[0].yt_videoId; //build message to be sent to chat
        const channel = client.channels.cache.get(client.config.disChannel); //defines the channel to send the message to
        channel.send(message); //sends the message
               
    }, client.config.checkInterval); //every 30 seconds
}
client.login(client.config.botToken); //logs in to your bot