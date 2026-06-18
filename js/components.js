// Рендер страницы
function Render() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '';

    switch(State.View) {
        case 'home': RenderHome(app); break;
        case 'product': RenderProductPage(app); break;
        case 'cart': RenderCart(app); break;
        case 'profile': RenderProfile(app); break;
        case 'game': RenderGame(app); break;
        case 'favorites': RenderFavorites(app); break;
        default: RenderHome(app);
    }
    UpdateCartCount();
}

// Рендер главной страницы
function RenderHome(container) {
    RenderSlider(container);
    // Рендер фильтров/сортировки
    const controls = document.createElement('div');
    controls.className = 'controls-bar';
    controls.innerHTML = `
        <input type="text" id="search-input" placeholder="Поиск..." value="${State.Filters.search}">
        
        <select id="category-select">
            <option value="all">Все категории</option>
            <option value="smartphones">Смартфоны</option>
            <option value="laptops">Ноутбуки</option>
            <option value="fragrances">Парфюмерия</option>
            <option value="skincare">Уход за кожей</option>
            <option value="groceries">Продукты</option>
            <option value="home-decoration">Декор</option>
        </select>

        <select id="sort-select">
            <option value="default">По умолчанию</option>
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
            <option value="rating-desc">По рейтингу</option>
            <option value="title-asc">Название (А-Я)</option>
            <option value="title-desc">Название (Я-А)</option>
        </select>

        <div class="filter-group">
            <label>Цена до: <span id="price-val">${State.Filters.maxPrice}</span>$</label>
            <input type="range" id="price-range" min="0" max="10000" step="50" value="${State.Filters.maxPrice}">
        </div>
    `;
    container.appendChild(controls);
    // Рендер популярных товаров
    const popularSection = document.createElement('section');
    popularSection.innerHTML = '<h2 class="container"> Популярное</h2>';
    container.appendChild(popularSection);
    
    const popularGrid = document.createElement('div');
    popularGrid.className = 'catalog-grid';
    popularGrid.id = 'popular-grid';
    container.appendChild(popularGrid);
    // Рендер каталога
    const mainTitle = document.createElement('h2');
    mainTitle.className = 'container';
    mainTitle.innerText = 'Каталог';
    container.appendChild(mainTitle);

    const grid = document.createElement('div');
    grid.className = 'catalog-grid';
    grid.id = 'product-grid';
    container.appendChild(grid);
    // Кнопка добавить еще
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'btn btn-block';
    loadMoreBtn.style.width = '200px';
    loadMoreBtn.innerText = 'Показать еще';
    loadMoreBtn.onclick = LoadMoreProducts;
    container.appendChild(loadMoreBtn);

    ApplyFiltersAndRender();
    SetupFilterListeners();
}

