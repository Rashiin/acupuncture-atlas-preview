// تنظیمات سایت از site.json خوانده می‌شود تا نشانی اطلس، قیمت‌ها، راه‌های تماس و اطلاعیه‌ها
// بدون دست زدن به HTML عوض شوند. بدون این فایل هم صفحه با مقدارهای پیش‌فرض کار می‌کند.

const CHANNELS = {
  phone: { title: 'تلفن', href: (v) => 'tel:' + v.replace(/[^\d+]/g, ''), icon: 'phone' },
  email: { title: 'ایمیل', href: (v) => 'mailto:' + v, icon: 'message' },
  bale: { title: 'بله', href: (v) => 'https://ble.ir/' + v.replace(/^@/, ''), icon: 'message' },
  eitaa: { title: 'ایتا', href: (v) => 'https://eitaa.com/' + v.replace(/^@/, ''), icon: 'message' },
  telegram: { title: 'تلگرام', href: (v) => 'https://t.me/' + v.replace(/^@/, ''), icon: 'message' },
  whatsapp: { title: 'واتس‌اپ', href: (v) => 'https://wa.me/' + v.replace(/\D/g, ''), icon: 'message' },
  address: { title: 'نشانی', href: null, icon: 'info' },
};

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...children.filter((c) => c != null));
  return e;
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'i');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#i-' + name);
  svg.append(use);
  return svg;
}

const faDate = (iso) => new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(iso));

function apply(cfg) {
  const app = cfg.appUrl || 'app/';
  for (const a of document.querySelectorAll('[data-app]')) a.href = app + a.dataset.app;

  for (const plan of cfg.plans ?? []) {
    const card = document.querySelector(`[data-plan="${plan.id}"]`);
    if (card && plan.price) card.querySelector('[data-price]').textContent = plan.price;
  }
  // تا درگاه پرداخت وصل نشده، دکمهٔ خرید به راه‌های تماس می‌رود.
  if (cfg.purchaseUrl) {
    for (const b of document.querySelectorAll('[data-buy]')) {
      b.href = cfg.purchaseUrl.replace('{plan}', b.dataset.buy);
      b.textContent = 'خرید اشتراک';
    }
  }

  const contact = document.querySelector('[data-contact]');
  for (const [key, value] of Object.entries(cfg.contact ?? {})) {
    const ch = CHANNELS[key];
    if (!ch || !value) continue;
    const body = el('span', {}, el('b', {}, ch.title), el('small', { class: key === 'address' ? '' : 'ltr' }, value));
    const card = ch.href
      ? el('a', { class: 'contact-card', href: ch.href(value), rel: 'noopener' }, icon(ch.icon), body)
      : el('div', { class: 'contact-card' }, icon(ch.icon), body);
    contact.append(card);
  }
  if (cfg.contact?.hours) contact.after(el('p', { class: 'note' }, 'ساعت پاسخ‌گویی: ' + cfg.contact.hours));

  const news = (cfg.announcements ?? []).filter((n) => n.title);
  if (news.length) {
    const box = document.querySelector('[data-news]');
    for (const n of news) {
      box.append(el('article', {}, n.date ? el('time', { datetime: n.date }, faDate(n.date)) : null, el('h3', {}, n.title), n.text ? el('p', {}, n.text) : null));
    }
    document.getElementById('news').hidden = false;
  }
}

fetch('./site.json', { cache: 'no-cache' })
  .then((r) => (r.ok ? r.json() : {}))
  .catch(() => ({}))
  .then(apply);

document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try {
    localStorage.setItem('atlas.theme', root.dataset.theme);
  } catch {
    /* */
  }
});

// فهرست موبایل پس از انتخاب یک پیوند بسته می‌شود.
for (const a of document.querySelectorAll('.menu-panel a')) {
  a.addEventListener('click', () => a.closest('details')?.removeAttribute('open'));
}
