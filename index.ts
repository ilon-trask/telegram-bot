import { Telegraf } from "telegraf";
import axios from "axios";
import { setIntervalAsync } from "set-interval-async/fixed";

const bot = new Telegraf("5932488137:AAE1PT5wJjfRG0BQ_rlz4iHzW_2ikgt3-HY");

const BINANCE_API =
  "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
const BYBIT_API = "https://api.bybit.com/v2/public/tickers?symbol=BTCUSD";
// const OKEX_API = "https://www.okex.com/api/spot/v3/instruments/BTC-USDT/ticker";
const COINBASE_API = "https://api.coinbase.com/v2/prices/BTC-USD/spot";

const getPrices = async () => {
  const binancePrice = await axios.get(BINANCE_API);
  const bybitPrice = await axios.get(BYBIT_API);
  // const okexPrice = await axios.get(OKEX_API);
  const coinbasePrice = await axios.get(COINBASE_API);

  return {
    binance: Number(binancePrice.data.price),
    bybit: Number(bybitPrice.data.result[0].last_price),
    // okex: Number(okexPrice.data.last),
    coinbase: Number(coinbasePrice.data.data.amount),
  };
};

const checkPriceDifference = async () => {
  const prices = await getPrices();
  const maxPrice = Math.max(...Object.values(prices));
  const minPrice = Math.min(...Object.values(prices));
  const diff = (maxPrice - minPrice) / maxPrice;

  if (diff >= 0.01) {
    bot.telegram.sendMessage(
      651494797,
      `Price difference is more than 1%: ${JSON.stringify(prices)}`
    );
    // bot.telegram.reply(
    //   `Price difference is more than 1%: ${JSON.stringify(prices)}`
    // );
  } else {
    bot.telegram.sendMessage(
      "651494797",
      `Price difference is within 1%: ${JSON.stringify(prices)}`
    );
  }
};

// setIntervalAsync(checkPriceDifference, 10000); // перевіряємо ціни кожну хвилину

bot.launch();
// bot.telegram.sendMessage("651494797", `Price difference is within 1%: }`);

while (true) {
  checkPriceDifference();
  await new Promise((res) => setTimeout(res, 1000));
}
