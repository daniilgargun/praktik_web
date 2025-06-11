// Управление модальным окном авторизации
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.querySelector('.close');
    
    // Проверяем авторизацию при загрузке страницы
    updateAuthButton();
    
    // Открытие модального окна (только если пользователь не авторизован)
    loginBtn.addEventListener('click', function() {
        if (checkAuth()) {
            // Если пользователь авторизован - выходим
            logout();
        } else {
            // Если не авторизован - показываем модальное окно
            modal.style.display = 'flex';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            playClickSound();
        }
    });
    
    // Закрытие модального окна
    closeBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    function closeModal() {
        const modalContent = document.querySelector('.modal-content');
        modalContent.classList.add('closing');
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('show');
            modalContent.classList.remove('closing');
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Функция для обновления кнопки авторизации
    function updateAuthButton() {
        const currentUser = localStorage.getItem('webprog_current_user');
        
        if (currentUser) {
            const user = JSON.parse(currentUser);
            // Пользователь авторизован - показываем кнопку выхода
            loginBtn.innerHTML = `
                <span class="user-info">
                    <span class="user-icon">👤</span>
                    <span class="user-name">${user.firstName}</span>
                </span>
                <span class="logout-text">Выйти</span>
            `;
            loginBtn.classList.add('logged-in');
            loginBtn.title = `Выйти (${user.email})`;
        } else {
            // Пользователь не авторизован - показываем кнопку входа
            loginBtn.innerHTML = 'Вход';
            loginBtn.classList.remove('logged-in');
            loginBtn.title = 'Войти в систему';
        }
    }
    
    // Функция выхода из системы
    function logout() {
        // Показываем подтверждение
        if (confirm('Вы действительно хотите выйти из системы?')) {
            // Очищаем данные пользователя
            localStorage.removeItem('webprog_current_user');
            
            // Обновляем кнопку
            updateAuthButton();
            
            // Показываем уведомление
            showLogoutNotification();
            
            // Добавляем эффект
            loginBtn.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                loginBtn.style.animation = '';
            }, 600);
        }
    }
    
    // Функция для показа уведомления о выходе
    function showLogoutNotification() {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'logout-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">👋</span>
                <span class="notification-text">Вы успешно вышли из системы</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Убираем уведомление
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Делаем функцию updateAuthButton глобальной
    window.updateAuthButton = updateAuthButton;
    
    // Функция для воспроизведения звука клика
    function playClickSound() {
        if (typeof(AudioContext) !== "undefined" || typeof(webkitAudioContext) !== "undefined") {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }
});

// Функции для перенаправления на страницы
function redirectToLogin() {
    showLoadingEffect();
    
    setTimeout(() => {
        window.location.href = 'auth/login.html';
    }, 800);
}

function redirectToRegister() {
    showLoadingEffect();
    
    setTimeout(() => {
        window.location.href = 'auth/register.html';
    }, 800);
}

function showLoadingEffect() {
    const modal = document.getElementById('authModal');
    const authContainer = document.querySelector('.auth-container');
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Загрузка...</p>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            z-index: 100;
            animation: fadeIn 0.3s ease;
        }
        
        .loading-spinner {
            text-align: center;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e7e7e7;
            border-top: 4px solid #29c5e6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-spinner p {
            color: #7e7e7e;
            font-family: 'Oswald', sans-serif;
            font-size: 14px;
            margin: 0;
        }
    `;
    
    document.head.appendChild(style);
    authContainer.appendChild(loadingDiv);
}

// Дополнительные эффекты при наведении
document.addEventListener('DOMContentLoaded', function() {
    const authButtons = document.querySelectorAll('.auth-action-btn');
    
    authButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('focus', function() {
            this.style.animation = 'pulse 0.6s ease-in-out';
        });
        
        button.addEventListener('blur', function() {
            this.style.animation = '';
        });
    });
});

// CSS анимация пульсации
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(pulseStyle); 