// Menu Toggle Logic
const menuIcon = document.getElementById("menu-icon");
const menuList = document.querySelector("nav ul"); // Updated to match the CSS selector

menuIcon.addEventListener("click", () => {
    menuList.classList.toggle("show");
    menuIcon.classList.toggle("active");
});

// Get all menu items and close the menu on item click
document.querySelectorAll("nav ul a").forEach(item => {
    item.addEventListener("click", () => {
        menuList.classList.remove("show");
        menuIcon.classList.remove("active");
    });
});


// API Configuration
const tmdbApiKey = '06a4f82067c070ae689a3b3e945e4ffb'; // Replace with your TMDb API Key
let currentPage = 1;
let totalPages = 1;

function fetchMovies(page) {
    const tmdbUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${tmdbApiKey}&page=${page}`;

    $.ajax({
        url: tmdbUrl,
        method: 'GET',
        success: function(data) {
            const movieTitles = data.results.map(movie => movie.title);

            // Fetch details from OMDB for each movie title
            const movieDetailsPromises = movieTitles.map(title =>
                $.ajax({
                    url: 'https://www.omdbapi.com/',
                    method: 'GET',
                    data: {
                        apikey: 'fd868951',
                        t: title
                    }
                })
            );

            Promise.all(movieDetailsPromises).then(movies => {
                displayMovies(movies);
                totalPages = data.total_pages;

                $('#pagination').html(`
                    <button id="prev-page" class="btn-prev me-2" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                    <button id="next-page" class="btn-next ms-2" ${movies.length < 10 ? 'disabled' : ''}>Next</button>
                `);

                $('html, body').animate({ scrollTop: 0 }, 'fast');
            }).catch(() => {
                $('#movie-list').html(`
                    <div class="error">
                        <h1 class="text-center">Terjadi kesalahan saat mengambil data.</h1>
                    </div>
                `);
                $('#pagination').empty();
            });
        },
        error: function() {
            $('#movie-list').html(`
                <div class="error">
                    <h1 class="text-center">Terjadi kesalahan saat mengambil data.</h1>
                </div>
            `);
            $('#pagination').empty();
        }
    });
}

function displayMovies(movies) {
    const movieContainer = $('#movie-recomandation');
    movieContainer.empty();

    movies.forEach(movie => {
        if (movie.Response === "True") {
            movieContainer.append(`
                <div class="">
                    <div class="card">
                        <img src="${movie.Poster}" class="card-img-top" alt="${movie.Title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.Title}</h5>
                            <h6 class="card-subtitle mb-2 ">${movie.Year}</h6>
                            <a href="#" class="btn-detail see-detail" data-id="${movie.imdbID}">See Details<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clip-rule="evenodd"></path> </svg></a>
                        </div>
                    </div>
                </div>
            `);
        }
    });
}

// Event Listeners
$('#search-button').on('click', function() {
    currentPage = 1;
    fetchMovies(currentPage);
});

$('#pagination').on('click', '#prev-page', function() {
    if (currentPage > 1) {
        currentPage--;
        fetchMovies(currentPage);
    }
});

$('#pagination').on('click', '#next-page', function() {
    if (currentPage < totalPages) {
        currentPage++;
        fetchMovies(currentPage);
    }
});

$(window).on('beforeunload', function() {
    localStorage.removeItem('currentKeyword');
});

$('#movie-recomandation').on('click', '.see-detail', function() {
  event.preventDefault();

  // Clear the modal content
  $('.modal-body').html(`
    <div class="text-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
`);

    const imdbID = $(this).data('id');
    $.ajax({
        url: 'https://www.omdbapi.com/',
        method: 'GET',
        data: {
            apikey: 'fd868951',
            i: imdbID
        },
        success: function(movie) {
            if (movie.Response === "True") {
                const ratings = movie.Ratings.map(rating =>
                    `<li>${rating.Source}: <i class="fas fa-star"></i> ${rating.Value}</li>`
                ).join('');

                $('.modal-body').html(`
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-md-4">
                                <img src="${movie.Poster}" class="img-fluid" alt="${movie.Title} Poster">
                            </div>
                            <div class="col-md-8">
                                <ul class="list-group">
                                    <li class="list-group-item"><strong>Movie Title:</strong> ${movie.Title}</li>
                                    <li class="list-group-item"><strong>Year:</strong> ${movie.Year}</li>
                                    <li class="list-group-item"><strong>Released:</strong> ${movie.Released}</li>
                                    <li class="list-group-item"><strong>Genres:</strong> ${movie.Genre}</li>
                                    <li class="list-group-item"><strong>Type:</strong> ${movie.Type}</li>
                                    <li class="list-group-item"><strong>Runtime:</strong> ${movie.Runtime}</li>
                                    <li class="list-group-item"><strong>Language:</strong> ${movie.Language}</li>
                                    <li class="list-group-item"><strong>Country:</strong> ${movie.Country}</li>
                                    <li class="list-group-item"><strong>Certificate:</strong> ${movie.Rated}</li>
                                    <li class="list-group-item"><strong>Ratings:</strong>
                                        <ul class="list-group">${ratings}</ul>
                                    </li>
                                    <li class="list-group-item"><strong>Plot:</strong> ${movie.Plot}</li>
                                    <hr>
                                    <li class="list-group-item"><strong>Director:</strong> ${movie.Director}</li>
                                    <li class="list-group-item"><strong>Writer:</strong> ${movie.Writer}</li>
                                    <li class="list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `);
                
                // Show the modal
                $('#exampleModal').modal('show');
            }
        }
    });
});


// Initial Call
fetchMovies(currentPage);
