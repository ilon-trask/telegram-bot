import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const botToken = "5932488137:AAE1PT5wJjfRG0BQ_rlz4iHzW_2ikgt3-HY";
console.log(`started on ${botToken}`);
const bot = new TelegramBot(botToken, { polling: true });
let chatIds: number[] = [];
const BINANCE_API =
  "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
const BYBIT_API = "https://api.bybit.com/v2/public/tickers?symbol=BTCUSD";
// const OKEX_API = 'https://www.okex.com/api/spot/v3/instruments/BTC-USDT/ticker';
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
    chatIds.forEach((el) => {
      bot.sendMessage(
        el,
        `Price difference is more than 1%: ${JSON.stringify(prices)}`
      );
    });
  }
};
bot.setMyCommands([
  { command: "/start", description: "Розпочати роботу" },
  { command: "/stop", description: "Завершити роботу" },
  { command: "/check", description: "Перевірити дані" },
]);
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  chatIds.push(chatId);
  bot.sendSticker(
    chatId,
    "https://tlgrm.ru/_/stickers/ade/277/ade277af-adcd-3b1e-a5f8-3aab12f35748/1.webp"
  );
  bot.sendMessage(chatId, "Починаю працювати");
});
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  chatIds = chatIds.filter((el) => el != chatId);
  bot.sendSticker(
    chatId,
    "https://tlgrm.ru/_/stickers/ade/277/ade277af-adcd-3b1e-a5f8-3aab12f35748/3.webp"
  );
  bot.sendMessage(chatId, "Ну я відпочивати");
});
bot.onText(/\/check/, async (msg) => {
  const chatId = msg.chat.id;
  const prices = await getPrices();
  const maxPrice = Math.max(...Object.values(prices));
  const minPrice = Math.min(...Object.values(prices));
  bot.sendMessage(
    chatId,
    `Найнижча ціна ${minPrice}, найвища ціна ${maxPrice}`
  );
});

while (true) {
  checkPriceDifference();
  await new Promise((res) => setTimeout(res, 1000));
}
