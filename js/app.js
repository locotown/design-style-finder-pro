// Design Style Finder Pro - Application Logic

// ===== DOM Elements =====
const toneNav = document.getElementById('toneNav');
const detailPanel = document.getElementById('detailPanel');
const overlay = document.getElementById('overlay');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const searchResultsCount = document.getElementById('searchResultsCount');

// ===== State =====
let currentDetailStyle = null;
let currentAppliedTheme = null;
let currentPurpose = 'presentation';
let currentSearchTerm = '';
let compareStyles = []; // Max 4 styles for comparison

// ===== Tone Navigation =====
function buildToneNav() {
  tones.forEach(t => {
    const count = t.id === 'all' ? styles.length : styles.filter(s => s.tone === t.id).length;
    const btn = document.createElement('button');
    btn.className = `tone-btn${t.id === 'all' ? ' active' : ''}`;
    btn.dataset.tone = t.id;

    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = t.emoji;

    const label = document.createElement('span');
    label.textContent = t.label;

    const countSpan = document.createElement('span');
    countSpan.className = 'count';
    countSpan.textContent = count;

    btn.appendChild(emoji);
    btn.appendChild(label);
    btn.appendChild(countSpan);
    toneNav.appendChild(btn);
  });
}

const toneBtns = () => document.querySelectorAll('.tone-btn');
const toneSections = () => document.querySelectorAll('.tone-section');

function setupToneNavigation() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tone-btn');
    if (!btn) return;

    toneBtns().forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tone = btn.dataset.tone;
    toneSections().forEach(s => s.classList.toggle('active', s.dataset.section === tone));
    updateGridWithSearch();
  });
}

// ===== Card Creation =====
function createPreviewContent(styleId, previewClass) {
  const previewDiv = document.createElement('div');
  previewDiv.className = `style-preview ${previewClass}`;
  // previewContent contains trusted internal HTML templates
  const template = document.createElement('template');
  template.innerHTML = previewContent[styleId] || '';
  previewDiv.appendChild(template.content.cloneNode(true));
  return previewDiv;
}

function createCard(style) {
  const card = document.createElement('div');
  card.className = 'style-card';
  card.dataset.styleId = style.id;

  // Compare checkbox
  const checkbox = document.createElement('div');
  checkbox.className = 'compare-checkbox';
  if (compareStyles.includes(style.id)) {
    checkbox.classList.add('checked');
  }
  checkbox.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;
  checkbox.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleCompareStyle(style.id);
  };
  card.appendChild(checkbox);

  // Preview
  card.appendChild(createPreviewContent(style.id, style.previewClass));

  // Info section
  const info = document.createElement('div');
  info.className = 'style-info';

  const name = document.createElement('h3');
  name.className = 'style-name';
  name.textContent = style.name;

  const nameJp = document.createElement('p');
  nameJp.className = 'style-name-jp';
  nameJp.textContent = style.nameJp;

  const desc = document.createElement('p');
  desc.className = 'style-desc';
  desc.textContent = style.desc;

  const tags = document.createElement('div');
  tags.className = 'style-tags';
  style.tags.forEach(t => {
    const tag = document.createElement('span');
    tag.className = 'style-tag';
    tag.textContent = t;
    tags.appendChild(tag);
  });

  info.appendChild(name);
  info.appendChild(nameJp);
  info.appendChild(desc);
  info.appendChild(tags);
  card.appendChild(info);

  card.onclick = () => openDetail(style);
  return card;
}

function populateGrids() {
  document.getElementById('allGrid').append(...styles.map(createCard));
  ['minimal', 'tech', 'casual', 'premium', 'creative', 'corporate'].forEach(tone => {
    const grid = document.getElementById(`${tone}Grid`);
    styles.filter(s => s.tone === tone).forEach(s => grid.appendChild(createCard(s)));
  });
}

// ===== Search =====
function filterStyles(searchTerm, tone) {
  const term = searchTerm.toLowerCase().trim();
  return styles.filter(s => {
    const toneMatch = tone === 'all' || s.tone === tone;
    if (!term) return toneMatch;

    const nameMatch = s.name.toLowerCase().includes(term) || s.nameJp.includes(term);
    const descMatch = s.desc.toLowerCase().includes(term);
    const tagMatch = s.tags.some(t => t.toLowerCase().includes(term));
    const featureMatch = s.features.some(f => f.toLowerCase().includes(term));

    return toneMatch && (nameMatch || descMatch || tagMatch || featureMatch);
  });
}

