const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)
const fs = require('node:fs')

const previewPart = async (inputIn, inputOut, filename) => {
  const ss = inputIn
  const t = Number(inputOut) - Number(inputIn)

  try {
    console.log('> Recortando Video...')
    ffmpeg(`public/videos/${filename}.mp4`)
      .seekInput(ss)
      .duration(t)
      .output(`public/previews/${filename}.mp4`)
      .format('mp4')
      .videoBitrate('1500k')
      .size('1280x720')
      .aspect('16:9')
      .videoCodec('libx264')
      .audioCodec('aac')
      .preset('divx')
      .on('end', () => {
        console.log(`> Video recortado correctamente!`)
      })
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = previewPart
