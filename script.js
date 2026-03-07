/* ===================================================
   好動徒手運動工作室 - JavaScript
   功能：頁面切換、導覽列、滾動動畫
   =================================================== */

// ----- 頁面切換 -----
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(pageId)) {
      link.classList.add('active');
    }
  });
  closeMenu();
  setTimeout(() => initReveal(), 100);
}

// ----- 平滑滾動到區塊 -----
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// ----- 漢堡選單 -----
function toggleMenu() {
  const menu = document.getElementById('navMenu');
  const hamburger = document.getElementById('hamburger');
  menu.classList.toggle('open');
  hamburger.classList.toggle('open');
}

function closeMenu() {
  document.getElementById('navMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

document.addEventListener('click', function(e) {
  const nav = document.querySelector('.nav-container');
  if (!nav.contains(e.target)) closeMenu();
});

// ----- Navbar 滾動效果 -----
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ----- Scroll Reveal 動畫 -----
function initReveal() {
  const els = document.querySelectorAll('.page.active .section-header, .page.active .service-card, .page.active .review-card, .page.active .news-card, .page.active .health-card, .page.active .pricing-card, .page.active .stat-item, .page.active .contact-item, .page.active .about-grid > *, .page.active .review-card-full, .page.active .health-featured, .page.active .reviews-summary');
  els.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });
  checkReveal();
}

function checkReveal() {
  const reveals = document.querySelectorAll('.page.active .reveal');
  reveals.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      setTimeout(() => el.classList.add('visible'), i * 60);
    }
  });
}

window.addEventListener('scroll', checkReveal, { passive: true });

// ----- 頁面 Logo 點擊回首頁 -----
document.querySelector('.nav-logo').addEventListener('click', function(e) {
  e.preventDefault();
  showPage('home');
});

// ===================================================
//  動態載入後台內容（從 GitHub 讀取 Markdown 檔案）
// ===================================================

const GITHUB_USER = 'yunwang1121';
const GITHUB_REPO = 'haodong-fitness';
const GITHUB_BRANCH = 'main';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

function parseFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      data[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  data._body = normalized.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  return data;
}

async function fetchGithubFolder(folder) {
  try {
    const timestamp = Date.now();
    const res = await fetch(`${GITHUB_API}/${folder}?ref=${GITHUB_BRANCH}&_t=${timestamp}`);
    if (!res.ok) return [];
    const files = await res.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.json'));
    const contents = await Promise.all(
      mdFiles.map(f => {
        const rawUrl = `${BASE_URL}/${folder}/${f.name}?_t=${timestamp}`;
        return fetch(rawUrl, { cache: 'no-store' }).then(r => r.text());
      })
    );
    return contents.map(parseFrontmatter).filter(d => d.name || d.title);
  } catch (e) {
    console.error('fetchGithubFolder error:', e);
    return [];
  }
}

// 載入最新消息
async function loadNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const items = await fetchGithubFolder('_data/news');
  if (!items.length) {
    grid.innerHTML = '<p style="text-align:center;color:#888;">暫無消息</p>';
    return;
  }
  items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  grid.innerHTML = items.map(item => {
    const date = item.date ? item.date.substring(0, 10).replace(/-/g, ' / ') : '';
    const category = item.category || '';
    const body = item._body || item.description || '';
    return `
      <article class="news-card">
        <div class="news-date">${date}</div>
        <div class="news-tag">${category}</div>
        <h3>${item.title}</h3>
        <p>${body.substring(0, 80)}${body.length > 80 ? '...' : ''}</p>
        <a href="#" class="news-more">閱讀更多 →</a>
      </article>`;
  }).join('');
  setTimeout(() => initReveal(), 100);
}