function updateGridWithSearch() {
  const activeTone = document.querySelector('.tone-btn.active')?.dataset.tone || 'all';
  const filteredStyles = filterStyles(currentSearchTerm, activeTone);

  // 結果数を表示
  if (currentSearchTerm) {
    searchResultsCount.textContent = `${filteredStyles.length}件 / ${styles.length}件`;
  } else {
    searchResultsCount.textContent = '';
  }

  // クリアボタンの表示切り替え
  clearSearchBtn.classList.toggle('visible', currentSearchTerm.length > 0);

  // 全てのグリッドを更新
  const allGrid = document.getElementById('allGrid');
  allGrid.replaceChildren();

  if (activeTone === 'all') {
    filteredStyles.forEach(s => allGrid.appendChild(createCard(s)));
  } else {
    filterStyles(currentSearchTerm, 'all').forEach(s => allGrid.appendChild(createCard(s)));
  }

  // 各トーン別グリッドも更新
  ['minimal', 'tech', 'casual', 'premium', 'creative', 'corporate'].forEach(tone => {
    const grid = document.getElementById(`${tone}Grid`);
    grid.replaceChildren();
    filterStyles(currentSearchTerm, tone).forEach(s => grid.appendChild(createCard(s)));
  });
}

function setupSearch() {
  searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    updateGridWithSearch();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchTerm = '';
    updateGridWithSearch();
    searchInput.focus();
  });
}

// ===== Detail Panel =====
function createColorChip(color) {
  const chip = document.createElement('div');
  chip.className = 'color-chip';
  const swatch = document.createElement('div');
  swatch.className = 'color-swatch';
  swatch.style.background = color.hex;
  const name = document.createElement('div');
  name.className = 'color-name';
  name.textContent = color.name;
  chip.appendChild(swatch);
  chip.appendChild(name);
  return chip;
}

function createFontItem(font) {
  const item = document.createElement('div');
  item.className = 'font-item';
  const label = document.createElement('span');
  label.className = 'font-label';
  label.textContent = font.label;
  const name = document.createElement('span');
  name.className = 'font-name';
  name.textContent = font.name;
  item.appendChild(label);
  item.appendChild(name);
  return item;
}

function createFeatureTag(feature) {
  const tag = document.createElement('span');
  tag.className = 'feature-tag';
  tag.textContent = feature;
  return tag;
}

function openDetail(style) {
  currentDetailStyle = style;
  document.getElementById('detailTitle').textContent = `${style.name} / ${style.nameJp}`;

  // プレビュー
  const previewContainer = document.getElementById('detailPreview');
  previewContainer.replaceChildren(createPreviewContent(style.id, style.previewClass));

  // カラーチップ
  const colorsContainer = document.getElementById('detailColors');
  colorsContainer.replaceChildren(...style.colors.map(createColorChip));

  // フォント
  const fontsContainer = document.getElementById('detailFonts');
  fontsContainer.replaceChildren(...style.fonts.map(createFontItem));

  // 特徴タグ
  const featuresContainer = document.getElementById('detailFeatures');
  featuresContainer.replaceChildren(...style.features.map(createFeatureTag));

  updateYamlDisplay();
  updateApplyButtonState();
  detailPanel.classList.add('open');
  overlay.classList.add('open');
}

function closeDetail() {
  detailPanel.classList.remove('open');
  overlay.classList.remove('open');
}

function setupDetailPanel() {
  document.getElementById('closeBtn').onclick = closeDetail;
  overlay.onclick = closeDetail;

  // 目的タブの切り替え
  document.querySelectorAll('.purpose-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.purpose-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPurpose = tab.dataset.purpose;
      updateYamlDisplay();
    });
  });

  // コピーボタン
  document.getElementById('copyBtn').onclick = function() {
    navigator.clipboard.writeText(document.getElementById('yamlCode').textContent).then(() => {
      this.textContent = 'コピー完了！';
      this.classList.add('copied');
      setTimeout(() => { this.textContent = 'コピー'; this.classList.remove('copied'); }, 2000);
    });
  };
}

