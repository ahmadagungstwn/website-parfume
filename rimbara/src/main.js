import { products, money, priceFor, validCart, addItem } from "./cart.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// Six individually composed botanical line drawings, reused only as decorative SVG paths.
const botanicals = [
  {
    stem: "M-12 185 Q100 160 285 35",
    leaves: [
      [38, 166, -90, 65],
      [72, 150, 10, 64],
      [110, 132, -85, 75],
      [145, 110, 8, 70],
      [184, 85, -83, 62],
      [225, 60, 8, 49],
    ],
  },
  {
    stem: "M300 275 Q235 145 65 20 M265 210 Q160 180 100 90 M222 150 Q232 75 180 20 M265 210 Q280 140 263 95",
    leaves: [
      [91, 41, -100, 28],
      [120, 62, 6, 33],
      [150, 84, -100, 30],
      [175, 110, 10, 33],
      [197, 131, -90, 28],
      [129, 126, -70, 26],
      [162, 158, 50, 26],
      [213, 64, -100, 28],
      [239, 103, 30, 23],
      [270, 138, -80, 25],
    ],
  },
  {
    stem: "M320 145 Q170 120 25 25",
    leaves: [
      [67, 49, -115, 55],
      [100, 66, 38, 54],
      [135, 84, -105, 58],
      [170, 101, 35, 60],
      [209, 118, -100, 50],
      [250, 132, 35, 43],
    ],
  },
  {
    stem: "M0 255 Q85 169 190 55 M15 238 Q20 110 50 25 M15 238 Q102 205 235 170",
    leaves: [
      [24, 193, -100, 75],
      [30, 153, -60, 75],
      [45, 205, -56, 105],
      [81, 161, -12, 99],
      [100, 200, -30, 90],
      [146, 188, 32, 70],
      [124, 126, -54, 65],
    ],
  },
  {
    stem: "M330 170 Q180 155 20 35 M210 133 Q182 65 105 20 M140 102 Q90 100 25 110",
    leaves: [
      [48, 55, -100, 25],
      [72, 70, 38, 28],
      [110, 86, -100, 27],
      [153, 111, 50, 26],
      [188, 129, -90, 30],
      [226, 146, 48, 30],
      [141, 44, -105, 24],
      [170, 71, 0, 25],
      [52, 105, 110, 24],
      [91, 104, -70, 23],
    ],
  },
  {
    stem: "M-10 170 Q60 140 180 15 M13 157 Q85 165 154 109",
    leaves: [
      [32, 137, -120, 50],
      [63, 108, -12, 54],
      [97, 76, -105, 52],
      [132, 43, -8, 46],
      [65, 157, 50, 37],
      [105, 141, -50, 37],
    ],
  },
];
$$("[data-leaf]").forEach((element) => {
  const botanical = botanicals[Number(element.dataset.leaf) - 1];
  const leaves = botanical.leaves
    .map(
      ([x, y, angle, length]) =>
        `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M0 0 Q${length * 0.3} ${-length * 0.3} ${length} 0 Q${length * 0.35} ${length * 0.22} 0 0 M0 0 Q${length * 0.5} -2 ${length} 0"/></g>`,
    )
    .join("");
  element.innerHTML = `<svg viewBox="0 0 320 ${Number(element.dataset.leaf) === 2 || Number(element.dataset.leaf) === 4 ? 280 : 200}" aria-hidden="true"><path d="${botanical.stem}"/>${leaves}</svg>`;
});

$("#year").textContent = new Date().getFullYear();
const menu = $(".menu-toggle");
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  $(".header nav").classList.toggle("open", open);
});
$$(".header nav a, .header nav button").forEach((link) =>
  link.addEventListener("click", () => {
    $(".header nav").classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Buka menu");
  }),
);
$$(".close-dialog").forEach((button) =>
  button.addEventListener("click", () => button.closest("dialog").close()),
);
$$("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }),
);

