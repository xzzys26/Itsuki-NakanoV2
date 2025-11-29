const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;

  const customEmoji = global.db.data.chats[m.chat]?.customEmoji || '🍓';
  m.react(customEmoji);

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const pesan = args.join` `;
  const oi = pesan 
    ? `> ⓘ \`Mensaje:\` *${pesan}*`
    : `> ⓘ \`Invocación general\``;

  let teks = `
╭━━━〔 *🌸 INVOCACIÓN GENERAL 🌸* 〕━━━⬣
┃ ${oi}
┃ ⓘ \`Miembros totales:\` *${participants.length}*
┃ ⓘ \`Ejecutado por:\` *@${m.sender.split('@')[0]}*
┃ ⓘ \`ID del ejecutor:\` *${m.sender}*
╰━━━━━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *📌 USUARIOS ETIQUETADOS 📌* 〕━━━⬣
`;

  // Crear array de menciones
  const mentions = [];
  
  for (const mem of participants) {
    const userId = mem.id.split('@')[0];
    teks += `┃ ⓘ \`@${userId}\`\n`;
    mentions.push(mem.id); // Agregar el ID completo para la mención
  }

  teks += `╰━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

  await conn.sendMessage(m.chat, { 
    text: teks, 
    mentions: mentions // Usar el array de menciones
  });
};

handler.help = ['invocar'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.admin = true;
handler.group = true;

export default handler;