// Применение фильтров и сортировки
function ApplyFiltersAndRender() {
    if (State.Products.length === 0) return;
    // Фильтры
    let filtered = State.Products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(State.Filters.search.toLowerCase());
        const matchesCategory = State.Filters.category === 'all' || p.category === State.Filters.category;
        const matchesPrice = p.price <= State.Filters.maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
    });
    // Сортировка
    if (State.Filters.sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
    else if (State.Filters.sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
    else if (State.Filters.sort === 'rating-desc') filtered.sort((a,b) => b.rating - a.rating);
    else if (State.Filters.sort === 'title-asc') filtered.sort((a,b) => a.title.localeCompare(b.title));
    else if (State.Filters.sort === 'title-desc') filtered.sort((a,b) => b.title.localeCompare(a.title));
    // Отображение популярных товаров
    const popular = [...State.Products].sort((a,b) => b.rating - a.rating).slice(0, 4);
    RenderProductsGrid('popular-grid', popular);
    // Отображение обычных товаров
    const visibleProducts = filtered.slice(0, State.VisibleCount);
    RenderProductsGrid('product-grid', visibleProducts);
}

// Загрузка доп. товаров
function LoadMoreProducts() {
    State.VisibleCount += 8;
    ApplyFiltersAndRender();
}

// Рендер каталога
function RenderProductsGrid(elementId, products) {
    const grid = document.getElementById(elementId);
    if (!grid) return;
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="padding: 20px;">Товары не найдены</p>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const isFav = State.Favorites.includes(p.id) ? 'style="color:red"' : '';
        return `
        <div class="product-card">
            <img src="${p.thumbnail}" class="product-img" alt="${p.title}" onclick="Router('product', ${p.id})">
            <div class="product-info">
                <h3 onclick="Router('product', ${p.id})">${p.title}</h3>
                <p>${p.price} $</p>
                <p>⭐ ${p.rating}</p>
            </div>
            <div class="flex-gap mt-20">
                <button class="btn" onclick="AddToCart(${p.id})">В корзину</button>
                <button class="btn btn-small" onclick="ToggleFavorite(${p.id})">
                    <i class="fas fa-heart" ${isFav}></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Рендер слайдера
function RenderSlider(container) {
    const sliderDiv = document.createElement('div');
    sliderDiv.className = 'slider-container';
    sliderDiv.innerHTML = `
        <div class="slide active" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://picsum.photos/1200/400?random=1')">
            <div class="slide-content"><h1>Большая распродажа!</h1><p>Скидки до 70%</p></div>
        </div>
        <div class="slide" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://picsum.photos/1200/400?random=2')">
            <div class="slide-content"><h1>Новые поступления</h1><p>Успей купить первым</p></div>
        </div>
        <div class="slide" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://picsum.photos/1200/400?random=3')">
            <div class="slide-content"><h1>Бонусы за игру</h1><p>Играй и получай промокоды</p></div>
        </div>
    `;
    container.appendChild(sliderDiv);
    // Переключение слайдов по интервалу
    let currentSlide = 0;
    const slides = sliderDiv.querySelectorAll('.slide');
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4000);
    }
}

// Рендер страницы товара
function RenderProductPage(container) {
    const product = State.Products.find(p => p.id === State.ActiveProductId);
    if (!product) {
        container.innerHTML = '<div class="container text-center"><h2>Товар не найден</h2><button class="btn w-auto" onclick="Router(\'home\')">Назад</button></div>';
        return;
    }

    const isFav = State.Favorites.includes(product.id);
    const favIconClass = isFav ? 'fas' : 'far';

    container.innerHTML = `
        <div class="product-page-wrapper">
            <button class="btn btn-secondary mb-20" onclick="Router('home')">
                <i class="fas fa-arrow-left"></i> Назад в каталог
            </button>
            
            <div class="product-detail">
                <div class="product-gallery">
                    <img src="${product.images[0]}" id="main-product-img">
                    <div class="thumbnails">
                        ${product.images.map(img => `<img src="${img}" onclick="document.getElementById('main-product-img').src='${img}'">`).join('')}
                    </div>
                </div>
                <div>
                    <h1>${product.title}</h1>
                    <h2 style="color: var(--accent)">${product.price} $</h2>
                    <p>${product.description}</p>
                    <p><b>Бренд:</b> ${product.brand}</p>
                    <p><b>Рейтинг:</b> ${product.rating} / 5</p>
                    <p><b>Категория:</b> ${product.category}</p>
                    <div class="flex-gap mt-20">
                        <button class="btn" onclick="AddToCart(${product.id})">Добавить в корзину</button>
                        <button class="btn btn-secondary" onclick="ToggleFavorite(${product.id})">
                            <i class="${favIconClass} fa-heart"></i> 
                            ${isFav ? 'В избранном' : 'В избранное'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Рендер избранных
function RenderFavorites(container) {
    const favProducts = State.Products.filter(p => State.Favorites.includes(p.id));
    
    container.innerHTML = `
        <h2 class="container">Избранное</h2>
        <div class="catalog-grid" id="fav-grid"></div>
    `;
    
    if (favProducts.length === 0) {
        document.getElementById('fav-grid').innerHTML = '<p>Список избранного пуст.</p>';
    } else {
        RenderProductsGrid('fav-grid', favProducts);
    }
}

// Рендер корзины
function RenderCart(container) {
    if (State.Cart.length === 0) {
        container.innerHTML = '<h2 class="container text-center">Корзина пуста</h2>';
        return;
    }

    let total = 0;
    const html = State.Cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <div class="flex-gap">
                    <img src="${item.thumbnail}">
                    <div>
                        <b>${item.title}</b><br>
                        ${item.price} $ x ${item.quantity}
                    </div>
                </div>
                <div class="flex-gap">
                    <button class="btn btn-small" onclick="ChangeQuantity(${item.id}, -1)">-</button>
                    <button class="btn btn-small" onclick="ChangeQuantity(${item.id}, 1)">+</button>
                    <button class="btn btn-small btn-danger" onclick="RemoveFromCart(${item.id})">X</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <h2 class="container">Корзина</h2>
        <div class="cart-wrapper">${html}</div>
        <div class="cart-wrapper text-center">
            <h3>Итого: ${total.toFixed(2)} $</h3>
            <button class="btn btn-special" onclick="Checkout()">Оформить заказ</button>
        </div>
    `;
}

// Рендер профиля
function RenderProfile(container) {
    if (State.CurrentUser) {
        container.innerHTML = `
            <div class="profile-wrapper">
                <h2>Личный кабинет</h2>
                
                <div class="profile-section">
                    <h3>Редактировать профиль</h3>
                    <form onsubmit="UpdateProfile(event)" class="auth-form">
                        <label>Email:</label>
                        <input type="email" id="profile-email" value="${State.CurrentUser.email}" disabled>
                        <label>Имя:</label>
                        <input type="text" id="profile-name" value="${State.CurrentUser.name || ''}" placeholder="Ваше имя">
                        <button type="submit" class="btn">Сохранить изменения</button>
                    </form>
                </div>

                <div class="profile-section">
                    <h3>Мои заказы</h3>
                    ${State.Orders.length === 0 ? '<p>Заказов пока нет</p>' : 
                      State.Orders.map((order, idx) => `
                        <div class="order-item">
                            <div>
                                <b>Заказ #${1000 + idx}</b><br>
                                <small>${new Date(order.date).toLocaleDateString()}</small>
                            </div>
                            <div>${order.total.toFixed(2)} $</div>
                        </div>
                      `).join('')}
                </div>

                <div class="flex-gap">
                    <button class="btn" onclick="Router('favorites')">Перейти в избранное</button>
                    <button class="btn btn-danger" onclick="Logout()">Выйти</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="auth-container">
                <h2 class="text-center">Вход</h2>
                <form onsubmit="HandleLogin(event)" class="auth-form">
                    <input type="email" id="login-email" placeholder="Email" required>
                    <input type="password" id="login-pass" placeholder="Пароль" required>
                    <button type="submit" class="btn btn-full">Войти</button>
                </form>
                
                <hr class="auth-divider">
                
                <h2 class="text-center">Регистрация</h2>
                <form onsubmit="HandleRegister(event)" class="auth-form">
                    <input type="email" id="reg-email" placeholder="Email" required>
                    <input type="password" id="reg-pass" placeholder="Пароль" required>
                    <button type="submit" class="btn btn-full">Зарегистрироваться</button>
                </form>
            </div>
        `;
    }
}

// Обновление информации о профиле
function UpdateProfile(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    State.CurrentUser.name = name;
    SaveUserData();
    alert('Профиль обновлен!');
}

// Рендер игры
function RenderGame(container) {
    container.innerHTML = `
        <div class="game-wrapper">
            <h2>Поймай промокод!</h2>
            <p>Кликай по квадратам. Собери 5 очков.</p>
            <div class="game-area">
                <div id="target" class="target"></div>
            </div>
            <p>Счет: <span id="score">0</span>/5</p>
            <button class="btn btn-special" onclick="StartGameLogic()">Начать игру</button>
        </div>
    `;
}