// ===== Purpose YAML Generation =====
const purposeConfigs = {
  presentation: {
    title: 'プレゼンテーション用デザイン設定',
    layoutDesc: 'スライド構成',
    layouts: [
      { name: 'タイトルスライド', desc: '大きな見出し、サブタイトル、背景パターン' },
      { name: 'コンテンツスライド', desc: '左右2カラム、箇条書き、図表配置' },
      { name: '強調スライド', desc: 'キーメッセージを中央大きく配置' },
      { name: 'データスライド', desc: 'グラフ・チャート中心、補足テキスト' }
    ],
    tips: '余白を多めに取り、1スライド1メッセージを心がける'
  },
  website: {
    title: 'Webサイト用デザイン設定',
    layoutDesc: 'ページ構成',
    layouts: [
      { name: 'ヒーローセクション', desc: 'フルワイド背景、キャッチコピー、CTA' },
      { name: 'サービス紹介', desc: '3-4カラムのカードグリッド' },
      { name: '特徴セクション', desc: 'アイコン+テキストの横並び' },
      { name: 'フッター', desc: 'リンク集、コピーライト、SNSアイコン' }
    ],
    tips: 'レスポンシブ対応、ホバーエフェクトを活用'
  },
  app: {
    title: 'アプリUI用デザイン設定',
    layoutDesc: '画面構成',
    layouts: [
      { name: 'ホーム画面', desc: 'ナビゲーション、メインコンテンツ、タブバー' },
      { name: 'リスト画面', desc: 'カード形式、スワイプアクション対応' },
      { name: '詳細画面', desc: '画像+情報+アクションボタン' },
      { name: '設定画面', desc: 'グループ化されたリスト形式' }
    ],
    tips: 'タッチターゲット44px以上、階層は浅く'
  },
  lp: {
    title: 'ランディングページ用デザイン設定',
    layoutDesc: 'セクション構成',
    layouts: [
      { name: 'ファーストビュー', desc: '強烈なキャッチ、ベネフィット、CTA' },
      { name: '課題提起', desc: 'ユーザーの悩みを言語化' },
      { name: '解決策提示', desc: '商品・サービスの特徴を3点' },
      { name: '社会的証明', desc: '実績、お客様の声、メディア掲載' },
      { name: 'クロージング', desc: '限定オファー、強いCTA' }
    ],
    tips: 'スクロールで物語が進む構成、CTAは複数配置'
  },
  social: {
    title: 'SNS投稿用デザイン設定',
    layoutDesc: '投稿タイプ',
    layouts: [
      { name: 'フィード投稿', desc: '正方形、インパクトある1枚絵' },
      { name: 'カルーセル', desc: '複数枚でストーリー展開' },
      { name: 'ストーリーズ', desc: '縦長、テキスト少なめ、動き' },
      { name: 'サムネイル', desc: '16:9、顔+テキスト+アイコン' }
    ],
    tips: '文字は大きく読みやすく、ブランドカラーを統一'
  }
};

function generatePurposeYaml(style, purposeId) {
  const baseColors = style.colors.map(c => `    ${c.name}: "${c.hex}"`).join('\n');
  const baseFonts = style.fonts.map(f => `    ${f.label}: "${f.name}"`).join('\n');
  const features = style.features.join('、');

  const config = purposeConfigs[purposeId];
  const layoutsYaml = config.layouts.map(l =>
    `    ${l.name}:\n      説明: "${l.desc}"`
  ).join('\n');

  return `# ${config.title}
# スタイル: ${style.name} (${style.nameJp})

全体デザイン設定:
  トーン: "${style.desc}"
  特徴: "${features}"

  配色パレット:
${baseColors}

  タイポグラフィ:
${baseFonts}

${config.layoutDesc}:
${layoutsYaml}

実装のコツ:
  - ${config.tips}
  - このスタイルの特徴「${style.features[0]}」を活かす
  - アクセントカラー「${style.colors[style.colors.length > 2 ? 2 : style.colors.length - 1]?.hex || style.colors[0].hex}」を効果的に使用`;
}

function updateYamlDisplay() {
  if (!currentDetailStyle) return;
  const purposeLabels = {
    presentation: 'プレゼン用',
    website: 'Webサイト用',
    app: 'アプリ用',
    lp: 'LP用',
    social: 'SNS用'
  };
  document.getElementById('purposeLabel').textContent = `（${purposeLabels[currentPurpose]}）`;
  document.getElementById('yamlCode').textContent = generatePurposeYaml(currentDetailStyle, currentPurpose);
}

