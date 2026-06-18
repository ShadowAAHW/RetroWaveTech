// Роутинг
function Router(viewName, productId = null) {
    State.View = viewName;
    if (productId) State.ActiveProductId = productId;
    window.scrollTo(0, 0);
    Render();
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    InitUserData();
    LoadProducts();
    SetupGlobalListeners();
});