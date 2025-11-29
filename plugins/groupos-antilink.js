let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return

  const action = args[0]?.toLowerCase()
  if (!global.antilink) global.antilink = {}

  if (!action) {
    return conn.reply(m.chat, `> ⓘ \`Uso:\` *${usedPrefix}antilink on/off*`, m)
  }

  if (action === 'on') {
    global.antilink[m.chat] = true
    await m.react('✅')
  } else if (action === 'off') {
    delete global.antilink[m.chat]
    await m.react('✅')
  }
}

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (m.isBaileys || !m.isGroup || isAdmin || !global.antilink?.[m.chat]) return
  
  const text = m.text || m.caption || ''
  if (!text) return

  // TODOS los enlaces prohibidos
  const links = /https?:\/\/[^\s]*|www\.[^\s]*|wa\.me\/[0-9]+|chat\.whatsapp\.com\/[A-Za-z0-9]+|t\.me\/[^\s]*|instagram\.com\/[^\s]*|facebook\.com\/[^\s]*|youtube\.com\/[^\s]*|youtu\.be\/[^\s]*|twitter\.com\/[^\s]*|x\.com\/[^\s]*|discord\.gg\/[^\s]*|tiktok\.com\/[^\s]*|bit\.ly\/[^\s]*|tinyurl\.com\/[^\s]*|goo\.gl\/[^\s]*|ow\.ly\/[^\s]*|buff\.ly\/[^\s]*|adf\.ly\/[^\s]*|shorte\.st\/[^\s]*|snip\.ly\/[^\s]*|cutt\.ly\/[^\s]*|is\.gd\/[^\s]*|v\.gd\/[^\s]*|cli\.gs\/[^\s]*|bc\.vc\/[^\s]*|tr\.im\/[^\s]*|prettylink\.pro\/[^\s]*|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/gi
  
  if (links.test(text)) {
    try {
      // Eliminar mensaje inmediatamente
      if (isBotAdmin && m.key) {
        await conn.sendMessage(m.chat, { 
          delete: { 
            remoteJid: m.chat, 
            fromMe: false, 
            id: m.key.id, 
            participant: m.sender 
          } 
        })
      }

      // Expulsar usuario inmediatamente
      if (isBotAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      }

    } catch (error) {}
  }
}

handler.help = ['antilink']
handler.tags = ['group']
handler.command = ['antilink']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler