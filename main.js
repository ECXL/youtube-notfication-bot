const { Client, GatewayIntentBits } = require('discord.js'); // npm i discord.js

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rss = require('rss-converter'); // npm i rss-converter
const fs = require('fs'); // npm i fs
client.config = require('./config.js');


client.on('clientReady', () => { // once you turn on the bot it starts running this code
    console.log("Bot is online!");
    ytNotification();
});

function ytNotification() {
    // initialize links file on startup
    initializeLinksFile();

    setInterval(async () => {
        try {
            let ytFeed = await rss.toJson(`https://www.youtube.com/feeds/videos.xml?channel_id=` + client.config.channelID);
            let includeShorts = client.config.includeShorts;
            let includeLives = client.config.includeLives;
            let foundValidVideo = false;
            let currentItem = 0;

            // validate config
            if (!client.config.channelID) {
                console.error('Error: channelID not configured');
                return;
            }
            
            if (includeLives) { // API Key is only needed if you need to read the metadata for livestreams in order to filter them out
                if (!client.config.youtubeApiKey) {
                    console.error('Error: youtubeApiKey not configured');
                    return;
                }
            }

            // read links file
            let linksOpen, json;
            try {
                linksOpen = fs.readFileSync('links.json', 'utf8');
                json = JSON.parse(linksOpen);
                
                // ensure json is an array
                if (!Array.isArray(json)) {
                    console.warn('links.json is not an array, resetting...');
                    json = [];
                }
            } catch (error) {
                console.error('Error reading links.json:', error.message);
                json = [];
            }

            while (!foundValidVideo) {
                let item = ytFeed.items[currentItem]
                
                if (!includeShorts) { // if includeShorts is false, skip shorts when searching for newest video upload
                    if (item.link.includes("shorts")) {
                        // update item for next loop
                        currentItem++;
                        continue;
                    }
                }

                if (!includeLives) { // if includeLives is false, skip livestreams when searching for newest video upload
                    const isLive = await isLivestream(item.yt_videoId, client.config.youtubeApiKey);
                    if (isLive) {
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
            
            json.push(ytFeed.items[currentItem].yt_videoId); // add any new latest uploads to links file
            
            try {
                let vidLink = JSON.stringify(json);
                fs.writeFileSync('links.json',vidLink); // write it into file as string
            } catch (error) {
                console.error('Error writing to links.json:', error.message);
                // continue anyway to still send Discord message
            }

            // build and send message
            let message = client.config.messageTemplate + ytFeed.items[currentItem].yt_videoId;
            const channel = client.channels.cache.get(client.config.disChannel);
            
            if (!channel) {
                console.error('Error: Discord channel not found');
                return;
            }
            
            try {
                await channel.send(message);
                console.log('Notification sent successfully!');
            } catch (error) {
                console.error('Error sending Discord message:', error.message);
            }
        
        } catch(error) {
            console.error('Unexpected error in ytNotification:', error)
        }  
    }, client.config.checkInterval); // every 30 seconds
}

function initializeLinksFile() {
    try {
        if (!fs.existsSync('links.json')) {
            console.log('links.json not found, creating new file...');
            fs.writeFileSync('links.json', JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error initializing links.json:', error.message);
        throw error;
    }
}

async function isLivestream(videoId, apiKey) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,liveStreamingDetails,status&id=${videoId}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const video = data.items[0];
            // check if video has liveStreamingDetails or if liveBroadcastContent indicates live/upcoming
            let isLive;
            if (client.config.includeUpcoming) {
                isLive = (video.snippet.liveBroadcastContent === 'live' || 
                          video.hasOwnProperty('liveStreamingDetails')) &&
                          video.snippet.liveBroadcastContent != 'upcoming';
            } else {
                isLive = video.snippet.liveBroadcastContent === 'live' || 
                          video.snippet.liveBroadcastContent === 'upcoming' ||
                          video.hasOwnProperty('liveStreamingDetails');
            }
            return isLive;
        }

        return false;
    } catch (error) {
        console.error('Error checking livestream status:', error);
        return false; // if there's an error, assume it's not a livestream to avoid blocking
    }
}

client.login(client.config.botToken); // logs in to your bot