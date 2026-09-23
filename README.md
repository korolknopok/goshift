# GoShift — Тестовое задание (1C OData + Node.js + Angular)

Веб-приложение для просмотра заказов покупателей из 1С:Управление торговлей через OData API, проверки товарных остатков, проведения документа отгрузки и генерации печатной формы в формате PDF.

---

## Быстрый запуск (Docker Compose)

1. Создайте файл `.env` на основе примера `.env.example`:
```
    PORT=3000
    ONEC_BASE_URL=https://goshift.ru/demo_ut
    ONEC_USER=odata.user
    ONEC_PASSWORD=Emul-1C-UT-2026
```

2. Запустите приложение одной командой:
   ```bash
   docker compose up --build
   ```

3. Откройте в браузере: `http://localhost:3000`

---

## Локальная разработка без Docker

### 1. Бэкенд (`server/`)
```bash
cd server
npm install
npm run dev # API зародится на http://localhost:3000
```

### 2. Фронтенд (`client/`)
* 
  ```bash
  cd client
  npm install
  npm start # Dev-сервер Angular на http://localhost:4200
  ```

* **Раздача статики через Express (порт 3000):**
  ```bash
  cd client
  npm install
  npm run build # Сборка статики в client/dist
  ```

---

## Тестирование бэкенда

В проекте написаны модульные тесты для утилит склонения ФИО и форматирования денежных сумм.

```bash
cd server
npm test
```

---

## Пример GUID заказа для проверки

`2da145f0-d5fc-11f1-a0b3-48df371887e9`