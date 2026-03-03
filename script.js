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

// ----- 初始化 -----
document.addEventListener('DOMContentLoaded', function() {
  // 預設顯示首頁
  showPage('home');

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
