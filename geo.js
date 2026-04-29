// Browser-side IP geolocation for displaying each player's country flag.
// Caches the country code in localStorage for 24h to avoid repeated API hits.
// Two free fallbacks (ipwho.is, country.is) plus navigator.language as last resort.
(function () {
  const STORAGE_KEY = "trivia_country";
  const TTL_MS = 24 * 60 * 60 * 1000;

  const AR_NAMES = {
    SA: "السعودية", AE: "الإمارات", EG: "مصر", JO: "الأردن",
    LB: "لبنان", SY: "سوريا", IQ: "العراق", KW: "الكويت",
    QA: "قطر", BH: "البحرين", OM: "عُمان", YE: "اليمن",
    PS: "فلسطين", MA: "المغرب", DZ: "الجزائر", TN: "تونس",
    LY: "ليبيا", SD: "السودان", MR: "موريتانيا", SO: "الصومال",
    DJ: "جيبوتي", KM: "جزر القمر",
    US: "الولايات المتحدة", GB: "المملكة المتحدة", FR: "فرنسا",
    DE: "ألمانيا", TR: "تركيا", CA: "كندا", AU: "أستراليا",
    IN: "الهند", PK: "باكستان", BD: "بنغلاديش", ID: "إندونيسيا",
    MY: "ماليزيا", CN: "الصين", JP: "اليابان", KR: "كوريا الجنوبية",
    BR: "البرازيل", RU: "روسيا", ES: "إسبانيا", IT: "إيطاليا",
    NL: "هولندا", BE: "بلجيكا", SE: "السويد", NO: "النرويج",
    AT: "النمسا", CH: "سويسرا", PL: "بولندا", PT: "البرتغال",
    GR: "اليونان", IL: "إسرائيل", IR: "إيران", AF: "أفغانستان",
    NG: "نيجيريا", KE: "كينيا", ZA: "جنوب إفريقيا", ET: "إثيوبيا",
    MX: "المكسيك", AR: "الأرجنتين", CL: "تشيلي",
  };

  function codeToFlag(code) {
    if (!code || code.length !== 2) return "";
    return String.fromCodePoint(
      ...code.toUpperCase().split("").map((c) => c.charCodeAt(0) + 127397)
    );
  }

  function arabicName(code) {
    return AR_NAMES[code] || code;
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const { country, ts } = JSON.parse(raw);
      if (!country || Date.now() - ts > TTL_MS) return null;
      return country;
    } catch { return null; }
  }

  function writeCache(country) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ country, ts: Date.now() }));
    } catch {}
  }

  async function fetchFromIpwhois() {
    const res = await fetch("https://ipwho.is/", { cache: "no-cache" });
    if (!res.ok) throw new Error("ipwho HTTP " + res.status);
    const data = await res.json();
    if (data?.success && data?.country_code) return data.country_code.toUpperCase();
    throw new Error("ipwho no country_code");
  }

  async function fetchFromCountryIs() {
    const res = await fetch("https://api.country.is/", { cache: "no-cache" });
    if (!res.ok) throw new Error("country.is HTTP " + res.status);
    const data = await res.json();
    if (data?.country) return data.country.toUpperCase();
    throw new Error("country.is no country");
  }

  function fallbackFromLocale() {
    const lang = navigator.language || "";
    const m = lang.match(/^[a-z]{2,3}-([A-Z]{2})$/);
    return m ? m[1] : null;
  }

  window.detectCountry = async function detectCountry() {
    const cached = readCache();
    if (cached) {
      return { code: cached, flag: codeToFlag(cached), name: arabicName(cached) };
    }

    let code = null;
    try { code = await fetchFromIpwhois(); }
    catch (e) {
      try { code = await fetchFromCountryIs(); }
      catch (e2) {
        code = fallbackFromLocale();
      }
    }

    if (!code) return null;
    writeCache(code);
    return { code, flag: codeToFlag(code), name: arabicName(code) };
  };

  window.codeToFlag = codeToFlag;
  window.arabicCountryName = arabicName;
})();
