import fetch from 'node-fetch'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execPromise = promisify(exec)

async function ytVideoDownload(url) {
  try {
    const response = await fetch('https://ytpy.ultraplus.click/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url,
        option: 'video'
      })
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error(`Error al obtener el video: ${error.message}`)
  }
}

async function downloadVideoWithFfmpeg(m3u8Url, outputPath) {
  try {
    const command = `ffmpeg -protocol_whitelist file,http,https,tcp,tls -i "${m3u8Url}" -c copy -bsf:a aac_adtstoasc "${outputPath}" -y`
    
    await execPromise(command, { 
      maxBuffer: 1024 * 1024 * 100,
      timeout: 86400000
    })
    
    return outputPath
  } catch (error) {
    throw new Error(`Error al descargar con ffmpeg: ${error.message}`)
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `> *[🌷]* Envía el enlace del video de YouTube.\n> *Ejemplo:* ${usedPrefix + command} https://youtu.be/KHgllosZ3kA`, m)
  }

  const videoUrl = args[0]
  
  if (!videoUrl.match(/youtu\.?be/i)) {
    return conn.reply(m.chat, '*[⛓️‍💥]* Por favor envía una URL válida de YouTube.', m)
  }

  try {
    // Emoji de reacción inicial
    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

    const result = await ytVideoDownload(videoUrl)
    
    if (!result || result.error || result.status !== 'success') {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat, `> *[❌]* Error: ${result?.error || result?.message || 'No se pudo obtener el video'}`, m)
    }

    const downloadUrl = result.url
    const title = result.title || 'Video de YouTube'

    if (!downloadUrl) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat, '> *[🖇]* No se pudo obtener el enlace de descarga.', m)
    }

    const tempDir = './temp'
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const timestamp = Date.now()
    const videoPath = path.join(tempDir, `video_${timestamp}.mp4`)
    
    const startTime = Date.now()
    await downloadVideoWithFfmpeg(downloadUrl, videoPath)
    const downloadTime = ((Date.now() - startTime) / 1000).toFixed(2)

    if (!fs.existsSync(videoPath)) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat, '> *[⚙️]* Error al procesar el video.', m)
    }

    const fileSize = fs.statSync(videoPath).size
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)
    
    console.log(`Video descargado: ${fileSizeMB} MB en ${downloadTime} segundos`)

    if (fileSize > 100 * 1024 * 1024) {
      fs.unlinkSync(videoPath)
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat, `> *[❌]* El video es demasiado grande (${fileSizeMB} MB).\n> ⚠️ WhatsApp tiene un límite de ~100 MB para videos.\n\n💡 Intenta con un video más corto o de menor calidad.`, m)
    }

    // Emoji de éxito antes de enviar
    await conn.sendMessage(m.chat, { react: { text: '✅️', key: m.key } })

    // Enviar el video
    await conn.sendMessage(m.chat, {
      video: fs.readFileSync(videoPath),
      caption: `> 🏷 *${title}*\n> 💾 *Tamaño: ${fileSizeMB} MB*\n> *⏳️Descarga: ${downloadTime}s*`,
      mimetype: 'video/mp4'
    }, { quoted: m })

    // Eliminar archivo temporal
    fs.unlinkSync(videoPath)

  } catch (error) {
    console.error('Error en ytvideo:', error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, `> *[❌]* Ocurrió un error: ${error.message}`, m)
  }
}

handler.help = ['play12']
handler.tags = ['downloader']
handler.command = ['play12']

export default handler