// 初期化処理
function init() {
  populateTagDropdown();
  initFilters();
  renderCards(voiceData);
}

// データ内のタグを重複なく集めてプルダウンの選択肢を作る関数
function populateTagDropdown() {
  const tagSelect = document.getElementById('select-tag');
  if (!tagSelect) return;

  const allTags = new Set();
  voiceData.forEach(item => {
    if (item.tags) {
      item.tags.forEach(t => allTags.add(t));
    }
  });

  allTags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = `#${tag}`;
    tagSelect.appendChild(option);
  });
}

function initFilters() {
  document.getElementById('search-liver').addEventListener('input', filterData);
  document.getElementById('search-tag').addEventListener('input', filterData);
  document.getElementById('filter-status').addEventListener('change', filterData);
  document.getElementById('select-tag').addEventListener('change', (e) => {
    currentSelectedTag = e.target.value;
    filterData();
  });
}

// カード内のタグをクリックした時の処理
function filterByTag(tagName) {
  currentSelectedTag = tagName;
  const tagSelect = document.getElementById('select-tag');
  if (tagSelect) tagSelect.value = tagName;
  filterData();
}

// 選択中タグを解除する関数
function clearTagFilter() {
  currentSelectedTag = '';
  const tagSelect = document.getElementById('select-tag');
  if (tagSelect) tagSelect.value = '';
  filterData();
}

function initFilters() {
  document.getElementById('search-liver').addEventListener('input', filterData);
  document.getElementById('search-tag').addEventListener('input', filterData);
  document.getElementById('filter-type').addEventListener('change', filterData); // ★追加
  document.getElementById('filter-status').addEventListener('change', filterData);
  document.getElementById('select-tag').addEventListener('change', (e) => {
    currentSelectedTag = e.target.value;
    filterData();
  });
}

function filterData() {
  const liverQuery = document.getElementById('search-liver').value.trim().toLowerCase();
  const tagQuery = document.getElementById('search-tag').value.trim().toLowerCase();
  const type = document.getElementById('filter-type').value; // ★追加
  const status = document.getElementById('filter-status').value;

  // バッジ表示制御
  const badgeContainer = document.getElementById('active-tag-badge');
  const badgeName = document.getElementById('active-tag-name');
  if (currentSelectedTag) {
    badgeName.textContent = `#${currentSelectedTag}`;
    badgeContainer.style.display = 'flex';
  } else {
    badgeContainer.style.display = 'none';
  }

  const filtered = voiceData.filter(item => {
    const matchLiver = liverQuery === '' || item.liver.toLowerCase().includes(liverQuery);
    const matchType = type === 'all' || item.type === type; // ★種別の絞り込み判定
    const matchStatus = status === 'all' || item.status === status;
    const matchTagInput = tagQuery === '' || item.tags.some(t => t.toLowerCase().includes(tagQuery));
    const matchTagSelect = currentSelectedTag === '' || item.tags.includes(currentSelectedTag);

    return matchLiver && matchType && matchStatus && matchTagInput && matchTagSelect;
  });

  renderCards(filtered);
}

function renderCards(data) {
  const list = document.getElementById('card-list');
  list.innerHTML = '';

  data.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card card-fade-in';
    card.style.animationDelay = `${index * 0.05}s`;

    const hasReview = item.review && item.review.trim() !== "";
    const hasUrl = item.url && item.url.trim() !== "";

    const reviewAttr = hasReview ? `href="${item.review}" target="_blank" rel="noopener"` : '';
    const urlAttr = hasUrl ? `href="${item.url}" target="_blank" rel="noopener"` : '';

    const reviewClass = hasReview ? 'review-btn' : 'review-btn disabled';
    const urlClass = hasUrl ? 'buy-btn-card' : 'buy-btn-card disabled';

    // EXバッジの生成（複数並べられる処理）
    let exBadgeHtml = '';
    if (item.exStatus === 'purchased') {
      exBadgeHtml = '<span class="ex-badge ex-purchased">EXあり（購入済）</span>';
    } else if (item.exStatus === 'unpurchased') {
      exBadgeHtml = '<span class="ex-badge ex-unpurchased">EXあり（未購入）</span>';
    } else if (item.exStatus === 'purchased_exa') {
      // EX(購入済) と EXA(購入済) の2つを並べる
      exBadgeHtml = `
        <span class="ex-badge ex-purchased">EXあり（購入済）</span>
        <span class="ex-badge ex-purchased-exa">EXAあり（購入済）</span>
      `;
    } else if (item.exStatus === 'unpurchased_exa') {
      // EX(未購入) と EXA(未購入) の2つを並べる
      exBadgeHtml = `
        <span class="ex-badge ex-unpurchased">EXあり（未購入）</span>
        <span class="ex-badge ex-unpurchased-exa">EXAあり（未購入）</span>
      `;
    } else if (item.exStatus === 'none') {
      exBadgeHtml = '<span class="ex-badge ex-none">EXなし</span>';
    }

    card.innerHTML = `
      <div>
        <div class="card-header">
          <div class="card-header-top">
            <span class="type-badge">${item.type || ''}</span>
            <span class="status-badge ${item.status}">${item.status}</span>
          </div>
          ${exBadgeHtml ? `<div class="card-header-bottom">${exBadgeHtml}</div>` : ''}
        </div>
        <h3 class="card-title">${item.title}</h3>
        <div class="liver-name">👤 ${item.liver}</div>
        <div class="sweetness">糖度: ${item.sweetness}</div>
        <div class="tags">
          ${item.tags.map(t => `<span class="tag" onclick="filterByTag('${t}')">#${t}</span>`).join('')}
        </div>
      </div>
      <div class="card-buttons">
        <a ${reviewAttr} class="${reviewClass}">感想を読む</a>
        <a ${urlAttr} class="${urlClass}">公式販売ページ</a>
      </div>
    `;
    list.appendChild(card);
  });
}
// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', init);
