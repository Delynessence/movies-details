// Menu Toggle Logic untuk menampilkan dan menyembunyikan menu
const menuIcon = document.getElementById("menu-icon");
const menuList = document.querySelector("nav ul");

menuIcon.addEventListener("click", () => {
    // Menambah/menghapus class untuk menunjukkan menu dan animasi ikon
    menuList.classList.toggle("show");
    menuIcon.classList.toggle("active");
});

// Logika untuk menutup menu ketika salah satu item menu diklik
document.querySelectorAll("nav ul a").forEach(item => {
    item.addEventListener("click", () => {
        // Menghilangkan class 'show' dan 'active' saat item menu diklik
        menuList.classList.remove("show");
        menuIcon.classList.remove("active");
    });

    // Variabel untuk melacak halaman saat ini
    let currentPage = 1;

    // Fungsi untuk mengambil film berdasarkan halaman dan query pencarian
    function fetchMovies(page) {
        const searchQuery = $('#search-input').val().trim(); // Mengambil nilai input pencarian
        const encodedQuery = encodeURIComponent(searchQuery); // Mengubah query menjadi aman untuk URL

        // Menampilkan animasi loading selama data diambil
        $('#search-input').html(`
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);

        // Permintaan AJAX untuk mendapatkan data film dari OMDb API
        $.ajax({
            url: 'https://www.omdbapi.com', // URL API
            type: 'get',
            dataType: 'json',
            data: {
                'apikey': 'fd868951', // API key
                's': searchQuery, // Query pencarian
                'page': page // Halaman pencarian
            },
            success: function(result) {
                if (result.Response === "True") {
                    // Jika film ditemukan, tampilkan film
                    let movies = result.Search;
                    $('#movie-list').empty(); // Mengosongkan hasil pencarian sebelumnya

                    // Loop untuk menampilkan setiap film yang ditemukan
                    $.each(movies, function(i, data) {
                        $('#movie-list').append(`
                            <div class="">
                                <div class="card">
                                    <img src="${data.Poster}" class="card-img-top" alt="${data.Title}">
                                    <div class="card-body">
                                        <h5 class="card-title">${data.Title}</h5>
                                        <h6 class="card-subtitle mb-2 s">${data.Year}</h6>
                                        <a href="#" class="btn-detail see-detail" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${data.imdbID}" >See Details</a>
                                    </div>
                                </div>
                            </div>
                        `);
                    });

                    // Menampilkan tombol pagination (sebelumnya/berikutnya) jika film ditemukan
                    if (movies.length > 0) {
                        $('#pagination').html(`
                            <button id="prev-page" class="btn-prev" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                            <button id="next-page" class="btn-next" ${movies.length < 10 ? 'disabled' : ''}>Next</button>
                        `);
                    } else {
                        $('#pagination').empty(); // Sembunyikan pagination jika tidak ada film
                    }

                    // Mengubah URL di address bar sesuai dengan pencarian dan halaman
                    const newUrl = `${window.location.pathname}?query=${encodedQuery}&page=${page}`;
                    history.pushState(null, '', newUrl);

                    // Scroll ke atas setelah data dimuat
                    $('html, body').animate({ scrollTop: 0 }, 'fast');
                } else {
                    // Jika tidak ada film yang ditemukan, tampilkan pesan error
                    $('#movie-list').html(`
                        <div class="error">
                            <h1 class="text-center">${result.Error}</h1>
                        </div>
                    `);
                    $('#pagination').empty(); // Sembunyikan pagination
                    $('html, body').animate({ scrollTop: 0 }, 'fast'); // Scroll ke atas
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // Menangani error jaringan dan AJAX
                console.error('AJAX error:', textStatus, errorThrown);
                $('#pagination').empty(); // Sembunyikan pagination
                $('html, body').animate({ scrollTop: 0 }, 'fast'); // Scroll ke atas
            }
        });
    }

    // Event listener untuk pencarian saat tombol Enter ditekan
    $('#search-input').on('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Mencegah submit form default
            $('#search-button').click(); // Memicu tombol pencarian
        }
    });

    // Event listener untuk tombol pencarian
    $('#search-button').off('click').on('click', function(event) {
        event.stopPropagation();
        let searchQuery = $('#search-input').val().trim();
        if (searchQuery.trim() === "") {
            alert("⚠ Please enter a valid movie title before searching."); // Validasi input kosong
        } else {
            currentPage = 1; // Reset halaman ke 1 saat pencarian baru
            fetchMovies(currentPage); // Panggil fungsi untuk mengambil film
        }
    });

    // Event delegation untuk tombol Previous (halaman sebelumnya)
    $('#pagination').on('click', '#prev-page', function() {
        if (currentPage > 1) {
            currentPage--; 
            fetchMovies(currentPage); // Ambil film untuk halaman baru
        }
    });

    // Event delegation untuk tombol Next (halaman berikutnya)
    $('#pagination').on('click', '#next-page', function() {
        currentPage++; 
        fetchMovies(currentPage); // Ambil film untuk halaman baru
    });
});

// Logika AJAX untuk mendapatkan detail film dan menampilkannya di modal
$('#movie-list').on('click', '.see-detail', function (event) {
    event.preventDefault();
    
    // Tampilkan animasi loading di modal sebelum data dimuat
    $('.modal-body').html(`
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);
    
    // Permintaan AJAX untuk mendapatkan detail film berdasarkan ID film
    $.ajax({
        url: 'https://www.omdbapi.com', // URL API
        type: 'get',
        dataType: 'json',
        data: {
            'apikey': 'fd868951', 
            'i': $(this).data('id') // ID film untuk mendapatkan detail
        },
        success: function (movie) {
            if (movie.Response === "True") {
                // Menampilkan detail film di dalam modal
                const ratings = movie.Ratings.map(rating => 
                    `<li>${rating.Source}: <i class="fas fa-star"></i>${rating.Value}</li>`
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
                                        <ul class="list-group">
                                            ${ratings}
                                        </ul>
                                    </li>
                                    <li class="list-group-item"><strong>Plot:</strong> ${movie.Plot}</li>
                                    <hr>
                                    <li class="list-group-item"><strong>Director:</strong> ${movie.Director}</li>
                                    <li class="list-group-item"><strong>Writer:</strong> ${movie.Writer}</li>
                                    <li class="list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>
                                    <hr>
                                </ul>
                            </div>
                        </div>
                    </div>`)
            }
        }
    });
});