let toastTimer;
function toast(message) {
  $(".toast").textContent = message;
  $(".toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $(".toast").classList.remove("visible"), 2800);
}
let cart = [];
try {
  cart = validCart(JSON.parse(localStorage.getItem("rimbara-bag") || "[]"));
} catch {
  cart = [];
}
function renderCart() {
  $(".bag-count").textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  $("#cart-items").innerHTML = cart.length
    ? cart
        .map(
          (item, index) =>
            `<article class="cart-item"><img src="/assets/${products[item.id].image}.webp" alt="${products[item.id].name}"/><div><h3>${products[item.id].name}</h3><p>${item.size} ml</p><div class="cart-item-quantity"><button data-cart-index="${index}" data-delta="-1" aria-label="Kurangi ${products[item.id].name}">−</button><span>${item.quantity}</span><button data-cart-index="${index}" data-delta="1" aria-label="Tambah ${products[item.id].name}">+</button></div><button data-remove="${index}">Hapus</button></div><strong>${money(priceFor(item.id, item.size) * item.quantity)}</strong></article>`,
        )
        .join("")
    : '<div class="empty-bag"><p>Tasmu masih menunggu aroma pertamanya.</p><button class="button outline" id="browse-collection">Jelajahi Koleksi ↗</button></div>';
  $("#cart-summary").hidden = !cart.length;
  $("#cart-total").textContent = money(
    cart.reduce(
      (sum, item) => sum + priceFor(item.id, item.size) * item.quantity,
      0,
    ),
  );
}
function saveCart() {
  try {
    localStorage.setItem("rimbara-bag", JSON.stringify(cart));
  } catch {
    toast("Tas aktif untuk sesi ini. Penyimpanan browser tidak tersedia.");
  }
  renderCart();
}
function addToCart(id, size, quantity) {
  cart = addItem(cart, id, size, quantity);
  saveCart();
  toast(`${products[id].name} masuk ke tas pilihanmu.`);
}
$("#cart-items").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.id === "browse-collection") {
    $("#cart").close();
    $("#collection").scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (button.dataset.remove !== undefined)
    cart.splice(Number(button.dataset.remove), 1);
  if (button.dataset.cartIndex !== undefined) {
    const index = Number(button.dataset.cartIndex);
    const item = cart[index];
    item.quantity = Math.min(20, item.quantity + Number(button.dataset.delta));
    if (item.quantity < 1) cart.splice(index, 1);
  }
  saveCart();
});
renderCart();
$("#save-bag").addEventListener("click", () => {
  const lines = cart.map(
    (item) =>
      `${products[item.id].name} — ${item.size} ml × ${item.quantity} — ${money(priceFor(item.id, item.size) * item.quantity)}`,
  );
  const content = `RIMBARA — Daftar pilihan\n\n${lines.join("\n")}\n\nTotal ${$("#cart-total").textContent}\n\nKoleksi konsep. Daftar ini bukan konfirmasi pesanan atau pembayaran.`;
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "Rimbara-pilihanmu.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

const noteDetails = {
  Bergamot:
    "Citrus yang cerah dengan sisi hijau dan sedikit pahit. Bergamot memberi pembukaan yang ringan sebelum aroma bunga mulai terasa.",
  Neroli:
    "Aroma bunga pohon jeruk pahit. Karakternya memadukan bunga putih, citrus, dan sentuhan hijau yang segar.",
  Iris: "Dalam dunia parfum, nuansa iris dikenal lembut, berbedak, dan sedikit woody. Ia memberi kesan tenang dan intim pada komposisi.",
  Cedar:
    "Nuansa kayu kering yang bersih, hangat, dan terstruktur. Cedar memberi kedalaman pada aroma tanpa kehilangan kelembutannya.",
  Vetiver:
    "Karakter akar yang hijau, earthy, dan sedikit smoky. Vetiver menjadi jejak akhir yang memberi kedalaman pada Embun Rimba.",
};
function showInfo(title, content) {
  $("#info-title").textContent = title;
  $("#info-content").innerHTML = content;
  $("#info-dialog").showModal();
}
$$("[data-note]").forEach((button) =>
  button.addEventListener("click", () =>
    showInfo(button.dataset.note, `<p>${noteDetails[button.dataset.note]}</p>`),
  ),
);
$$("[data-open]").forEach((button) =>
  button.addEventListener("click", () => {
    if (button.dataset.open === "cart") {
      $("#cart").showModal();
      return;
    }
    if (button.dataset.open === "privacy") {
      showInfo(
        "Privasi",
        "<p>Tas pilihan disimpan di browser perangkatmu. Website ini tidak meminta akun dan tidak mengirim data tas ke server.</p><p>Kamu dapat menghapus pilihan dari tas atau membersihkan data situs melalui pengaturan browser.</p>",
      );
      return;
    }
    showInfo(
      "Pertanyaan",
      "<details open><summary>Bagaimana memilih aroma?</summary><p>Embun Rimba untuk nuansa hijau dan segar, Teduh Iris untuk floral yang lembut, dan Senja Kayu untuk kehangatan kayu.</p></details><details><summary>Apakah sudah bisa membeli?</summary><p>Website ini merupakan presentasi koleksi konsep Rimbara. Kamu bisa menyusun dan menyimpan daftar pilihan. Pembayaran dan pengiriman belum tersedia.</p></details><details><summary>Bagaimana menyimpan parfum?</summary><p>Simpan dalam keadaan tertutup, di tempat sejuk dan jauh dari sinar matahari langsung.</p></details><details><summary>Apa arti lapisan aroma?</summary><p>Pembuka adalah kesan pertama. Inti muncul saat parfum mulai menghangat di kulit. Jejak akhir adalah karakter yang berkembang setelahnya.</p></details>",
    );
  }),
);
let selectedProduct = "embun";
$$("[data-product]").forEach((button) =>
  button.addEventListener("click", () => {
    selectedProduct = button.dataset.product;
    const product = products[selectedProduct];
    $("#product-detail-name").textContent = product.name;
    $("#product-detail-image").src = `/assets/${product.image}.webp`;
    $("#product-detail-image").alt = product.name;
    $("#product-detail-description").textContent = product.description;
    $("#product-detail-notes").textContent = product.notes;
    $("#product-detail-price").textContent = money(product.price);
    $("#product-dialog").showModal();
  }),
);
$("#add-product").addEventListener("click", () => {
  addToCart(selectedProduct, 50, 1);
  $("#product-dialog").close();
});
let quantity = 1;
$("#qty-minus").addEventListener("click", () => {
  $("#quantity").textContent = quantity = Math.max(1, quantity - 1);
});
$("#qty-plus").addEventListener("click", () => {
  $("#quantity").textContent = quantity = Math.min(20, quantity + 1);
});
$$("input[name=size]").forEach((input) =>
  input.addEventListener(
    "change",
    () =>
      ($("#featured-price").textContent = money(
        priceFor("embun", Number(input.value)),
      )),
  ),
);
$("#add-featured").addEventListener("click", () =>
  addToCart("embun", Number($("input[name=size]:checked").value), quantity),
);
const layers = {
  opening: [
    "Segar yang pelan.<br>Pagi yang tinggal.",
    "Bergamot, mandarin hijau, neroli",
  ],
  heart: [
    "Bunga putih.<br>Ruang untuk bernapas.",
    "Neroli, petitgrain, sentuhan floral",
  ],
  base: [
    "Hijau yang dalam.<br>Hangat di ingatan.",
    "Vetiver, cedar, soft musk",
  ],
};
function selectTab(button) {
  $$("[data-tab]").forEach((tab) => {
    const active = tab === button;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  const layer = layers[button.dataset.tab];
  $("#note-panel").innerHTML = `<h3>${layer[0]}</h3><p>${layer[1]}</p>`;
  $("#note-panel").setAttribute("aria-labelledby", button.id);
}
$$("[data-tab]").forEach((button) =>
  button.addEventListener("click", () => selectTab(button)),
);
$(".note-tabs").addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const tabs = $$("[data-tab]");
  let index = tabs.indexOf(document.activeElement);
  if (event.key === "Home") index = 0;
  else if (event.key === "End") index = 2;
  else index = (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
  selectTab(tabs[index]);
  tabs[index].focus();
});
const stories = [
  [
    "Tentang pulang",
    "“Ada tempat yang tak perlu kita datangi lagi. Cukup satu aroma, dan kita sudah kembali.”",
  ],
  [
    "Tentang jeda",
    "“Di sela hari yang penuh, selalu ada ruang untuk menarik napas. Untuk merasakan yang kecil, dengan lebih dalam.”",
  ],
  [
    "Tentang jejak",
    "“Yang tinggal sering kali sederhana. Hangatnya kayu, segarnya daun, atau seseorang yang baru saja berlalu.”",
  ],
];
let story = 0;
function changeStory(delta) {
  story = (story + delta + stories.length) % stories.length;
  $("#story-number").textContent = String(story + 1).padStart(2, "0");
  $("#story-title").textContent = stories[story][0];
  $("#story-quote").textContent = stories[story][1];
}
$("#story-prev").addEventListener("click", () => changeStory(-1));
$("#story-next").addEventListener("click", () => changeStory(1));
import("./scene.js")
  .then(({ mountBottle }) => mountBottle())
  .catch((error) => {
    console.error("Bottle renderer unavailable", error);
    document.documentElement.classList.add("no-webgl");
  });
