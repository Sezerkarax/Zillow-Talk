// Εδώ υλοποιούμε το κομμάτι που συνδέει την εμφάνιση με τα δεδομένα·
// η δουλειά του είναι να παίρνει ό,τι γράφει ο χρήστης στην αναζήτηση, να
// ζητάει τα αντίστοιχα προϊόντα από την Python και να τα εμφανίζει στην
// οθόνη, αλλάζοντας το περιεχόμενο της σελίδας δυναμικά.

document.addEventListener("DOMContentLoaded", () => {
    
    // ==============================================
    // ΑΛΛΗΛΕΠΙΔΡΑΣΗ 1 & 2: Σελίδα Προϊόντων (items.html)
    // ==============================================
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const productsGrid = document.getElementById("productsGrid");

    if (searchBtn && searchInput && productsGrid) {
        
        // Φόρτωση όλων των προϊόντων με το που ανοίγει η σελίδα
        fetchProducts("");

        // Αλληλεπίδραση 1: Όταν ο χρήστης πατήσει το κουμπί Αναζήτηση
        searchBtn.addEventListener("click", () => {
            const query = searchInput.value.trim();
            fetchProducts(query);
        });

        // Εκτέλεση αναζήτησης και με το πάτημα του Enter
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                fetchProducts(searchInput.value.trim());
            }
        });
    }

    // Συνάρτηση για το GET request στο /search 
    function fetchProducts(searchQuery) {
        fetch(`http://127.0.0.1:5000/search?name=${encodeURIComponent(searchQuery)}`)
            .then(response => response.json())
            .then(products => {
                // Καθαρίζουμε τον πίνακα/grid των αποτελεσμάτων πριν προσθέσουμε τα νέα
                productsGrid.innerHTML = "";

                products.forEach(product => {
                    // Δημιουργία δομής HTML για κάθε προϊόν
                    const card = document.createElement("div");
                    card.className = "product-card";
                    card.innerHTML = `
                        <div class="product-image-container">
                            <!-- Αλληλεπίδραση 2: Κλικ στην εικόνα καλεί την addLike() -->
                            <img src="${product.image}" alt="${product.name}" class="product-img" style="cursor: pointer;" onclick="addLike('${product._id}', this)">
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <div class="product-meta">
                                <span class="price">€${product.price}</span>
                                <span><i class="fas fa-heart"></i> <span class="likes-count">${product.likes}</span> Likes</span>
                            </div>
                        </div>
                    `;
                    productsGrid.appendChild(card);
                });
            })
            .catch(error => console.error("Error fetching products:", error));
    }


    // ==============================================
    // ΑΛΛΗΛΕΠΙΔΡΑΣΗ 3: Αρχική Σελίδα (homepage.html)
    // ==============================================
    const popularSlideshow = document.getElementById("popularSlideshow");

    if (popularSlideshow) {
        // Κάνουμε GET request στο /popular
        fetch("http://127.0.0.1:5000/popular")
            .then(response => response.json())
            .then(popularProducts => {
                popularSlideshow.innerHTML = ""; // Καθαρίζουμε τον χώρο του slideshow

                popularProducts.forEach((product, index) => {
                    // Δημιουργούμε HTML δομή για κάθε popular προϊόν
                    const slide = document.createElement("div");
                    slide.className = "slide fade";
                    // Εμφανίζουμε μόνο την πρώτη εικόνα αρχικά
                    if (index !== 0) {
                        slide.style.display = "none";
                    }
                    slide.innerHTML = `
                        <img src="${product.image}" alt="${product.name}" style="width: 100%; max-height: 400px; object-fit: contain;">
                        <div class="slide-caption" style="text-align: center; margin-top: 10px;">
                            <h3>${product.name}</h3>
                        </div>
                    `;
                    popularSlideshow.appendChild(slide);
                });
                
                // Αρχικοποίηση slider
                showSlides(slideIndex);
                
                // Εκκίνηση του Autoplay
                slideInterval = setInterval(function() {
                    showSlides(slideIndex += 1);
                }, 4000); // 4000 milliseconds = 4 δευτερόλεπτα
            })
            .catch(error => console.error("Error fetching popular products:", error));
    }
});

// ==============================================
// Συμπληρωματικός Κώδικας για Controls στο Slider
// ==============================================
let slideIndex = 1;
let slideInterval; // Μεταβλητή για το Autoplay

function plusSlides(n) {
  clearInterval(slideInterval); // Σταματάμε προσωρινά το autoplay όταν πατάει ο χρήστης
  showSlides(slideIndex += n);
  
  // Ξεκινάμε πάλι το autoplay μετά το κλικ του χρήστη
  slideInterval = setInterval(function() {
      showSlides(slideIndex += 1);
  }, 4000);
}

function showSlides(n) {
  let i;
  let slides = document.querySelectorAll("#popularSlideshow .slide");
  if (!slides || slides.length === 0) return;
  
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slides[slideIndex-1].style.display = "block";  
}

// Συνάρτηση για την Αλληλεπίδραση 2: POST request στο /like
function addLike(productId, imgElement) {
    fetch("http://127.0.0.1:5000/like", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Like added!") {
            // Βρίσκουμε το <span class="likes-count"> μέσα στο ίδιο card και το αυξάνουμε κατά 1 γραφικά
            const card = imgElement.closest('.product-card');
            const likesSpan = card.querySelector('.likes-count');
            likesSpan.innerText = parseInt(likesSpan.innerText) + 1;
        }
    })
    .catch(error => console.error("Error adding like:", error));
}

