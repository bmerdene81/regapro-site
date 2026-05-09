# RegaPro — Цахим геологи геотехникийн лог

Survey123 платформ дээр суурилсан, геологи уул уурхайн салбарт зориулсан цахим хээрийн мэдээллийн системийн вэбсайт.

## Файлын бүтэц

```
regapro-site/
├── index.html        # Нүүр хуудас
├── services.html     # Үйлчилгээ
├── about.html        # Бидний тухай
├── contact.html      # Холбоо барих
├── style.css         # Бүх дизайн
├── script.js         # Интерактив функцууд
├── images/           # Зурагнуудын хавтас
│   ├── zurag1.png    #   Hero slideshow + галерей
│   ├── zurag2.png    #   Hero slideshow + галерей
│   ├── zurag3.png    #   Hero slideshow + галерей
│   ├── zurag4.png    #   Hero slideshow + галерей
│   └── zurag5.png    #   Hero slideshow + галерей
└── README.md         # Энэ файл
```

## GitHub дээр үнэгүй байршуулах заавар

### 1. GitHub repository үүсгэх

1. https://github.com -д нэвтэрнэ
2. Баруун дээд буланд **+** > **New repository** дарна
3. Repository нэр: **regapro-site** (эсвэл өөрийн хүссэн нэр)
4. Public сонгоно (GitHub Pages үнэгүй ажиллахад зайлшгүй)
5. **Create repository** дарна

### 2. Файлуудыг upload хийх

**А) Хялбар арга — GitHub веб дээр шууд:**

1. Шинээр үүсгэсэн repo дотор **uploading an existing file** холбоос дээр дарна
2. Дээрх 5 файлыг (index.html, services.html, about.html, contact.html, style.css, script.js) drag-and-drop хийж оруулна
3. Доор нь **Commit changes** дарна

**Б) Git ашиглан (хэрэв танилцсан бол):**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/regapro-site.git
git push -u origin main
```

### 3. GitHub Pages идэвхжүүлэх

1. Repository дээрээ **Settings** taab дарна
2. Зүүн талын цэснээс **Pages** сонгоно
3. **Source** хэсэгт:
   - Branch: **main**
   - Folder: **/ (root)**
4. **Save** дарна
5. 1-2 минутын дараа `https://USERNAME.github.io/regapro-site/` хаягаар сайт нээгдэнэ

### 4. regapro.com домайныг холбох

#### А) Repository талд

1. Repository-н **Settings → Pages** хэсэгт ор
2. **Custom domain** хэсэгт: `regapro.com` гэж бичээд **Save** дарна
3. **Enforce HTTPS** хайрцагт тэмдэг тавина (DNS зөв тохируулсны дараа)
4. Repository-д автоматаар **CNAME** файл үүсгэгдэнэ

#### Б) Домайн бүртгүүлсэн газар (registrar) дээр DNS бичлэг тохируулах

regapro.com-ээ авсан газар (жнь: GoDaddy, Namecheap, Mongolnames гэх мэт) дээр DNS-д дараах бичлэгүүдийг нэмнэ:

**Apex домайн (regapro.com) — A бичлэгүүд:**

| Type | Host | Value           |
|------|------|-----------------|
| A    | @    | 185.199.108.153 |
| A    | @    | 185.199.109.153 |
| A    | @    | 185.199.110.153 |
| A    | @    | 185.199.111.153 |

**www subdomain — CNAME:**

| Type  | Host | Value                  |
|-------|------|------------------------|
| CNAME | www  | USERNAME.github.io     |

(USERNAME — таны GitHub хэрэглэгчийн нэр)

DNS тархах нь 10 минутаас 24 цагийн хооронд хугацаа авна. Дараа нь https://regapro.com хаягаар сайт ажиллана.

## Холбоо барих формын тухай

`contact.html` дахь форм нь GitHub Pages дээр **backend** ажиллуулдаггүй учир дараах байдлаар ажиллана:

- Хэрэглэгч маягт бөглөж submit дарвал, тухайн хэрэглэгчийн **mailto:** клиент (Gmail, Outlook гэх мэт) автоматаар нээгдэж info@regapro.com руу зурвас илгээх бэлэн болно

### Жинхэнэ форм болгоё гэвэл (нэмэлт):

Энд үнэгүй сонголтууд бий:

