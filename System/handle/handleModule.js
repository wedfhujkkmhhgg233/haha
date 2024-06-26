const fonts = require("./createFonts");
const { styled } = require("./styler");
  

// commenter: rui; message: 😱😲;
//liane created the noPrefix

module.exports = async function ({ api, event, box, aliases, ...etc }) {
  const { botPrefix, botAdmins } = global.Akhiro.config;

  // i updated it uwu ♥️

  try {
    let [command, ...args] = event.body
      /*.slice(botPrefix.length)*/
      .trim()
      .split(" ");

    if (command.startsWith(botPrefix)) {
      command = command.slice(botPrefix.length);
    }
    if (event.body && event.body.toLowerCase() === "prefix") {
      box.reply(`AkhiroV2's Prefix: [ ${botPrefix} ]`);
    } else if (
      /*event.body && event.body.toLowerCase().startsWith(botPrefix)*/

      //liane
      event.body
    ) {
      const moduleName = command && command.toLowerCase();
      const module = aliases(moduleName);
      if (module) {
        try {
          async function sendStyled(text) {
            if (!module.style) {
              throw new Error("Module does not have a 'styled' property.");
            }
            const text2 = await styled(text, module.style);
            return await box.reply(text2);
          }
          
          // uwu
          if (
            !botAdmins?.includes(event.senderID) &&
            module.metadata?.botAdmin
          ) {
            return api.sendMessage(
              fonts.sans(`ℹ️ | Only the permitted user can use this command.`),
              event.threadID,
              event.messageID,
            );
          }

          if (
            module.metadata?.hasPrefix !== false &&
            !event.body?.toLowerCase().startsWith(botPrefix)
          ) {
            //liane: if no prefix, and module.metadata.hasPrefix is not false, do nothing
            return box.reply(fonts.sans(`❌ | This command needs a prefix.`));
          } else if (
            module.metadata?.hasPrefix === false && !module.metadata.bypassHasPrefixRestriction &&
            event.body?.toLowerCase().startsWith(botPrefix)
          ) {
            return box.reply(
              fonts.sans(`❌ | This command cannot be used with a prefix.`),
            );
          } else if (
            module.metadata?.hasPrefix === false &&
            !event.body?.toLowerCase().startsWith(botPrefix)
          ) {
            //do nothing
          }
          await module.onRun({
            api,
            event,
            args,
            box,
            fonts,
            commandName: moduleName,
            sendStyled,
            ...etc
          });
        } catch (error) {
          box.reply(`❌ | ${error.message}
${error.stack}
${error.name}
${error.code}
${error.path}`);

          console.error(error);
        }
      } else if (event.body?.startsWith(botPrefix)) {
        box.reply(
          fonts.sans(
            `❌ | Command ${command ? `"${command}"` : "you are using"} doesn't exist, use ${botPrefix}help to view the commands modules.`,
          ),
        );
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};
