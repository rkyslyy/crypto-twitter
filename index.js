require("dotenv").config();

const axios = require("axios").default;
const cors = require("cors");
const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const redis = require("redis");
const client = redis.createClient();

const socketUsers = [];

app.use(cors());

client.connect();

app.get("/", async (req, res) => {
  res.send(await client.hGetAll("cryptos"));
});

io.on("connection", (socket) => {
  socketUsers.push(socket);

  socket.on("disconnect", (socket) => {
    var i = socketUsers.indexOf(socket);
    socketUsers.splice(i, 1);
    console.log("a user disconnected");
  });

  console.log("a user connected");
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});

const CRYPTOS = [
  "Bitcoin",
  "Etherium",
  "XRP",
  "Tether",
  "Cardano",
  "Polkadot",
  "Stellar",
  "USD Coin",
  "Dogecoin",
  "Chainlink",
];

const wait = () =>
  new Promise((res) => {
    setTimeout(() => {
      res();
    }, 3000);
  });

const fetchTweetCounts = async (cryptos) => {
  try {
    const response = await Promise.all(
      cryptos.map((crypto) =>
        axios.get(`https://api.twitter.com/2/tweets/counts/recent?query=${crypto}`, {
          headers: { Authorization: `Bearer ${process.env.TWITTER_TOKEN}` },
        })
      )
    );

    response.forEach((r) => {
      client.hSet(
        "cryptos",
        new URLSearchParams(r.request.path).values().next().value,
        r.data.meta.total_tweet_count
      );
    });

    const res = await client.hGetAll("cryptos");

    socketUsers.forEach((user) => {
      user.emit("count-update", res);
    });
  } catch (error) {
    console.log(error);
  }
};

const run = async () => {
  for (let i = 0; i < CRYPTOS.length / 2; i++) {
    setInterval(() => {
      fetchTweetCounts(CRYPTOS.slice(i * 1, i * 1 + 1));
    }, 30000);

    await wait();
  }
};

run();
