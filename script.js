/* ========= Year ========= */
(function(){
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ========= WhatsApp helpers ========= */
(function(){
  const WA_NUMBER = '972545576117';
  const WA_BASE = `https://wa.me/${WA_NUMBER}?text=`;
  document.querySelectorAll('.ask-wa').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const msg = el.getAttribute('data-msg') || 'שלום, אשמח לקבל פרטים.';
      window.open(WA_BASE + encodeURIComponent(msg), '_blank', 'noopener');
    });
  });
})();

/* ========= Testimonials Carousel ========= */
(function(){
  const testimonials = [
    { name: "שירלי ל.", stars: 5, text: "עינבל מקצועית ברמות! העור נראה זוהר כבר מהטיפול הראשון." },
    { name: "הילה מ.", stars: 5, text: "הטיפול ב-Venus Versa שדרג לי את המרקם משמעותית. מומלץ!" },
    { name: "דנה ק.", stars: 4, text: "אבחון מעמיק, יחס אישי וחם. חוזרת שוב." },
    { name: "מורן ס.", stars: 5, text: "חווית שירות מדהימה ותוצאות מצוינות. תודה עינבל!" }
  ];
  const tText = document.getElementById('tText');
  const tName = document.getElementById('tName');
  const tStars = document.getElementById('tStars');
  const dotsWrap = document.getElementById('tDots');
  const prev = document.querySelector('.t-btn.prev');
  const next = document.querySelector('.t-btn.next');
  if (!tText || !tName || !tStars || !dotsWrap || !prev || !next) return;

  let tIndex = 0;

  function renderTestimonial(idx){
    const t = testimonials[idx];
    tText.textContent = `“${t.text}”`;
    tName.textContent = t.name;
    tStars.textContent = "★".repeat(t.stars) + "☆".repeat(5 - t.stars);
    [...dotsWrap.children].forEach((d,i)=>d.classList.toggle('active', i === idx));
  }

  function buildDots(){
    dotsWrap.innerHTML = '';
    testimonials.forEach((_, i)=>{
      const dot = document.createElement('button');
      dot.className = 't-dot';
      dot.setAttribute('aria-label', `חוות דעת ${i+1}`);
      dot.addEventListener('click', ()=>{ tIndex = i; renderTestimonial(tIndex); resetAuto(); });
      dotsWrap.appendChild(dot);
    });
  }

  buildDots();
  renderTestimonial(tIndex);

  prev.addEventListener('click', ()=>{
    tIndex = (tIndex - 1 + testimonials.length) % testimonials.length;
    renderTestimonial(tIndex); resetAuto();
  });
  next.addEventListener('click', ()=>{
    tIndex = (tIndex + 1) % testimonials.length;
    renderTestimonial(tIndex); resetAuto();
  });

  let auto = setInterval(()=> {
    tIndex = (tIndex + 1) % testimonials.length;
    renderTestimonial(tIndex);
  }, 5000);

  function resetAuto(){
    clearInterval(auto);
    auto = setInterval(()=> {
      tIndex = (tIndex + 1) % testimonials.length;
      renderTestimonial(tIndex);
    }, 5000);
  }
})();

