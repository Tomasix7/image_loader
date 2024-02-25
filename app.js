require('dotenv').config({path:__dirname+'/.env'});
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

const port = process.env.PORT;
const db = process.env.DBNAME;
console.log(port);

// Подключение к базе данных MongoDB
mongoose.connect('mongodb://localhost:27017/' + db);

// Модель для хранения данных изображений в базе данных
const Image = mongoose.model('Image', {
  data: Buffer,
  contentType: String,
});

// Устанавливаем EJS как шаблонизатор
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Подключение middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Настройка Multer для обработки файлов изображений
const storage = multer.memoryStorage();





const upload = multer({ storage: storage });

// Отображение формы на странице index.ejs
app.get('/', (req, res) => {
  res.render('index');
});

// Загрузка изображения и сохранение в базу данных
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const image = new Image({
      data: req.file.buffer,
      contentType: req.file.mimetype,
    });
    await image.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Отображение сохраненных изображений
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ _id: -1 });
    res.render('images', { images });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
