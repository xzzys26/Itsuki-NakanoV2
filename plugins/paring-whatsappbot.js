import ws from 'ws'
import pkg from '@whiskeysockets/baileys'
const { DisconnectReason } = pkg
import fs from "fs/promises"
import path from 'path'

let handler = async(m, { usedPrefix, conn, text }) => {
const limit = 20
// --- VERSIÓN ORIGINAL ---
// Leemos desde global.subbots
const users = [...new Set([...global.subbots.filter((conn) => conn.user && conn.ws?.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];

function dhms(ms) {
  var segundos = Math.floor(ms / 1000);
  var minutos = Math.floor(segundos / 60);
  var horas = Math.floor(minutos / 60);
  var días = Math.floor(horas / 24);

  segundos %= 60;
  minutos %= 60;
  horas %= 24;

  var resultado = "";
  if (días !== 0) {
    resultado += días + 'd '
  }
  if (horas !== 0) {
    resultado += horas + 'h '
  }
  if (minutos !== 0) {
    resultado += minutos + 'm '
  }
  if (segundos !== 0) {
    resultado += segundos + 's'
  }

  return resultado;
}

// Función para contar sesiones guardadas
async function info(path) {
    try {
        const items = await fs.readdir(path);
        return items.length;
    } catch (err) {
        console.error("Error:", err);
        return 0;
    }
}

const jadi = 'Sessions/SubBot'

// Generar lista de bots con la decoración solicitada
let botList = ''
users.forEach((v, index) => {
    const jid = v.user.jid.replace(/[^0-9]/g, '')
    const name = v.user.name || 'itsuki-sub'
    const uptime = v.uptime ? dhms(Date.now() - v.uptime) : "0s"
    
    botList += `🌷 *Itsuki-V3 Sub*  *[ ${index + 1} ]*\n\n`
    botList += `🌱 *Tag :* @${jid}\n`
    botList += `🆔️ *ID :* wa.me/${jid}?text=.menu\n`
    botList += `🤖 *Bot :* Itsuki-V3 Sub\n`
    botList += `🕑 *Uptime :* ${uptime}\n`
    botList += `────────────────\n\n`
})

const totalUsers = users.length
const sesionesGuardadas = await info(jadi)

let cap = `# 📚 *Subbots activos : ${totalUsers}/100*\n\n`
cap += `💾 *Sesiones guardadas:* ${sesionesGuardadas}\n`
cap += `🟢 *Sesiones activas:* ${totalUsers}\n\n`

// Si hay más del límite, mostrar advertencia
if (totalUsers > limit) {
    cap += `> *[🧃] El número de subbots activos supera el límite de ${limit} por lo que no se mostrará la lista con los tags.*\n\n`
    // Aún así mostrar algunos (los primeros 5)
    const limitedUsers = users.slice(0, 5)
    limitedUsers.forEach((v, index) => {
        const jid = v.user.jid.replace(/[^0-9]/g, '')
        const name = v.user.name || 'itsuki-sub'
        const uptime = v.uptime ? dhms(Date.now() - v.uptime) : "0s"
        
        cap += `🌷 *Itsuki-V3 Sub*  *[ ${index + 1} ]*\n`
        cap += `🌱 Tag : @${jid}\n`
        cap += `🆔️ ID : wa.me/${jid}?text=.menu\n`
        cap += `🤖 Bot : Itsuki-V3 Sub\n`
        cap += `🕑 Uptime : ${uptime}\n`
        cap += `────────────────\n\n`
    })
    cap += `*... y ${totalUsers - 5} bots más*`
} else {
    cap += botList
}

// Obtener menciones para los tags
const mentions = users.map(v => v.user.jid)

// Enviar mensaje
await conn.sendMessage(m.chat, {
    text: cap, 
    mentions: mentions,
    contextInfo: {
        mentionedJid: mentions,
        externalAdReply: {
            title: "🤖 LISTA DE SUBBOTS ACTIVOS",
            mediaType: 1,
            previewType: 0,
            renderLargerThumbnail: true,
            thumbnail: await (await fetch("https://cdn.russellxz.click/69ae53cb.jpg")).buffer(),
            sourceUrl: ''
        }
    }
}, { quoted: m })
}

handler.help = ['botlist']
handler.tags = ['serbot']
handler.command = ['bots', 'listabots', 'subbots'] 
handler.rowner = true

export default handler