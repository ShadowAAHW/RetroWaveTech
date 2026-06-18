//#region Профиль;
// Авторизация
function HandleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    
    // Учительский вход
    if (email === AppConfig.TeacherEmail && pass === AppConfig.TeacherPassword) {
        State.CurrentUser = { email: email, role: 'teacher', name: 'Преподаватель', cart: [], favorites: [], orders: [] };
        localStorage.setItem('currentUser', JSON.stringify(State.CurrentUser));
        InitUserData();
        alert('Добро пожаловать, преподаватель!');
        Render();
        return;
    }

    const user = State.Users.find(u => u.email === email && u.password === pass);
    if (user) {
        State.CurrentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        InitUserData();
        Render();
    } else {
        alert('Неверный email или пароль');
    }
}

// Регистрация
function HandleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    if (State.Users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }

    const newUser = { email, password: pass, name: '', cart: [], favorites: [], orders: [] };
    State.Users.push(newUser);
    State.CurrentUser = newUser;
    
    localStorage.setItem('users', JSON.stringify(State.Users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    InitUserData();
    alert('Регистрация успешна!');
    Render();
}

// Выход
function Logout() {
    State.CurrentUser = null;
    localStorage.removeItem('currentUser');
    InitUserData();
    Render();
}
//#endregion
//#region Корзина
// Добавление товаров в корзину
function AddToCart(id) {
    const product = State.Products.find(p => p.id === id);
    if (!product) return;
    
    const existing = State.Cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        State.Cart.push({...product, quantity: 1});
    }
    SaveUserData();
    alert('Товар добавлен в корзину!');
    Render();
}

// Изменение кол-ва товара в корзине
function ChangeQuantity(id, delta) {
    const item = State.Cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) RemoveFromCart(id);
        else { SaveUserData(); Render(); }
    }
}

// Удаление из корзины
function RemoveFromCart(id) {
    State.Cart = State.Cart.filter(item => item.id !== id);
    SaveUserData();
    Render();
}

// Применение промокода
function ApplyPromoCode(codeInput) {
    const code = codeInput.trim().toUpperCase();
    
    const promo = PromoDB.find(p => p.code === code);
    
    if (!promo) {
        alert('Неверный промокод');
        return;
    }
    if (State.ActivePromoCode === code) {
        alert('Этот промокод уже применен');
        return;
    }

    State.ActivePromoCode = code;
    SaveUserData(); 
    Render();       
    alert(`Промокод "${code}" применен! Скидка: ${promo.type === 'percent' ? promo.discount + '%' : promo.discount + '$'}`);
}

// Очистка текущего промокода
function RemovePromoCode() {
    State.ActivePromoCode = null;
    SaveUserData();
    Render();
}

// Получение стоимости товара с учетом скидки
function GetItemPrice(item) {
    const discount = item.discountPercent || 0;
    return item.price * (1 - discount / 100);
}

// Подсчет суммы корзины
function CalculateCartTotal() {
    let subtotal = State.Cart.reduce((sum, item) => sum + (GetItemPrice(item) * item.quantity), 0);
    let discount = 0;
    let appliedPromo = null;

    if (State.ActivePromoCode) {
        const promo = PromoDB.find(p => p.code === State.ActivePromoCode);
        if (promo) {
            appliedPromo = promo;
            if (promo.type === 'percent') {
                discount = subtotal * (promo.discount / 100);
            } else if (promo.type === 'fixed') {
                discount = Math.min(promo.discount, subtotal); 
            }
        }
    }

    return {
        subtotal: subtotal,
        discount: discount,
        total: Math.max(0, subtotal - discount),
        promo: appliedPromo
    };
}

// Оформление заказа
function Checkout() {
    if (!State.CurrentUser) {
        alert('Для оформления заказа необходимо войти в аккаунт!');
        Router('profile');
        return;
    }
    
    const total = State.Cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder = {
        date: new Date().toISOString(),
        items: [...State.Cart],
        total: total
    };
    
    State.Orders.push(newOrder);
    State.Cart = [];
    SaveUserData();
    alert(`Заказ оформлен! Сумма: ${total.toFixed(2)} $`);
    Render();
}
//#endregion
//#region Избранное

// Добавление/удаление из избранного
function ToggleFavorite(id) {
    if (State.Favorites.includes(id)) {
        State.Favorites = State.Favorites.filter(fid => fid !== id);
    } else {
        State.Favorites.push(id);
    }
    SaveUserData();
    Render();
}
//#endregion
//#region Игра
// Логика игры
let score = 0;
function StartGameLogic() {
    score = 0;
    document.getElementById('score').innerText = score;
    const target = document.getElementById('target');
    target.style.display = 'block';
    MoveTarget();
    
    target.onclick = () => {
        score++;
        document.getElementById('score').innerText = score;
        if (score >= 5) {
            alert('Поздравляем! Твой промокод: RETRO2026');
            target.style.display = 'none';
        } else {
            MoveTarget();
        }
    };
}

// Перемещение цели в игре
function MoveTarget() {
    const target = document.getElementById('target');
    const area = document.querySelector('.game-area');
    if (!target || !area) return;
    
    const x = Math.random() * (area.clientWidth - 50);
    const y = Math.random() * (area.clientHeight - 50);
    target.style.left = x + 'px';
    target.style.top = y + 'px';
}
//#endregion
//#region События
// Слушатели событий (локальные)
function SetupFilterListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', (e) => {
        State.Filters.search = e.target.value;
        State.VisibleCount = 8;
        ApplyFiltersAndRender();
    });

    const categorySelect = document.getElementById('category-select');
    if (categorySelect) categorySelect.addEventListener('change', (e) => {
        State.Filters.category = e.target.value;
        State.VisibleCount = 8;
        ApplyFiltersAndRender();
    });

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', (e) => {
        State.Filters.sort = e.target.value;
        ApplyFiltersAndRender();
    });

    const priceRange = document.getElementById('price-range');
    if (priceRange) priceRange.addEventListener('input', (e) => {
        State.Filters.maxPrice = parseInt(e.target.value);
        const valSpan = document.getElementById('price-val');
        if (valSpan) valSpan.innerText = State.Filters.maxPrice;
        State.VisibleCount = 8;
        ApplyFiltersAndRender();
    });
}

// Слушатели событий (глобальные)
function SetupGlobalListeners() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }
    
    const accBtn = document.getElementById('accessibility-toggle');
    if (accBtn) {
        accBtn.addEventListener('click', () => {
            document.body.classList.toggle('accessibility-mode');
        });
    }
}
//#endregion