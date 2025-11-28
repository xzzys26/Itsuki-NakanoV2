import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('🎄 *¡Ingresa el nombre de la música que deseas buscar!* 🎅\n\n> ⓘ Ejemplo: .play vamos nena');

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

    const searchRes = await fetch(`https://sky-api-ashy.vercel.app/search/youtube?q=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.status || !searchJson.result?.length) {
      return m.reply('> 🎁 *¡No se encontraron resultados!*\n\n> ⓘ Intenta con otro nombre de canción navideña 🎅');
    }

    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })

    const video = searchJson.result[0];
    const { title, channel, duration, imageUrl, link } = video;

    const info = `
🎄 *Y O U T U B E - P L A Y* 🎅

*ⓘ ᴛɪᴛᴜʟᴏ »* ${title}
*ⓘ ᴄᴀɴᴀʟ »* ${channel}
*ⓘ ᴅᴜʀᴀᴄɪᴏɴ »* ${duration}
*ⓘ ᴇɴʟᴀɴᴄᴇ »* ${link}

🎅 *¡Que disfrutes tu música navideña!* 🎄
`.trim();

    const thumb = await (await fetch(imageUrl)).arrayBuffer();
    await conn.sendMessage(m.chat, { image: Buffer.from(thumb), caption: info }, { quoted: m });

    if (command === 'play') {
      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${link}&quality=128`);
      const json = await res.json();

      if (!json.status || !json.result?.download?.url) {
        return m.reply('🎁 *¡No se pudo obtener el audio!*\n\n> ⓘ Intenta con otra canción navideña 🎄');
      }

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: json.result.download.url },
          fileName: `🎄 ${title}.mp3`,
          mimetype: 'audio/mpeg',
          ptt: false
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

    if (command === 'play2') {
      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${link}&quality=360`);
      const json = await res.json();

      if (!json.status || !json.result?.download?.url) {
        return m.reply('🎁 *¡No se pudo obtener el video!*\n\n> ⓘ Intenta con otro video navideño 🎅');
      }

      await conn.sendMessage(
        m.chat,
        {
          video: { url: json.result.download.url },
          fileName: `> ${title} (360p).mp4`,
          mimetype: 'video/mp4',
          caption: info
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } })
    }

  } catch (e) {
    console.error('[play] Error:', e);
    m.reply('🎄 *¡Error al procesar tu solicitud navideña!*\n\n> ⓘ Intenta de nuevo en un momento 🎅');
  }
};

handler.command = ['play', 'play2'];
handler.tags = ['dl'];
handler.help = ['play <canción navideña>', 'play2 <video navideño>'];

export default handler;