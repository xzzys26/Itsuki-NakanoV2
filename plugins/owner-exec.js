import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
const exec = promisify(_exec).bind(cp)

const handler = async (m, { conn, isOwner, command, text, usedPrefix, args, isROwner }) => {
  if (!isROwner) return

  const fullText = m.text || ''
  const prefix = '$ '
  
  if (!fullText.startsWith('$ ')) return
  
  const cmdToExecute = fullText.slice(2).trim()
  
  if (!cmdToExecute) {
    return m.reply('Escribe un comando después de $')
  }

  const botNumber = conn.user?.id?.split(':')[0]
  const senderNumber = m.sender?.split('@')[0]
  if (botNumber !== senderNumber) {
    console.log('Comando desde otra instancia, ignorado')
    return
  }

  m.reply('Ejecutando orden')

  let o
  try {
    o = await exec(cmdToExecute)
  } catch (e) {
    o = e
  } finally {
    const { stdout, stderr } = o
    if (stdout?.trim()) m.reply(stdout)
    if (stderr?.trim()) m.reply(stderr)
  }
}

handler.help = ['$']
handler.tags = ['owner']
handler.customPrefix = /^\$ /
handler.command = new RegExp

export default handler