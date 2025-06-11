// Универсальная система авторизации для всех страниц
class UniversalAuth {
    constructor() {
        this.basePath = this.detectBasePath();
        this.authPath = this.detectAuthPath();
        
        // Отладочная информация 
        console.log('UniversalAuth initialized:');
        console.log('- Protocol:', window.location.protocol);
        console.log('- Pathname:', window.location.pathname);
        console.log('- Base path:', this.basePath);
        console.log('- Auth path:', this.authPath);
        
        this.init();
    }

    detectBasePath() {
        // Проверяем, открыт ли файл локально (file://) или через сервер
        const isLocalFile = window.location.protocol === 'file:';
        
        if (isLocalFile) {
            // Для локальных файлов определяем базовый путь по текущему файлу
            const path = window.location.pathname;
            const currentFile = path.split('/').pop() || 'index.html';
            
            if (currentFile === 'index.html' || path.endsWith('/')) {
                return './'; // Корневая директория
            } else {
                return '../'; // Для файлов в подпапках
            }
        } else {
            // Для серверных файлов используем существующую логику
            const path = window.location.pathname;
            const segments = path.split('/').filter(segment => segment !== '');
            
            if (segments.length <= 1) {
                return './';
            } else {
                return '../'.repeat(segments.length - 1);
            }
        }
    }

    detectAuthPath() {
        // Проверяем, открыт ли файл локально (file://) или через сервер
        const isLocalFile = window.location.protocol === 'file:';
        const path = window.location.pathname;
        const currentFile = path.split('/').pop() || 'index.html';
        
        if (isLocalFile) {
            // Для локальных файлов всегда используем относительный путь
            if (currentFile === 'index.html' || path.endsWith('/')) {
                return 'auth/'; // Корневая директория
            } else {
                return '../auth/'; // Для файлов в подпапках
            }
        } else {
            // Для серверных файлов используем существующую логику
            if (path === '/' || (path.endsWith('index.html') && !path.includes('/'))) {
                return 'auth/'; // Корневая директория
            } else {
                return this.basePath + 'auth/'; // Для всех остальных случаев
            }
        }
    }

    init() {
        this.setupAuth();
        this.checkAuth();
    }

    setupAuth() {
        const loginBtn = document.getElementById('loginBtn');
        const modal = document.getElementById('authModal');
        const closeBtn = modal?.querySelector('.close');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const currentUser = localStorage.getItem('webprog_current_user');
                if (currentUser) {
                    this.logout();
                } else {
                    modal.classList.add('show');
                    modal.style.display = 'flex';
                    this.playClickSound();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Обработка клавиши Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('show')) {
                this.closeModal();
            }
        });

        // Настройка функций перенаправления
        this.setupRedirectFunctions();
    }

    checkAuth() {
        const currentUser = localStorage.getItem('webprog_current_user');
        this.updateAuthButton(currentUser);
    }

    updateAuthButton(currentUser = null) {
        const loginBtn = document.getElementById('loginBtn');
        if (!loginBtn) return;

        if (currentUser || localStorage.getItem('webprog_current_user')) {
            const userData = JSON.parse(currentUser || localStorage.getItem('webprog_current_user'));
            const firstName = userData.firstName || userData.email.split('@')[0];
            
            loginBtn.classList.add('logged-in');
            loginBtn.innerHTML = `
                <div class="user-info">
                    <span class="user-icon">👤</span>
                    <span class="user-name">${firstName}</span>
                </div>
                <span class="logout-text">Выйти</span>
            `;
        } else {
            loginBtn.classList.remove('logged-in');
            loginBtn.innerHTML = 'Вход';
        }
    }

    logout() {
        // Создаем красивое модальное окно подтверждения
        this.showLogoutConfirmation();
    }

    showLogoutConfirmation() {
        // Создаем модальное окно подтверждения выхода
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal logout-confirm-modal';
        confirmModal.innerHTML = `
            <div class="modal-content logout-confirm-content">
                <div class="logout-confirm-header">
                    <div class="logout-icon">🚪</div>
                    <h2>Подтверждение выхода</h2>
                    <p>Вы действительно хотите выйти из аккаунта?</p>
                </div>
                
                <div class="logout-confirm-buttons">
                    <button class="logout-btn confirm-logout">
                        <span class="btn-icon">✓</span>
                        <span>Да, выйти</span>
                    </button>
                    <button class="logout-btn cancel-logout">
                        <span class="btn-icon">✕</span>
                        <span>Отмена</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmModal);
        
        // Показываем модальное окно с анимацией
        setTimeout(() => {
            confirmModal.classList.add('show');
            confirmModal.style.display = 'flex';
        }, 10);

        // Обработчики событий
        const confirmBtn = confirmModal.querySelector('.confirm-logout');
        const cancelBtn = confirmModal.querySelector('.cancel-logout');

        confirmBtn.addEventListener('click', () => {
            this.performLogout();
            this.closeConfirmModal(confirmModal);
        });

        cancelBtn.addEventListener('click', () => {
            this.closeConfirmModal(confirmModal);
        });

        // Закрытие по клику вне модального окна
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                this.closeConfirmModal(confirmModal);
            }
        });

        // Закрытие по Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeConfirmModal(confirmModal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    closeConfirmModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    performLogout() {
        localStorage.removeItem('webprog_current_user');
        this.updateAuthButton();
        this.showLogoutNotification();
        this.playClickSound();
    }

    showLogoutNotification() {
        const notification = document.createElement('div');
        notification.className = 'logout-notification show';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">👋</span>
                <span class="notification-text">Вы успешно вышли из аккаунта</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    closeModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.add('closing');
            
            setTimeout(() => {
                modal.classList.remove('show');
                modal.style.display = 'none';
                modalContent.classList.remove('closing');
            }, 300);
        }
    }

    setupRedirectFunctions() {
        // Делаем функции глобальными для использования в HTML
        window.redirectToLogin = () => {
            this.showLoadingEffect();
            setTimeout(() => {
                window.location.href = this.authPath + 'login.html';
            }, 500);
        };

        window.redirectToRegister = () => {
            this.showLoadingEffect();
            setTimeout(() => {
                window.location.href = this.authPath + 'register.html';
            }, 500);
        };
    }

    showLoadingEffect() {
        const modal = document.getElementById('authModal');
        if (modal) {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Перенаправление...</p>
                </div>
            `;
            
            modal.querySelector('.modal-content').appendChild(loadingOverlay);
        }
    }

    playClickSound() {
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
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.universalAuth = new UniversalAuth();
}); 