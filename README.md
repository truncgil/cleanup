# Cleantr - macOS Temizlik Uygulaması

Cleantr, macOS sistemlerinde geliştirici araçları tarafından oluşturulan geçici dosyaları temizlemek için tasarlanmış bir Electron uygulamasıdır.

## Proje Yapısı

Proje, modüler bir yapıda tasarlanmıştır ve her bir modül kendi sorumluluğuna sahiptir:

### `src/js/` Klasörü

```
src/js/
├── dom.js           # DOM elementleri ve başlangıç tanımlamaları
├── translations.js  # Dil ve çeviri yönetimi
├── settings.js      # Ayarlar yönetimi
├── rules.js         # Kural yönetimi
├── scanner.js       # Tarama işlemleri
├── cleaner.js       # Temizleme işlemleri
├── logger.js        # Log yönetimi
├── utils.js         # Yardımcı fonksiyonlar
├── results.js       # Sonuç yönetimi
└── renderer.js      # Ana uygulama dosyası
```

### Modüller ve Sorumlulukları

#### 1. `dom.js`
- DOM elementlerinin tanımlanması ve yönetimi
- Bootstrap modal ve template tanımlamaları
- Uygulama durumu (state) yönetimi
- Global değişkenlerin tanımlanması

#### 2. `translations.js`
- Çoklu dil desteği (Türkçe/İngilizce)
- Çeviri metinlerinin yönetimi
- Dil değiştirme fonksiyonları
- Mevcut dil durumunun takibi

#### 3. `settings.js`
- Kullanıcı ayarlarının yüklenmesi ve kaydedilmesi
- Tema (açık/koyu) yönetimi
- Dil tercihlerinin yönetimi
- Son tarama tarihinin takibi

#### 4. `rules.js`
- Temizleme kurallarının yüklenmesi
- Kural elementlerinin oluşturulması
- Kural seçimlerinin yönetimi
- Toplu kural seçimi/kaldırma işlemleri

#### 5. `scanner.js`
- Dosya sistemi tarama işlemleri
- Tarama sonuçlarının toplanması
- Tarama ilerleme durumunun takibi
- Hata yönetimi ve raporlama

#### 6. `cleaner.js`
- Dosya temizleme işlemlerinin yönetimi
- Temizleme onayı ve güvenlik kontrolleri
- İlerleme çubuğu yönetimi
- Temizleme sonuçlarının raporlanması

#### 7. `logger.js`
- Log kayıtlarının yönetimi
- Toast bildirimlerinin gösterimi
- Log temizleme işlemleri
- Zaman damgalı log kayıtları

#### 8. `utils.js`
- Yardımcı fonksiyonlar
- Boyut formatlama
- Adım göstergesi yönetimi
- Buton durumlarının güncellenmesi

#### 9. `results.js`
- Tarama sonuçlarının görüntülenmesi
- Sonuç elementlerinin oluşturulması
- Sonuç seçimlerinin yönetimi
- Toplam boyut hesaplamaları

#### 10. `renderer.js`
- Ana uygulama başlatma
- Event listener'ların tanımlanması
- Modüller arası koordinasyon
- Uygulama yaşam döngüsü yönetimi

## Modüler Yapının Avantajları

1. **Bakım Kolaylığı**: Her modül kendi sorumluluğuna sahip olduğu için kod bakımı ve güncellemesi daha kolaydır.

2. **Kod Organizasyonu**: Kod, mantıksal olarak gruplandırılmış ve organize edilmiştir.

3. **Bağımlılık Yönetimi**: Modüller arası bağımlılıklar açıkça tanımlanmıştır.

4. **Test Edilebilirlik**: Her modül bağımsız olarak test edilebilir.

5. **Kod Tekrarını Önleme**: Ortak fonksiyonlar merkezi bir yerde toplanmıştır.

6. **Geliştirme Verimliliği**: Farklı geliştiriciler farklı modüller üzerinde çalışabilir.

## Kullanım

1. Uygulamayı başlatın
2. Temizlenecek klasörleri seçin
3. Tarama işlemini başlatın
4. Sonuçları inceleyin
5. Temizleme işlemini onaylayın

## Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda başlat
npm run dev

# Uygulamayı derle
npm run build
```

## Lisans

MIT 

## Özellikler

- **Geliştirici Odaklı Temizlik:** Xcode, Android Studio, Flutter gibi popüler geliştirme araçlarının oluşturduğu geçici ve gereksiz dosyaları otomatik olarak tespit eder ve temizler.
- **Kapsamlı Kural Sistemi:** Temizlenecek klasörler ve dosya türleri kolayca seçilebilir, özelleştirilebilir.
- **Güvenli Temizlik:** Sadece güvenle silinebilecek dosyalar hedeflenir, sistem dosyalarınıza zarar gelmez.
- **Çoklu Dil Desteği:** Türkçe ve İngilizce arayüz ile geniş kullanıcı kitlesine hitap eder.
- **Koyu/Açık Tema:** Kullanıcı tercihlerine göre tema seçimi yapılabilir.
- **Detaylı Loglama:** Tüm tarama ve temizlik işlemleri detaylı şekilde loglanır, geçmiş işlemler incelenebilir.
- **Kullanıcı Dostu Arayüz:** Modern ve anlaşılır arayüz ile herkes kolayca kullanabilir.
- **Açık Kaynak:** MIT lisansı ile özgürce kullanılabilir ve geliştirilebilir.

## Kullanım Senaryoları

- Xcode projelerinde biriken DerivedData, arşivler ve simülatör dosyalarını hızlıca temizlemek.
- Android Studio ve Flutter projelerinde build, cache ve log dosyalarını silerek disk alanı kazanmak.
- Node.js projelerinde npm ve yarn önbelleklerini temizleyerek sisteminizi hafifletmek.
- macOS sisteminde zamanla biriken geçici dosyaları tek tıkla temizlemek.
- Geliştirici bilgisayarınızı düzenli ve hızlı tutmak için periyodik temizlik yapmak.

---

Daha fazla bilgi ve katkı için projeye göz atabilir, öneri ve geri bildirimlerinizi iletebilirsiniz! 