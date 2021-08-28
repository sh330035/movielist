const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const cardsModel = document.querySelector('#cards-model')
const listModel = document.querySelector('#list-model')
const pagination = document.querySelector('#pagination')
const moviesPrePage = 12
let nowPage = 1

const movies = []
let movieFilter = []

// API
axios
  .get(INDEX_URL)
  .then((Response) => {
    movies.push(...Response.data.results)
    renderMovieList(getMovieByPage(1))
    renderPaginator(movies.length)
  })
  .catch((err) => {
    console.log(err)
  })

// 渲染卡片模式的Movie List
function renderMovieList(data) {
  let rawHTML = ''
  // catch title & image
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${
                POSTER_URL + item.image
              }" class="card-img-top" alt="movie poster">
              <class class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </class>
              <div class="card-footer">
                <button 
                class="btn btn-primary btn-show-more" 
                data-toggle="modal" 
                data-target="#MovieModal"
                data-id="${item.id}"
                >
                More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${
                  item.id
                }">+</button>
              </div>
            </div>
          </div>
        </div>`
  })
  dataPanel.classList.add('row')
  dataPanel.innerHTML = rawHTML
}

// 渲染清單模式的Movie List
function renderMovieToList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `<hr>
        <div class="list row">
          <h5 class="col-sm-10">${item.title}</h5>
            <button 
              class="btn btn-primary btn-show-more" 
              data-toggle="modal" 
              data-target="#MovieModal"
              data-id="${item.id}"
              style="margin: 0.5rem;"
              >
              More
            </button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}" style="margin: 0.5rem;">+</button>
        </div>`
  })
  dataPanel.classList.remove('row')
  dataPanel.innerHTML = rawHTML
}

// 分頁功能
function getMovieByPage(page) {
  const data = movieFilter.length ? movieFilter : movies
  const startIndex = (page - 1) * moviesPrePage
  const endIndex = startIndex + moviesPrePage
  return data.slice(startIndex, endIndex)
}

// 產生分頁器
function renderPaginator(amount) {
  let rawHTML = ''
  const pages = Math.ceil(amount / moviesPrePage)

  for (let i = 0; i < pages; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${
      i + 1
    }">${i + 1}</a></li>`
  }
  pagination.innerHTML = rawHTML
}

// 點擊按鈕More，生成詳細資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-img')
  const modalDate = document.querySelector('#movie-modal-data')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((Response) => {
    const data = Response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster">`
  })
}

// 點擊按鈕+，加入我的最愛
function addToFavorite(id) {
  id = Number(id)
  // 把localStorage的東西拿出來
  let list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('已加入我的最愛') // 有return，就直接結束函式
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 判斷目前位於卡片模式或是清單模式，並生成點擊之分頁
function picOrList(data, page) {
  if (dataPanel.classList.length == 1) {
    renderMovieList(getMovieByPage(page))
  } else if (dataPanel.classList.length == 0) {
    renderMovieToList(getMovieByPage(page))
  }
}

// click more event
dataPanel.addEventListener('click', function panelClick(event) {
  if (event.target.matches('.btn-show-more')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(event.target.dataset.id)
  }
})

// search bar
searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  movieFilter = movies.filter((movies) =>
    movies.title.toLowerCase().includes(keyword)
  )

  if (!movieFilter.length) {
    alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  picOrList(getMovieByPage(1), 1)
  renderPaginator(movieFilter.length)
})

// click pagination event；確認點擊有效後，送入picOrList函式進行判斷，並回傳當下分頁至Global
pagination.addEventListener('click', function paginationClick(event) {
  if (event.target.tagName !== 'A') return
  const page = event.target.dataset.page

  picOrList(getMovieByPage(page), page)
  nowPage = page
  return nowPage
})

// 顯示模式切換 (從Global中取得當下分頁，可於同分頁切換顯示)
listModel.addEventListener('click', function onList(event) {
  renderMovieToList(getMovieByPage(nowPage))
})

cardsModel.addEventListener('click', function onList(event) {
  renderMovieList(getMovieByPage(nowPage))
})
