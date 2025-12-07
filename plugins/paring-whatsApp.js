const {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} = await import("@whiskeysockets/baileys");
import qrcode from "qrcode";
import nodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from "pino";
import util from "util";
import * as ws from "ws";
const { child, spawn, exec } = await import("child_process");
const { CONNECTING } = ws;
import chalk from 'chalk'
import { makeWASocket } from "../lib/simple.js";

let rtx = `🌱 Escanea este código QR para conectarte como subbot.\n\n> I'm Fz ~`;
let rtx2 = `🌳 Introduce el siguiente código para convertirte en subbot.\n\n> I'm Fz ~`;

if (global.conns instanceof Array) {
  console.log();
} else {
  global.conns = [];
}
global.jadi = "./Subbots"
const MAX_SUBBOTS = 100;
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (users.length >= MAX_SUBBOTS) {
    return conn.reply(m.chat, `*≡ Lo siento, se ha alcanzado el límite de ${MAX_SUBBOTS} subbots. Por favor, intenta más tarde.*`, m);
  }

  let user = conn;
  const isCode = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  let code;
  let pairingCode;
  let qrMessage;
  let userData = global.db.data.users[m.sender];
let input = args[1] || args[0];
let userJid;

if (m.mentionedJid?.length) {
  userJid = m.mentionedJid[0];
} else if (input && /^\d{5,}$/.test(input.replace(/\D/g, ""))) {
  let cleaned = input.replace(/\D/g, "");
  userJid = `${cleaned}@s.whatsapp.net`;
} else if (m.fromMe) {
  userJid = user.user.jid;
} else {
  userJid = m.sender;
}
let userName = userJid.split("@")[0];



  if (isCode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim() || undefined;
    if (args[1]) {
      args[1] = args[1].replace(/^--code$|^code$/, "").trim();
    }
  }

  if (!fs.existsSync("./" + jadi + "/" + userName)) {
    fs.mkdirSync("./" + jadi + "/" + userName, { recursive: true });
  }

  if (args[0] && args[0] != undefined) {
try {
  const jsonString = Buffer.from(args[0], "base64").toString("utf-8");
  const jsonParsed = JSON.parse(jsonString);
  fs.writeFileSync(`./${jadi}/${userName}/creds.json`, JSON.stringify(jsonParsed, null, "\t"));
} catch (e) {
  return m.reply("≡ Ocurrió un error al procesar el código.\n\nPon *#delsesi* y luego ejecuta *#serbot --code* de nuevo.");
}
  } else {
    "";
  }
