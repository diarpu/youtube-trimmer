import slugify from 'slugify'
import YouTubePlayer from 'yt-player'

if (module.hot) {
  module.hot.accept()
}

const form = document.querySelector('#load-form')
const previewForm = document.querySelector('#preview-form')
const containerVideos = document.querySelector('#sectionVideos')
const downloadVideoButton = document.querySelector('#downloadVideo')
const downloadPrevievButton = document.querySelector('#downloadPreview')
const divPosterPreview = document.querySelector('#posterVideo')
const divScreenShot = containerScreenShot.querySelector('div.container')

let isPreviewVideo = false
let isSelectionPlaying = false

const player = new YouTubePlayer('#youtube-video', {
  width: 0,
  height: 0,
})

player.on('timeupdate', () => {
  const currentTime = player.getCurrentTime()
  const reachStopTime = currentTime >= Number(inputOut.value)
  if (isSelectionPlaying && reachStopTime) {
    player.pause()
    isSelectionPlaying = false
  }
})

function playSelection() {
  player.seek(Number(inputIn.value))
  isSelectionPlaying = true
  player.play()
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  downloadVideoButton.classList.add('disabled')

  const cVideo = document.querySelector('#cVideo')
  if (cVideo.querySelector('video')) {
    cVideo.querySelector('video').remove()
    cVideo.classList.remove('block')
  }

  if (isPreviewVideo) {
    const pVideo = document.querySelector('#pVideo')
    pVideo.removeChild(pVideo.querySelector('video'))
    pVideo.classList.remove('block')
    const imagePoster = divPosterPreview.querySelector('img')
    imagePoster && divPosterPreview.removeChild(imagePoster)
    divPosterPreview.classList.remove('block')
    isPreviewVideo = false
  }

  const videoId = url.value.split('v=')[1]
  player.load(videoId, {
    autoplay: true,
  })

  response.innerHTML = `<p>Uploading...</p>`
  const formData = new FormData()
  formData.append('url', url.value)
  formData.append(
    'filename',
    slugify(filename.value, {
      lower: true,
    })
  )
  const formDataJsonString = JSON.stringify(
    Object.fromEntries(formData.entries())
  )

  try {
    const res = await fetch('/api/v1/download', {
      body: formDataJsonString,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const data = await res.json()

    response.innerHTML = `<p>${data.message}</p>`
    containerVideos.classList.add('block')
    cVideo.classList.add('block')

    // Complete Video
    const completeVideo = document.createElement('video')
    completeVideo.src = `/videos/${formData.get('filename')}.mp4`
    completeVideo.controls = true
    cVideo.appendChild(completeVideo)
    downloadVideoButton.classList.remove('disabled')
  } catch (err) {
    console.log(err)
    url.value = ''
    filename.value = ''
    response.innerHTML = `<p>Something went wrong</p>`
  }
})

async function saveImagePreview() {
  const name = slugify(filename.value, { lower: true })
  const videoUrl = `/previews/${name}.mp4`
  const video = document.createElement('video')
  video.src = videoUrl

  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas')
      const aspectRatio = video.videoWidth / video.videoHeight
      canvas.width = 1000
      canvas.height = canvas.width / aspectRatio
      const ctx = canvas.getContext('2d')

      video.currentTime = 0

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/webp')
        resolve(dataUrl)
      }

      video.onerror = (error) => {
        reject(error)
      }
    }
  }).then(async (dataUrl) => {
    await fetch('/api/v1/save/preview', {
      body: JSON.stringify({
        url: dataUrl,
        filename: `${name}-poster`,
      }),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())

    const imgUrl = `previews/${name}-poster.webp`
    const img = document.createElement('img')
    img.src = imgUrl
    divPosterPreview.classList.add('block')
    divPosterPreview.appendChild(img)
  })
}

