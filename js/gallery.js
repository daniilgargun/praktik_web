document.addEventListener('DOMContentLoaded', function() {
    const mainImage = document.getElementById('mainGalleryImage');
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    const thumbnails = document.querySelectorAll('.gallery-thumbnails img');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    const galleryTitle = document.getElementById('galleryTitle');
    const galleryDescription = document.getElementById('galleryDescription');

    const projects = [
        {
            image: '../img/project_placeholder1.jpg',
            title: 'Инновационная Платформа E-commerce',
            description: 'Разработка полнофункциональной платформы для онлайн-торговли с персонализированными рекомендациями и безопасной платежной системой.'
        },
        {
            image: '../img/project_placeholder2.jpg',
            title: 'Корпоративный Портал для Внутренней Коммуникации',
            description: 'Создание интранет-портала, упрощающего внутренние процессы, документооборот и взаимодействие сотрудников крупной компании.'
        },
        {
            image: '../img/project_placeholder3.jpg',
            title: 'Мобильное Приложение для Фитнес-Тренировок',
            description: 'Разработка интуитивно понятного мобильного приложения для планирования тренировок, отслеживания прогресса и интеграции с носимыми устройствами.'
        },
        {
            image: '../img/project_placeholder4.jpg',
            title: 'Веб-Сервис для Управления Проектами',
            description: 'Создание облачного инструмента для командного управления проектами с функциями канбан-досок, учета времени и генерации отчетов.'
        },
        {
            image: '../img/project_placeholder5.jpg',
            title: 'Аналитическая Панель для Бизнес-Отчетности',
            description: 'Разработка интерактивной панели для визуализации ключевых показателей бизнеса и принятия обоснованных решений на основе данных.'
        }
    ];

    let currentIndex = 0;

    function updateGallery(direction = 'next') {
        const currentProject = projects[currentIndex];
        
        // Удаляем старые классы анимации изображения
        mainImage.classList.remove('image-animate-right', 'image-animate-left');

        // Сбрасываем анимации для текста, чтобы они могли быть повторены
        galleryTitle.classList.remove('fadeInUp');
        galleryDescription.classList.remove('fadeInUp');
        void galleryTitle.offsetWidth; // Триггер рефлоу для сброса анимации
        void galleryDescription.offsetWidth; // Триггер рефлоу для сброса анимации

        // Применяем новую анимацию изображения
        if (direction === 'next') {
            mainImage.classList.add('image-animate-right');
        } else {
            mainImage.classList.add('image-animate-left');
        }

        mainImage.src = currentProject.image;
        galleryTitle.textContent = currentProject.title;
        galleryDescription.textContent = currentProject.description;

        // Повторно применяем анимации для текста
        galleryTitle.classList.add('fadeInUp');
        galleryDescription.classList.add('fadeInUp');

        // Обновление активной миниатюры
        thumbnails.forEach((thumb, index) => {
            if (index === currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    // Обработчик для кликов по миниатюрам
    thumbnailsContainer.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG') {
            const clickedIndex = Array.from(thumbnails).indexOf(e.target);
            if (clickedIndex !== -1 && clickedIndex !== currentIndex) {
                // Определяем направление для анимации
                const direction = clickedIndex > currentIndex ? 'next' : 'prev';
                currentIndex = clickedIndex;
                updateGallery(direction);
            }
        }
    });

    // Обработчик для кнопки 'Предыдущий'
    prevBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + projects.length) % projects.length;
        updateGallery('prev');
    });

    // Обработчик для кнопки 'Следующий'
    nextBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % projects.length;
        updateGallery('next');
    });

    // Инициализация галереи при загрузке страницы
    updateGallery();
}); 