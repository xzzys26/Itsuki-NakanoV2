let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '⚡️', key: m.key } })

    // Tiempo inicial
    const start = Date.now()

    // Tiempo final
    const end = Date.now()

    // Calcular ping
    const ping = end - start

    // Evaluación del ping
    let speed, status;
    if (ping < 100) {
      speed = '🚀 Extremadamente Rápido'
      status = '🟢 Excelente'
    } else if (ping < 300) {
      speed = '⚡ Muy Rápido'
      status = '🟡 Óptimo'
    } else if (ping < 600) {
      speed = '🏓 Rápido'
      status = '🟡 Bueno'
    } else if (ping < 1000) {
      speed = '📶 Normal'
      status = '🟠 Estable'
    } else {
      speed = '🐢 Lento'
      status = '🔴 Regular'
    }

    // Mensaje del ping
    const pingMessage = `

\`Ping :\` *${ping} ms*
\`Velocidad :\` *${speed}*
\`Estado :\` *${status}*`

    // Enviar resultado
    await conn.reply(m.chat, pingMessage, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (error) {
    console.error('Error en ping:', error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, 
      `> ⓘ ERROR

\`Error :\` No se pudo calcular el ping`, m)
  }
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['p', 'ping']

export default handler