try {
  if (fs.existsSync("./" + jadi + "/" + userName + "/creds.json")) {
    let creds = JSON.parse(fs.readFileSync("./" + jadi + "/" + userName + "/creds.json"));
    if (creds) {
      if (creds.registered === false) {
        fs.unlinkSync("./" + jadi + "/" + userName + "/creds.json");
      }
    }
  }
} catch (e) {
  return m.reply(`≡ Ocurrió un error al procesar el código.\n\nPon *#delsesi* y luego ejecuta *#${command}* de nuevo.`);
}
    async function initSubBot() {
      if (!fs.existsSync("./" + jadi + "/" + userName)) {
        fs.mkdirSync("./" + jadi + "/" + userName, { recursive: true });
      }

      if (args[0]) {
        fs.writeFileSync("./" + jadi + "/" + userName + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
      } else {
        "";
      }

      let { version, isLatest } = await fetchLatestBaileysVersion();
      const msgRetry = msgRetry => {};
      const cache = new nodeCache();
      const { state, saveState, saveCreds } = await useMultiFileAuthState("./" + jadi + "/" + userName);

      const config = {
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        msgRetry: msgRetry,
        msgRetryCache: cache,
        version: [2, 3000, 1023223821],
        syncFullHistory: true,
        browser: isCode ? ["Ubuntu", "Chrome", "110.0.5585.95"] : ["Sylphiette", "Chrome", "2.0.0"],
        defaultQueryTimeoutMs: undefined,
        getMessage: async msgId => {
          if (store) {}
          return {
            conversation: "Sylph"
          };
        }
      };

      let subBot = makeWASocket(config);
      subBot.isInit = false;
      let isConnected = true;

      async function handleConnectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update;
        if (isNewLogin) {
          subBot.isInit = false;
        }
        if (qr && !isCode) {
          qrMessage = await user.sendMessage(m.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: rtx,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          }, { quoted: m });
          return;
        }
        if (qr && isCode) {
          code = await user.sendMessage(m.chat, {
            text: rtx2,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          }, { quoted: m });


          await sleep(3000);
          pairingCode = await subBot.requestPairingCode(userName)

          pairingCode = await user.sendMessage(m.chat, {
            text: pairingCode, 
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          }, { quoted: m });
        }

        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        console.log(statusCode);

        const closeConnection = async shouldClose => {
          if (!shouldClose) {
            try {
              subBot.ws.close();
            } catch {}
            subBot.ev.removeAllListeners();
            let index = global.conns.indexOf(subBot);
            if (index < 0) {
              return;
            }
            delete global.conns[index];
            global.conns.splice(index, 1);
          }
        };

        const disconnectCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (connection === "close") {
          console.log(disconnectCode);
          if (disconnectCode == 405) {
            await fs.unlinkSync("./" + jadi + "/" + userName + "/creds.json");
            return await m.reply("≡ Reenvia nuevamente el comando.");
          }
          if (disconnectCode === DisconnectReason.restartRequired) {
            initSubBot();
            return console.log("\n≡ Tiempo de conexión agotado, reconectando...");
          } else if (disconnectCode === DisconnectReason.loggedOut) {
            fs.rmdirSync(`./${jadi}/${userName}`, { recursive: true });
            return m.reply("≡ *Conexión perdida...*");
          } else if (disconnectCode == 428) {
            await closeConnection(false);
            return m.reply("≡ La conexión se ha cerrado de manera inesperada, intentaremos reconectar...");
          } else if (disconnectCode === DisconnectReason.connectionLost) {
            await initSubBot();
            return console.log("\n≡Conexión perdida con el servidor, reconectando....");
          } else if (disconnectCode === DisconnectReason.badSession) {
            return await m.reply("≡ La conexión se ha cerrado, deberá de conectarse manualmente usando el comando *.serbot* o *.code*");
          } else if (disconnectCode === DisconnectReason.timedOut) {
            await closeConnection(false);
            return console.log("\n≡ Tiempo de conexión agotado, reconectando....");
          } else {
            console.log("\n🍂 Razón de la desconexión desconocida: " + (disconnectCode || "") + " >> " + (connection || ""));
          }
        }

        if (global.db.data == null) {
          loadDatabase();
        }

        if (connection == "open") {
        const emoj = await remoji()
          subBot.uptime = new Date();
          subBot.isInit = true;
          global.conns.push(subBot);
          await user.sendMessage(m.chat, {
            text: args[0] ? "🌙 *¡Está conectado!*\nPor favor espere se está cargando los mensajes..." : "¡Conectado con éxito!"
          }, { quoted: m })
          if (!args[0]) {
          }
        }
      }

      setInterval(async () => {
        if (!subBot.user) {
          try {
            subBot.ws.close();
          } catch (error) {
            console.log(await updateHandler(true).catch(console.error));
          }
          subBot.ev.removeAllListeners();
          let index = global.conns.indexOf(subBot);
          if (index < 0) {
            return;
          }
          delete global.conns[index];
          global.conns.splice(index, 1);
        }
      }, 60000);

      let handlerModule = await import("../handler.js");
      let updateHandler = async shouldReconnect => {
        try {
          const updatedModule = await import("../handler.js?update=" + Date.now()).catch(console.error);
          if (Object.keys(updatedModule || {}).length) {
            handlerModule = updatedModule;
          }
        } catch (error) {
          console.error(error);
        }
        if (shouldReconnect) {
          const chats = subBot.chats;
          try {
            subBot.ws.close();
          } catch {}
          subBot.ev.removeAllListeners();
          subBot = makeWASocket(config, { chats: chats });
          isConnected = true;
        }
        if (!isConnected) {
          subBot.ev.off("messages.upsert", subBot.handler);
          subBot.ev.off("connection.update", subBot.connectionUpdate);
          subBot.ev.off("creds.update", subBot.credsUpdate);
        }
        const currentTime = new Date();
        const lastEventTime = new Date(subBot.ev * 1000);
        if (currentTime.getTime() - lastEventTime.getTime() <= 300000) {
          console.log("Leyendo mensaje entrante:", subBot.ev);
          Object.keys(subBot.chats).forEach(chatId => {
            subBot.chats[chatId].isBanned = false;
          });
        } else {
          Object.keys(subBot.chats).forEach(chatId => {
            subBot.chats[chatId].isBanned = true;
          });
        }
        subBot.handler = handlerModule.handler.bind(subBot);
        subBot.connectionUpdate = handleConnectionUpdate.bind(subBot);
        subBot.credsUpdate = saveCreds.bind(subBot, true);
        subBot.ev.on("messages.upsert", subBot.handler);
        subBot.ev.on("connection.update", subBot.connectionUpdate);
        subBot.ev.on("creds.update", subBot.credsUpdate);
        isConnected = false;
        return true;
      };
      updateHandler(false);
    }
try {
    initSubBot();
  } catch(e) {
  m.reply(`Ocurrió un error. Intenta borra tu sesión usando: !delsesi y vuelve a intentarlo`)
  }
};

handler.help = ["serbot", "code"];
handler.tags = ["serbot"];
handler.command = ["serbot", "code"];

export default handler;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}