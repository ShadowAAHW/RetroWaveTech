// Загрузка продуктов
async function LoadProducts() {
    try {
        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        
        State.Products = data.products.map(p => {
            let discountPercent = 0;
            if (p.id % 3 === 0) {
                discountPercent = 20;
            } 
            else if (p.category === 'beauty') {
                discountPercent = 15;
            }
            else if (p.category === 'laptops' && p.price > 1000) {
                discountPercent = 10;
            }

            return { ...p, discountPercent };
        });

        Render();
    } catch (e) {
        console.error("Ошибка загрузки:", e);
        document.getElementById('app').innerHTML = '<h2 class="container text-center">Ошибка загрузки товаров</h2>';
    }
}