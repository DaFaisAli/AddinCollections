// Cart functionality
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let total = 0;

// Initialize when DOM loads - SINGLE event listener
document.addEventListener("DOMContentLoaded", function() {
    initializeCart();
    initializeMenu();
    initializeCarousel();
    updateNavCartCount();
    
    // Checkout functionality - moved inside the main listener
    const checkoutBtn = document.querySelector(".checkout-btn, .cart .btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", function() {
            if (cart.length === 0) {
                alert("🛒 Your cart is empty!");
            } else {
                alert("✅ Checkout successful! Thank you for shopping at Ad-Din Collections!");
                cart = [];
                saveCart();
            }
        });
    }
});

// Cart functions
function initializeCart() {
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    
    if (cartCount) updateCartCount();
    if (cartItems) displayCart();
    
    // Add event listeners to all add-to-cart buttons
    document.querySelectorAll(".add-to-cart, .product-card button").forEach(btn => {
        btn.addEventListener("click", function() {
            let name, price;
            
            if (this.classList.contains("add-to-cart")) {
                // Perfume carousel button
                name = this.getAttribute("data-name");
                price = parseFloat(this.getAttribute("data-price"));
            } else {
                // Product card button
                const product = this.parentElement;
                name = product.querySelector("h3").innerText;
                price = parseFloat(product.querySelector("p").innerText.replace("£", ""));
            }
            
            addToCart(name, price);
        });
    });
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    saveCart();
    showAddToCartAnimation();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
    updateNavCartCount();
}

function updateNavCartCount() {
    const navCartCount = document.getElementById("nav-cart-count");
    if (navCartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        navCartCount.innerText = totalItems;
    }
}

function updateCartDisplay() {
    updateCartCount();
    displayCart();
}

function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
        cartCount.classList.add("bounce");
        setTimeout(() => cartCount.classList.remove("bounce"), 400);
    }
}

function displayCart() {
    const cartContainer = document.getElementById("cart-items");
    const totalContainer = document.getElementById("cart-total");
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<li>Your cart is empty 🛍️</li>";
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.name} - £${item.price.toFixed(2)} x ${item.quantity}
                <button class="remove-btn" onclick="removeFromCart(${index})">❌ Remove</button>
            `;
            cartContainer.appendChild(li);
        });
    }

    if (totalContainer) {
        totalContainer.textContent = `Total: £${total.toFixed(2)}`;
    }
}

function showAddToCartAnimation() {
    // Create a floating "+1" animation
    const animation = document.createElement('div');
    animation.textContent = '+1';
    animation.style.position = 'fixed';
    animation.style.right = '20px';
    animation.style.top = '70px';
    animation.style.background = '#e6c200';
    animation.style.color = '#000';
    animation.style.padding = '5px 10px';
    animation.style.borderRadius = '15px';
    animation.style.fontWeight = 'bold';
    animation.style.zIndex = '1000';
    animation.style.animation = 'floatUp 0.8s ease-out forwards';
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        document.body.removeChild(animation);
    }, 800);
}

// Menu functionality
function initializeMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
}

// Carousel functionality
function initializeCarousel() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;
    
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');
    
    if (!slides.length || !nextButton || !prevButton) return;

    let currentSlide = 0;
    const slideWidth = slides[0].getBoundingClientRect().width;

    // Arrange slides next to one another
    slides.forEach((slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    });

    function updateCarousel() {
        track.style.transform = `translateX(-${slides[currentSlide].style.left})`;
    }

    nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
    });

    prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateCarousel();
    });

    // Mobile swipe
    let startX = 0;
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    track.addEventListener('touchend', (e) => {
        let endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) {
            // swipe left
            currentSlide = (currentSlide + 1) % slides.length;
        } else if (endX - startX > 50) {
            // swipe right
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        }
        updateCarousel();
    });

    // Initialize carousel position
    updateCarousel();
}