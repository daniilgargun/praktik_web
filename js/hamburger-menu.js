// Получаем ссылки на элементы
const hamburgerBtn = document.getElementById('hamburgerBtn');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const menuExitBtn = document.getElementById('menuExitBtn');

// Функция для переключения состояния меню
function toggleHamburgerMenu() {
    hamburgerMenu.classList.toggle('show');
    hamburgerBtn.classList.toggle('active');
}

// Добавляем слушатель событий для кнопки-гамбургера
hamburgerBtn.addEventListener('click', function(event) {
    event.stopPropagation(); // Предотвращаем всплытие клика, чтобы он не закрыл меню сразу
    toggleHamburgerMenu();
});

// Добавляем слушатель событий для закрытия меню по клику вне его
document.addEventListener('click', function(event) {
    if (hamburgerMenu.classList.contains('show') &&
        !hamburgerMenu.contains(event.target) &&
        !hamburgerBtn.contains(event.target)) {
        toggleHamburgerMenu();
    }
});

// Добавляем слушатель событий для закрытия меню по нажатию Esc
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && hamburgerMenu.classList.contains('show')) {
        toggleHamburgerMenu();
    }
});

// Добавляем слушатель событий для кнопки 'Exit'
// Предполагаем, что universalAuth является глобальным экземпляром UniversalAuth
// Если universalAuth не доступен глобально, потребуется другая реализация (например, через CustomEvent)
if (menuExitBtn && typeof universalAuth !== 'undefined' && universalAuth.logout) {
    menuExitBtn.addEventListener('click', function(event) {
        event.preventDefault(); // Предотвращаем стандартное действие ссылки
        universalAuth.logout();
        toggleHamburgerMenu(); // Закрываем меню после выхода
    });
} else if (menuExitBtn) {
    // Запасной вариант, если universalAuth.logout недоступен (для тестирования)
    menuExitBtn.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('Пользователь вышел из системы (имитация)');
        // Здесь можно добавить перенаправление на главную страницу или страницу входа
        // window.location.href = 'index.html'; 
        toggleHamburgerMenu();
    });
} 