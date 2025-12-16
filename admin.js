// admin.js (FINAL VERSION)

const container = document.getElementById("product-list");

// Save initial products to localStorage if not already present
if (!localStorage.getItem("products")) {
  localStorage.setItem("products", JSON.stringify(products));
}

// Load or initialize stock
const stockData = JSON.parse(localStorage.getItem("stockData")) || {};

function saveStock() {
  localStorage.setItem("stockData", JSON.stringify(stockData));
}

products.forEach((product, index) => {
  const card = document.createElement("div");
  card.style.border = "1px solid #ccc";
  card.style.padding = "10px";
  card.style.marginBottom = "15px";

  const title = document.createElement("h3");
  title.textContent = `${product.name} (${product.type})`;
  card.appendChild(title);

  // Products WITH sizes
  if (product.sizes && Array.isArray(product.sizes)) {
    product.sizes.forEach(s => {
      const key = `${product.name}-${s.size}`;

      if (stockData[key] === undefined) {
        stockData[key] = 0;
      }

      const row = document.createElement("div");
      row.style.marginBottom = "6px";

      row.innerHTML = `
        ${s.size} (£${s.price}) :
        <input type="number" min="0" value="${stockData[key]}" />
      `;

      const input = row.querySelector("input");
      input.addEventListener("change", () => {
        stockData[key] = Number(input.value);
        saveStock();
      });

      card.appendChild(row);
    });
  }

  // Products WITHOUT sizes
  else {
    const key = product.name;

    if (stockData[key] === undefined) {
      stockData[key] = 0;
    }

    const row = document.createElement("div");
    row.innerHTML = `
      Stock (£${product.price}) :
      <input type="number" min="0" value="${stockData[key]}" />
    `;

    const input = row.querySelector("input");
    input.addEventListener("change", () => {
      stockData[key] = Number(input.value);
      saveStock();
    });

    card.appendChild(row);
  }

  container.appendChild(card);
});

saveStock();