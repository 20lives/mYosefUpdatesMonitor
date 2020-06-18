const cheerio = require('cheerio');
const bent = require('bent');
const telebot = require('telebot');

require('dotenv').config();

const domain = 'https://www.myosef.org.il/';
const updatesPage = id => `Lists/List2/CustomDispForm.aspx?ID=${id}`;
let currentId = 180;
const delay = 2000;

const sleep = ms => new Promise( resolve => setTimeout( resolve, ms) );
const get = bent(domain, 'GET', 'string', 200);
const getLink = id => `${domain}${updatesPage(id)}`;
const bot = new telebot(process.env.TELEGRAM_TOKEN);
const msgOptions = { parseMode: 'html' };
const sendMessage = (header, text, id) => send(`<b>${header}</b>\n${text}\n${getLink(id)}`);
const send = msg => bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg, msgOptions);

function extractData($) {
  const headerSelector = '#WebPartWPQ4 > h1';
  const contentSelector = '#WebPartWPQ4 > div.listItemDescription';

  const header = $(headerSelector).text();
  const content = $(contentSelector).text();

  return { header, content };
}

(async function run() {
  while (true) {
    const html = await get(updatesPage(currentId));
    const $ = cheerio.load(html);
    const updateExists = $('#ms-error-body').length === 0;
    if (updateExists) {
      const data = extractData($);
      sendMessage(data.header, data.content, currentId);
      currentId++;
    }
    await sleep(delay);
  }
}());