function getVideoPreview(e) {
  e && e.preventDefault()
  downloadPrevievButton.classList.add('disabled')

  if (isPreviewVideo) {
    const pVideo = document.querySelector('#pVideo')
    pVideo.removeChild(pVideo.querySelector('video'))
    pVideo.classList.remove('block')
    const imagePoster = divPosterPreview.querySelector('img')
    imagePoster && divPosterPreview.removeChild(imagePoster)
    divPosterPreview.classList.remove('block')
    isPreviewVideo = false
  }

  response.innerHTML = `<p>Trimmer video...</p>`
  const formPreviewData = new FormData()
  formPreviewData.append('inputIn', inputIn.value)
  formPreviewData.append('inputOut', inputOut.value)
  formPreviewData.append(
    'filename',
    slugify(filename.value, {
      lower: true,
    })
  )
  const formDataPreview = JSON.stringify(
    Object.fromEntries(formPreviewData.entries())
  )

  if (inputIn.value >= inputOut.value) {
    response.innerHTML = `<p>Please, enter correct time</p>`
    return
  } else {
    fetch('/api/v1/preview', {
      body: formDataPreview,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        isPreviewVideo = true
        response.innerHTML = `<p>${data.message}</p>`
        containerVideos.classList.add('block')
        pVideo.classList.add('block')
        saveImagePreview()
        const file = `/previews/${formPreviewData.get('filename')}.mp4`

        // Preview Video
        const previewVideo = document.createElement('video')
        previewVideo.src = file
        previewVideo.controls = true
        pVideo.appendChild(previewVideo)
        downloadPrevievButton.classList.remove('disabled')
      })
      .catch((err) => {
        console.log(err)
        response.innerHTML = `<p>Something went wrong</p>`
      })
  }
}

previewForm.addEventListener('submit', (e) => getVideoPreview(e))

const setInOut = (currentTime, field) => (field.value = currentTime)

setTimeIn.addEventListener('click', () =>
  setInOut(player.getCurrentTime(), inputIn)
)

setTimeOut.addEventListener('click', () =>
  setInOut(player.getCurrentTime(), inputOut)
)

playPreview.addEventListener('click', () => playSelection())

function screenShot(currentTime) {
  const name = slugify(filename.value, { lower: true })

  const videoUrl = `videos/${name}.mp4`
  const video = document.createElement('video')
  video.src = videoUrl

  new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas')
      const aspectRatio = video.videoWidth / video.videoHeight
      canvas.width = 1000
      canvas.height = canvas.width / aspectRatio
      const ctx = canvas.getContext('2d')

      video.currentTime = currentTime

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/webp')
        resolve(dataUrl)
      }

      video.onerror = (error) => {
        reject(error)
      }
    }
  }).then((dataUrl) => {
    const figure = document.createElement('figure')
    figure.classList.add('screenShot')

    const imgScreenShot = document.createElement('img')
    imgScreenShot.src = dataUrl
    figure.appendChild(imgScreenShot)

    const buttonRemove = document.createElement('button')
    buttonRemove.classList.add('remove')
    buttonRemove.innerHTML = 'X'
    buttonRemove.addEventListener('click', () => {
      figure.parentElement.removeChild(figure)

      if (document.querySelectorAll('figure.screenShot').length === 0) {
        containerScreenShot.classList.remove('block')
      }
    })

    const saveImage = document.createElement('button')
    saveImage.classList.add('save')
    saveImage.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>'
    saveImage.addEventListener('click', () =>
      saveScreenShot(dataUrl, currentTime)
    )

    figure.appendChild(buttonRemove)
    figure.appendChild(saveImage)
    divScreenShot.appendChild(figure)
    containerScreenShot.classList.add('block')
    containerScreenShot.appendChild(divScreenShot)
  })
}

function saveScreenShot(dataUrl, currentTime) {
  const name = slugify(filename.value, { lower: true })
  fetch('/api/v1/save/screenshot', {
    body: JSON.stringify({
      url: dataUrl,
      filename: `${name}-${currentTime}`,
    }),
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())
}

window.addEventListener('keydown', ({ key }) => {
  const currentTime = player.getCurrentTime()

  if (key === 'Dead') {
    player.play()
  }
  if (key === '+') {
    player.pause()
  }
  if (key === 'ArrowLeft') {
    player.seek(currentTime - 1)
  }
  if (key === 'ArrowRight') {
    player.seek(currentTime + 1)
  }
  if (key === '{') {
    setInOut(currentTime, inputIn)
  }
  if (key === '}') {
    setInOut(currentTime, inputOut)
  }
  if (key === 'Shift') {
    playSelection()
  }
  if (key === '¿') {
    getVideoPreview()
  }
  if (key === 'AltGraph') {
    screenShot(currentTime)
  }
})
