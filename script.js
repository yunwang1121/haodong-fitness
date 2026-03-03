/* ===================================================
   好動徒手運動工作室 - JavaScript
   功能：頁面切換、導覽列、滾動動畫
   =================================================== */

// ----- 頁面切換 -----
function showPage(pageId) {
  // 隱藏所有頁面
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // 顯示目標頁面
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 更新導覽列 active 狀態
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(pageId)) {
      link.classList.add('active');
    }
  });

  // 關閉手機選單
  closeMenu();

  // 初始化 reveal 動畫
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

// 點擊選單以外區域關閉
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
      // 加入延遲使卡片依序出現
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

// 解析 Markdown frontmatter（--- key: value --- 格式）
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      data[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  // 取得 frontmatter 之後的 body 內容
  data._body = text.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  return data;
}

// 從 GitHub 讀取資料夾下所有檔案
async function fetchGithubFolder(folder) {
  try {
    const res = await fetch(`${GITHUB_API}/${folder}?ref=${GITHUB_BRANCH}`);
    if (!res.ok) return [];
    const files = await res.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.json'));
    const contents = await Promise.all(
      mdFiles.map(f => fetch(f.download_url).then(r => r.text()))
    );
    return contents.map(parseFrontmatter).filter(d => d.title);
  } catch (e) {
    return [];
  }
}

// 載入最新消息
async function loadNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const items = await fetchGithubFolder('_data/news');
  if (!items.length) return; // 沒資料就保留靜態內容
  // 依日期排序（新到舊）
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
  if (!grid) return;
  const items = await fetchGithubFolder('_data/reviews');
  if (!items.length) return;
  grid.innerHTML = items.map(item => {
    const stars = '★'.repeat(parseInt(item.rating) || 5);
    const avatar = item.name ? item.name.charAt(0) : '學';
    const type = item.type || '';
    const body = item._body || item.body || '';
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
  setTimeout(() => initReveal(), 100);
}

// 載入收費標準
async function loadPricing() {
  const grid = document.getElementById('pricing-grid');
  if (!grid) return;
  const items = await fetchGithubFolder('_data/pricing');
  if (!items.length) return;
  // 依 order 排序
  items.sort((a, b) => parseInt(a.order || 99) - parseInt(b.order || 99));
  grid.innerHTML = items.map(item => {
    const body = item._body || item.description || '';
    return `
      <div class="pricing-card">
        <div class="pricing-badge">${item.title}</div>
        <div class="pricing-price">${item.price}</div>
        <p>${body}</p>
        <a href="https://line.me/R/ti/p/@PLACEHOLDER" target="_blank" class="btn-outline-dark">立即報名</a>
      </div>`;
  }).join('');
  setTimeout(() => initReveal(), 100);
}

// ----- 初始化 -----
document.addEventListener('DOMContentLoaded', function() {
  // 預設顯示首頁
  showPage('home');

  // 載入後台動態內容
  loadNews();
  loadReviews();
  loadPricing();

  // 阻止 nav-link 的預設連結行為
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
    });
  });

  // 阻止 btn-outline scroll 的預設行為
  document.querySelectorAll('a[onclick*="scrollToSection"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
    });
  });
});
