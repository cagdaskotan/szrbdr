# SEZER BADUR — Lavuk Era

Tamamen statik, GitHub Pages uyumlu, parodi/fan yapımı bir microsite.

## Yerelde çalıştırma

PowerShell'de proje klasöründe (Node.js kuruluysa):

```powershell
npx --yes http-server -p 4173 -c-1 .
```

Sonra `http://localhost:4173` adresini aç.

## Görselleri değiştirme

`assets/` klasöründeki SVG placeholder dosyalarını aynı dosya adlarıyla JPG, PNG, WEBP veya AVIF görsellerle değiştirebilirsin. Uzantıyı değiştirirsen `index.html` içindeki ilgili `src` değerini de güncelle.

Önerilen ölçüler:

- `prime-yeat`: 1600×1000 (yatay)
- `gojo`: 1200×1500 (dikey)
- `nana-main`: 1200×1500 (dikey)
- `nana-detail`: 1000×1000
- `gallery-01..04`: en az 1400 px uzun kenar

Görselleri yayımlamadan önce kullanım haklarının sende olduğundan emin ol.

## GitHub Pages ile yayınlama

1. GitHub'da boş bir repo aç ve bu klasörün içeriğini `main` branch'ine gönder.
2. Repo → **Settings → Pages** bölümünde **Source: GitHub Actions** seç.
3. Dahili workflow her `main` push'unda siteyi yayınlar.
4. Özel domain için Pages ekranındaki **Custom domain** alanını kullan; ardından domain sağlayıcında DNS kayıtlarını ayarla.

Özel domain kesinleşince istersen repo köküne `CNAME` dosyası ekleyebilirsin; GitHub Actions akışında asıl ayar yine Pages ekranındaki Custom domain alanıdır.

## İçerik notu

Sitedeki evren, istatistik ve ilişkiler mizahi/parodi içeriktir; doğrulanabilir tek biyografik bilgi olarak yalnızca kullanıcının verdiği doğum tarihi kullanılmıştır.
