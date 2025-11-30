let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin, participants }) => {
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return conn.reply(m.chat, '> ⓘ \\`La economía está desactivada en este grupo\\`', m)
  }

  let user = global.db.data.users[m.sender]
  const cooldown = 2 * 60 * 1000

  if (!user.lastwork) user.lastwork = 0

  if (Date.now() - user.lastwork < cooldown) {
    const tiempoRestante = formatTime(user.lastwork + cooldown - Date.now())
    return conn.reply(m.chat, `> ⓘ \\`Debes esperar:\\` *${tiempoRestante}*`, m)
  }

  user.lastwork = Date.now()

  let baseGanancia = Math.floor(Math.random() * 1501) + 2000
  let bonus = Math.random() < 0.2 ? Math.floor(baseGanancia * 0.3) : 0
  let gananciaTotal = baseGanancia + bonus

  user.coin += gananciaTotal

  const trabajo = pickRandom(trabajoItsuki)
  
  await m.react('💼')
  await conn.reply(m.chat, 
    `> ⓘ \\`${trabajo}\\` *¥${gananciaTotal.toLocaleString()}*\n> ⓘ \\`Ganancia base:\\` *¥${baseGanancia.toLocaleString()}*${bonus > 0 ? `\n> ⓘ \\`Bonus:\\` *+¥${bonus.toLocaleString()}*` : ''}\n> ⓘ \\`Total:\\` *¥${gananciaTotal.toLocaleString()}*`, 
    m
  )
}

handler.help = ['work']
handler.tags = ['economy']
handler.command = ['work']
handler.group = true

export default handler

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const parts = []
  if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return parts.join(' ')
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

