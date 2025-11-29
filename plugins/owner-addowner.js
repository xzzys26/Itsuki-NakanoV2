import path from 'path'
import fs from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import fetch from 'node-fetch'

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Owner Add', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return null
  }
}

const toNum = v => (v + '').replace(/[^0-9]/g, '')
const localPart = v => (v + '').split('@')[0].split(':')[0].split('/')[0].split(',')[0]
const normalizeCore = v => toNum(localPart(v))

function formatPretty(num) { const n = normalizeCore(num); return n ? '+' + n : '' }

async function resolveName(conn, jid) {
  try { const n = await conn.getName(jid); if (n && n.trim()) return n.trim() } catch {}
  return formatPretty(jid)
}

async function appendOwnerToConfig(configPath, number, name, isRoot = false) {
  try {
    const src = await fs.promises.readFile(configPath, 'utf8')
    const anchor = src.indexOf('global.owner')
    if (anchor === -1) throw new Error('No se encontró global.owner en config.js')
    const eqIdx = src.indexOf('=', anchor)
    if (eqIdx === -1) throw new Error('Asignación de owner no encontrada')
    const arrStart = src.indexOf('[', eqIdx)
    if (arrStart === -1) throw new Error('No se encontró inicio de array de owner')

    let i = arrStart
    let depth = 0
    let inS = false, inD = false, inB = false, esc = false
    let arrEnd = -1
    while (i < src.length) {
      const ch = src[i]
      if (esc) { esc = false; i++; continue }
      if (inS) { if (ch === "\\") esc = true; else if (ch === "'") inS = false; i++; continue }
      if (inD) { if (ch === "\\") esc = true; else if (ch === '"') inD = false; i++; continue }
      if (inB) { if (ch === "\\") esc = true; else if (ch === '`') inB = false; i++; continue }
      if (ch === "'") { inS = true; i++; continue }
      if (ch === '"') { inD = true; i++; continue }
      if (ch === '`') { inB = true; i++; continue }
      if (ch === '[') { depth++; i++; continue }
      if (ch === ']') { depth--; i++; if (depth === 0) { arrEnd = i - 1; break } else continue }
      i++
    }
    if (arrEnd === -1) throw new Error('No se encontró cierre del array de owner')

    const inside = src.slice(arrStart + 1, arrEnd)
    const hasItems = /[^\s]/.test(inside)

    let j = arrEnd - 1
    while (j > arrStart && /\s/.test(src[j])) j--
    const prevChar = src[j] || ''
    const needLeadingComma = hasItems && prevChar !== ','

    const nameEsc = name.replace(/'/g, "\\'")
    const indent = '  '
    const entry = `${indent}['${number}', '${nameEsc}', ${!!isRoot}]`
    const insertText = (needLeadingComma ? ',' : '') + '\n' + entry

    const updated = src.slice(0, arrEnd) + insertText + src.slice(arrEnd)
    await fs.promises.writeFile(configPath, updated, 'utf8')
    return true
  } catch (e) {
    console.error('[owner-add] persist error:', e.message)
    return false
  }
}

function parseUserTargets(input, options = {}) {
    try {
        if (!input || input.trim() === '') return [];

        const defaults = {
            allowLids: true,
            resolveMentions: true,
            groupJid: null,
            maxTargets: 50
        };
        const opts = { ...defaults, ...options };

        if (Array.isArray(input)) {
            return input.map(jid => normalizeJid(jid)).filter(jid => jid);
        }

        if (typeof input === 'string') {
            let targets = [];
            const textTargets = input.split(/[,;\s\n]+/).map(item => item.trim()).filter(item => item);

            for (let item of textTargets) {
                if (item.startsWith('@')) {
                    const num = item.substring(1);
                    if (num) {
                        const jid = `${num}@s.whatsapp.net`;
                        targets.push(jid);
                    }
                    continue;
                }

                if (/^[\d+][\d\s\-()]+$/.test(item)) {
                    const cleanNum = item.replace(/[^\d+]/g, '');
                    if (cleanNum.length >= 8) {
                        const jid = `${cleanNum.replace(/^\+/, '')}@s.whatsapp.net`;
                        targets.push(jid);
                    }
                    continue;
                }

                if (item.includes('@')) {
                    targets.push(normalizeJid(item));
                    continue;
                }

                if (/^\d+$/.test(item) && item.length >= 8) {
                    targets.push(`${item}@s.whatsapp.net`);
                }
            }

            targets = [...new Set(targets.map(jid => normalizeJid(jid)).filter(jid => jid))];

            if (opts.maxTargets && targets.length > opts.maxTargets) {
                targets = targets.slice(0, opts.maxTargets);
            }

            return targets;
        }

        return [];
    } catch (error) {
        console.error('Error en parseUserTargets:', error);
        return [];
    }
}

const normalizeJid = v => {
    if (!v) return ''
    if (typeof v === 'number') v = String(v)
    v = (v + '').trim()
    if (v.startsWith('@')) v = v.slice(1)
    if (v.endsWith('@g.us')) return v
    if (v.includes('@s.whatsapp.net')) {
        const n = toNum(v.split('@')[0])
        return n ? n + '@s.whatsapp.net' : v
    }
    const n = toNum(v)
    return n ? n + '@s.whatsapp.net' : v
}

async function getUserInfo(jid, participants = [], conn) {
    try {
        const normalizedJid = normalizeJid(jid);
        if (!normalizedJid) return null;

        let name = '';
        try {
            name = await conn.getName(normalizedJid) || '';
        } catch (e) {
            name = '';
        }

        return {
            jid: normalizedJid,
            name: name || formatPretty(normalizedJid),
            number: formatPretty(normalizedJid)
        };
    } catch (error) {
        console.error('Error en getUserInfo:', error);
        return {
            jid: normalizeJid(jid),
            name: formatPretty(jid),
            number: formatPretty(jid)
        };
    }
}

const handler = async (m, { conn, text, participants }) => {
  try {
    if (!text?.trim() && !m.mentionedJid?.length && !m.quoted) {
      return conn.reply(m.chat, `> ⓘ \`Uso:\` *addowner @usuario*\n> ⓘ \`Uso:\` *addowner número*\n> ⓘ \`O responde a un mensaje*`, m)
    }

    const targetsAll = parseUserTargets(text || '', {
        resolveMentions: true,
        groupJid: m.chat
    });

    if (m.mentionedJid && Array.isArray(m.mentionedJid)) {
        m.mentionedJid.forEach(jid => {
            if (!targetsAll.includes(jid)) {
                targetsAll.push(jid);
            }
        });
    }

    if (m.quoted) {
        const quotedJid = m.quoted.sender;
        if (quotedJid && !targetsAll.includes(quotedJid)) {
            targetsAll.push(quotedJid);
        }
    }

    if (!targetsAll.length) return conn.reply(m.chat, '> ⓘ \`No se encontró usuario válido\`', m)
    const target = targetsAll[0]

    const info = await getUserInfo(target, participants, conn)
    const num = normalizeCore(info.jid)
    if (!num) return conn.reply(m.chat, '> ⓘ \`Número inválido\`', m)

    const already = (Array.isArray(global.owner) ? global.owner : []).some(v => {
      if (Array.isArray(v)) return normalizeCore(v[0]) === num
      return normalizeCore(v) === num
    })
    if (already) return conn.reply(m.chat, `> ⓘ \`Ya es owner:\` *@${num}*`, m, { mentions: [info.jid] })

    let providedName = ''
    if (text?.trim()) {
      const cleaned = text.replace(/@\d+/g, '').replace(/\+?\d{5,}/g, '').trim()
      providedName = cleaned
    }
    const name = (providedName && providedName.length > 1) ? providedName : (await resolveName(conn, info.jid))

    global.owner = Array.isArray(global.owner) ? global.owner : []
    global.owner.push([num, name, true])

    let persisted = false
    try {
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      const configPath = path.join(__dirname, '..', 'config.js')
      persisted = await appendOwnerToConfig(configPath, num, name, true)
      if (persisted) {
        try { await import(pathToFileURL(configPath).href + `?update=${Date.now()}`) } catch {}
      }
    } catch {}

    const fkontak = await makeFkontak().catch(() => null)
    
    if (persisted) {
      return conn.reply(m.chat, `> ⓘ \`Owner agregado:\` *@${num}*\n> ⓘ \`Nombre:\` *${name}*`, fkontak || m, { mentions: [info.jid] })
    } else {
      return conn.reply(m.chat, `> ⓘ \`Owner agregado en memoria:\` *@${num}*\n> ⓘ \`Nombre:\` *${name}*\n> ⓘ \`No se pudo guardar en config.js\``, fkontak || m, { mentions: [info.jid] })
    }
    
  } catch (e) {
    console.error('[owner-add] error:', e)
    return conn.reply(m.chat, `> ⓘ \`Error:\` *${e.message}*`, m)
  }
}

handler.help = ['addowner']
handler.tags = ['owner']
handler.command = /^(addowner)$/i
handler.group = false
handler.admin = false
handler.botAdmin = false
handler.rowner = true

export default handler