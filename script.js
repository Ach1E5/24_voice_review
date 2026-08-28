// ==========================================
// 初期化とイベント設定
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 初期データの読み込み・描画
  initFilters();
  renderCards();

  // スマホ用 絞り込みフィルター開閉処理
  const toggleBtn = document.getElementById('toggle-filter-btn');
  const filterContainer = document.getElementById('filter-container');

  if (toggleBtn && filterContainer) {
    toggleBtn.addEventListener('click', () => {
      filterContainer.classList.toggle('is-open');
      if (filterContainer.classList.contains('is-open')) {
        toggleBtn.textContent = '絞り込み条件を閉じる';
      } else {
        toggleBtn.textContent = '絞り込み条件を開く';
      }
    });
  }

  // フィルター各種の変更イベント登録
  document.getElementById('search-liver')?.addEventListener('input', renderCards);
  document.getElementById('select-liver')?.addEventListener('change', renderCards);
  document.getElementById('select-tag')?.addEventListener('change', renderCards);
  document.getElementById('filter-status')?.addEventListener('change', renderCards);
  document.getElementById('filter-type')?.addEventListener('change', renderCards);
  document.getElementById('sort-order')?.addEventListener('change', renderCards);

  // リセットボタン
  document.getElementById('btn-reset')?.addEventListener('click', resetFilters);

  // トップに戻るボタン
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// グローバル状態
let isBookmarkOnly = false;

// ==========================================
// フィルターの初期選択肢設定
// ==========================================
function initFilters() {
  if (typeof voiceData === 'undefined') return;

  const selectLiver = document.getElementById('select-liver');
  const selectTag = document.getElementById('select-tag');

  // ライバー一覧の重複排除とソート
  const livers = [...new Set(voiceData.map(item => item.liver))].sort();
  livers.forEach(liver => {
    const opt = document.createElement('option');
    opt.value = liver;
    opt.textContent = liver;
    selectLiver.appendChild(opt);
  });

  // タグ一覧の重複排除とソート
  const tags = [...new Set(voiceData.flatMap(item => item.tags || []))].sort();
  tags.forEach(tag => {
    const opt = document.createElement('option');
    opt.value = tag;
    opt.textContent = tag;
    selectTag.appendChild(opt);
  });
}

// ==========================================
// カード描画メイン処理
// ==========================================
function renderCards() {
  const container = document.getElementById('card-list');
  if (!container || typeof voiceData === 'undefined') return;

  const searchVal = document.getElementById('search-liver')?.value.trim().toLowerCase() || '';
  const selectedLiver = document.getElementById('select-liver')?.value || '';
  const selectedTag = document.getElementById('select-tag')?.value || '';
  const selectedStatus = document.getElementById('filter-status')?.value || 'all';
  const selectedType = document.getElementById('filter-type')?.value || 'all';
  const sortOrder = document.getElementById('sort-order')?.value || 'shuffle';

  // 選択中タグバッジの表示制御
  const activeBadge = document.getElementById('active-tag-badge');
  const activeTagName = document.getElementById('active-tag-name');
  if (activeBadge && activeTagName) {
    if (selectedTag) {
      activeTagName.textContent = selectedTag;
      activeBadge.style.display = 'inline-flex';
    } else {
      activeBadge.style.display = 'none';
    }
  }

  // ブックマークデータ取得
  const bookmarks = JSON.parse(localStorage.getItem('voice_bookmarks') || '[]');

  // フィルタリング
  let filtered = voiceData.filter(item => {
    // 検索ワード（ライバー名かタイトル）
    if (searchVal) {
      const matchLiver = item.liver.toLowerCase().includes(searchVal);
      const matchTitle = item.title.toLowerCase().includes(searchVal);
      if (!matchLiver && !matchTitle) return false;
    }
    // ライバー選択
    if (selectedLiver && item.liver !== selectedLiver) return false;
    // タグ選択
    if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) return false;
    // 販売状況
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    // ボイス種別
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    // ブックマークのみ
    if (isBookmarkOnly && !bookmarks.includes(item.id)) return false;

    return true;
  });

  // 並び替え
  if (sortOrder === 'sweetness-desc') {
    filtered.sort((a, b) => (b.sweetness || 0) - (a.sweetness || 0));
  } else if (sortOrder === 'sweetness-asc') {
    filtered.sort((a, b) => (a.sweetness || 0) - (b.sweetness || 0));
  } else if (sortOrder === 'liver-asc') {
    filtered.sort((a, b) => a.liver.localeCompare(b.liver, 'ja'));
  } else if (sortOrder === 'title-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
  } else if (sortOrder === 'shuffle') {
    filtered.sort(() => Math.random() - 0.5);
  }

  // HTML出力
  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0;">該当するボイスが見つかりませんでした。</p>';
    return;
  }

  filtered.forEach(item => {
    const isBookmarked = bookmarks.includes(item.id);
    const cardHtml = createCardElement(item, isBookmarked);
    container.appendChild(cardHtml);
  });
}

