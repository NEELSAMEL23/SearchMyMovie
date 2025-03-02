let movies = []; // Stores all fetched movies
let sortedMovies = []; // Stores movies after sorting/searching
let currentPage = 1; // Tracks the current pagination page
let perPageMovies = 4; // Number of movies per page

/**
 * Fetches movie data from Firebase Realtime Database.
 * @returns {Promise<Array>} - Resolves with an array of movie objects or an error message.
 */
function fetchData() {
    return fetch("https://movies-f3fc9-default-rtdb.firebaseio.com/movies.json")
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP status failed ${res.status}`);
            return res.json();
        })
        .catch((error) => alert(`Failed to fetch: ${error.message}`));
}

/**
 * Initializes the page by fetching movie data and displaying movies with pagination.
 */
function initPage() {
    const spinnerContainer = document.getElementById("spinnerContainer");

    return fetchData()
        .then((data) => {
            spinnerContainer.style.display = "none";
            movies = data;
            sortedMovies = [...movies];
            displayMovies(sortedMovies);
            displayPagination();
        })
        .catch((error) => {
            spinnerContainer.style.display = "none";
            alert(`Something went wrong: ${error.message}`);
        });
}

/**
 * Displays movies based on current pagination and sorting/search filters.
 * @param {Array} moviesToDisplay - The filtered/sorted list of movies to be displayed.
 */
function displayMovies(moviesToDisplay) {
    const cards = document.getElementById('cards');
    cards.innerHTML = "";

    // Calculate movies to display on the current page
    const start = (currentPage - 1) * perPageMovies;
    const end = start + perPageMovies;
    const filterMovies = moviesToDisplay.slice(start, end);

    filterMovies.forEach((movie) => {
        const card = createCard(movie);
        cards.appendChild(card);
    });
}

/**
 * Creates a movie card element with details.
 * @param {Object} movie - A movie object containing details like title, director, rating, etc.
 * @returns {HTMLElement} - The generated movie card element.
 */
function createCard(movie) {
    const card = document.createElement('div');
    card.classList.add('card');

    // Movie image
    const image = document.createElement('img');
    image.src = movie.image || "https://dummyimage.com/300x200/000/fff";
    image.alt = movie.title;
    image.classList.add('card-image');

    // Movie title
    const title = document.createElement('h2');
    title.textContent = movie.title;
    title.classList.add('card-title');

    // Movie director
    const director = document.createElement('p');
    director.textContent = `Directed by: ${movie.director || "N/A"}`;
    director.classList.add('card-director');

    // Movie rating
    const rating = document.createElement('p');
    rating.textContent = `Rating: ⭐ ${movie.rating || "N/A"}`;
    rating.classList.add('card-rating');

    // Tags for genres or keywords
    const tagsContainer = document.createElement('div');
    tagsContainer.classList.add('tags-container');
    (movie.tags || []).forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = tag;
        tagElement.classList.add('tag');
        tagsContainer.appendChild(tagElement);
    });

    // View More button to show extra details in an alert
    const viewMoreBtn = document.createElement('button');
    viewMoreBtn.textContent = "View More";
    viewMoreBtn.classList.add('view-more-btn');
    viewMoreBtn.onclick = () => {
        alert(`
        Title: ${movie.title}
        Director: ${movie.director || "N/A"}
        Duration: ${movie.duration || "Unknown"} min
        Genre: ${movie.genre || "N/A"}
        Release Date: ${movie.release_date || "N/A"}
        Cast: ${(movie.cast || []).join(', ') || "N/A"}
        `);
    };

    card.append(image, title, director, rating, tagsContainer, viewMoreBtn);
    return card;
}

/**
 * Filters movies based on the search input.
 */
function searchMovie() {
    currentPage = 1;
    const query = document.getElementById('searchInput').value.toLowerCase();
    sortedMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.genre.toLowerCase().includes(query) ||
        (movie.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
    displayMovies(sortedMovies);
    displayPagination();
}

/**
 * Sorts movies based on the given criteria.
 * @param {string} criteria - The sorting parameter ("rating", "release_date", or "genre").
 */
function sortMovie(criteria) {
    sortedMovies = [...movies].sort((a, b) => {
        if (criteria === "rating") return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        if (criteria === "release_date") return new Date(b.release_date) - new Date(a.release_date);
        if (criteria === "genre") return (a.genre || "").localeCompare(b.genre || "");
    });
    currentPage = 1;
    displayMovies(sortedMovies);
    displayPagination();
}

/**
 * Displays pagination buttons based on the number of movies.
 */
function displayPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(sortedMovies.length / perPageMovies);

    if (totalPages === 0) return; // Prevent rendering pagination if no movies exist

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.classList.add("prev");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        currentPage--;
        displayMovies(sortedMovies);
        displayPagination();
    };
    paginationContainer.appendChild(prevButton);

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('pageButton');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage); // More readable
        pageButton.onclick = () => {
            currentPage = i;
            displayMovies(sortedMovies);
            displayPagination();
        };
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nxtButton = document.createElement('button');
    nxtButton.classList.add("nxt");
    nxtButton.textContent = "Next";
    nxtButton.disabled = currentPage === totalPages || totalPages === 0;
    nxtButton.onclick = () => {
        currentPage++;
        displayMovies(sortedMovies);
        displayPagination();
    };
    paginationContainer.appendChild(nxtButton);
}


// Load the movie data when the page is loaded
window.addEventListener('load', initPage);
