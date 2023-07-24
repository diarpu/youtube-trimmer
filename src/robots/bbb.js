const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg')
const { toSeconds, grabRange } = require('./utils.js')
const fs = require('fs')

const ffmpeg = createFFmpeg({
  log: true,
})

const previewPart = async (inputIn, inputOut, filename) => {
  await ffmpeg.load()
  const ss = inputIn
  const t = String(inputOut).includes(':')
    ? toSeconds(inputIn, inputOut)
    : grabRange(inputOut, inputIn)

  try {
    console.log('> Recortando Video...')

    ffmpeg.FS(
      'writeFile',
      'input.webm',
      await fetchFile(`www/videos/${filename}.webm`)
    )
    await ffmpeg.run('-i', 'input.webm', '-ss', ss, '-t', `${t}`, 'output.webm')

    await fs.promises.writeFile(
      `www/previews/${filename}-preview.webm`,
      ffmpeg.FS('readFile', 'output.webm')
    )
    console.log('> Video Recortado...')
    process.exit(0)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = previewPart
