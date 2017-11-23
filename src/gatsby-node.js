const axios = require('axios');
const crypto = require('crypto');

function createHash(obj) {
  return crypto.createHash('md5')
               .update(JSON.stringify(obj))
               .digest('hex');
}

function getTwitchApiVersion(name, clientID) {
  const rateLimit = 500;
  let lastCalled = undefined;

  const rateLimiter = (call) => {
    // Thank you to https://stackoverflow.com/questions/43482639/throttling-axios-requests
    const now = Date.now();
    if (lastCalled) {
      lastCalled += rateLimit;
      const wait = (lastCalled - now);
      if (wait > 0) {
        return new Promise((resolve) => setTimeout(() => resolve(call), wait));
      }
    }
    lastCalled = now;
    return call;
  }

  const api = axios.create({
    baseURL: `https://api.twitch.tv/${name}/`,
  });

  api.defaults.headers.common['Client-ID'] = clientID;
  api.interceptors.request.use(rateLimiter);

  return api;
}

function processDatum(datum, kind) {
  const type = `twitch${kind}`;
  const id = `${type}-${datum.id}`;
  const contentDigest = createHash(datum);

  return {
    ...datum,
    id,
    originalID: `${datum.id}`,
    parent: '__SOURCE__',
    children: [],
    internal: { type, contentDigest }
  };
}

exports.sourceNodes = async ({ boundActionCreators }, { userID, clientID }) => {
  const { createNode } = boundActionCreators;

  var twitchHelix = getTwitchApiVersion('helix', clientID);
  var twitchKraken = getTwitchApiVersion('kraken', clientID);

  try {
    // Fetch data
    const userInfo = await twitchHelix.get(`users?id=${userID}`);
    const videos = await twitchHelix.get(`videos?user_id=${userID}&first=100`);
    // const collections = await twitchKraken.get(`channels/${userID}/collections`);

    // Process data into nodes.
    userInfo.data.data.forEach(datum => createNode(processDatum(datum, 'user')));
    videos.data.data.forEach(datum => createNode(processDatum(datum, 'video')));
    // collections.data.items.forEach(datum => createNode(processDatum(datum)));

    // We're done, return.
    return;

  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