// 載入學員評價
async function loadReviews() {
  const grid = document.getElementById('reviews-grid');
  const homeGrid = document.getElementById('home-reviews-grid');
  if (!grid && !homeGrid) return;
  const items = await fetchGithubFolder('_data/reviews');
  if (!items.length) {
    if (grid) grid.innerHTML = '<p style="text-align:center;color:#888;">暫無評價</p>';
    if (homeGrid) homeGrid.innerHTML = '<p style="text-align:center;color:#888;">暫無評價</p>';
    return;
  }

  if (grid) {
    grid.innerHTML = items.map(item => {
      const stars = '★'.repeat(parseInt(item.rating) || 5);
      const avatar = item.name ? item.name.charAt(0) : '學';
      const type = item.type || '';
      const body = item._body || item.review || item.body || '';
      return `
        <div class="review-card-full">
          <div class="review-stars">${stars}</div>
          <p class="review-text">「${body}」</p>
          <div class="review-author">
            <div class="author-avatar">${avatar}</div>
            <div>
              <strong>${item.name}</strong>
              <span>${type}</span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  if (homeGrid) {
    homeGrid.innerHTML = items.slice(0, 3).map(item => {
      const stars = '★'.repeat(parseInt(item.rating) || 5);
      const avatar = item.name ? item.name.charAt(0) : '學';
      const type = item.type || '';
      const body = item._body || item.review || item.body || '';
      return `
        <div class="review-card">
          <div class="review-stars">${stars}</div>
          <p class="review-text">「${body.substring(0, 60)}${body.length > 60 ? '...' : ''}」</p>
          <div class="review-author">
            <div class="author-avatar">${avatar}</div>
            <div>
              <strong>${item.name}</strong>
              <span>${type}</span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  setTimeout(() => initReveal(), 100);
}

// 載入收費標準
async function loadPricing() {
  const grid = document.getElementById('pricing-grid');
  if (!grid) return;
  const items = await fetchGithubFolder('_data/pricing');
  if (!items.length) return;
  items.sort((a, b) => parseInt(a.order || 99) - parseInt(b.order || 99));
  grid.innerHTML = items.map(item => {
    const body = item._body || item.description || '';
    return `
      <div class="pricing-card">
        <div class="pricing-badge">${item.title}</div>
        <div class="pricing-price">${item.price}</div>
        <p>${body}</p>
        <a href="https://line.me/R/ti/p/@230omexn" target="_blank" class="btn-outline-dark">立即報名</a>
      </div>`;
  }).join('');
  setTimeout(() => initReveal(), 100);
}

// 載入健康專欄
async function loadHealth() {
  const featured = document.getElementById('health-featured');
  const grid = document.getElementById('health-grid');
  if (!featured || !grid) return;

  const items = await fetchGithubFolder('_data/health');
  if (!items.length) {
    featured.innerHTML = '<p style="color:#aaa;text-align:center;padding:2rem;">尚無文章</p>';
    return;
  }

  items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const top = items[0];
  const topImg = top.image
    ? `<img src="${BASE_URL}${top.image}" alt="${top.title}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
    : `<div class="img-placeholder tall"><span>精選文章封面</span></div>`;
  const topBody = top._body || top.description || '';
  featured.innerHTML = `
    <div class="health-featured-img">${topImg}</div>
    <div class="health-featured-text">
      <div class="news-tag">精選</div>
      <h2>${top.title}</h2>
      <p>${topBody.substring(0, 120)}${topBody.length > 120 ? '...' : ''}</p>
      <a href="#" class="btn-primary" style="display:inline-block;margin-top:1rem;">閱讀全文</a>
    </div>`;

  const rest = items.slice(1);
  if (!rest.length) {
    grid.innerHTML = '';
    setTimeout(() => initReveal(), 100);
    return;
  }
  grid.innerHTML = rest.map(item => {
    const body = item._body || item.description || '';
    const category = item.category || '專欄';
    const img = item.image
      ? `<img src="${BASE_URL}${item.image}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;">`
      : `<div class="img-placeholder small"><span>圖片</span></div>`;
    return `
      <article class="health-card">
        <div class="health-card-img">${img}</div>
        <div class="health-card-body">
          <div class="news-tag">${category}</div>
          <h3>${item.title}</h3>
          <p>${body.substring(0, 80)}${body.length > 80 ? '...' : ''}</p>
          <a href="#" class="news-more">閱讀更多 →</a>
        </div>
      </article>`;
  }).join('');

  setTimeout(() => initReveal(), 100);
}

// ----- 初始化 -----
document.addEventListener('DOMContentLoaded', function() {
  showPage('home');
  loadNews();
  loadReviews();
  loadPricing();
  loadHealth();

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
    });
  });

  document.querySelectorAll('a[onclick*="scrollToSection"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
    });
  });
});
