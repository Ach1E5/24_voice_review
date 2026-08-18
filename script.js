// グローバル変数の宣言
let currentSelectedTag = '';
let bookmarkedKeys = JSON.parse(localStorage.getItem('voice_bookmarks_keys')) || [];
let showOnlyBookmarks = false;
let shuffledData = []; // 初回シャッフルデータを保持

// データ項目から一意のキーを生成（title + liver）
function getItemKey(item) {
  return `${item.liver}_${item.title}`;
}

// 配列をランダムにシャッフル（フィッシャー–イェーツの手法）
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 初期化処理
function init() {
  // 初回アクセス時にデータをランダムシャッフル
  shuffledData = shuffleArray(voiceData);

  populateTagDropdown();
  populateLiverDropdown();
  initFilters();
  initScrollTop();
  filterData();
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

// データ内のライバー名を重複なく集めてプルダウンの選択肢を作る関数
function populateLiverDropdown() {
  const liverSelect = document.getElementById('select-liver');
  if (!liverSelect) return;

  const allLivers = new Set();
  voiceData.forEach(item => {
    if (item.liver) {
      allLivers.add(item.liver);
    }
  });

  Array.from(allLivers).sort().forEach(liver => {
    const option = document.createElement('option');
    option.value = liver;
    option.textContent = liver;
    liverSelect.appendChild(option);
  });
}

// フィルターイベントの初期化
function initFilters() {
  const liverInput = document.getElementById('search-liver');
  const tagInput = document.getElementById('search-tag');

  if (liverInput) {
    liverInput.addEventListener('input', () => {
      const liverSelect = document.getElementById('select-liver');
      if (liverSelect) liverSelect.value = '';
      filterData();
    });
    liverInput.addEventListener('search', () => {
      const liverSelect = document.getElementById('select-liver');
      if (liverSelect) liverSelect.value = '';
      filterData();
    });
  }

  if (tagInput) {
    tagInput.addEventListener('input', filterData);
    tagInput.addEventListener('search', filterData);
  }

  const liverSelect = document.getElementById('select-liver');
  if (liverSelect) {
    liverSelect.addEventListener('change', (e) => {
      if (liverInput) liverInput.value = e.target.value;
      filterData();
    });
  }

  const filterType = document.getElementById('filter-type');
  if (filterType) filterType.addEventListener('change', filterData);

  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) filterStatus.addEventListener('change', filterData);

  const selectTag = document.getElementById('select-tag');
  if (selectTag) {
    selectTag.addEventListener('change', (e) => {
      currentSelectedTag = e.target.value;
      filterData();
    });
  }

  // ソート切り替え
  const sortOrder = document.getElementById('sort-order');
  if (sortOrder) sortOrder.addEventListener('change', filterData);

  // リセットボタン
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) btnReset.addEventListener('click', resetAllFilters);
}

// ページのトップへ戻るボタンのイベント初期化
function initScrollTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// 全フィルター初期化（リセット）
function resetAllFilters() {
  const liverInput = document.getElementById('search-liver');
  const tagInput = document.getElementById('search-tag');
  const liverSelect = document.getElementById('select-liver');
  const filterType = document.getElementById('filter-type');
  const filterStatus = document.getElementById('filter-status');
  const selectTag = document.getElementById('select-tag');
  const sortOrder = document.getElementById('sort-order');

  if (liverInput) liverInput.value = '';
  if (tagInput) tagInput.value = '';
  if (liverSelect) liverSelect.value = '';
  if (filterType) filterType.value = 'all';
  if (filterStatus) filterStatus.value = 'all';
  if (selectTag) selectTag.value = '';
  if (sortOrder) sortOrder.value = 'shuffle';

  currentSelectedTag = '';
  showOnlyBookmarks = false;

  const bookmarkBtn = document.getElementById('btn-toggle-bookmark');
  if (bookmarkBtn) {
    bookmarkBtn.classList.remove('active');
    bookmarkBtn.textContent = '☆ ブックマークのみ表示';
  }

  // 再びランダムに並び替え直す
  shuffledData = shuffleArray(voiceData);
  filterData();
}

// カード内のタグをクリックした時の処理
function filterByTag(tagName) {
  currentSelectedTag = tagName;
  const tagSelect = document.getElementById('select-tag');
  if (tagSelect) tagSelect.value = tagName;
  filterData();
}

// カード内のライバー名をクリックした時の処理
function filterByLiver(liverName) {
  const liverInput = document.getElementById('search-liver');
  const liverSelect = document.getElementById('select-liver');
  if (liverInput) liverInput.value = liverName;
  if (liverSelect) liverSelect.value = liverName;
  filterData();
}

// 選択中タグを解除する関数
function clearTagFilter() {
  currentSelectedTag = '';
  const tagSelect = document.getElementById('select-tag');
  if (tagSelect) tagSelect.value = '';
  filterData();
}

// ブックマークのON/OFF切り替え
function toggleBookmark(key) {
  const index = bookmarkedKeys.indexOf(key);
  if (index > -1) {
    bookmarkedKeys.splice(index, 1);
  } else {
    bookmarkedKeys.push(key);
  }
  localStorage.setItem('voice_bookmarks_keys', JSON.stringify(bookmarkedKeys));
  filterData();
}

