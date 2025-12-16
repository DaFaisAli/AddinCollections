console.log("Script loaded!");

// ==================== GLOBAL VARIABLES ====================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedSizes = JSON.parse(localStorage.getItem("selectedSizes")) || {};

const stockData = JSON.parse(localStorage.getItem("stockData")) || {};

// Initialize stockData if empty
if (Object.keys(stockData).length === 0) {
  const stockInit = {};
  products.forEach(product => {
    if (product.sizes && Array.isArray(product.sizes)) {
      product.sizes.forEach(s => {
        const key = `${product.name}-${s.size}`;
        stockInit[key] = 0; // default stock
      });
    } else {
      stockInit[product.name] = product.price ? 0 : 0;
    }
  });
  localStorage.setItem("stockData", JSON.stringify(stockInit));
}

function getStock(productName, size = "default") {
  const key = size === "default" ? productName : `${productName}-${size}`;
  return stockData[key] ?? 0;
}

// ==================== DOMCONTENTLOADED ====================
document.addEventListener("DOMContentLoaded", () => {
  initializeCart();
  updateCartCount();
  updateNavCartCount();

  setupCheckoutButton();
  setupRemoveButtons();
  setupProductCards();
  setupGiftsets();
  setupBundleOptions();
  setupTitleLineBreaks();
  setupSearchToggle();
  setupAccountDropdown();

  refreshAddButtons();
});

// ==================== CART FUNCTIONS ====================
function addToCart(name, price, image, options = [], stockObj = { default: 9999 }) {
  let selectedSize = "default";
  options.forEach(opt => {
    if (opt.includes("Size:")) selectedSize = opt.split("Size:")[1].trim();
  });

  const availableStock = getStock(name.replace(` - ${selectedSize}`, ""), selectedSize);

  const optionsKey = JSON.stringify(options);
  const existingItem = cart.find(item =>
    item.name === name && JSON.stringify(item.options) === optionsKey
  );

  if (existingItem) {
    if (existingItem.quantity + 1 > availableStock) {
      alert(`❗ Not enough stock for ${name} (${selectedSize})`);
      return;
    }
    existingItem.quantity++;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
      image,
      options,
      stockObj,
      stock: availableStock
    });
  }

  saveCart();
  refreshAddButtons();
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

    const qtyContainer = document.createElement("div");
    qtyContainer.classList.add("cart-qty-container");

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "−";
    minusBtn.classList.add("qty-btn");
    minusBtn.addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
        saveCart();
      }
    });

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = 1;
    qtyInput.max = item.stock;
    qtyInput.value = item.quantity;
    qtyInput.classList.add("qty-input");
    qtyInput.addEventListener("change", () => {
      let val = parseInt(qtyInput.value);
      if (val > item.stock) val = item.stock;
      if (val < 1) val = 1;
      item.quantity = val;
      saveCart();
    });

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.classList.add("qty-btn");
    plusBtn.addEventListener("click", () => {
      if (item.quantity < item.stock) {
        item.quantity++;
        saveCart();
      }
    });

    qtyContainer.appendChild(minusBtn);
    qtyContainer.appendChild(qtyInput);
    qtyContainer.appendChild(plusBtn);
    textDiv.appendChild(qtyContainer);

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

    for (let item of cart) {
      if (item.quantity > item.stock) {
        alert(`❗ Not enough stock for ${item.name}.`);
        return;
      }
    }

    alert("✅ Checkout successful!");

// 🔥 REDUCE STOCK
cart.forEach(item => {
  let size = "default";

  if (item.options) {
    const sizeOpt = item.options.find(o => o.startsWith("Size:"));
    if (sizeOpt) size = sizeOpt.replace("Size:", "").trim();
  }

  const product = products.find(p => item.name.startsWith(p.name));
  if (!product) return;

  if (!product.stockObj[size]) product.stockObj[size] = 0;
  product.stockObj[size] -= item.quantity;

  if (product.stockObj[size] < 0) product.stockObj[size] = 0;
});

// 💾 Save updated stock
localStorage.setItem("products", JSON.stringify(products));

