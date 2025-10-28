console.log("Script loaded!");

// ==================== GLOBAL VARIABLES ====================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedSizes = JSON.parse(localStorage.getItem("selectedSizes")) || {};

// ==================== DOMCONTENTLOADED ====================
document.addEventListener("DOMContentLoaded", () => {
  initializeCart();
  updateCartCount();
  updateNavCartCount();

  setupCheckoutButton();
  setupRemoveButtons();
  setupProductCards();
  setupGiftsets();
  setupBundleOptions(); // ✅ NEW: bundle size & colour
  setupTitleLineBreaks(); // ✅ Applies auto line breaks for clothing only
});

// ==================== CART FUNCTIONS ====================
function addToCart(name, price, image, options) {
  const optionsKey = options ? JSON.stringify(options) : null;
  const existingItem = cart.find(item =>
    item.name === name && JSON.stringify(item.options) === optionsKey
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1, image, options });
  }

  saveCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
  updateNavCartCount();
}

function displayCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<li style='color:#e2b111; text-align:center;'>Your cart is empty 🛍️</li>";
    cartTotal.textContent = "Total: £0.00";
    return;
  }

  cart.forEach((item, index) => {
    const price = parseFloat(item.price);
    const quantity = parseInt(item.quantity);
    total += price * quantity;

    const li = document.createElement("li");
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("cart-item-info");

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.classList.add("cart-item-img");

    const textDiv = document.createElement("div");
    textDiv.classList.add("cart-item-text");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = `${item.name}${quantity > 1 ? ` x${quantity}` : ""}`;
    textDiv.appendChild(nameSpan);

    if (item.options && item.options.length) {
      const optionsContainer = document.createElement("div");
      optionsContainer.classList.add("cart-item-options");

      item.options.forEach(opt => {
        const optDiv = document.createElement("div");
        optDiv.textContent = opt;
        optionsContainer.appendChild(optDiv);
      });

      textDiv.appendChild(optionsContainer);
    }

    infoDiv.appendChild(img);
    infoDiv.appendChild(textDiv);

    const priceSpan = document.createElement("span");
    priceSpan.classList.add("cart-item-price");
    priceSpan.textContent = `£${(price * quantity).toFixed(2)}`;

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-btn");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFromCart(index));

    li.appendChild(infoDiv);
    li.appendChild(priceSpan);
    li.appendChild(removeBtn);

    cartItems.appendChild(li);
  });

  cartTotal.textContent = `Total: £${total.toFixed(2)}`;
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function updateNavCartCount() {
  const navCartCount = document.getElementById("nav-cart-count");
  if (navCartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    navCartCount.textContent = totalItems;
  }
}

function initializeCart() {
  displayCart();
}

function setupRemoveButtons() {
  const cartList = document.getElementById("cart-items");
  if (!cartList) return;

  cartList.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-btn")) {
      const index = Array.from(cartList.children).indexOf(event.target.closest("li"));
      removeFromCart(index);
    }
  });
}

// ==================== CHECKOUT ====================
function setupCheckoutButton() {
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("🛒 Your cart is empty!");
      return;
    }

    alert("✅ Checkout successful!");
    cart = [];
    saveCart();
  });
}

// ==================== PRODUCT PAGE ====================
function setupProductCards() {
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach(card => {
    const select = card.querySelector(".size-select");
    const priceEl = card.querySelector(".price");
    const addBtn = card.querySelector(".add-to-cart");
    if (!addBtn) return;

    addBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const name = addBtn.dataset.name || card.querySelector("h3").textContent;
      const price = parseFloat(addBtn.dataset.price) || 20;
      const image = addBtn.dataset.image || "";
      addToCart(name, price, image);
    });

    if (select) {
      addBtn.disabled = true;

      select.addEventListener("change", () => {
        const selected = select.options[select.selectedIndex];
        const size = selected.value;
        const productName = card.querySelector("h3").textContent;

        if (size) {
          const currentPriceText = priceEl.textContent.replace(/[£,]/g, "").trim();
          const currentPrice = parseFloat(currentPriceText) || 0;
          const price = selected.dataset.price ? parseFloat(selected.dataset.price) : currentPrice;

          priceEl.textContent = `£${price.toFixed(2)}`;
          addBtn.disabled = false;
          addBtn.dataset.price = price;
          addBtn.dataset.name = `${productName} - ${size}`;
          selectedSizes[productName] = size;
          localStorage.setItem("selectedSizes", JSON.stringify(selectedSizes));
        } else {
          addBtn.disabled = true;
          delete selectedSizes[productName];
          localStorage.setItem("selectedSizes", JSON.stringify(selectedSizes));
        }
      });

      const productName = card.querySelector("h3").textContent;
      if (selectedSizes[productName]) {
        select.value = selectedSizes[productName];
        select.dispatchEvent(new Event("change"));
      } else {
        select.dispatchEvent(new Event("change"));
      }
    }
  });
}

