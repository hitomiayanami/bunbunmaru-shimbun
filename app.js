let currentIssue = null;
let activePageIdx = 0;

const paperContent = document.getElementById('paper-content');
const desktopTabs = document.getElementById('desktop-tabs');
const mobileTabs = document.getElementById('mobile-tabs');
const issueSelect = document.getElementById('issue-select');
const notifyBtn = document.getElementById('notify-btn');

async function init() {
  registerSW();
  setupNotifyButton();

  try {
    let idxData;
    try {
      const idxRes = await fetch('./issues/index.json');
      idxData = await idxRes.json();
    } catch (_) {
      if (window.__FALLBACK_INDEX__) {
        idxData = window.__FALLBACK_INDEX__;
      } else {
        throw new Error('无法读取期数索引');
      }
    }

    issueSelect.innerHTML = idxData.issues
      .map((iss) => `<option value="${iss.date}">${iss.label}</option>`)
      .join('');

    issueSelect.addEventListener('change', (e) => loadIssue(e.target.value));
    await loadIssue(idxData.latest);
  } catch (err) {
    paperContent.innerHTML = `<p>加载期数索引失败：${err.message}</p>`;
  }
}

async function loadIssue(dateStr) {
  try {
    let issueData;
    try {
      const res = await fetch(`./issues/${dateStr}.json`);
      issueData = await res.json();
    } catch (_) {
      if (window.__FALLBACK_ISSUES__ && window.__FALLBACK_ISSUES__[dateStr]) {
        issueData = window.__FALLBACK_ISSUES__[dateStr];
      } else {
        throw new Error(`无法读取 ${dateStr}`);
      }
    }
    currentIssue = issueData;
    activePageIdx = 0;
    renderTabs();
    renderActivePage();
  } catch (err) {
    paperContent.innerHTML = `<p>加载 ${dateStr} 报纸失败：${err.message}</p>`;
  }
}

function renderTabs() {
  if (!currentIssue) return;
  const makeButtons = (useFull) =>
    currentIssue.pages
      .map(
        (p, idx) =>
          `<button class="tab-btn ${idx === activePageIdx ? 'active' : ''}" data-idx="${idx}">${
            useFull ? p.fullLabel : p.tabLabel
          }</button>`
      )
      .join('');

  desktopTabs.innerHTML = makeButtons(true);
  mobileTabs.innerHTML = makeButtons(false);

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activePageIdx = Number(btn.dataset.idx);
      renderTabs();
      renderActivePage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function renderSection(sec) {
  const itemsHtml = sec.items
    .map((item) => {
      const srcLink =
        item.sourceName && item.sourceURL
          ? `<a class="source-link" href="${item.sourceURL}" target="_blank" rel="noopener">[${item.sourceName}]</a>`
          : item.sourceName
          ? `<span class="source-link">[${item.sourceName}]</span>`
          : '';
      return `
        <div class="news-item">
          <h3 class="news-item-title">▪ ${item.title}</h3>
          <p class="news-item-body">${item.body}${srcLink}</p>
        </div>
      `;
    })
    .join('');

  return `
    <section>
      <div class="section-bar ${sec.theme}">${sec.title}</div>
      <div class="news-grid ${sec.layout}">${itemsHtml}</div>
    </section>
  `;
}

function renderActivePage() {
  if (!currentIssue) return;
  const page = currentIssue.pages[activePageIdx];
  let html = '';

  if (activePageIdx === 0) {
    const summaryHtml = currentIssue.summaryRows
      .map(
        (r) =>
          `<div class="summary-label">${r.label}</div><div class="summary-value">${r.value}</div>`
      )
      .join('');

    const weatherHtml = currentIssue.weatherCities
      .map(
        (c) => `
        <a class="weather-card" href="${c.url}" target="_blank" rel="noopener">
          <div class="weather-top">
            <span class="weather-city">${c.name}</span>
            <span class="weather-temp">${c.iconTemp}</span>
          </div>
          <div class="weather-meta">${c.meta}</div>
          <div class="weather-advice">${c.advice}</div>
        </a>
      `
      )
      .join('');

    const spSources = currentIssue.specialReport.sources
      .map(
        (s) =>
          `<a class="source-link" href="${s.url}" target="_blank" rel="noopener">[${s.name}]</a>`
      )
      .join(' ');

    html += `
      <div class="masthead-wrap">
        <div class="masthead-left">
          <h1 class="edition-date">${currentIssue.editionTitle} 第一面</h1>
          <div class="summary-grid">${summaryHtml}</div>
        </div>
        <div class="masthead-box" aria-hidden="true">
          <div class="masthead-inner">
            <div class="masthead-chars">文々。新聞</div>
            <div class="masthead-seal">文々</div>
          </div>
        </div>
      </div>

      <section>
        <div class="section-bar navy">${currentIssue.weatherSectionTitle}</div>
        <div class="weather-grid">${weatherHtml}</div>
      </section>

      <section>
        <div class="section-bar crimson">${currentIssue.specialReport.title}</div>
        <p class="special-body">${currentIssue.specialReport.body} ${spSources}</p>
      </section>
    `;
  } else {
    html += `<h1 class="edition-date">${currentIssue.editionTitle} ${page.tabLabel}</h1>`;
  }

  html += page.sections.map(renderSection).join('');

  if (page.xiaoyan) {
    html += `
      <aside class="xiaoyan-box">
        <h2 class="xiaoyan-title">${page.xiaoyan.title}</h2>
        <p class="xiaoyan-body">${page.xiaoyan.body}</p>
      </aside>
    `;
  }

  html += `
    <footer class="paper-footer">
      <span>文々。新聞｜${currentIssue.editionTitle}｜US EPA AQI 标准</span>
      <span>第 ${activePageIdx + 1} / ${currentIssue.pages.length} 版</span>
    </footer>
  `;

  paperContent.innerHTML = html;
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function setupNotifyButton() {
  if (!('Notification' in window)) {
    notifyBtn.textContent = '🔕 不支持通知';
    notifyBtn.disabled = true;
    return;
  }
  const updateState = () => {
    if (Notification.permission === 'granted') {
      notifyBtn.textContent = '🔔 通知已开启';
      notifyBtn.classList.add('enabled');
    } else if (Notification.permission === 'denied') {
      notifyBtn.textContent = '🔕 通知被禁用';
    } else {
      notifyBtn.textContent = '🔔 开启出报通知';
    }
  };
  updateState();

  notifyBtn.addEventListener('click', async () => {
    const perm = await Notification.requestPermission();
    updateState();
    if (perm === 'granted') {
      new Notification('文々。新聞｜通知测试成功', {
        body: '后续接入云端 Push 服务后，每日出报将自动推送到此设备。',
        icon: './icons/icon.svg'
      });
    }
  });
}

init();
