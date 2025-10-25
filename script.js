// === Настройки ===
let DAILY_GOAL = parseInt(localStorage.getItem("dailyNorm")) || 2000;
const DEFAULT_CITY = "Shymkent";

// === Продукты ===
// kcal — на 100 г
const products = [
  { name: "🍎 Яблоко", en: "Apple", kcal: 47, icon: "apple.png" },
  { name: "🍌 Банан", en: "Banana", kcal: 89, icon: "banana.png" },
  { name: "🍞 Хлеб", en: "Bread", kcal: 265, icon: "bread.png" },
  { name: "🍚 Рис", en: "Rice", kcal: 130, icon: "rice.png" },
  { name: "🍗 Курица", en: "Chicken", kcal: 165, icon: "chicken.png" },
  { name: "🥩 Говядина", en: "Beef", kcal: 250, icon: "beef.png" },
  { name: "🍳 Яйцо", en: "Egg", kcal: 155, icon: "egg.png" },
  { name: "🥔 Картофель", en: "Potato", kcal: 77, icon: "potato.png" },
  { name: "🥗 Салат", en: "Salad", kcal: 20, icon: "salad.png" },
  { name: "🍲 Плов", en: "Pilaf", kcal: 180, icon: "pilaf.png" },
  { name: "🍝 Паста", en: "Pasta", kcal: 131, icon: "pasta.png" },
  { name: "🍕 Пицца", en: "Pizza", kcal: 266, icon: "pizza.png" },
  { name: "🍔 Бургер", en: "Burger", kcal: 295, icon: "burger.png" },
  { name: "🍟 Картошка фри", en: "Fries", kcal: 312, icon: "fries.png" },
  { name: "🍰 Торт", en: "Cake", kcal: 350, icon: "cake.png" },
  { name: "🍫 Шоколад", en: "Chocolate", kcal: 546, icon: "chocolate.png" },
  { name: "☕ Кофе", en: "Coffee", kcal: 2, icon: "coffee.png" },
  { name: "🥤 Кола", en: "Cola", kcal: 42, icon: "cola.png" },
  { name: "🍹 Сок", en: "Juice", kcal: 46, icon: "juice.png" },
  { name: "💧 Вода", en: "Water", kcal: 0, icon: "water.png" }
];

let selected = JSON.parse(localStorage.getItem("selectedProducts") || "[]");
let currentLang = localStorage.getItem("lang") || "ru";

// === Элементы DOM ===
const listEl = document.getElementById("product-list");
const tableBody = document.querySelector("#selected tbody");
const totalEl = document.getElementById("total");
const progressBar = document.getElementById("progress-bar");
const clearBtn = document.getElementById("clear");
const searchInput = document.getElementById("search");
const changeGoalBtn = document.getElementById("change-goal");

// === Отображение времени ===
function updateTime() {
  const now = new Date();
  document.getElementById("datetime").textContent =
    now.toLocaleDateString(currentLang === "ru" ? "ru-RU" : "en-GB", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
    });
}
setInterval(updateTime, 1000);
updateTime();

// === Погода ===
async function fetchWeather(city = DEFAULT_CITY) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=42.3&longitude=69.6&current_weather=true`);
    const data = await res.json();
    const t = data.current_weather.temperature;
    document.getElementById("weather").textContent = `🌤 ${city}: ${t}°C`;
  } catch {
    document.getElementById("weather").textContent = "🌤 нет данных о погоде";
  }
}
fetchWeather();

// === Генерация списка продуктов ===
function renderProducts(filter = "") {
  listEl.innerHTML = "";
  products
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || p.en.toLowerCase().includes(filter.toLowerCase()))
    .forEach(p => {
      const li = document.createElement("li");
      li.classList.add("product-item");

      const img = document.createElement("img");
      img.src = `images/${p.icon}`;
      img.alt = p.name;
      li.appendChild(img);

      const span = document.createElement("span");
      span.textContent = currentLang === "ru" ? p.name : p.en;
      li.appendChild(span);

      const kcal = document.createElement("small");
      kcal.textContent = `${p.kcal} ккал/100г`;
      li.appendChild(kcal);

      li.onclick = () => addProduct(p);
      listEl.appendChild(li);
    });
}
renderProducts();

// === Добавление продукта ===
function addProduct(p) {
  const grams = prompt(currentLang === "ru" ? "Введите массу (граммы):" : "Enter weight (grams):", 100);
  if (!grams || isNaN(grams)) return;

  const calories = (p.kcal * grams) / 100;
  selected.push({ ...p, grams: Number(grams), calories });
  saveAndRender();
}

// === Сохранение и перерисовка ===
function saveAndRender() {
  localStorage.setItem("selectedProducts", JSON.stringify(selected));
  renderTable();
}

// === Таблица ===
function renderTable() {
  tableBody.innerHTML = "";
  let total = 0;

  selected.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${currentLang === "ru" ? item.name : item.en}</td>
      <td>${item.grams}</td>
      <td>${item.calories.toFixed(0)}</td>
    `;
    tr.onclick = () => {
      if (confirm(currentLang === "ru" ? "Удалить этот продукт?" : "Remove this item?")) {
        selected.splice(i, 1);
        saveAndRender();
      }
    };
    tableBody.appendChild(tr);
    total += item.calories;
  });

  totalEl.textContent = `${currentLang === "ru" ? "Итого:" : "Total:"} ${total.toFixed(0)} / ${DAILY_GOAL} ккал`;
  progressBar.style.width = Math.min((total / DAILY_GOAL) * 100, 100) + "%";
}
renderTable();

// === Очистка ===
clearBtn.onclick = () => {
  if (confirm(currentLang === "ru" ? "Очистить всё?" : "Clear all?")) {
    selected = [];
    saveAndRender();
  }
};

// === Поиск ===
searchInput.addEventListener("input", e => renderProducts(e.target.value));

// === Переключение языка ===
document.getElementById("lang-toggle").onclick = () => {
  currentLang = currentLang === "ru" ? "en" : "ru";
  localStorage.setItem("lang", currentLang);

  document.querySelectorAll("[data-ru]").forEach(el => {
    el.textContent = el.getAttribute(`data-${currentLang}`);
  });

  renderProducts(searchInput.value);
  renderTable();
  updateTime();
};

// === Изменение суточной нормы калорий ===
if (changeGoalBtn) {
  changeGoalBtn.onclick = () => {
    const newGoal = prompt(
      currentLang === "ru"
        ? "Введите новую дневную норму калорий:"
        : "Enter new daily calorie goal:",
      DAILY_GOAL
    );

    if (newGoal && !isNaN(newGoal) && newGoal > 0) {
      DAILY_GOAL = parseInt(newGoal);
      localStorage.setItem("dailyNorm", DAILY_GOAL);
      renderTable();
      alert(
        currentLang === "ru"
          ? `Новая дневная норма установлена: ${DAILY_GOAL} ккал`
          : `New daily goal set: ${DAILY_GOAL} kcal`
      );
    }
  };
}
