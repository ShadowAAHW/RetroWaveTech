// Загрузка продуктов
async function LoadProducts() {
    try {
        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        State.Products = data.products;
        Render();
    } catch (e) {
        console.error("Ошибка загрузки:", e);
        document.getElementById('app').innerHTML = '<h2 class="container">Ошибка загрузки товаров. Проверьте интернет.</h2>';
    }
}