// ★ ここにデータ追加・編集
const voiceData = [
  {
    id: 1,
    title: "2026誕生日ボイス",
    liver: "〇〇〇〇",
    status: "常設販売中",
    sweetness: "♥♥♥♥♡", // ハートの数で表現
    tags: ["シチュエーション", "手紙"],
    review: "感想本文",
    url: "https://"
  },
  {
    id: 2,
    title: "季節ボイス（夏）",
    liver: "△△△△",
    status: "期間終了",
    sweetness: "♥♥♡♡♡",
    tags: ["ASMR", "学パロ"],
    review: "〇〇",
    url: "https:///"
  }
];

// 画面読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
  renderCards(voiceData);
  initFilters();
});

function renderCards(data) {
  const list = document.getElementById('card-list');
  list.innerHTML = '';

  data.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card card-fade-in'; // ★アニメーションのクラスを追加！

    // ★フェードインさせるための設定
    card.style.animationDelay = `${index * 0.05}s`;

    card.innerHTML = `
      <div>
        <div class="card-header">
          <span class="status-badge ${item.status}">${item.status}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
        <div class="liver-name">👤 ${item.liver}</div>
        <div class="sweetness">糖度: ${item.sweetness}</div>
        <div class="tags">
          ${item.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
        </div>
      </div>
      <button class="review-btn" onclick="openModal(${item.id})">感想を見る</button>
    `;
    list.appendChild(card);
  });
}

function initFilters() {
  // 文字入力や選択が変わった時にリアルタイムで絞り込むイベントを追加
  document.getElementById('search-liver').addEventListener('input', filterData);
  document.getElementById('search-tag').addEventListener('input', filterData);
  document.getElementById('filter-status').addEventListener('change', filterData);
}

function filterData() {
  const liverQuery = document.getElementById('search-liver').value.trim().toLowerCase();
  const tagQuery = document.getElementById('search-tag').value.trim().toLowerCase();
  const status = document.getElementById('filter-status').value;

  const filtered = voiceData.filter(item => {
    // ライバー名の部分一致チェック
    const matchLiver = liverQuery === '' || item.liver.toLowerCase().includes(liverQuery);
    
    // 販売状況のチェック
    const matchStatus = status === 'all' || item.status === status;
    
    // ジャンル（タグ）の部分一致チェック
    const matchTag = tagQuery === '' || item.tags.some(t => t.toLowerCase().includes(tagQuery));

    return matchLiver && matchStatus && matchTag;
  });

  renderCards(filtered);
}

function openModal(id) {
  const item = voiceData.find(d => d.id === id);
  if (!item) return;

  document.getElementById('modal-title').innerText = item.title;
  document.getElementById('modal-liver').innerText = `ライバー: ${item.liver}`;
  document.getElementById('modal-body').innerText = item.review;
  document.getElementById('modal-link').href = item.url;
  document.getElementById('modal').style.display = 'flex';
}

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('modal').style.display = 'none';
});