// ブックマークのみ表示の切り替え
function toggleBookmarkFilter() {
  showOnlyBookmarks = !showOnlyBookmarks;
  const btn = document.getElementById('btn-toggle-bookmark');
  if (btn) {
    btn.classList.toggle('active', showOnlyBookmarks);
    btn.textContent = showOnlyBookmarks ? '★ ブックマークのみ表示中' : '☆ ブックマークのみ表示';
  }
  filterData();
}

// 糖度の文字列から数値（★の数など）を抽出するヘルパー
function parseSweetness(sweetnessStr) {
  if (!sweetnessStr) return 0;
  const stars = (sweetnessStr.match(/★/g) || []).length;
  if (stars > 0) return stars;
  const num = parseFloat(sweetnessStr);
  return isNaN(num) ? 0 : num;
}

function filterData() {
  const liverInput = document.getElementById('search-liver');
  const tagInput = document.getElementById('search-tag');
  const filterType = document.getElementById('filter-type');
  const filterStatus = document.getElementById('filter-status');
  const sortOrder = document.getElementById('sort-order');

  const liverQuery = liverInput ? liverInput.value.trim().toLowerCase() : '';
  const tagQuery = tagInput ? tagInput.value.trim().toLowerCase() : '';
  const type = filterType ? filterType.value : 'all';
  const status = filterStatus ? filterStatus.value : 'all';
  const sort = sortOrder ? sortOrder.value : 'shuffle';

  // バッジ表示制御
  const badgeContainer = document.getElementById('active-tag-badge');
  const badgeName = document.getElementById('active-tag-name');
  if (badgeContainer && badgeName) {
    if (currentSelectedTag) {
      badgeName.textContent = `#${currentSelectedTag}`;
      badgeContainer.style.display = 'flex';
    } else {
      badgeContainer.style.display = 'none';
    }
  }

  // 絞り込み処理
  let filtered = shuffledData.filter(item => {
    const itemKey = getItemKey(item);
    const matchLiver = liverQuery === '' || (item.liver && item.liver.toLowerCase().includes(liverQuery));
    const matchType = type === 'all' || item.type === type;
    const matchStatus = status === 'all' || item.status === status;
    const matchTagInput = tagQuery === '' || (item.tags && item.tags.some(t => t.toLowerCase().includes(tagQuery)));
    const matchTagSelect = currentSelectedTag === '' || (item.tags && item.tags.includes(currentSelectedTag));
    const matchBookmark = !showOnlyBookmarks || bookmarkedKeys.includes(itemKey);

    return matchLiver && matchType && matchStatus && matchTagInput && matchTagSelect && matchBookmark;
  });

  // 並び替え処理
  if (sort === 'sweetness-desc') {
    filtered.sort((a, b) => parseSweetness(b.sweetness) - parseSweetness(a.sweetness));
  } else if (sort === 'sweetness-asc') {
    filtered.sort((a, b) => parseSweetness(a.sweetness) - parseSweetness(b.sweetness));
  } else if (sort === 'liver-asc') {
    filtered.sort((a, b) => (a.liver || '').localeCompare(b.liver || '', 'ja'));
  } else if (sort === 'title-asc') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ja'));
  }

  renderCards(filtered);
}

function renderCards(data) {
  const list = document.getElementById('card-list');
  if (!list) return;
  list.innerHTML = '';

  data.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card card-fade-in';
    card.style.animationDelay = `${index * 0.05}s`;

    const itemKey = getItemKey(item);
    const isBookmarked = bookmarkedKeys.includes(itemKey);
    const bookmarkClass = isBookmarked ? 'bookmarked' : '';
    const bookmarkStar = `<svg width="22" height="22" viewBox="0 0 24 24" fill="${isBookmarked ? '#ff4d6d' : 'none'}" stroke="${isBookmarked ? '#ff4d6d' : '#ccc'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"/></svg>`;

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

    let typeClass = '';
    if (item.type === 'ルート選択ボイス') {
      typeClass = 'type-route';
    } else if (item.type === 'セリフボイス') {
      typeClass = 'type-dialogue';
    } else if (item.type === 'コンセプトボイス') {
      typeClass = 'type-concept';
    }

    card.innerHTML = `
      <button class="bookmark-btn ${bookmarkClass}" type="button">${bookmarkStar}</button>
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
          ${item.tags ? item.tags.map(t => `<span class="tag" onclick="filterByTag('${t.replace(/'/g, "\\'")}')">#${t}</span>`).join('') : ''}
        </div>
      </div>
      <div class="card-buttons">
        <a ${reviewAttr} class="${reviewClass}">感想を読む</a>
        <a ${urlAttr} class="${urlClass}">公式販売ページ</a>
      </div>
    `;

    const bookmarkBtn = card.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleBookmark(itemKey);
      });
    }

    const liverElement = card.querySelector('.liver-name');
    if (liverElement) {
      liverElement.addEventListener('click', () => {
        filterByLiver(item.liver);
      });
    }

    list.appendChild(card);
  });
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', init);
