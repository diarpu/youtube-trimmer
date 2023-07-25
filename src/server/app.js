const express = require('express')
const cors = require('cors')
const app = express()
const path = require('path')
const fs = require('node:fs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(express.static('www'))

const PORT = process.env.PORT || 3000

const download = require('../robots/download')
const preview = require('../robots/preview')

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www', 'index.html'))
})

app.post('/api/v1/download', async (req, res) => {
  try {
    const { url, filename } = req.body

    await download(url, filename)
    res.json({ message: 'Downloaded successfully' })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Error' })
  }
})

app.post('/api/v1/preview', async (req, res) => {
  try {
    const { inputIn, inputOut, filename } = req.body

    await preview(inputIn, inputOut, filename)
    res.json({ message: 'Trimmed and saved video!' })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Error' })
  }
})

app.post('/api/v1/save/preview', async (req, res) => {
  try {
    const { url, filename } = req.body

    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const image = Buffer.from(buffer)

    fs.writeFileSync(`www/previews/${filename}.webp`, image)

    res.status(200).json({ message: 'Imagen guardada exitosamente' })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Error' })
  }
})

// Run
app.listen(PORT, () => console.log('Server is running'))
