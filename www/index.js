import slugify from 'slugify'
import YouTubePlayer from 'yt-player'

if (module.hot) {
  module.hot.accept()
}

const form = document.querySelector('#load-form')
const previewForm = document.querySelector('#preview-form')

const player = new YouTubePlayer('#youtube-video', {
  width: 0,
  height: 0,
})

form.addEventListener('submit', (e) => {
  e.preventDefault()

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

  fetch('/api/v1/download', {
    body: formDataJsonString,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      response.innerHTML = `<p>${data.message}</p>`
    })
    .catch((err) => {
      console.log(err)
      url.value = ''
      filename.value = ''
      response.innerHTML = `<p>Something went wrong</p>`
    })
})

const setInOut = (currentTime, field) => (field.value = currentTime)

setTimeIn.addEventListener('click', () =>
  setInOut(player.getCurrentTime(), inputIn)
)

setTimeOut.addEventListener('click', () =>
  setInOut(player.getCurrentTime(), inputOut)
)

window.addEventListener('keydown', ({ key }) => {
  console.log(key)
  const currentTime = player.getCurrentTime()
  // const isPlayedState = player.getState()

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
})

previewForm.addEventListener('submit', (e) => {
  e.preventDefault()

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
        response.innerHTML = `<p>${data.message}</p>`
      })
      .catch((err) => {
        console.log(err)
        response.innerHTML = `<p>Something went wrong</p>`
      })
  }
})
