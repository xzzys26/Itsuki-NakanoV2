import fetch from 'node-fetch';

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

let handler = async (m, { conn, command, args }) => {
  let link = args[0];

  if (!link) {
    return conn.reply(m.chat, `${emoji} Por favor, ingrese el *enlace de una página web*.`, m);
  }

  if (!isValidUrl(link)) {
    return conn.reply(m.chat, `${msm} El enlace proporcionado *no es válido*.`, m);
  }

  try {
    await m.react(rwait);
    await conn.reply(m.chat, `${emoji2} Generando captura de pantalla de:\n${link}`, m);

    let response = await fetch(`https://image.thum.io/get/fullpage/${link}`);
    if (!response.ok) throw new Error(`Error al obtener la captura`);

    let buffer = await response.buffer();

    await conn.sendFile(m.chat, buffer, 'screenshot.png', `✅ Captura de *${link}*`, m);
    await m.react(done);

  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, `${error} Ocurrió un error al capturar la web.`, m);
    await m.react(error);
  }
};

handler.help = ['ssweb <url>', 'ss <url>'];
handler.tags = ['tools'];
handler.command = ['ssweb', 'ss'];

export default handler;