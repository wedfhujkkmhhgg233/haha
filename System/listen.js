// rui waz here -_-
// i liek modular code

module.exports = function ({ api, event }) {
  const { logger } = require("./logger");
  const handleModule = require("./handle/handleModule");
  const handleEvent = require("./handle/handleEvent");
  const handleReply = require("./handle/handleReply");
  // meow
  const UserInfo = require("../Akhiro/resources/userInfo/utils");
  const BankHandler = require("../Akhiro/resources/bank/utils");
  const CurrencyHandler = require("../Akhiro/resources/balance/utils");
  const userInfos = new UserInfo({
    filepath: "Akhiro/resources/userInfo/userInfo.json",
    api
  });
  const bankHandler = new BankHandler({
    filepath: "Akhiro/resources/bank/bank.json"
  });
  const currencyHandler = new CurrencyHandler({
    filepath: "Akhiro/resources/money/currency.json"
  });
  

  //nilipat
  function aliases(command) {
  for (const [moduleNames, module] of Object.entries(global.Akhiro.modules)) {
    const aliases = moduleNames.split(",");
    if (
      aliases.some(
        (alias) => alias.trim().toLowerCase() === command?.toLowerCase(),
      )
    ) {
      return module;
    }
  }
  return null;
  }
  

  // will rework box functions
  //---lia
  const boxOld = {
    react: (emoji) => {
      api.setMessageReaction(emoji, event.messageID, () => {}, true);
    },
    reply: (msg) => {
      api.sendMessage(msg, event.threadID, event.messageID);
    },
    add: (uid) => {
      api.addUserToGroup(uid, event.threadID);
    },
    kick: (uid) => {
      api.removeUserFromGroup(uid, event.threadID);
    },
    send: (msg, id) => {
      api.sendMessage(msg, id || event.threadID);
    },
  };

  /*
  Liane: I'm forced to rework both of these in order for messageInfo to work.
  const info = await box.reply("Test");
  global.Akhiro.replies.set(info.messageID, {
    commandName: "test",
    author: event.senderID
  })
  */
  const box = {
    ...boxOld,
    reply(msg, x, y) {
      if (x === event.threadID || y === event.messageID) {
        throw new Error(`Wag lagyan ng threadID at messageID yung box.reply!`);
      }
      return new Promise(res => {
        api.sendMessage(msg, event.threadID, (_, info) => res(info), event.messageID);
      });
    },
    send(msg, goal) {
      return new Promise(res => {
        api.sendMessage(msg, goal || event.threadID, (_, info) => res(info));
      });
    },
    edit(msg, mid) {
      return new Promise(res => api.editMessage(msg, mid, () => res(true)));
    }
  }
  const entryObj = {
    api,
    event,
    box,
    aliases,
    userInfos,
    bankHandler,
    currencyHandler
  };

  switch (event.type) {
    case "message":
      handleModule({ ...entryObj });
      break;
    case "event":
      handleEvent({ ...entryObj });
      break;
    case "message_reply":
      handleModule({ ...entryObj });
      handleReply({ ...entryObj });
      break;
  }
};
