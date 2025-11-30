let handler = async (m, { conn, usedPrefix }) => {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Balance', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}

  const currency = global.currency || 'Yenes'

  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return conn.reply(m.chat, '> \\`🚫 ECONOMIA DESACTIVADA\\`\n\n> \\`❌ Los comandos de economía están desactivados en este grupo\\`\n\n> \\`📝 Administrador activa con:\\`\n> \\`' + usedPrefix + 'economy on\\`\n\n> \\`📚 "No puedo revisar tu balance si la economía está desactivada..."\\`', m, ctxErr)
  }

  let mentionedJid = await m.mentionedJid
  let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender
  let name = await (async () => global.db.data.users[who] ? global.db.data.users[who].name : (async () => { 
    try { 
      const n = await conn.getName(who); 
      return typeof n === 'string' && n.trim() ? n : who.split('@')[0] 
    } catch { 
      return who.split('@')[0] 
    } 
  })())()

  if (!(who in global.db.data.users)) {
    return conn.reply(m.chat, '> \\`❌ USUARIO NO ENCONTRADO\\`\n\n> \\`🍙 Este usuario no está registrado en mi base de datos\\`\n\n> \\`📚 "Debe usar el bot primero para registrarse..."\\`', m, ctxErr)
  }

  let user = global.db.data.users[who]
  let coin = user.coin || 0
  let bank = user.bank || 0
  let total = coin + bank

  const texto = '> \\`💰 BALANCE ECONOMICO\\` 📚✨\n\n' +
                '> \\`👤 Información del Usuario:\\`\n' +
                '> \\`📝 Nombre:\\` *' + name + '*\n\n' +
                '> \\`📊 Estado Financiero:\\`\n' +
                '> \\`👛 Cartera:\\` *¥' + coin.toLocaleString() + '* ' + currency + '\n' +
                '> \\`🏦 Banco:\\` *¥' + bank.toLocaleString() + '* ' + currency + '\n' +
                '> \\`💴 Total:\\` *¥' + total.toLocaleString() + '* ' + currency + '\n\n' +
                (coin > bank ? '> \\`⚠️ Advertencia:\\` *Tienes mucho dinero en tu cartera*' : '> \\`✅ Excelente:\\` *Tu dinero está bien protegido*') + '\n\n' +
                '> \\`🍱 Consejo de Itsuki:\\`\n' +
                '> \\`📚 "Para proteger tu dinero, ¡deposítalo en el banco!"\\`\n\n' +
                '> \\`📝 Usa:\\` *' + usedPrefix + 'deposit <cantidad>*'

  await conn.reply(m.chat, texto, m, ctxOk)
}

handler.help = ['bal']
handler.tags = ['economy']
handler.command = ['bal', 'balance', 'bank'] 
handler.group = true 

export default handler