// ===== Theme Application =====
const applyStyleBtn = document.getElementById('applyStyleBtn');
const applyBtnText = document.getElementById('applyBtnText');
const resetStyleBtn = document.getElementById('resetStyleBtn');
const currentThemeBadge = document.getElementById('currentThemeBadge');
const currentThemeName = document.getElementById('currentThemeName');
const badgeResetBtn = document.getElementById('badgeResetBtn');

function applyStyleTheme(styleId) {
  document.body.setAttribute('data-style-theme', styleId);
  currentAppliedTheme = styleId;
  updateApplyButtonState();
  updateThemeBadge();
}

function resetStyleTheme() {
  document.body.removeAttribute('data-style-theme');
  currentAppliedTheme = null;
  updateApplyButtonState();
  updateThemeBadge();
}

function updateApplyButtonState() {
  if (!currentDetailStyle) return;
  const isApplied = currentAppliedTheme === currentDetailStyle.id;
  // All styles are now themed (Phase B will add all theme CSS)
  const hasTheme = true;

  applyStyleBtn.classList.toggle('applied', isApplied);
  applyBtnText.textContent = isApplied ? '✓ 適用中' : 'このスタイルを適用';
  applyStyleBtn.disabled = !hasTheme;
  applyStyleBtn.style.opacity = '1';
}

function updateThemeBadge() {
  if (currentAppliedTheme) {
    const style = styles.find(s => s.id === currentAppliedTheme);
    if (style) {
      currentThemeName.textContent = style.nameJp;
      currentThemeBadge.classList.add('visible');
    }
  } else {
    currentThemeBadge.classList.remove('visible');
  }
}

function setupThemeApplication() {
  applyStyleBtn.addEventListener('click', () => {
    if (!currentDetailStyle) return;

    if (currentAppliedTheme === currentDetailStyle.id) {
      resetStyleTheme();
    } else {
      applyStyleTheme(currentDetailStyle.id);
    }
  });

  resetStyleBtn.addEventListener('click', resetStyleTheme);
  badgeResetBtn.addEventListener('click', resetStyleTheme);
}

// ===== Compare Mode =====
const compareBar = document.getElementById('compareBar');
const compareSelected = document.getElementById('compareSelected');
const compareCount = document.getElementById('compareCount');
const compareBtn = document.getElementById('compareBtn');
const compareClearBtn = document.getElementById('compareClearBtn');
const compareOverlay = document.getElementById('compareOverlay');
const compareModal = document.getElementById('compareModal');
const compareModalClose = document.getElementById('compareModalClose');
const compareModalContent = document.getElementById('compareModalContent');

function toggleCompareStyle(styleId) {
  const index = compareStyles.indexOf(styleId);
  if (index > -1) {
    // Remove from comparison
    compareStyles.splice(index, 1);
  } else if (compareStyles.length < 4) {
    // Add to comparison (max 4)
    compareStyles.push(styleId);
  }
  updateCompareUI();
}

function updateCompareUI() {
  // Update card checkboxes
  document.querySelectorAll('.style-card').forEach(card => {
    const styleId = card.dataset.styleId;
    const checkbox = card.querySelector('.compare-checkbox');
    if (checkbox) {
      const isSelected = compareStyles.includes(styleId);
      checkbox.classList.toggle('checked', isSelected);
    }
  });

  // Update compare bar
  updateCompareBar();
}

function updateCompareBar() {
  // Update count
  compareCount.textContent = compareStyles.length;

  // Update compare button state
  compareBtn.disabled = compareStyles.length < 2;

  // Update selected chips
  compareSelected.replaceChildren();
  compareStyles.forEach(styleId => {
    const style = styles.find(s => s.id === styleId);
    if (!style) return;

    const chip = document.createElement('div');
    chip.className = 'compare-chip';

    const name = document.createElement('span');
    name.textContent = style.nameJp;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'chip-remove';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => toggleCompareStyle(styleId);

    chip.appendChild(name);
    chip.appendChild(removeBtn);
    compareSelected.appendChild(chip);
  });

  // Show/hide bar
  compareBar.classList.toggle('visible', compareStyles.length > 0);
}

function openCompareModal() {
  if (compareStyles.length < 2) return;

  renderCompareGrid();
  compareModal.classList.add('open');
  compareOverlay.classList.add('open');
}

