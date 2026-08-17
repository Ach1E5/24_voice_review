// ★ ここにボイスのデータを追加・編集していってね！
const voiceData = [
  {
    id: 1,
    title: "2026誕生日ボイス",
    liver: "〇〇〇〇",
    status: "常設販売中",
    sweetness: "♥♥♥♥♡", // ハートの数で表現
    tags: ["シチュエーション", "手紙"],
    review: "ここに感想本文が入ります！距離感が近くて最高でした...",
    url: "https://shop.nijisanji.jp/"
  },
  {
    id: 2,
    title: "季節ボイス（夏）",
    liver: "△△△△",
    status: "期間終了",
    sweetness: "♥♥♡♡♡",
    tags: ["ASMR", "学パロ"],
    review: "わちゃわちゃ系で楽しかった！",
    url: "https://shop.nijisanji.jp/"
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

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
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
  const liverSelect = document.getElementById('filter-liver');
  const tagSelect = document.getElementById('filter-tag');

  const livers = [...new Set(voiceData.map(d => d.liver))];
  const tags = [...new Set(voiceData.flatMap(d => d.tags))];

  livers.forEach(l => liverSelect.innerHTML += `<option value="${l}">${l}</option>`);
  tags.forEach(t => tagSelect.innerHTML += `<option value="${t}">${t}</option>`);

  document.querySelectorAll('select').forEach(s => s.addEventListener('change', filterData));
}

function filterData() {
  const liver = document.getElementById('filter-liver').value;
  const status = document.getElementById('filter-status').value;
  const tag = document.getElementById('filter-tag').value;

  const filtered = voiceData.filter(item => {
    const matchLiver = liver === 'all' || item.liver === liver;
    const matchStatus = status === 'all' || item.status === status;
    const matchTag = tag === 'all' || item.tags.includes(tag);
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
