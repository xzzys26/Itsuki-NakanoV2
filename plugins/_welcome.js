// plugins/_welcome.js

let handler = async (m, { conn }) => {
    // 1. Verificar si el evento es una actualización de participantes del grupo
    if (m.type !== 'group-participants.update') return;

    // 2. Obtener la configuración del grupo
    let chat = global.db.data.chats[m.chat];

    // 3. Si la función está desactivada, salir
    if (!chat.welcome) return;

    // 4. Obtener metadatos del grupo (esenciales para el nombre del grupo)
    let groupMetadata;
    try {
        groupMetadata = await conn.groupMetadata(m.chat);
    } catch (e) {
        console.error("Error al obtener metadatos del grupo:", e);
        return; // Salir si no se pueden obtener los metadatos
    }

    const groupName = groupMetadata.subject;
    const currentMembersLength = groupMetadata.participants.length;

    // URLs de las imágenes
    // ¡Asegúrate de que estas URLs sean accesibles públicamente!
    const welcomeImageUrl = 'https://cdn.russellxz.click/6ae2181d.jpg'; // URL para bienvenida
    const goodbyeImageUrl = 'https://cdn.russellxz.click/9f98f272.jpg';  // URL para despedida

    // 5. Manejar las acciones de 'add' y 'remove'
    for (let user of m.participants) {
        // Formatear el JID a número para la mención
        const mentionId = user.split('@')[0];
        
        // Obtener el nombre del usuario
        let userName = global.db.data.users[user]?.name || conn.getName(user);
        
        // La mención se crea automáticamente en el objeto 'mentions'
        const mentionsList = [user]; 

        switch (m.action) {
            case 'add': {
                // Acción cuando un usuario se une al grupo
                let welcomeText = `✨ *¡Bienvenido/a a ${groupName}!* ✨\n\n`;
                welcomeText += `👋 Hola, @${mentionId}!\n`;
                welcomeText += `🎉 Ahora somos *${currentMembersLength}* miembros.\n`;
                welcomeText += `📜 Por favor, lee la descripción y respeta las normas.\n\n`;
                welcomeText += `*¡Disfruta tu estancia!* 🥳`;

                // Enviamos el mensaje con imagen
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: welcomeImageUrl },
                        caption: welcomeText,
                        mentions: mentionsList
                    },
                    { quoted: m }
                );
                break;
            }

            case 'remove': {
                // Acción cuando un usuario sale o es eliminado del grupo
                // Nota: currentMembersLength ya tiene el conteo post-salida.
                
                let goodbyeText = `👋 *¡Adiós, @${mentionId}!* 👋\n\n`;
                goodbyeText += `📉 El grupo *${groupName}* pierde a un miembro.\n`;
                goodbyeText += `🕊️ Ahora somos *${currentMembersLength}* miembros.\n\n`;
                goodbyeText += `¡Esperamos verte pronto!`;

                // Enviamos el mensaje de despedida
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: goodbyeImageUrl },
                        caption: goodbyeText,
                        mentions: mentionsList
                    },
                    { quoted: m }
                );
                break;
            }
        }
    }
};

// Indicamos que este handler solo funciona en grupos
handler.group = true;

// No necesita un comando, se activa por un evento
export default handler;
