// Обработчик авторизации и регистрации
class AuthHandler {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.loadUsers();
    }

    // Загрузка пользователей из localStorage (имитация txt файла)
    loadUsers() {
        try {
            const userData = localStorage.getItem('webprog_users');
            if (userData) {
                this.users = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            this.users = [];
        }
    }

    // Сохранение пользователей в localStorage (имитация txt файла)
    saveUsers() {
        try {
            localStorage.setItem('webprog_users', JSON.stringify(this.users));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения пользователей:', error);
            return false;
        }
    }

    // Регистрация нового пользователя
    register(userData) {
        // Проверка существования пользователя
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        // Валидация данных
        if (!this.validateEmail(userData.email)) {
            return { success: false, message: 'Некорректный email адрес' };
        }

        if (!this.validatePassword(userData.password)) {
            return { success: false, message: 'Пароль должен содержать минимум 6 символов' };
        }

        if (userData.password !== userData.confirmPassword) {
            return { success: false, message: 'Пароли не совпадают' };
        }

        // Создание нового пользователя
        const newUser = {
            id: Date.now(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: this.hashPassword(userData.password), // В реальном приложении используйте bcrypt
            phone: userData.phone || '',
            newsletter: userData.newsletter || false,
            registrationDate: new Date().toISOString(),
            lastLogin: null
        };

        this.users.push(newUser);
        
        if (this.saveUsers()) {
            return { success: true, message: 'Регистрация прошла успешно!' };
        } else {
            return { success: false, message: 'Ошибка сохранения данных' };
        }
    }

    // Вход пользователя
    login(email, password) {
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }

        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Неверный пароль' };
        }

        // Обновление времени последнего входа
        user.lastLogin = new Date().toISOString();
        this.saveUsers();
        
        this.currentUser = user;
        localStorage.setItem('webprog_current_user', JSON.stringify(user));

        return { success: true, message: 'Вход выполнен успешно!' };
    }

    // Выход пользователя
    logout() {
        this.currentUser = null;
        localStorage.removeItem('webprog_current_user');
    }

    // Простое хеширование пароля (в реальном приложении используйте bcrypt)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Конвертация в 32-битное целое
        }
        return hash.toString();
    }

    // Валидация email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Валидация пароля
    validatePassword(password) {
        return password && password.length >= 6;
    }

    // Проверка силы пароля
    checkPasswordStrength(password) {
        let strength = 0;
        let feedback = 'Слабый';
        let color = '#ff4757';

        if (password.length >= 6) strength += 1;
        if (password.length >= 10) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        if (strength >= 2 && strength < 4) {
            feedback = 'Средний';
            color = '#ffa502';
        } else if (strength >= 4) {
            feedback = 'Сильный';
            color = '#2ed573';
        }

        return {
            strength: Math.min(strength, 4),
            feedback,
            color,
            percentage: (Math.min(strength, 4) / 4) * 100
        };
    }
}

// Глобальный экземпляр обработчика авторизации
const authHandler = new AuthHandler();

// Функции для управления уведомлениями
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Функция переключения видимости пароля
function togglePassword(fieldId = 'password') {
    const passwordField = document.getElementById(fieldId);
    const toggleBtn = passwordField.nextElementSibling.nextElementSibling;
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordField.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Инициализация страницы входа
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.querySelector('.submit-btn');
            
            // Показываем загрузку
            submitBtn.classList.add('loading');
            
            setTimeout(() => {
                const result = authHandler.login(email, password);
                
                submitBtn.classList.remove('loading');
                
                if (result.success) {
                    showNotification(result.message, 'success');
                    
                    // Обновляем кнопку авторизации
                    if (typeof window.universalAuth !== 'undefined') {
                        window.universalAuth.updateAuthButton();
                    }
                    
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1500);
                } else {
                    showNotification(result.message, 'error');
                    // Анимация тряски формы при ошибке
                    const authCard = document.querySelector('.auth-card');
                    authCard.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        authCard.style.animation = '';
                    }, 500);
                }
            }, 1000);
        });

        // Добавляем анимацию тряски
        const shakeStyle = document.createElement('style');
        shakeStyle.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(shakeStyle);
    }
}

