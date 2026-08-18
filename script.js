// グローバル変数の宣言
let currentSelectedTag = '';

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

// フィルターイベントの初期化（まとめ）
function initFilters() {
  document.getElementById('search-liver').addEventListener('input', filterData);
  document.getElementById('search-tag').addEventListener('input', filterData);
  document.getElementById('filter-type').addEventListener('change', filterData);
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

function filterData() {
  const liverQuery = document.getElementById('search-liver').value.trim().toLowerCase();
  const tagQuery = document.getElementById('search-tag').value.trim().toLowerCase();
  const type = document.getElementById('filter-type').value;
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
    const matchType = type === 'all' || item.type === type;
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

    // バッジ生成のパーツ
    const badgeExP = '<span class="ex-badge ex-purchased">EXあり（購入済）</span>';
    const badgeExU = '<span class="ex-badge ex-unpurchased">EXあり（未購入）</span>';
    const badgeExaP = '<span class="ex-badge ex-purchased-exa">EXAあり（購入済）</span>';
    const badgeExaU = '<span class="ex-badge ex-unpurchased-exa">EXAあり（未購入）</span>';
    const badgeNone = '<span class="ex-badge ex-none">EXなし</span>';

    // 全パターン分岐
    let exBadgeHtml = '';
    switch (item.exStatus) {
      case 'ex_purchased':
      case 'purchased':
        exBadgeHtml = badgeExP;
        break;
      case 'ex_p_exa_u':
        exBadgeHtml = `${badgeExP}${badgeExaU}`;
        break;
      case 'ex_u_exa_p':
        exBadgeHtml = `${badgeExU}${badgeExaP}`;
        break;
      case 'ex_p_exa_p':
      case 'purchased_exa':
        exBadgeHtml = `${badgeExP}${badgeExaP}`;
        break;
      case 'ex_u_exa_u':
      case 'unpurchased_exa':
        exBadgeHtml = `${badgeExU}${badgeExaU}`;
        break;
      case 'none':
        exBadgeHtml = badgeNone;
        break;
    }

    // ★ここでクラス名を判定
    let typeClass = '';
    if (item.type === 'ルート選択ボイス') {
      typeClass = 'type-route';
    } else if (item.type === 'セリフボイス') {
      typeClass = 'type-dialogue';
    } else if (item.type === 'コンセプトボイス') {
      typeClass = 'type-concept';
    }

    card.innerHTML = `
      <div>
        <div class="card-header">
          <div class="card-header-top">
            <span class="type-badge ${typeClass}">${item.type || ''}</span>
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
