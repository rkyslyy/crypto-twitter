const axios = require("axios").default;

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

const run = async () => {
  try {
    const res = await Promise.all(
      CRYPTOS.map((crypto) =>
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

run();
