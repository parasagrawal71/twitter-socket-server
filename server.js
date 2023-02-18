const Twit = require("twit");
require("dotenv").config();
const webSocketsServerPort = process.env.PORT || 6002;
const webSocketServer = require("websocket").server;
const http = require("http");
const server = http.createServer();
server.listen(webSocketsServerPort);
const wsServer = new webSocketServer({
  httpServer: server,
  cors: true,
});

// Generates unique ID for every new connection
const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

const clients = {};

wsServer.on("request", function (request) {
  const path = request && request.resourceURL && request.resourceURL.path;
  const tempArr = path && path.substr(1, path.length).split("&");
  const dataArray =
    tempArr && tempArr.map((item) => item && item.split("=")[1]);
  const oauth_token = dataArray[0];
  const oauth_token_secret = dataArray[1];
  const screen_name = dataArray[2];

  const userID = getUniqueID();
  console.log(
    new Date() + ` Recieved a new connection from origin ${request.origin}.`
  );

  const connection = request.accept(null, request.origin);
  clients[userID] = {
    connection,
    oauth_token,
    oauth_token_secret,
    screen_name,
  };

  console.log(`Connected: ${userID} in ${Object.getOwnPropertyNames(clients)}`);

  for (const client of Object.keys(clients)) {
    const { oauth_token, oauth_token_secret } = clients[client];
    if (
      !oauth_token ||
      oauth_token === "undefined" ||
      !oauth_token_secret ||
      oauth_token_secret === "undefined"
    ) {
      continue;
    }
    const T = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: oauth_token,
      access_token_secret: oauth_token_secret,
      timeout_ms: 60 * 1000,
      strictSSL: true,
    });

    const stream = T.stream("statuses/filter", {
      track: `@${clients[client].screen_name}`,
    });

    stream &&
      stream.on("tweet", function (tweet) {
        // console.log("tweet", tweet);
        clients[client] &&
          clients[client].connection.sendUTF(
            JSON.stringify({ type: "NEW_TWEET", data: tweet })
          );
      });
  }

  connection.on("close", function (connection) {
    console.log(`${new Date()} Peer ${userID} disconnected`);
    delete clients[userID];
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  process.exit(1);
});
