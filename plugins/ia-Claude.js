import dotenv from 'dotenv'
dotenv.config()

const { Claude } = (await import("../scraper/claudeAi.js"))

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        await m.react('❓')
        return conn.reply(m.chat,
            `> \`🤖 CLAUDE AI\` 🍙\n\n` +
            `> \`📝 Uso:\` ${usedPrefix}${command} <pregunta>\n\n` +
            `> \`💡 Ejemplo:\` ${usedPrefix}${command} ¿quién es el presidente de México?\n\n` +
            `> \`📚 "Haz cualquier pregunta a Claude AI"\` ✨`,
            m
        )
    }

    try {
        await m.react("💬")
        
        // ✅ Obtener sessionKey desde .env
        const sessionKey = process.env.CLAUDE_SESSION_KEY
        
        if (!sessionKey) {
            throw new Error('Claude session key no configurada en .env')
        }
        
        let claude = new Claude(`sessionKey=${sessionKey}`)
        const { result } = await claude.chat(text)
        
        await conn.reply(m.chat, 
            `> \`🤖 RESPUESTA DE CLAUDE\` 🍙\n\n` +
            `> \`💬 Pregunta:\` ${text}\n\n` +
            `> \`📝 Respuesta:\` ${await result}\n\n` +
            `> \`📚 "¡Espero haberte ayudado!"\` ✨`,
            m
        ).then(_ => {
            m.react("🔥")
        })
    } catch (e) {
        await m.react('❌')
        conn.reply(m.chat,
            `> \`❌ ERROR CLAUDE\` 🍙\n\n` +
            `> \`📚 Problema:\` ${e.message}\n\n` +
            `> \`🍙 "Claude no pudo responder en este momento"\` ✨`,
            m
        )
    }
}

handler.help = ['claude']
handler.command = ['claude']
handler.tags = ["ia"]

export default handler