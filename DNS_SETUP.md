# Настройка кастомного домена cryptotraderai.app

## ✅ Что уже сделано:
1. Добавлен файл `CNAME` с содержимым `cryptotraderai.app` в ветку `gh-pages`
2. GitHub Pages настроен на использование кастомного домена
3. HTTPS будет активирован автоматически после настройки DNS

---

## 🌐 НАСТРОЙКА DNS (ОБЯЗАТЕЛЬНО!)

### Шаг 1: Зайди в панель управления доменом
Где куплен домен: Cloudflare, GoDaddy, Namecheap, Reg.ru, и т.д.

### Шаг 2: Найди раздел DNS Management / Управление DNS

### Шаг 3: Удали старые записи (если есть):
- ❌ Удали все A-записи, указывающие на Vercel
- ❌ Удали CNAME на `cname.vercel-dns.com`
- ❌ Удали CNAME на `cname.vercel.app`

### Шаг 4: Добавь новые DNS записи:

**Для корневого домена (cryptotraderai.app):**

| Тип | Имя (Name) | Значение (Value) | TTL |
|-----|------------|------------------|-----|
| **A** | `@` или `cryptotraderai.app` | `185.199.108.153` | 600 |
| **A** | `@` или `cryptotraderai.app` | `185.199.109.153` | 600 |
| **A** | `@` или `cryptotraderai.app` | `185.199.110.153` | 600 |
| **A** | `@` или `cryptotraderai.app` | `185.199.111.153` | 600 |

**Для поддомена www (www.cryptotraderai.app):**

| Тип | Имя (Name) | Значение (Value) | TTL |
|-----|------------|------------------|-----|
| **CNAME** | `www` | `goldinilya-debug.github.io` | 600 |

---

## 🔍 Проверка настройки DNS

После добавления записей (подожди 5-15 минут), проверь:

```bash
# На Linux/Mac:
dig cryptotraderai.app +short

# Должно показать:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153
```

Или на Windows:
```cmd
nslookup cryptotraderai.app
```

---

## ✅ Проверка сайта

После настройки DNS (5-30 минут):
1. Открой https://cryptotraderai.app
2. Должно открыться твой сайт
3. HTTPS будет работать автоматически (GitHub выдаст сертификат)

---

## ⚠️ Возможные проблемы:

### "Domain does not resolve"
- Подожди еще 10-15 минут (DNS обновляется)
- Проверь правильность IP адресов

### "404 Not Found"
- Проверь, что файл CNAME запушен в gh-pages ветку
- Проверь настройки GitHub Pages в репозитории

### "Certificate error"
- Подожди 5-10 минут, GitHub автоматически выпускает SSL
- Если не помогло — зайди в Settings → Pages → Enforce HTTPS

---

## 📞 Если не работает:

Проверь статус GitHub Pages:
1. Открой https://github.com/goldinilya-debug/cryptotraderai/settings/pages
2. Должно быть написано:
   - "Your site is published at https://cryptotraderai.app"
3. Если ошибка — скриншот в чат

---

**После настройки DNS сайт будет доступен по:**
- https://cryptotraderai.app
- https://www.cryptotraderai.app (редиректит на основной)