1. **Formspree** (https://formspree.io) — `<form action="https://formspree.io/f/XXXXX" method="POST">` болгож өөрчлөнө
2. **Web3Forms** (https://web3forms.com) — мөн адилхан POST URL ашиглана
3. **Netlify Forms** — хэрэв Netlify дээр host хийсэн бол `<form netlify>` атрибут нэмнэ

Үүний тулд `script.js` дахь `mailto:` хэсгийг хасч, formspree URL-аар submit хийдэг болгоно.

## Hero зураг (Slideshow)

Нүүр хуудасны Hero хэсэгт **5 зурагтай автомат slideshow** ажиллаж байна:

- `images/zurag1.png` — `images/zurag5.png` (бүгд 1536×1024)
- **3 секунд** тутамд автомат солигдоно (fade transition)
- Доод талд **цэгтэй индикатор** — дарж шууд тухайн зурагт очно

GitHub дээр upload хийхэд `images/` хавтсыг бүхэлд нь оруулахад л хангалттай.

## Зураг ба видео

- Hero хэсэгт `images/zurag1.png` – `zurag5.png` slideshow автомат ажиллана
- Галерейд (services.html, нүүр) мөн адил зурагнууд харагдана
- **Галерейн зурагнууд** одоогоор Unsplash-ийн жишээ зурагнуудыг ашиглаж байна. Та өөрийн хээрийн зурагнуудаар сольж болно. (Дараах хэсгийг үзнэ үү.)
- about.html дахь танилцуулга видео одоогоор YouTube жишээ URL дээр заагдсан байгаа. Та өөрийн видеогоо YouTube-д байршуулаад embed URL-ыг солино:
  ```html
  data-src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1"
  ```

## Галерейн зурагнуудыг өөрийн зургаар солих

### А) GitHub дээр шууд upload хийх (хялбар)

1. Repository-доо `images/` нэртэй шинэ хавтас үүсгэнэ (Add file → Create new file → нэрэндээ `images/.gitkeep` гэж бичээд хадгална)
2. Тэр хавтасруу өөрийн хээрийн зурагнуудыг (drilling-1.jpg, core-sample.jpg гэх мэт) drag-and-drop хийж upload хийнэ
3. `index.html` болон `services.html` файл дотор `<img class="gallery-image" src="...">` мөрнүүдийг хайж олоод **src** утгыг өөрийн зургийн файл руу заана:
   ```html
   <!-- Хуучин -->
   src="https://images.unsplash.com/photo-1605557202138-cdcccea34cdf?w=1200&q=80"
   <!-- Шинэ -->
   src="images/drilling-1.jpg"
   ```

### Б) Зургийн зөвлөмж

- Хэмжээ: 1200×800 пиксель орчим (wide зураг), 800×600 (энгийн)
- Формат: **JPG** (хэмжээ бага), эсвэл **WebP** (өндөр чанар, бага хэмжээ)
- Файлын хэмжээ: 200 KB-аас доош (хурдан ачаалахын тулд)
- Зургийн агуулга жишээ:
  - Өрөмдлөгийн машин, талбайн ажил
  - Чулуулгийн дээж, кернийн хайрцаг
  - Геологич таблеттай ажиллаж байгаа зураг (Survey123 формтой)
  - Ил уурхайн талбай
  - Лабораторид дээж шинжилж байгаа
  - Багийн ажиллагаа
  - Тоног төхөөрөмж, GPS багаж

### В) Зургийн title, тайлбар солих

`<div class="gallery-overlay">` хэсэгт:
- `<span class="gallery-tag">Өрөмдлөг</span>` — категори
- `<h3 class="gallery-title">...</h3>` — гарчиг
- `<p class="gallery-desc">...</p>` — товч тайлбар

Эдгээрийг өөрийн зургуудад тохируулан өөрчилнө.

## Нэмэлт өөрчлөлт хийх

### Өнгө солих

`style.css`-ийн **:root** хэсгийн CSS variables-ийг өөрчлөнө:

```css
--accent-primary: #f59e0b;     /* Үндсэн тодруулга */
--accent-secondary: #fbbf24;   /* Туслах тодруулга */
--bg-primary: #0a0e14;         /* Дэвсгэр */
```

### Logo солих

Бүх HTML файлын `<span class="logo-mark">R</span>` хэсэгт өөрийн SVG лого тавьж болно.

### Холбоо барих мэдээлэл солих

`info@regapro.com`, `+976 7000-0000` гэх мэт текстүүдийг бүх файлд хайж олоод өөрсдийн мэдээллээр солино.

## Лиценз

Энэ код нь танай төсөлд зориулсан тул чөлөөтэй ашиглах эрхтэй.

---

**RegaPro** — 2026