function closeCompareModal() {
  compareModal.classList.remove('open');
  compareOverlay.classList.remove('open');
}

function renderCompareGrid() {
  compareModalContent.replaceChildren();

  const grid = document.createElement('div');
  grid.className = 'compare-grid';
  grid.dataset.count = compareStyles.length;

  compareStyles.forEach(styleId => {
    const style = styles.find(s => s.id === styleId);
    if (!style) return;

    const item = document.createElement('div');
    item.className = 'compare-item';

    // Header
    const header = document.createElement('div');
    header.className = 'compare-item-header';

    const title = document.createElement('h4');
    title.className = 'compare-item-title';
    title.textContent = style.name;

    const subtitle = document.createElement('span');
    subtitle.className = 'compare-item-subtitle';
    subtitle.textContent = style.nameJp;

    header.appendChild(title);
    header.appendChild(subtitle);
    item.appendChild(header);

    // Preview
    const previewWrapper = document.createElement('div');
    previewWrapper.className = 'compare-item-preview';
    previewWrapper.appendChild(createPreviewContent(style.id, style.previewClass));
    item.appendChild(previewWrapper);

    // Colors
    const colorsSection = document.createElement('div');
    colorsSection.className = 'compare-item-section';

    const colorsTitle = document.createElement('div');
    colorsTitle.className = 'compare-section-title';
    colorsTitle.textContent = '配色';
    colorsSection.appendChild(colorsTitle);

    const colorsRow = document.createElement('div');
    colorsRow.className = 'compare-colors';
    style.colors.forEach(c => {
      const swatch = document.createElement('div');
      swatch.className = 'compare-color-swatch';
      swatch.style.background = c.hex;
      swatch.title = `${c.name}: ${c.hex}`;
      colorsRow.appendChild(swatch);
    });
    colorsSection.appendChild(colorsRow);
    item.appendChild(colorsSection);

    // Fonts
    const fontsSection = document.createElement('div');
    fontsSection.className = 'compare-item-section';

    const fontsTitle = document.createElement('div');
    fontsTitle.className = 'compare-section-title';
    fontsTitle.textContent = 'フォント';
    fontsSection.appendChild(fontsTitle);

    style.fonts.forEach(f => {
      const fontRow = document.createElement('div');
      fontRow.className = 'compare-font';
      fontRow.innerHTML = `<span class="compare-font-label">${f.label}</span><span class="compare-font-name">${f.name}</span>`;
      fontsSection.appendChild(fontRow);
    });
    item.appendChild(fontsSection);

    // Features
    const featuresSection = document.createElement('div');
    featuresSection.className = 'compare-item-section';

    const featuresTitle = document.createElement('div');
    featuresTitle.className = 'compare-section-title';
    featuresTitle.textContent = '特徴';
    featuresSection.appendChild(featuresTitle);

    const featuresList = document.createElement('div');
    featuresList.className = 'compare-features';
    style.features.forEach(f => {
      const tag = document.createElement('span');
      tag.className = 'compare-feature-tag';
      tag.textContent = f;
      featuresList.appendChild(tag);
    });
    featuresSection.appendChild(featuresList);
    item.appendChild(featuresSection);

    // Apply button
    const applyBtn = document.createElement('button');
    applyBtn.className = 'compare-apply-btn';
    applyBtn.textContent = 'このスタイルを適用';
    applyBtn.onclick = () => {
      applyStyleTheme(style.id);
      closeCompareModal();
    };
    item.appendChild(applyBtn);

    grid.appendChild(item);
  });

  compareModalContent.appendChild(grid);
}

function clearCompareStyles() {
  compareStyles = [];
  updateCompareUI();
}

function setupCompareMode() {
  compareBtn.addEventListener('click', openCompareModal);
  compareClearBtn.addEventListener('click', clearCompareStyles);
  compareModalClose.addEventListener('click', closeCompareModal);
  compareOverlay.addEventListener('click', closeCompareModal);

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && compareModal.classList.contains('open')) {
      closeCompareModal();
    }
  });
}

// ===== Initialize =====
function init() {
  buildToneNav();
  populateGrids();
  setupToneNavigation();
  setupSearch();
  setupDetailPanel();
  setupThemeApplication();
  setupCompareMode();
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
