const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'data', 'users.txt');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Создаем папку data если её нет
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Функция для чтения пользователей из файла
function readUsersFromFile() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return data ? JSON.parse(data) : [];
        }
        return [];
    } catch (error) {
        console.error('Ошибка чтения файла пользователей:', error);
        return [];
    }
}

// Функция для записи пользователей в файл
function writeUsersToFile(users) {
    try {
        const data = JSON.stringify(users, null, 2);
        fs.writeFileSync(USERS_FILE, data, 'utf8');
        return true;
    } catch (error) {
        console.error('Ошибка записи файла пользователей:', error);
        return false;
    }
}

// API маршруты

// Получить всех пользователей
app.get('/api/users', (req, res) => {
    const users = readUsersFromFile();
    // Убираем пароли из ответа
    const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
    });
    res.json(safeUsers);
});

// Регистрация пользователя
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, password, phone, newsletter } = req.body;
    
    // Валидация
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Все обязательные поля должны быть заполнены' 
        });
    }
    
    const users = readUsersFromFile();
    
    // Проверка существования пользователя
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пользователь с таким email уже существует' 
        });
    }
    
    // Создание нового пользователя
    const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        password: hashPassword(password), // Простое хеширование
        phone: phone || '',
        newsletter: newsletter || false,
        registrationDate: new Date().toISOString(),
        lastLogin: null
    };
    
    users.push(newUser);
    
    if (writeUsersToFile(users)) {
        res.json({ success: true, message: 'Регистрация прошла успешно!' });
    } else {
        res.status(500).json({ success: false, message: 'Ошибка сохранения данных' });
    }
});

// Вход пользователя
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email и пароль обязательны' 
        });
    }
    
    const users = readUsersFromFile();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Пользователь не найден' 
        });
    }
    
    if (user.password !== hashPassword(password)) {
        return res.status(401).json({ 
            success: false, 
            message: 'Неверный пароль' 
        });
    }
    
    // Обновление времени последнего входа
    user.lastLogin = new Date().toISOString();
    writeUsersToFile(users);
    
    // Убираем пароль из ответа
    const { password: _, ...safeUser } = user;
    
    res.json({ 
        success: true, 
        message: 'Вход выполнен успешно!', 
        user: safeUser 
    });
});

// Экспорт данных пользователей в текстовый файл
app.get('/api/export', (req, res) => {
    const users = readUsersFromFile();
    
    let content = 'WEBPROG - База данных пользователей\n';
    content += '=====================================\n\n';
    content += `Дата экспорта: ${new Date().toLocaleString('ru-RU')}\n`;
    content += `Всего пользователей: ${users.length}\n\n`;
    
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
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="webprog_users.txt"');
    res.send(content);
});

// Простое хеширование пароля (в реальном приложении используйте bcrypt)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Файл пользователей: ${USERS_FILE}`);
});

module.exports = app; 