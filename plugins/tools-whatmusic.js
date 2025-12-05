import fs from 'fs'
import acrcloud from 'acrcloud'
import fetch from 'node-fetch'

let handler = async (m, { usedPrefix, command, conn, text }) => {
    // Configuración del token
    let acr = new acrcloud({
        host: 'identify-eu-west-1.acrcloud.com',
        access_key: 'c33c767d683f78bd17d4bd4991955d81',
        access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
    })

    let mimes = (m.quoted ? m.quoted : m.msg).mimetype || ''

    if (/audio|video/.test(mimes)) {
        let q = m.quoted ? m.quoted : m
        let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''

        m.reply('🎵 *Buscando información de la canción...*')

        let media = await q.download()
        let ext = mime.split('/')[1]

        fs.writeFileSync(`./tmp/${m.sender}.${ext}`, media)

        let res = await acr.identify(
            fs.readFileSync(`./tmp/${m.sender}.${ext}`)
        )

        let { code, msg } = res.status
        if (code !== 0) {
            fs.unlinkSync(`./tmp/${m.sender}.${ext}`)
            return m.reply('> ❌ No se encontró ninguna canción.')
        }

        let { title, artists, album, genres, release_date, external_metadata } = res.metadata.music[0]
        
        // Buscar imagen del álbum
        let albumImage = null
        if (album && album.name) {
            try {
                // Buscar en Spotify
                let spotifySearch = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(title + ' ' + (artists ? artists[0].name : ''))}&type=track&limit=1`)
                let spotifyData = await spotifySearch.json()
                
                if (spotifyData.tracks && spotifyData.tracks.items && spotifyData.tracks.items[0]) {
                    albumImage = spotifyData.tracks.items[0].album.images[0]?.url
                }
            } catch (e) {
                console.log('Error al buscar en Spotify:', e)
                
                // Si falla Spotify, intentar con iTunes
                try {
                    let itunesSearch = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(title + ' ' + (artists ? artists[0].name : ''))}&entity=song&limit=1`)
                    let itunesData = await itunesSearch.json()
                    
                    if (itunesData.results && itunesData.results[0]) {
                        albumImage = itunesData.results[0].artworkUrl100.replace('100x100', '600x600')
                    }
                } catch (e2) {
                    console.log('Error al buscar en iTunes:', e2)
                }
            }
        }

        let txt = `*🎵 IDENTIFICADOR DE MÚSICA 🎵*

> 🎶 *Título:* ${title}
> 👨‍🎤 *Artista(s):* ${artists ? artists.map(v => v.name).join(', ') : 'Desconocido'}
> 💿 *Álbum:* ${album?.name || 'Desconocido'}
> 🎼 *Género:* ${genres ? genres.map(v => v.name).join(', ') : 'Desconocido'}
> 📅 *Fecha de lanzamiento:* ${release_date || 'Desconocido'}

`.trim()

        fs.unlinkSync(`./tmp/${m.sender}.${ext}`)

        // Enviar respuesta con imagen si está disponible
        if (albumImage) {
            try {
                // Descargar la imagen
                let imgResponse = await fetch(albumImage)
                let imgBuffer = await imgResponse.buffer()
                
                // Enviar mensaje con imagen y texto
                await conn.sendMessage(m.chat, {
                    image: imgBuffer,
                    caption: txt,
                    contextInfo: {
                        externalAdReply: {
                            title: `🎵 ${title}`,
                            body: `👨‍🎤 ${artists ? artists.map(v => v.name).join(', ') : 'Desconocido'}`,
                            thumbnail: imgBuffer,
                            sourceUrl: 'https://spotify.com'
                        }
                    }
                })
            } catch (imgError) {
                console.log('Error al obtener imagen:', imgError)
                // Si falla la imagen, enviar solo texto
                m.reply(txt)
            }
        } else {
            m.reply(txt)
        }

        // Agregar reacción de emoji
        try {
            await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })
        } catch (e) {
            console.log('Error al enviar reacción:', e)
        }

    } else {
        m.reply(`> ⚠️ Responde a un *audio o video* con el comando *${command}*`)

        // Agregar reacción de error
        try {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        } catch (e) {
            console.log('Error al enviar reacción:', e)
        }
    }
}

handler.help = ['whatmusic']
handler.tags = ['tools']
handler.command = /^(whatmusic|shazam|music)$/i

export default handler