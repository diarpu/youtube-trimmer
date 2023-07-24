const fs = require('node:fs')

const previewPart = async (inputIn, inputOut, filename) => {
  const ss = inputIn
  const t = Number(inputOut) - Number(inputIn)
  const video = `www/videos/${filename}.mp4`
  const preview = `www/previews/${filename}.mp4`

  try {
    console.log('> Trimming Video...')

    const { execa } = await import('execa')

    if (fs.existsSync(preview)) {
      fs.unlinkSync(preview)
    }

    await execa('ffmpeg', [
      '-ss',
      ss,
      '-i',
      video,
      '-t',
      `${t}`,
      '-c:a',
      'aac',
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      preview,
    ])

    console.log('> Trimmed and saved video...')
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = previewPart
