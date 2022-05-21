const axios = require("axios").default;
const Express = require("express");
const redis = require("redis");

require("dotenv").config();

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
    }, 30000);
  });

const client = redis.createClient();

client.connect();

const app = Express();

app.use(Express.json());

app.listen(5000, () => {
  console.log("Listening on 5000...");
});

const fetchTweetCounts = async (cryptos) => {
  try {
    const res = await Promise.all(
      cryptos.map((crypto) =>
        axios.get(`https://api.twitter.com/2/tweets/counts/recent?query=${crypto}`, {
          headers: { Authorization: `Bearer ${process.env.TWITTER_TOKEN}` },
        })
      )
    );

    res.map((r) => {
      console.log(
        `${new URLSearchParams(r.request.path).values().next().value}: ${
          r.data.meta.total_tweet_count
        }`
      );
    });
    console.log("\n");
  } catch (error) {
    console.log(error);
  }
};

const run = async () => {
  setInterval(() => {
    fetchTweetCounts(CRYPTOS.slice(0, 5));
  }, 60000);

  await wait();

  setInterval(() => {
    fetchTweetCounts(CRYPTOS.slice(5));
  }, 60000);
};

run();
