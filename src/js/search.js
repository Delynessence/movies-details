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

    
    let currentPage = 1;

    // Fungsi untuk mengambil dan menampilkan film berdasarkan halaman
    function fetchMovies(page) {
        const searchQuery = $('#search-input').val().trim(); // Mengambil nilai dari input pencarian
        const encodedQuery = encodeURIComponent(searchQuery); // Encode query untuk URL

        $('#search-input').html(`
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);
        $.ajax({
            url: 'https://www.omdbapi.com',
            type: 'get',
            dataType: 'json',
            data: {
                'apikey': 'fd868951',
                's': searchQuery,
                'page': page
            },
            success: function(result) {
                
                if (result.Response === "True") {
                    let movies = result.Search;

                    // Membersihkan hasil sebelumnya
                    $('#movie-list').empty();

                    // Menampilkan film yang diperoleh dari API
                    $.each(movies, function(i, data) {
                        $('#movie-list').append(`
                            <div class="col-md-3 mb-3">
                                <div class="card">
                                    <img src="${data.Poster}" class="card-img-top" alt="${data.Title}">
                                    <div class="card-body">
                                        <h5 class="card-title">${data.Title}</h5>
                                        <h6 class="card-subtitle mb-2 text-muted">${data.Year}</h6>
                                        <a href="#" class="btn-detail see-detail" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${data.imdbID}" >See Details<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clip-rule="evenodd"></path> </svg></a>
                                    </div>
                                </div>
                            </div>
                        `);
                    });

                    // Menampilkan tombol pagination jika ada hasil yang ditemukan
                    if (movies.length > 0) {
                        $('#pagination').html(`
                            <button id="prev-page" class="btn-prev me-2" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                            <button id="next-page" class="btn-next" ${movies.length < 10 ? 'disabled' : ''}>Next</button>
                        `);
                    } else {
                        $('#pagination').empty(); // Sembunyikan tombol jika tidak ada hasil
                    }

                    // Mengubah URL di address bar sesuai dengan pencarian dan halaman
                    const newUrl = `${window.location.pathname}?query=${encodedQuery}&page=${page}`;
                        history.pushState(null, '', newUrl);

                    // Menggulir halaman ke atas setelah memuat data
                    $('html, body').animate({ scrollTop: 0 }, 'fast');

                } else {
                    // Jika tidak ada film yang ditemukan, tampilkan pesan error
                    $('#movie-list').html(`
                        <div class="error">
                            <h1 class="text-center">${result.Error}</h1>
                        </div>
                    `);

                    // Sembunyikan pagination
                    $('#pagination').empty();

                    // Menggulir halaman ke atas setelah memuat data
                    $('html, body').animate({ scrollTop: 0 }, 'fast');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error:', textStatus, errorThrown); // Logging error for debugging

                // Sembunyikan pagination
                $('#pagination').empty();

                // Menggulir halaman ke atas juga saat terjadi error jaringan
                $('html, body').animate({ scrollTop: 0 }, 'fast');
            }
        });
    }

    // Event listener untuk tombol pencarian atau saat menekan Enter
    $('#search-input').on('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Mencegah perilaku default (form submit)
            $('#search-button').click(); // Memicu klik tombol pencarian
        }
    });

    // Event listener untuk tombol pencarian
$('#search-button').off('click').on('click', function(event) {
    event.stopPropagation();
    let searchQuery = $('#search-input').val().trim();
    if (searchQuery.trim() === "") {
        alert("⚠ Please enter a valid movie title before searching.");
    }
     else {
        currentPage = 1;
        fetchMovies(currentPage);
    }
});
    
        

    // Event delegation untuk tombol Previous
    $('#pagination').on('click', '#prev-page', function() {
        if (currentPage > 1) {
            currentPage--;
            fetchMovies(currentPage);
        }
    });

    // Event delegation untuk tombol Next
    $('#pagination').on('click', '#next-page', function() {
        currentPage++;
        fetchMovies(currentPage);
    });
});


//  Ajax Detail
$('#movie-list').on('click', '.see-detail', function (event) {
    event.preventDefault();
    
    // Clear the modal content
    $('.modal-body').html(`
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);
    
    $.ajax({
        url: 'https://www.omdbapi.com',
        type: 'get',
        dataType: 'json',
        data: {
            'apikey': 'fd868951',
            'i': $(this).data('id')
        },

        success: function (movie){

            if (movie.Response === "True") {
                const ratings = movie.Ratings.map(rating => 
                    `<li>${rating.Source}: <i class="fas fa-star"></i>${rating.Value}</li>`
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


