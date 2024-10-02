// Menu Toggle Logic
// Mendapatkan elemen ikon menu dan daftar menu
const menuIcon = document.getElementById("menu-icon");
const menuList = document.querySelector("nav ul"); // Diperbarui sesuai selector CSS

// Menambahkan event listener untuk ikon menu
menuIcon.addEventListener("click", () => {
    // Menambahkan/menghapus class "show" untuk daftar menu dan "active" untuk ikon
    menuList.classList.toggle("show");
    menuIcon.classList.toggle("active");
});

// Mendapatkan semua item menu dan menutup menu ketika item diklik
document.querySelectorAll("nav ul a").forEach(item => {
    item.addEventListener("click", () => {
        // Menghapus class "show" dari menu dan "active" dari ikon saat item menu diklik
        menuList.classList.remove("show");
        menuIcon.classList.remove("active");
    });
});

// API Configuration
// Kunci API dari TMDb dan pengaturan halaman awal
const tmdbApiKey = '06a4f82067c070ae689a3b3e945e4ffb'; // Ganti dengan kunci API TMDb Anda
let currentPage = 1; // Halaman saat ini untuk pagination
let totalPages = 1; // Total halaman berdasarkan data yang dikembalikan API

// Fungsi untuk mengambil film dari API TMDb dan menampilkan rekomendasi film
function fetchMovies(page) {
    const tmdbUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${tmdbApiKey}&page=${page}`;

    // Permintaan Ajax untuk mendapatkan data film dari TMDb
    $.ajax({
        url: tmdbUrl,
        method: 'GET',
        success: function(data) {
            // Mendapatkan judul film dari hasil TMDb
            const movieTitles = data.results.map(movie => movie.title);

            // Meminta detail film dari OMDB berdasarkan judul film TMDb
            const movieDetailsPromises = movieTitles.map(title =>
                $.ajax({
                    url: 'https://www.omdbapi.com/',
                    method: 'GET',
                    data: {
                        apikey: 'fd868951', // Kunci API OMDb
                        t: title // Judul film untuk pencarian
                    }
                })
            );

            // Ketika semua permintaan selesai, tampilkan film
            Promise.all(movieDetailsPromises).then(movies => {
                displayMovies(movies); // Menampilkan film yang berhasil diambil
                totalPages = data.total_pages; // Mengatur total halaman dari hasil TMDb

                // Mengatur tombol pagination berdasarkan halaman saat ini
                $('#pagination').html(`
                    <button id="prev-page" class="btn-prev me-2" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                    <button id="next-page" class="btn-next ms-2" ${movies.length < 10 ? 'disabled' : ''}>Next</button>
                `);

                // Scroll ke atas setelah data film ditampilkan
                $('html, body').animate({ scrollTop: 0 }, 'fast');
            }).catch(() => {
                // Jika terjadi kesalahan, tampilkan pesan error
                $('#movie-list').html(`
                    <div class="error">
                        <h1 class="text-center">Terjadi kesalahan saat mengambil data.</h1>
                    </div>
                `);
                $('#pagination').empty(); // Sembunyikan pagination saat error
            });
        },
        error: function() {
            // Jika permintaan Ajax gagal, tampilkan pesan error
            $('#movie-list').html(`
                <div class="error">
                    <h1 class="text-center">Terjadi kesalahan saat mengambil data.</h1>
                </div>
            `);
            $('#pagination').empty(); // Sembunyikan pagination
        }
    });
}

// Fungsi untuk menampilkan film di halaman
function displayMovies(movies) {
    const movieContainer = $('#movie-recomandation'); // Kontainer untuk rekomendasi film
    movieContainer.empty(); // Kosongkan kontainer sebelum menampilkan film baru

    // Loop untuk menampilkan setiap film yang berhasil diambil
    movies.forEach(movie => {
        if (movie.Response === "True") {
            movieContainer.append(`
                <div class="">
                    <div class="card">
                        <img src="${movie.Poster}" class="card-img-top" alt="${movie.Title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.Title}</h5>
                            <h6 class="card-subtitle mb-3">${movie.Year}</h6>
                            <a href="#" class="btn-detail see-detail" data-id="${movie.imdbID}">See Details<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clip-rule="evenodd"></path></svg></a>
                        </div>
                    </div>
                </div>
            `);
        }
    });
}

// Event Listeners

// Event listener untuk tombol halaman sebelumnya pada pagination
$('#pagination').on('click', '#prev-page', function() {
    if (currentPage > 1) {
        currentPage--; // Kurangi halaman saat ini
        fetchMovies(currentPage); // Ambil film untuk halaman baru
    }
});

// Event listener untuk tombol halaman berikutnya pada pagination
$('#pagination').on('click', '#next-page', function() {
    if (currentPage < totalPages) {
        currentPage++; // Tambah halaman saat ini
        fetchMovies(currentPage); // Ambil film untuk halaman baru
    }
});

// Ketika tombol "See Details" diklik, tampilkan detail film di modal
$('#movie-recomandation').on('click', '.see-detail', function() {
    event.preventDefault();

    // Tampilkan animasi loading di modal sebelum data dimuat
    $('.modal-body').html(`
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);

    // Ambil ID film dari atribut data-id
    const imdbID = $(this).data('id');
    
    // Permintaan Ajax untuk mendapatkan detail film dari OMDb
    $.ajax({
        url: 'https://www.omdbapi.com/',
        method: 'GET',
        data: {
            apikey: 'fd868951', // Kunci API OMDb
            i: imdbID // ID film untuk pencarian detail
        },
        success: function(movie) {
            if (movie.Response === "True") {
                // Menampilkan detail film di dalam modal
                const ratings = movie.Ratings.map(rating =>
                    `<li>${rating.Source}: <i class="fas fa-star"></i> ${rating.Value}</li>`
                ).join('');

                $('.modal-body').html(`
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-md-4" id="poster">
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
                
                // Tampilkan modal dengan data film
                $('#exampleModal').modal('show');
            }
        }
    });
});

// Panggilan awal untuk mengambil film ketika halaman dimuat pertama kali
fetchMovies(currentPage);