// ==================== BUNDLE OPTIONS (SIZE + COLOUR) ====================
// ==================== BUNDLE OPTIONS (SIZE + COLOUR) ====================
function setupBundleOptions() {
  document.querySelectorAll(".add-bundle-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const selects = card.querySelectorAll(".bundle-size, .bundle-color"); // ✅ updated

      const chosenOptions = [];

      for (const select of selects) {
        const label = select.previousElementSibling
          ? select.previousElementSibling.textContent.replace(":", "")
          : select.dataset.item;
        const value = select.value;
        if (!value) {
          alert(`Please select ${label}`);
          return;
        }
        chosenOptions.push(`${label}: ${value}`);
      }

      const name = button.dataset.name || card.querySelector("h3").textContent;
      const price = parseFloat(button.dataset.price) || 0;
      const image = button.dataset.image || "";

      addToCart(name, price, image, chosenOptions);
    });
  });
}

// ==================== GIFTSETS ====================
function setupGiftsets() {
  const containers = document.querySelectorAll(".gift-dropdowns");
  if (!containers.length) return;

  const scents = [
    "1 مليون (Inspired by 1 Million)",
    "العنبر الذهب (Inspired by Amber Gold)",
    "مشاركة الملاك (Inspired by Angel Share)",
    "باكارا روج (Inspired by Baccarat Rouge)",
    "بلو دي شانيل (Inspired by Bleu De Chanel)",
    "كريد أفينتوس (Inspired by Creed Aventus)",
    "الغبار الذهبي (Inspired by Golden Dust)",
    "الوادي الإمبراطوري (Inspired by Imperial Valley)",
    "الكرز المفقود (Inspired by Lost Cherry)",
    "أومبير نومادي (Inspired by Ombre Nomade)",
    "سوفاج (Inspired by Sauvage)",
    "الزوجة الثانية (Inspired by Second Wife)",
    "عود للعظمة (Inspired by Oud For Greatness)",
    "العرب تونكا (Inspired by Arabians Tonka)",
    "كلمات (Inspired by Kalimat)",
    "كائن فضائي (Inspired by Alien)",
    "كوكو مادموزيل (Inspired by Coco Mademoiselle)",
    "جادور (Inspired by Jadore)",
    "شانيل رقم 5 (Inspired by Chanel No.5)"
  ];

  containers.forEach(container => {
    const card = container.closest(".product-card");
    const title = card.querySelector("h3").textContent.trim();

    const match = title.match(/(\d+)x/i);
    const itemCount = match ? parseInt(match[1]) : 3;

    for (let i = 1; i <= itemCount; i++) {
      const label = document.createElement("label");
      label.textContent = `Item ${i}:`;

      const select = document.createElement("select");
      select.classList.add("gift-item");

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- Select --";
      select.appendChild(defaultOption);

      scents.forEach(scent => {
        const option = document.createElement("option");
        option.value = scent;
        option.textContent = scent;
        select.appendChild(option);
      });

      container.appendChild(label);
      container.appendChild(select);
    }
  });

  document.querySelectorAll(".toggle-options").forEach(button => {
    button.addEventListener("click", () => {
      const optionsDiv = button.nextElementSibling;
      optionsDiv.style.display =
        optionsDiv.style.display === "none" ? "block" : "none";
    });
  });

  document.querySelectorAll(".add-giftset-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const giftsetDiv = button.closest(".giftset-options");
      const selects = giftsetDiv.querySelectorAll(".gift-item");
      const chosen = Array.from(selects).map(s => s.value);

      if (chosen.some(v => !v)) {
        alert(`Please select all ${chosen.length} scents for your giftset.`);
        return;
      }

      const uniqueChosen = new Set(chosen);
      if (uniqueChosen.size < chosen.length) {
        alert("Please choose different scents (no duplicates).");
        return;
      }

      const name = button.dataset.name;
      const price = parseFloat(button.dataset.price);
      const image = button.dataset.image;

      addToCart(name, price, image, chosen);
    });
  });

  console.log("Giftset script active ✅ (2x & 3x supported)");
}

// ==================== SMART TITLE LINE BREAKS (CLOTHING ONLY) ====================
function setupTitleLineBreaks() {
  const clothingTypes = ["Moroccan Thobe", "Saudi Thobe", "Kandura", "Keffiyeh", "Thobe"];

  document.querySelectorAll(".product-card h3").forEach(title => {
    const text = title.textContent.trim();
    const match = clothingTypes.find(type => text.includes(type));
    if (!match) return;
    const parts = text.split(match);
    title.innerHTML = `${parts[0].trim()}<br>${match}`;
  });
}

// ==================== SEARCH BAR TOGGLE ====================
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-form');

searchToggle.addEventListener('click', () => {
  searchBar.classList.toggle('show');
  if (searchBar.classList.contains('show')) {
    document.getElementById('search-input').focus();
  }
});