/* ========= Instagram Video Library =========
   תומך בשני מצבים:
   1) עוגנים לפי קטגוריות: <div class="il-insta-mount" data-urls="url1, url2, url3"></div>
   2) פלייסהולדר אוטומטי: אלמנט עם id="instagram-grid"
   ברירת מחדל: שלושת הקישורים שסיפקת.
*/
(function(){
  const DEFAULT_REELS = [
    "https://www.instagram.com/reel/DIhFb_LIWDs/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "https://www.instagram.com/reel/DCYusxIAgGW/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "https://www.instagram.com/reel/C3LU7qKoLXI/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  ];

  // טען סקריפט ההטמעה אם לא נטען
  function ensureInstagramScript(){
    if (document.querySelector('script[src*="instagram.com/embed.js"]')) return;
    const s = document.createElement('script');
    s.src = 'https://www.instagram.com/embed.js';
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }

  function processEmbeds(){
    if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
      window.instgrm.Embeds.process();
    }
  }

  function buildCard(url, index, clsPrefix){
    const card = document.createElement('article');
    card.className = `${clsPrefix}-card`;

    const thumb = document.createElement('div');
    thumb.className = `${clsPrefix}-card__thumb`;
    thumb.innerHTML = `<span>חלון #${index + 1}</span>`;

    const meta = document.createElement('div');
    meta.className = `${clsPrefix}-card__meta`;
    meta.innerHTML = `
      <span>פתחו באינסטגרם</span>
      <a class="${clsPrefix === 'il-insta' ? 'il-insta-btn' : 'insta-card__btn'}"
         href="${url}" target="_blank" rel="noopener"
         aria-label="צפייה ב-Reel ${index + 1} באינסטגרם">
        <svg class="${clsPrefix === 'il-insta' ? 'il-insta-icon' : 'icon'}" viewBox="0 0 24 24" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7"/>
          </g>
        </svg>
        לצפייה
      </a>
    `;

    const embed = document.createElement('blockquote');
    embed.className = 'instagram-media';
    embed.setAttribute('data-instgrm-permalink', url);
    embed.setAttribute('data-instgrm-version', '14');
    embed.style.margin = 0; embed.style.border = 0;

    card.appendChild(thumb);
    card.appendChild(meta);
    card.appendChild(embed);
    return card;
  }

  // מצב 1: עוגנים לכל קטגוריה
  const mounts = document.querySelectorAll('.il-insta-mount');
  if (mounts.length){
    ensureInstagramScript();
    mounts.forEach(mount => {
      const urlsAttr = (mount.getAttribute('data-urls') || '').trim();
      const urls = urlsAttr ? urlsAttr.split(',').map(s=>s.trim()).filter(Boolean) : DEFAULT_REELS.slice();

      const title = mount.getAttribute('data-insta-title') || 'ספריית וידאו';
      const subtitle = mount.getAttribute('data-insta-subtitle') || 'היילייטים מהקליניקה – לחצו לפתיחה באינסטגרם';

      const h = document.createElement('h3'); h.className = 'il-insta-title'; h.textContent = title;
      const p = document.createElement('p'); p.className = 'il-insta-subtitle'; p.textContent = subtitle;
      const grid = document.createElement('div'); grid.className = 'il-insta-grid';

      urls.forEach((u, i)=> grid.appendChild(buildCard(u, i, 'il-insta')));

      mount.appendChild(h); mount.appendChild(p); mount.appendChild(grid);
    });
    // לעבד הטמעות
    processEmbeds(); setTimeout(processEmbeds, 1000); setTimeout(processEmbeds, 2500);
    return; // אם יש עוגנים, לא נמשיך הלאה
  }

  // מצב 2: פלייסהולדר כללי עם id="instagram-grid"
  const grid = document.getElementById('instagram-grid');
  if (grid){
    ensureInstagramScript();
    DEFAULT_REELS.forEach((u,i)=> grid.appendChild(buildCard(u, i, 'insta')));
    processEmbeds(); setTimeout(processEmbeds, 1000); setTimeout(processEmbeds, 2500);
  }
})();
/* השארת ספריית אינסטגרם בלבד והסתרת ספריות "להורדה" — ADD-ONLY */
(function keepOnlyInstagramLibrary(){
  // מאתרים מקטעים שכנראה ספריות וידאו/אינסטגרם
  const libs = Array.from(document.querySelectorAll('section, div')).filter(el => {
    const sig = (el.id + ' ' + el.className).toLowerCase();
    return /video|library|insta|instagram/.test(sig);
  });
  if (!libs.length) return;

  const isInstaLib = (el) =>
    el.querySelector('blockquote.instagram-media') ||
    el.querySelector('.il-insta-mount, .il-insta-grid, .insta-grid') ||
    el.querySelector('a[href*="instagram.com/reel"]');

  const isDownloadish = (el) =>
    el.querySelector('video, source[type^="video/"], a[download], a[href$=".mp4"], a[href$=".mov"]');

  let kept = false;
  libs.forEach(el => {
    // שומרים רק את ספריית האינסטגרם הראשונה שנמצאת
    if (isInstaLib(el) && !kept) { kept = true; return; }
    // ספריות שמכילות וידאו להורדה – להסתיר
    if (isDownloadish(el) || (isInstaLib(el) && kept)) {
      el.classList.add('is-hidden');
    }
  });
})();
/* Upgrade img -> picture (auto WebP + srcset) בלי לשנות HTML */
(function autoUpgradeImages(){
  // לוגו
  const logoImg = document.getElementById('brandLogo');
  if (logoImg && !logoImg.closest('picture')) {
    const pic = document.createElement('picture');
    const srcWebp = document.createElement('source');
    srcWebp.type = 'image/webp';
    srcWebp.srcset = 'assets/logo-inbal.webp';
    logoImg.parentNode.insertBefore(pic, logoImg);
    pic.appendChild(srcWebp);
    pic.appendChild(logoImg);
  }
  // Hero
  const heroImg = document.getElementById('inbalPhoto');
  if (heroImg && !heroImg.closest('picture')) {
    const pic = document.createElement('picture');
    const s1 = document.createElement('source');
    s1.type = 'image/webp';
    s1.setAttribute('srcset',
      'assets/hero-inbal-800.webp 800w, assets/hero-inbal-1200.webp 1200w, assets/hero-inbal-1600.webp 1600w'
    );
    const s2 = document.createElement('source');
    s2.type = 'image/jpeg';
    s2.setAttribute('srcset',
      'assets/hero-inbal-800.jpg 800w, assets/hero-inbal-1200.jpg 1200w, assets/hero-inbal-1600.jpg 1600w'
    );
    heroImg.setAttribute('sizes','(max-width:560px) 100vw, (max-width:1000px) 92vw, 48vw');
    heroImg.parentNode.insertBefore(pic, heroImg);
    pic.appendChild(s1);
    pic.appendChild(s2);
    pic.appendChild(heroImg);
  }
})();
/* === Prefer Instagram Library (show) & Hide Download Libraries (ADD-ONLY) === */
(function preferInstagramLibrary(){
  // אם בסקריפט קודם הוספנו הסתרה גלובלית — מבטלים
  document.body.classList.remove('ig-embeds-hidden');

  // מאתרים מקטעים שכנראה ספריות וידאו/תמונות
  const libs = Array.from(document.querySelectorAll('section, div')).filter(el => {
    const sig = (el.id + ' ' + el.className).toLowerCase();
    return /video|library|insta|instagram|gallery/.test(sig);
  });
  if (!libs.length) return;

  const isInstaLib = (el) =>
    el.querySelector('blockquote.instagram-media') ||               // הטמעות אינסטגרם
    el.querySelector('.il-insta-mount, .il-insta-grid, .insta-grid') ||
    el.querySelector('a[href*="instagram.com/reel"]');

  const isDownloadish = (el) =>
    el.querySelector('video, source[type^="video/"], a[download], a[href$=".mp4"], a[href$=".mov"]');

  // 1) מציגים כל ספריית אינסטגרם
  libs.forEach(el => { if (isInstaLib(el)) el.classList.remove('is-hidden'); });

  // 2) מסתירים ספריות “להורדה”
  libs.forEach(el => { if (isDownloadish(el)) el.classList.add('is-hidden'); });

  // 3) דואגים שסקריפט ההטמעות של אינסטגרם נטען ומעבד את ה-embeds
  function ensureInstagramScript(){
    if (document.querySelector('script[src*="instagram.com/embed.js"]')) return;
    const s = document.createElement('script');
    s.src = 'https://www.instagram.com/embed.js';
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }
  function processEmbeds(){
    if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
      window.instgrm.Embeds.process();
    }
  }
  ensureInstagramScript();
  processEmbeds();
  setTimeout(processEmbeds, 800);
  setTimeout(processEmbeds, 2000);

  // 4) כפתורי "לצפייה" (קישורים גלויים) — במקרה שה-embed לא נטען
  const ensureViewButtons = () => {
    document.querySelectorAll('.il-insta-card, .insta-card').forEach((card, i) => {
      if (card.querySelector('.il-insta-btn, .insta-card__btn')) return; // כבר יש
      const url = (card.getAttribute('data-url') ||
                   (card.querySelector('blockquote.instagram-media')?.getAttribute('data-instgrm-permalink')) ||
                   card.querySelector('a[href*="instagram.com/reel"]')?.getAttribute('href'));
      if (!url) return;
      const meta = card.querySelector('.il-insta-card__meta, .insta-card__meta') || (() => {
        const m = document.createElement('div');
        m.className = 'il-insta-card__meta';
        card.appendChild(m);
        return m;
      })();
      const btn = document.createElement('a');
      btn.className = 'il-insta-btn';
      btn.href = url; btn.target = '_blank'; btn.rel = 'noopener';
      btn.setAttribute('aria-label', `צפייה ב-Reel ${i+1} באינסטגרם`);
      btn.innerHTML = `
        <svg class="il-insta-icon" viewBox="0 0 24 24" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7"/>
          </g>
        </svg> לצפייה
      `;
      if (!meta.textContent.trim()) meta.innerHTML = '<span>פתחו באינסטגרם</span>';
      meta.appendChild(btn);
    });
  };
  ensureViewButtons();
  setTimeout(ensureViewButtons, 1000);
})();