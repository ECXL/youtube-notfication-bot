# youtube-notfication-bot
Discord bot that notifies users when a new video is posted to a youtube channel

npm install these files

<a href="https://discord.js.org/#/" target="_blank">discord.js</a>
<a href="https://www.npmjs.com/package/fs" target="_blank">fs</a>
<a href="https://www.npmjs.com/package/rss-converter" target="_blank">rss-converter</a>

cd to this directory and run node .

DISCLAIMER: difference between a previous livestream and premiere is not apparent through YouTube API metadata. However, this branch uses scheduling to help differentiate somewhat. If it is not scheduled then it cannot be a premiere, meaning it definitely is a livestream. However, livestreams can also be scheduled so this is a conditional workaround.