// ==========================================
// カードHTML生成
// ==========================================
function createCardElement(item, isBookmarked) {
  const card = document.createElement('div');
  card.className = 'card card-fade-in';

  // 星（糖度）表示の変換
  const stars = '★'.repeat(item.sweetness || 0) + '☆'.repeat(5 - (item.sweetness || 0));

  // 種別バッジのクラス判定
  let typeClass = '';
  if (item.type === 'ルート選択ボイス') typeClass = 'type-route';
  else if (item.type === 'セリフボイス') typeClass = 'type-dialogue';
  else if (item.type === 'コンセプトボイス') typeClass = 'type-concept';

  // タグ生成
  const tagsHtml = (item.tags || []).map(t => `<span class="tag" onclick="selectTag('${t}')">#${t}</span>`).join('');

  // ボタン設定
  const reviewBtnClass = item.reviewUrl ? 'review-btn' : 'review-btn disabled';
  const buyBtnClass = item.buyUrl ? 'buy-btn-card' : 'buy-btn-card disabled';
  const reviewTarget = item.reviewUrl ? 'target="_blank" rel="noopener"' : '';
  const buyTarget = item.buyUrl ? 'target="_blank" rel="noopener"' : '';

  card.innerHTML = `
    <button class="bookmark-btn" onclick="toggleBookmark('${item.id}')" aria-label="ブックマーク">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill="${isBookmarked ? '#ff4d6d' : 'none'}"
              stroke="${isBookmarked ? '#ff4d6d' : '#ccc'}"
              stroke-width="2"/>
      </svg>
    </button>
    <div>
      <div class="card-header">
        <div class="card-header-top">
          ${item.type ? `<span class="type-badge ${typeClass}">${item.type}</span>` : ''}
          ${item.status ? `<span class="status-badge ${item.status}">${item.status}</span>` : ''}
        </div>
      </div>
      <h3 class="card-title">${item.title}</h3>
      <span class="liver-name" onclick="selectLiver('${item.liver}')">${item.liver}</span>
      <div class="sweetness">
        <span class="sweetness-label">糖度：</span>
        <span class="sweetness-stars">${stars}</span>
      </div>
      <div class="tags">${tagsHtml}</div>
    </div>
    <div class="card-buttons">
      <a href="${item.reviewUrl || '#'}" class="${reviewBtnClass}" ${reviewTarget}>感想を読む</a>
      <a href="${item.buyUrl || '#'}" class="${buyBtnClass}" ${buyTarget}>購入ページへ</a>
    </div>
  `;
  return card;
}

// ==========================================
// 各種アクション処理
// ==========================================
function toggleBookmark(id) {
  let bookmarks = JSON.parse(localStorage.getItem('voice_bookmarks') || '[]');
  if (bookmarks.includes(id)) {
    bookmarks = bookmarks.filter(bId => bId !== id);
  } else {
    bookmarks.push(id);
  }
  localStorage.setItem('voice_bookmarks', JSON.stringify(bookmarks));
  renderCards();
}

function toggleBookmarkFilter() {
  isBookmarkOnly = !isBookmarkOnly;
  const btn = document.getElementById('btn-toggle-bookmark');
  if (btn) {
    if (isBookmarkOnly) {
      btn.classList.add('active');
      btn.textContent = '★ ブックマークのみ表示中';
    } else {
      btn.classList.remove('active');
      btn.textContent = '☆ ブックマークのみ表示';
    }
  }
  renderCards();
}

function selectLiver(liverName) {
  const selectLiver = document.getElementById('select-liver');
  if (selectLiver) {
    selectLiver.value = liverName;
    renderCards();
  }
}

function selectTag(tagName) {
  const selectTag = document.getElementById('select-tag');
  if (selectTag) {
    selectTag.value = tagName;
    renderCards();
  }
}

function clearTagFilter() {
  const selectTag = document.getElementById('select-tag');
  if (selectTag) {
    selectTag.value = '';
    renderCards();
  }
}

function resetFilters() {
  document.getElementById('search-liver').value = '';
  document.getElementById('select-liver').value = '';
  document.getElementById('select-tag').value = '';
  document.getElementById('filter-status').value = 'all';
  document.getElementById('filter-type').value = 'all';
  document.getElementById('sort-order').value = 'shuffle';

  isBookmarkOnly = false;
  const btnBookmark = document.getElementById('btn-toggle-bookmark');
  if (btnBookmark) {
    btnBookmark.classList.remove('active');
    btnBookmark.textContent = '☆ ブックマークのみ表示';
  }

  renderCards();
}