// 🧹 Clear cart
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

    const refreshSizes = () => {
      const productName = card.querySelector("h3").textContent;
      let stockObj = { default: 9999 };
      const prod = products.find(p => productName.startsWith(p.name));
      if (prod) stockObj = prod.stockObj;

      if (select) {
        let hasStock = false;
        Array.from(select.options).forEach(opt => {
          const size = opt.value;
          const available = stockObj[size] || 0;
          opt.disabled = available === 0;
          if (available > 0) hasStock = true;
        });

        if (!select.value || stockObj[select.value] === 0) {
          const firstAvailable = Array.from(select.options).find(opt => !opt.disabled);
          select.value = firstAvailable ? firstAvailable.value : "";
        }

        addBtn.disabled = !hasStock || !select.value;
      }
    };

    refreshSizes();

    select?.addEventListener("change", () => {
      const selectedSize = select.value;
      const productName = card.querySelector("h3").textContent;

      const currentPriceText = priceEl.textContent.replace(/[£,]/g, "").trim();
      const currentPrice = parseFloat(currentPriceText) || 0;
      const price = select.selectedOptions[0]?.dataset.price
        ? parseFloat(select.selectedOptions[0].dataset.price)
        : currentPrice;

      priceEl.textContent = `£${price.toFixed(2)}`;
      addBtn.dataset.price = price;
      addBtn.dataset.name = `${productName} - ${selectedSize}`;
      selectedSizes[productName] = selectedSize;
      localStorage.setItem("selectedSizes", JSON.stringify(selectedSizes));

      const prod = products.find(p => productName.startsWith(p.name));
      const availableStock = prod?.stockObj[selectedSize] || 0;
      addBtn.disabled = availableStock === 0;
    });

    addBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const name = addBtn.dataset.name || card.querySelector("h3").textContent;
      const price = parseFloat(addBtn.dataset.price) || 20;
      const image = addBtn.dataset.image || "";

      let stockObj = { default: 9999 };
      const prod = products.find(p => name.startsWith(p.name));
      if (prod) stockObj = prod.stockObj;

      const options = [];
      if (select && select.value) options.push(`Size: ${select.value}`);

      addToCart(name, price, image, options, stockObj);
    });

    window.addEventListener("storage", (e) => {
      if (e.key === "products") {
        products = JSON.parse(e.newValue) || [];
        refreshSizes();
        refreshAddButtons();
        updateCartStock();
      }
    });
  });
}

// ==================== REFRESH ADD BUTTONS ====================
function refreshAddButtons() {
  document.querySelectorAll(".product-card").forEach(card => {
    const addBtn = card.querySelector(".add-to-cart");
    if (!addBtn) return;

    const name = card.querySelector("h3").textContent.trim();
    const select = card.querySelector(".size-select");
    const size = select?.value || "default";
    const stock = getStock(name, size);

    addBtn.disabled = stock === 0;
    addBtn.textContent = stock === 0 ? "Out of Stock" : "Add to Cart";
    addBtn.style.opacity = stock === 0 ? 0.6 : 1;
  });
}

// ==================== BUNDLE OPTIONS (SIZE + COLOUR) ====================
function setupBundleOptions() {
  document.querySelectorAll(".add-bundle-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const selects = card.querySelectorAll(".bundle-size, .bundle-color");

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

  console.log("Giftset script active ✅");
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
function setupSearchToggle() {
  const searchToggle = document.getElementById('search-toggle');
  const searchBar = document.getElementById('search-form');

  if (!searchToggle || !searchBar) return;

  searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('show');
    if (searchBar.classList.contains('show')) {
      document.getElementById('search-input').focus();
    }
  });
}

// ==================== ACCOUNT DROPDOWN ====================
function setupAccountDropdown() {
  const accountIcon = document.getElementById("account-icon");
  const accountDropdown = document.getElementById("account-dropdown");

  if (!accountIcon || !accountDropdown) return;

  accountIcon.addEventListener("click", () => {
    accountDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!accountIcon.contains(e.target) && !accountDropdown.contains(e.target)) {
      accountDropdown.classList.add("hidden");
    }
  });
}
