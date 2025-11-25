import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })
    return conn.reply(m.chat, 
`> 🎅 *¡NAVIDAD EN YOUTUBE!* 🎁

>  *🎧 DESCARGADOR NAVIDEÑO 🎵*

> ❌ *Uso incorrecto*

> \`\`\`Debes ingresar el nombre de la música o video\`\`\`

> *Ejemplos navideños:*
> • ${usedPrefix + command} villancicos navideños
> • ${usedPrefix + command} canciones de navidad
> • ${usedPrefix + command} música navideña

> 🎄 *¡Itsuki Nakano V3 descargará tu contenido!* 🎅`, m)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

    // API de búsqueda del primer código
    const searchRes = await fetch(`https://sky-api-ashy.vercel.app/search/youtube?q=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.status || !searchJson.result?.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply(`> 🎄 *¡NO ENCONTRADO!* 🎅

> ❌ *No se encontraron resultados para:* \`${text}\`

> 🎅 *Sugerencias:*
> • Verifica la ortografía
> • Intenta con términos más específicos
> • Prueba con otro nombre de canción

> 🎄 *¡Itsuki Nakano V3 te ayuda!* 🎁`);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const video = searchJson.result[0];
    const { title, channel, duration, imageUrl, link } = video;

    const info = 
`> 🎄 *INFORMACIÓN NAVIDEÑA* 🎅

> 🏷 *Título:*
\`\`\`${title}\`\`\`
> 👑 *Canal:*
\`\`\`${channel}\`\`\`
> ⏱️ *Duración:*
\`\`\`${duration}\`\`\`
> 🔗 *Enlace:*
\`\`\`${link}\`\`\`

> 🎅 *¡Itsuki Nakano V3 encontró tu contenido!* 🎄`;

    const thumb = await (await fetch(imageUrl)).arrayBuffer();
    await conn.sendMessage(m.chat, { 
      image: Buffer.from(thumb), 
      caption: info 
    }, { quoted: m });

    if (command === 'play') {
      // API de audio del primer código
      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${link}&quality=128`);
      const json = await res.json();

      if (!json.status || !json.result?.download?.url) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(`> 🎄 *¡ERROR DE AUDIO!* 🎅

> ❌ *No se pudo obtener el audio*

> 🎅 *Posibles causas:*
> • El video podría estar restringido
> • Problemas temporales con la API
> • Enlace no válido

> 🎄 *¡Itsuki Nakano V3 lo intentará de nuevo!* 🎁`);
      }

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: json.result.download.url },
          fileName: `${title}.mp3`,
          mimetype: 'audio/mpeg',
          ptt: false
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

    if (command === 'play2') {
      // API de video del primer código
      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${link}&quality=360`);
      const json = await res.json();

      if (!json.status || !json.result?.download?.url) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(`> 🎄 *¡ERROR DE VIDEO!* 🎅

> ❌ *No se pudo obtener el video*

> 🎅 *Posibles causas:*
> • El video podría estar restringido
> • Problemas temporales con la API
> • Calidad no disponible

> 🎄 *¡Itsuki Nakano V3 lo intentará de nuevo!* 🎁`);
      }

      await conn.sendMessage(
        m.chat,
        {
          video: { url: json.result.download.url },
          fileName: `${title} (360p).mp4`,
          mimetype: 'video/mp4',
          caption: `> 🎄 *VIDEO NAVIDEÑO DESCARGADO* 🎅

> 🏷 *Título:*
> \`\`\`${title}\`\`\`
> 🌌 *Calidad:*
> \`\`\`480p\`\`\`

> 🎁 *¡Disfruta de tu contenido navideño!*
> 🎅 *Itsuki Nakano V3 te desea felices fiestas* 🎄`
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } })
    }

  } catch (e) {
    console.error('🎄 Error en play/play2:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`> 🎄 *¡ERROR NAVIDEÑO!* 🎅

> ❌ *Error al procesar tu solicitud*

> 📝 *Detalles:*
\`\`\`${e.message}\`\`\`

> 🎅 *Sugerencias:*
> • Verifica tu conexión a internet
> • Intenta con otro nombre de canción
> • Espera unos minutos y vuelve a intentar

> 🎄 *¡Itsuki Nakano V3 está aquí para ayudarte!* 🎁`);
  }
};

handler.command = ['play', 'play2'];
handler.tags = ['downloader'];
handler.help = ['play', 'play2'];
handler.group = true;

export default handler;