// Инициализация страницы регистрации
function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        // Обработчик проверки силы пароля
        const passwordField = document.getElementById('password');
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (passwordField && strengthBar && strengthText) {
            passwordField.addEventListener('input', function() {
                const strength = authHandler.checkPasswordStrength(this.value);
                
                strengthBar.style.width = strength.percentage + '%';
                strengthBar.style.background = strength.color;
                strengthText.textContent = strength.feedback;
                strengthText.style.color = strength.color;
            });
        }

        // Проверка совпадения паролей
        const confirmPasswordField = document.getElementById('confirmPassword');
        if (confirmPasswordField) {
            confirmPasswordField.addEventListener('input', function() {
                const password = passwordField.value;
                const confirmPassword = this.value;
                
                if (confirmPassword && password !== confirmPassword) {
                    this.style.borderColor = '#ff4757';
                    this.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
                } else {
                    this.style.borderColor = '#29c5e6';
                    this.style.boxShadow = '0 0 10px rgba(41, 197, 230, 0.3)';
                }
            });
        }

        // Форматирование номера телефона для Беларуси
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.startsWith('375')) {
                    value = value.substring(3);
                }
                if (value.length > 0) {
                    value = value.substring(0, 9);
                    let formatted = '+375';
                    if (value.length > 0) {
                        formatted += ' (' + value.substring(0, 2);
                        if (value.length > 2) {
                            formatted += ') ' + value.substring(2, 5);
                            if (value.length > 5) {
                                formatted += '-' + value.substring(5, 7);
                                if (value.length > 7) {
                                    formatted += '-' + value.substring(7, 9);
                                }
                            }
                        } else {
                            formatted += ')';
                        }
                    }
                    this.value = formatted;
                }
            });
        }

        // Обработка отправки формы
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                phone: formData.get('phone'),
                newsletter: formData.get('newsletter') === 'on'
            };
            
            const submitBtn = document.querySelector('.submit-btn');
            
            // Показываем загрузку
            submitBtn.classList.add('loading');
            
            setTimeout(() => {
                const result = authHandler.register(userData);
                
                submitBtn.classList.remove('loading');
                
                if (result.success) {
                    showNotification(result.message, 'success');
                    
                    // Эффект конфетти при успешной регистрации
                    createConfetti();
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    // При любой ошибке регистрации переходим на 404
                    showNotification(result.message, 'error');
                    
                    setTimeout(() => {
                        window.location.href = '../404.html';
                    }, 2000);
                    
                    // Анимация тряски формы при ошибке
                    const authCard = document.querySelector('.auth-card');
                    authCard.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        authCard.style.animation = '';
                    }, 500);
                }
            }, 1500);
        });
    }
}

// Функция создания эффекта конфетти
function createConfetti() {
    const colors = ['#29c5e6', '#1b8ea6', '#7e7e7e', '#f8f8f8'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => {
            confetti.remove();
        };
    }
}

// Функция для экспорта данных пользователей в текстовый файл
function exportUsersToFile() {
    const users = authHandler.users;
    let content = 'WEBPROG - База данных пользователей\n';
    content += '=====================================\n\n';
    
    users.forEach((user, index) => {
        content += `Пользователь ${index + 1}:\n`;
        content += `ID: ${user.id}\n`;
        content += `Имя: ${user.firstName} ${user.lastName}\n`;
        content += `Email: ${user.email}\n`;
        content += `Телефон: ${user.phone || 'Не указан'}\n`;
        content += `Дата регистрации: ${new Date(user.registrationDate).toLocaleString('ru-RU')}\n`;
        content += `Последний вход: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString('ru-RU') : 'Никогда'}\n`;
        content += `Подписка на новости: ${user.newsletter ? 'Да' : 'Нет'}\n`;
        content += '-----------------------------------\n\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webprog_users.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Добавляем обработчики для социальных кнопок
document.addEventListener('DOMContentLoaded', function() {
    const socialBtns = document.querySelectorAll('.social-btn');
    
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            let provider = 'Неизвестный провайдер';
            if (this.classList.contains('google-btn')) {
                provider = 'Google';
            } else if (this.classList.contains('yandex-btn')) {
                provider = 'Яндекс';
            }
            showNotification(`Вход через ${provider} временно недоступен`, 'warning');
        });
    });
});

// Функция для проверки авторизации пользователя
function checkAuth() {
    const currentUser = localStorage.getItem('webprog_current_user');
    if (currentUser) {
        authHandler.currentUser = JSON.parse(currentUser);
        return true;
    }
    return false;
}

// Экспорт функций для использования в других файлах
window.authHandler = authHandler;
window.showNotification = showNotification;
window.togglePassword = togglePassword;
window.initLoginPage = initLoginPage;
window.initRegisterPage = initRegisterPage;
window.exportUsersToFile = exportUsersToFile;
window.checkAuth = checkAuth; 