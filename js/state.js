const State = {
    // Список загруженных товаров
    Products: [],
    // Список пользователей
    Users: JSON.parse(localStorage.getItem('users')) || [],
    // Текущий пользователь
    CurrentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    // Данные текущего пользователя
    Cart: [],
    // Избранное пользователя
    Favorites: [],
    // Заказы пользователя
    Orders: [],
    // Текущая страница
    View: 'home',
    // Текущий товар
    ActiveProductId: null,
    // Все параметры фильтров/сортировки
    Filters: {
        search: '',
        category: 'all',
        sort: 'default',
        minPrice: 0,
        maxPrice: 10000
    },
    VisibleCount: 8
};

// Инициализация данных пользователя
function InitUserData() {
    if (State.CurrentUser) {
        State.Cart = State.CurrentUser.cart || [];
        State.Favorites = State.CurrentUser.favorites || [];
        State.Orders = State.CurrentUser.orders || [];
    } else {
        State.Cart = [];
        State.Favorites = [];
        State.Orders = [];
    }
}

// Сохранение состояния пользователя
function SaveUserData() {
    if (!State.CurrentUser) return;

    State.CurrentUser.cart = State.Cart;
    State.CurrentUser.favorites = State.Favorites;
    State.CurrentUser.orders = State.Orders;

    // Обновление пользователя в общем списке
    const userIndex = State.Users.findIndex(u => u.email === State.CurrentUser.email);
    if (userIndex !== -1) {
        State.Users[userIndex] = State.CurrentUser;
    } else {
        State.Users.push(State.CurrentUser);
    }

    localStorage.setItem('users', JSON.stringify(State.Users));
    localStorage.setItem('currentUser', JSON.stringify(State.CurrentUser));
}

// Обновление счетчика корзины
function UpdateCartCount() {
    const count = State.Cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.getElementById('cart-count');
    if (el) el.innerText = count;
}