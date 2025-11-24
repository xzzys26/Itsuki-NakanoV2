import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

var handler = m => m
handler.all = async function (m) { 
global.canalIdM = ["120363404434164076@newsletter", "120363404434164076@newsletter"]
global.canalNombreM = ["꒰ ❄️ ITՏᑌKI ᑎᗩKᗩᑎO-ᐯ3 ᑌᑭᗪᗩTᗴ ☃️ ꒱", "𝆺𝅥 𝆭 ִ ֗ ❄ 𝐋𝐚𝐬 𝐐𝐮𝐢𝐧𝐭𝐢𝐥𝐥𝐢𝐬𝐚𝐬-𝐍𝐨𝐯𝐞𝐝𝐚𝐝 📢 ┆ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥-𝐈𝐧𝐟𝐨 ☃️ ˚₊‧"]
global.channelRD = await getRandomChannel()

global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
global.mes = d.toLocaleDateString('es', {month: 'long'})
global.año = d.toLocaleDateString('es', {year: 'numeric'})
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

var canal = 'https://whatsapp.com/channel/0029VbBBXTr5fM5flFaxsO06'  
// var comunidad = 'https://chat.whatsapp.com/BXxWuamOOE4K9eKC623FIO'
var git = 'https://github.com/leoxito'
var github = 'https://github.com/leoxito/Itsuki-NakanoV2'
var correo = 'xzzysultra@gmail.com'
global.redes = [canal, comunidad, git, github, correo].getRandom()

global.nombre = m.pushName || 'User-MD'
global.packsticker = ``

// Todas las imágenes en orden
global.iconos = [
  'https://cdn.russellxz.click/a015cecd.jpg',
  'https://cdn.russellxz.click/d112a400.jpg',
  'https://cdn.russellxz.click/40fb346f.jpg',
  'https://cdn.russellxz.click/d8cefbd9.jpg',
  'https://cdn.russellxz.click/1d6aa06f.jpg',
  'https://cdn.russellxz.click/8df6a43c.jpg',
  'https://cdn.russellxz.click/0d27e894.jpg',
  'https://cdn.russellxz.click/98e7e0df.jpg',
  'https://cdn.russellxz.click/b262e815.jpg',
  'https://cdn.russellxz.click/f46d62d3.jpg',
  'https://cdn.russellxz.click/36caddb4.jpg'
]
global.icono = global.iconos[Math.floor(Math.random() * global.iconos.length)]

global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

// Adaptado rcanal para usar global.icono random
global.rcanal = { 
  contextInfo: { 
    isForwarded: true, 
    forwardedNewsletterMessageInfo: { 
      newsletterJid: channelRD.id, 
      serverMessageId: '', 
      newsletterName: channelRD.name 
    }, 
    externalAdReply: { 
      title: botname, 
      body: dev, 
      mediaUrl: null, 
      description: null, 
      previewType: "PHOTO", 
      thumbnailUrl: global.icono, // Usando global.icono random
      sourceUrl: redes, 
      mediaType: 1, 
      renderLargerThumbnail: false 
    }, 
    mentionedJid: null 
  }
}
}

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalIdM.length)
let id = canalIdM[randomIndex]
let name = canalNombreM[randomIndex]
return { id, name }
}