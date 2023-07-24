const fs = require('node:fs')
const youtubedl = require('youtube-dl-exec')

const downloadPart = async (url, filename) => {
  try {
    if (fs.existsSync(`www/videos/${filename}.mp4`)) {
      return
    } else {
      console.log('Downloading Video')
      await youtubedl(`${url}`, {
        format: 'bv[filesize<60M][ext=mp4]',
        output: `www/videos/${filename}.mp4`,
      })
      console.log('Download Complete')
    }
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = downloadPart
