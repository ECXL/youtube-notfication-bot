const { Client, GatewayIntentBits } = require('discord.js'); // npm i discord.js

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rss = require('rss-converter'); //npm i rss-converter
const fs = require('fs'); //npm i fs
client.config = require('./config.js');


client.on('clientReady', () => { //once you turn on the bot it starts running this code
    console.log("Bot is online!");
    ytNotification();
});


function ytNotification() {
    setInterval(async () => {
        let ytFeed = await rss.toJson(`https://www.youtube.com/feeds/videos.xml?channel_id=` + client.config.channelID);
        let linksOpen = fs.readFileSync('links.json');
        let json = JSON.parse(linksOpen);
        let includeShorts = client.config.includeShorts;
        let includeLives = client.config.includeLives;
        let foundValidVideo = false;
        let currentItem = 0;

        while (!foundValidVideo) {
            let item = ytFeed.items[currentItem]
            
            if (!includeShorts) { // if includeShorts is false, skip shorts when searching for newest video upload
                if (item.link.includes("shorts")) {
                    // update item for next loop
                    currentItem++;
                    continue;
                }
            }
            
            // found a valid video to post
            foundValidVideo = true;
        }

        // if the link has previously been posted, it recognises that the newest video has already been posted
        if (linksOpen.includes(ytFeed.items[currentItem].yt_videoId)) {
            return;
        }
        console.log("New video uploaded! Sending notification to Discord...")
        json.push(ytFeed.items[currentItem].yt_videoId); //add any new latest uploads to links file
        let vidLink = JSON.stringify(json);
        fs.writeFileSync('links.json',vidLink); //write it into file as string
        
        let message = client.config.messageTemplate + ytFeed.items[currentItem].yt_videoId; //build message to be sent to chat
        const channel = client.channels.cache.get(client.config.disChannel); //defines the channel to send the message to
        channel.send(message); // sends the message to Discord    
               
    }, client.config.checkInterval); //every 30 seconds
}

client.login(client.config.botToken); //logs in to your bot