const trabajoItsuki = [
  "> ⓘ \\`Estudié diligentemente para mis exámenes y gané\\`",
  "> ⓘ \\`Ayudé en la librería familiar y recibí\\`",
  "> ⓘ \\`Escribí un ensayo académico excelente y me pagaron\\`",
  "> ⓘ \\`Organicé mis apuntes de estudio y encontré\\`",
  "> ⓘ \\`Di clases particulares a estudiantes más jóvenes y gané\\`",
  "> ⓘ \\`Participé en un concurso académico y gané\\`",
  "> ⓘ \\`Vendí algunos de mis libros de texto viejos y obtuve\\`",
  "> ⓘ \\`Ayudé a Miku con sus estudios y me dio\\`",
  "> ⓘ \\`Trabajé como asistente en biblioteca y gané\\`",
  "> ⓘ \\`Escribí reseñas de libros y recibí\\`",
  "> ⓘ \\`Participé en un grupo de estudio y gané\\`",
  "> ⓘ \\`Encontré una solución eficiente para un problema difícil y me premiaron con\\`",
  "> ⓘ \\`Ayudé a Nino con la contabilidad del restaurante y gané\\`",
  "> ⓘ \\`Organicé un evento literario y recibí\\`",
  "> ⓘ \\`Estudié en el café y recibí propinas por ayudar a otros clientes, ganando\\`",
  "> ⓘ \\`Desarrollé un nuevo método de estudio y vendí los derechos por\\`",
  "> ⓘ \\`Gané una beca de estudio por mi excelente desempeño académico, recibiendo\\`",
  "> ⓘ \\`Ayudé a Ichika a memorizar sus guiones y me pagó\\`",
  "> ⓘ \\`Participé en una maratón de estudio y gané\\`",
  "> ⓘ \\`Enseñé técnicas de estudio eficientes y recibí\\`",
  "> ⓘ \\`Completé todos mis deberes con excelencia y mi padre me premió con\\`",
  "> ⓘ \\`Gané un debate académico y recibí\\`",
  "> ⓘ \\`Ayudé a Yotsuba con sus tareas escolares y me dio\\`",
  "> ⓘ \\`Descubrí una edición rara de un libro y la vendí por\\`",
  "> ⓘ \\`Escribí un best-seller académico y recibí regalías por\\`",
  "> ⓘ \\`Participé en una investigación universitaria y me pagaron\\`",
  "> ⓘ \\`Organicé mi colección de libros y encontré dinero olvidado, sumando\\`",
  "> ⓘ \\`Gané una competencia de ortografía y recibí\\`",
  "> ⓘ \\`Ayudé a digitalizar archivos de la biblioteca y gané\\`",
  "> ⓘ \\`Enseñé japonés tradicional a extranjeros y recibí\\`",
  "> ⓘ \\`Resolví problemas matemáticos complejos en una competencia y gané\\`",
  "> ⓘ \\`Asistí como tutora en un curso intensivo y recibí\\`",
  "> ⓘ \\`Escribí guías de estudio para universitarios y vendí\\`",
  "> ⓘ \\`Organicé una conferencia académica y me pagaron\\`",
  "> ⓘ \\`Ayudé a traducir documentos académicos del japonés y gané\\`",
  "> ⓘ \\`Participé en un programa de intercambio estudiantil como mentora y recibí\\`",
  "> ⓘ \\`Clasifiqué y catalogué libros antiguos en la biblioteca universitaria por\\`",
  "> ⓘ \\`Gané el primer lugar en un concurso de ensayos y recibí\\`",
  "> ⓘ \\`Revisé y edité trabajos de investigación de otros estudiantes por\\`",
  "> ⓘ \\`Trabajé en una editorial revisando manuscritos académicos y gané\\`",
  "> ⓘ \\`Di una charla motivacional sobre hábitos de estudio efectivos por\\`",
  "> ⓘ \\`Desarrollé una aplicación educativa y vendí la licencia por\\`",
  "> ⓘ \\`Participé como jurado en un concurso de oratoria y me pagaron\\`",
  "> ⓘ \\`Escribí artículos para una revista académica y recibí\\`",
  "> ⓘ \\`Organicé sesiones de estudio grupal pagadas y gané\\`",
  "> ⓘ \\`Ayudé a preparar material didáctico para profesores y recibí\\`",
  "> ⓘ \\`Traduje libros de texto del inglés al japonés por\\`",
  "> ⓘ \\`Gané una competencia de debate interuniversitario con un premio de\\`",
  "> ⓘ \\`Trabajé como correctora de estilo para trabajos universitarios y gané\\`",
  "> ⓘ \\`Creé contenido educativo para plataformas online y recibí\\`",
  "> ⓘ \\`Participé en un panel de expertos sobre métodos de estudio por\\`",
  "> ⓘ \\`Ayudé en la organización de exámenes de admisión y gané\\`",
  "> ⓘ \\`Escribí críticas literarias para un periódico estudiantil por\\`",
  "> ⓘ \\`Di asesorías sobre elección de carrera universitaria y recibí\\`",
  "> ⓘ \\`Trabajé en un proyecto de investigación del ministerio de educación por\\`",
  "> ⓘ \\`Organicé un club de lectura privado y gané\\`",
  "> ⓘ \\`Ayudé a estudiantes extranjeros con sus tesis en japonés por\\`",
  "> ⓘ \\`Participé en un programa de radio educativo y me pagaron\\`",
  "> ⓘ \\`Creé presentaciones profesionales para conferencias académicas por\\`",
  "> ⓘ \\`Trabajé como asistente de investigación en la universidad y gané\\`",
  "> ⓘ \\`Gané una beca internacional de investigación valorada en\\`",
  "> ⓘ \\`Escribí la introducción para un libro académico importante por\\`",
  "> ⓘ \\`Organicé talleres de técnicas de memorización y recibí\\`",
  "> ⓘ \\`Ayudé a digitalizar archivos históricos de la biblioteca por\\`",
  "> ⓘ \\`Participé en un documental educativo como experta y gané\\`",
  "> ⓘ \\`Creé infografías educativas para instituciones y recibí\\`",
  "> ⓘ \\`Trabajé en la corrección de exámenes de certificación por\\`",
  "> ⓘ \\`Gané un concurso de conocimientos generales con premio de\\`",
  "> ⓘ \\`Ayudé a diseñar el currículo de un curso universitario por\\`",
  "> ⓘ \\`Escribí reseñas académicas para una base de datos especializada y gané\\`",
  "> ⓘ \\`Organicé un simposio estudiantil internacional y recibí\\`",
  "> ⓘ \\`Trabajé como traductora simultánea en una conferencia académica por\\`",
  "> ⓘ \\`Desarrollé materiales de estudio personalizados para estudiantes y gané\\`",
  "> ⓘ \\`Participé en un programa de mentoría universitaria pagada por\\`",
  "> ⓘ \\`Ayudé a catalogar colecciones especiales en museos educativos por\\`",
  "> ⓘ \\`Gané una competencia de análisis literario con premio de\\`",
  "> ⓘ \\`Trabajé en la revisión de políticas educativas como consultora junior por\\`",
  "> ⓘ \\`Creé un podcast educativo exitoso y gané en publicidad\\`",
  "> ⓘ \\`Participé en la elaboración de exámenes estandarizados por\\`",
  "> ⓘ \\`Ayudé en la coordinación de programas de becas estudiantiles y recibí\\`",
  "> ⓘ \\`Escribí capítulos para un libro colaborativo de estudio por\\`"
]
