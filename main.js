// =====================================================
// 고라니 키우기 - main.js
// 섹션 번호 = 기획서 주요 기능 번호
// =====================================================

// ---------- 기본 설정 ----------
const MAX_LEVEL = 800; // 만렙

const NewGame = () => ({
  berry: 0, // 현재 열매
  totalBerry: 0, // 지금까지 번 총량
  clickCount: 0, // 클릭 횟수
  level: 1, // 고라니 레벨
  members: new Array(12).fill(0), // 동료 레벨 (0 = 아직 영입 안 함)
  pets: [false, false, false], // 펫 보유 여부
  skin: "기본", // 적용중인 스킨
  map: "숲", // 현재 맵
  bgm: true,
  sfx: true,
  lastTime: Date.now(), // 마지막 접속 시간 (오프라인 보상용)
});
let game = NewGame();

let boosterEnd = 0; // 부스터 끝나는 시간 (저장 안 함)

// 최소값~최대값 사이 랜덤 정수 (수업 common.js 에서 가져옴)
function getRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// 숫자에 콤마 찍기 : 12345 → "12,345"
const fmt = (num) => Math.floor(num).toLocaleString();

// ---------- 1. 클릭으로 열매 획득 ----------
function clickDeer(event) {
  let amount = getClickBerry();
  let text = `+${fmt(amount)}`;
  let big = false;

  // 야구선수 고라니 : 확률로 홈런 (10배)
  if (getRandomInteger(1, 100) <= getHomerunChance()) {
    amount *= 10;
    text = `홈런! +${fmt(amount)}`;
    big = true;
  }
  // 5% 확률 크리티컬 (2배)
  else if (getRandomInteger(1, 100) <= 5) {
    amount *= 2;
    text = `크리티컬! +${fmt(amount)}`;
    big = true;
  }

  addBerry(amount);
  game.clickCount++; // 밀짚모자 스킨 조건
  showEffect(text, big, event);
  render();
}

// 클릭한 위치에 "+열매" 글자 띄우기
function showEffect(text, big, event) {
  const screen = document.getElementById("tab-main");
  const effect = document.createElement("span");
  effect.className = big ? "click-effect big" : "click-effect";
  effect.innerText = text;

  const rect = screen.getBoundingClientRect();
  effect.style.left = `${event.clientX - rect.left}px`;
  effect.style.top = `${event.clientY - rect.top}px`;

  screen.appendChild(effect);
  setTimeout(() => effect.remove(), 800); // 0.8초 뒤 삭제
}

// ---------- 2. 주인공 강화 ----------
// 강화 비용 : 10에서 시작, 레벨이 오를수록 비싸짐 / 대장장이 고라니가 할인
const getUpgradePrice = () => {
  const price = 5 + 5 * Math.pow(game.level, 1.5);
  return Math.floor(price * (1 - getSmithDiscount() / 100));
};

function upgradeDeer() {
  if (game.level >= MAX_LEVEL) return alert("이미 만렙입니다!");
  if (!spend(getUpgradePrice())) return;

  game.level++;
  render();
}

// ---------- 3.1 동료 12마리 ----------
// type
// auto   : 초당 열매 +value (레벨마다)
// click  : 클릭당 열매 +value (레벨마다)
// homerun: 클릭 시 value% 확률로 10배 (최대 50%)
// smith  : 강화 비용 -value% (최대 50%)
// newton : 모든 생산량 +value%
// sleep  : 오프라인 보상 +value% (7번 저장 기능 만들 때 적용)
const memberList = [
  {
    name: "엄마고라니",
    type: "auto",
    value: 1,
    price: 50,
    text: "애들 영양실조 걸리겠다! 자식 고라니들에게 먹일 사과가 부족해지자 주방용 뒤집개를 들고 직접 나무를 털러 나온 생활력 만렙 엄마.",
  },
  { name: "태권도 고라니", type: "click", value: 2, price: 150, text: "발차기로 나무를 침" },
  { name: "상인고라니", type: "auto", value: 5, price: 500, text: "돈 벌려고 옴" },
  { name: "나무꾼 고라니", type: "auto", value: 12, price: 1500, text: "나무를 베지 않고 때림" },
  { name: "잠자는고라니", type: "sleep", value: 20, price: 4000, text: "자고 있어도 열매가 나옴" },
  { name: "선생고라니", type: "click", value: 20, price: 10000, text: "고라니 학생들을 지킴" },
  { name: "외계인고라니", type: "auto", value: 80, price: 30000, text: "지구 침공하러 왔다가 도와줌" },
  { name: "소방관고라니", type: "auto", value: 200, price: 80000, text: "기후 위기 대응" },
  { name: "대장장이 고라니", type: "smith", value: 5, price: 150000, text: "장비 제작" },
  { name: "야구선수 고라니", type: "homerun", value: 2, price: 300000, text: "한 번에 엄청난 열매 획득" },
  { name: "중장비 기사 고라니", type: "auto", value: 1000, price: 600000, text: "포크레인으로 나무 흔듦" },
  { name: "뉴턴 고라니", type: "newton", value: 10, price: 1000000, text: "최적의 타격점 계산" },
];

// 동료 가격 : 레벨업할수록 1.5배씩
const getMemberPrice = (i) => Math.floor(memberList[i].price * Math.pow(1.5, game.members[i]));

// 특정 type 동료들의 효과 합 (value × 동료 레벨)
const getMemberSum = (type) => {
  let sum = 0;
  memberList.forEach((m, i) => {
    if (m.type === type) sum += m.value * game.members[i];
  });
  return sum;
};

// 영입한 동료 수 (마술 모자 스킨 조건)
const getMemberCount = () => game.members.filter((lv) => lv > 0).length;

// 동료 효과 설명
const getMemberEffectText = (m) => {
  switch (m.type) {
    case "auto": return `초당 열매 +${m.value}`;
    case "click": return `클릭당 열매 +${m.value}`;
    case "homerun": return `홈런 확률 +${m.value}%`;
    case "smith": return `강화 비용 -${m.value}%`;
    case "newton": return `모든 생산량 +${m.value}%`;
    case "sleep": return `오프라인 보상 +${m.value}%`;
  }
};

function buyMember(i) {
  if (!spend(getMemberPrice(i))) return;
  game.members[i]++;
  render();
}

// ---------- 3.2 펫 ----------
const petList = [
  { name: "병아리", type: "click", bonus: 10, price: 500, text: "클릭 열매 +10%" },
  { name: "람쥐", type: "auto", bonus: 15, price: 1000, text: "초당 열매 +15%" },
  { name: "부엉이", type: "auto", bonus: 30, price: 50000, text: "밤에도 열매 수확, 초당 열매 +30%" },
];

// 펫 보너스 % 합 (type : "click" 또는 "auto")
const getPetBonus = (type) => {
  let bonus = 0;
  petList.forEach((pet, i) => {
    if (game.pets[i] && pet.type === type) bonus += pet.bonus;
  });
  return bonus;
};

function buyPet(i) {
  if (game.pets[i]) return;
  if (!spend(petList[i].price)) return;
  game.pets[i] = true;
  render();
}

// ---------- 4. 방치 시스템 (setInterval) ----------
// 1초마다 초당 열매만큼 자동으로 추가
setInterval(() => {
  addBerry(getAutoBerry());
  render(); // 부스터 남은 시간도 같이 갱신
}, 1000);

// ---------- 5. 스킨 ----------
// icon : 고라니 머리 위에 표시할 이모지
const skinList = [
  { name: "기본", text: "기본", icon: "", check: () => true },
  { name: "마술 모자", text: "동료 3명 영입", icon: "🎩", check: () => getMemberCount() >= 3 },
  { name: "선글라스", text: "Lv.100", icon: "🕶️", check: () => game.level >= 100 },
  { name: "빨간 목도리", text: "총 열매 1000", icon: "🧣", check: () => game.totalBerry >= 1000 },
  { name: "밀짚모자", text: "클릭 10,000회", icon: "👒", check: () => game.clickCount >= 10000 },
  { name: "안전모", text: "Lv.300", icon: "⛑️", check: () => game.level >= 300 },
  { name: "헤드폰", text: "Lv.500", icon: "🎧", check: () => game.level >= 500 },
  { name: "황금 고라니", text: "Lv.800 만렙", icon: "👑", check: () => game.level >= MAX_LEVEL },
];

function selectSkin(i) {
  const skin = skinList[i];
  if (!skin.check()) return alert(`잠금 조건: ${skin.text}`);
  game.skin = skin.name;
  render();
}

// ---------- 6. 맵 ----------
// needLevel : 해금 레벨 / bonus : 모든 열매 배율
// filter : 배경 색감 (맵별 배경 그림이 생기면 bg 주소만 바꾸면 됨)
const FOREST_BG =
  "https://media.istockphoto.com/id/1326389468/vector/beautiful-sunlit-forest.jpg?s=612x612&w=0&k=20&c=ik0tGlKOhIY4w85MvSnhgF05MogXxP2CDDBbHb-d57M=";

const mapList = new Map();
mapList.set("숲", {
  needLevel: 1,
  bonus: 1,
  text: "중앙에 큰 나무 하나, 옆에는 풀숲",
  bg: FOREST_BG,
  filter: "none",
});
mapList.set("하늘 위", {
  needLevel: 100,
  bonus: 1.5,
  text: "큰 나무의 윗부분",
  bg: FOREST_BG,
  filter: "hue-rotate(160deg) brightness(1.2)",
});
mapList.set("개발 지역", {
  needLevel: 300,
  bonus: 2,
  text: "인간들이 숲을 개발하는 지역",
  bg: FOREST_BG,
  filter: "sepia(0.8) saturate(0.7)",
});
mapList.set("인간 도시", {
  needLevel: 500,
  bonus: 3,
  text: "고라니들의 첫 도시 진출",
  bg: FOREST_BG,
  filter: "grayscale(1) contrast(1.1)",
});
mapList.set("숲 깊은 곳", {
  needLevel: MAX_LEVEL,
  bonus: 5,
  text: "최종 사건",
  bg: FOREST_BG,
  filter: "brightness(0.45) saturate(1.3)",
});

function moveMap(name) {
  const { needLevel } = mapList.get(name); // 구조 분해 할당
  if (game.level < needLevel) return alert(`Lv.${needLevel} 이상만 이동할 수 있습니다.`);
  game.map = name;
  render();
}

// ---------- 상점 ----------
const BOOSTER_TIME = 30; // 부스터 지속 시간 (초)

const isBoosterOn = () => Date.now() < boosterEnd;

// 부스터 가격 : 최소 500, 초당 열매가 많아지면 같이 비싸짐
const getBoosterPrice = () => Math.max(500, getAutoBerry() * 20);

// 이주호 가격 : 최소 100, 클릭당 열매에 따라 비싸짐
const getJuhoPrice = () => Math.max(100, getClickBerry() * 20);

function buyBooster() {
  if (isBoosterOn()) return alert("이미 부스터 사용중입니다.");
  if (!spend(getBoosterPrice())) return;
  boosterEnd = Date.now() + BOOSTER_TIME * 1000;
  render();
}

function buyJuho() {
  const price = getJuhoPrice();
  if (!spend(price)) return;

  // 30% 확률로 꽝, 아니면 가격의 0.5 ~ 3배
  if (getRandomInteger(1, 100) <= 30) {
    alert("이주호가 열매를 들고 도망갔다... (꽝)");
  } else {
    const prize = getRandomInteger(Math.floor(price / 2), price * 3);
    addBerry(prize);
    alert(`이주호가 열매 ${fmt(prize)}개를 가져왔다!`);
  }
  render();
}

// ---------- HTML 요소 ----------
const berry_box = document.getElementById("berry");
const click_berry_box = document.querySelector("#click_berry .value");
const auto_berry_box = document.querySelector("#auto_berry .value");
const sum_berry_box = document.querySelector("#sum_berry .value");

// ---------- 계산 함수 ----------
// 열매 더하기 (현재 열매 + 총 생산량)
const addBerry = (amount) => {
  game.berry += amount;
  game.totalBerry += amount;
};

// 열매 쓰기 : 모자라면 false
const spend = (price) => {
  if (game.berry < price) {
    alert(`열매가 부족합니다! (필요: ${fmt(price)})`);
    return false;
  }
  game.berry -= price;
  return true;
};

const getMapBonus = () => mapList.get(game.map).bonus;
const getSmithDiscount = () => Math.min(getMemberSum("smith"), 50); // 최대 50%
const getHomerunChance = () => Math.min(getMemberSum("homerun"), 50); // 최대 50%

// 공통 배율 = 맵 × 뉴턴 × 부스터
const getMultiplier = () => {
  let value = getMapBonus() * (1 + getMemberSum("newton") / 100);
  if (isBoosterOn()) value *= 2;
  return value;
};

// 클릭당 열매 = (레벨 + 클릭 동료) × 펫 × 공통 배율
const getClickBerry = () => {
  const base = game.level + getMemberSum("click");
  return Math.floor(base * (1 + getPetBonus("click") / 100) * getMultiplier());
};

// 초당 열매 = 자동 동료 × 펫 × 공통 배율
const getAutoBerry = () => {
  const base = getMemberSum("auto");
  return Math.floor(base * (1 + getPetBonus("auto") / 100) * getMultiplier());
};

// ---------- 탭 전환 (HTML 에서 옮겨옴) ----------
function openTab(tabId, btnElement) {
  const screens = document.querySelectorAll(".game-screen");
  screens.forEach((screen) => screen.classList.remove("active"));

  const buttons = document.querySelectorAll(".tab-group button");
  buttons.forEach((btn) => btn.classList.remove("active-btn"));

  document.getElementById(tabId).classList.add("active");

  if (btnElement) {
    btnElement.classList.add("active-btn");
  }
}

// ---------- 7. 저장 (localStorage) ----------
// TODO

// ---------- 오프라인 보상 ----------
// TODO (잠자는고라니 sleep 효과 여기서 적용)

// ---------- 8. JSON 내보내기 / 불러오기 ----------
// TODO

// ---------- 9. 데이터 초기화 ----------
// TODO

// ---------- 화면 적용 ----------
// 목록 HTML 이 전과 같으면 다시 안 그림
// (1초마다 다시 그리면 버튼 누르는 순간 버튼이 바뀌어서 클릭이 씹힐 수 있음)
const lastHtml = {};
function setHTML(id, html) {
  if (lastHtml[id] === html) return;
  lastHtml[id] = html;
  document.getElementById(id).innerHTML = html;
}

function render() {
  // 상단 / 하단 숫자
  berry_box.innerText = `열매 ${fmt(game.berry)}`;
  click_berry_box.innerText = fmt(getClickBerry());
  auto_berry_box.innerText = fmt(getAutoBerry());
  sum_berry_box.innerText = fmt(game.totalBerry);

  renderMain();
  renderUpgrade();
  renderMember();
  renderPet();
  renderSkin();
  renderMap();
  renderShop();
}

// 메인 : 스킨, 배경, 정보
function renderMain() {
  const skin = skinList.find((s) => s.name === game.skin);
  document.getElementById("skin-icon").innerText = skin.icon;
  document.getElementById("deer-box").classList.toggle("golden", game.skin === "황금 고라니");

  const map = mapList.get(game.map);
  const bgImg = document.getElementById("background-img");
  if (bgImg.dataset.bg !== map.bg) {
    bgImg.src = map.bg; // 그림이 바뀔 때만 새로 불러오기
    bgImg.dataset.bg = map.bg;
  }
  bgImg.style.filter = map.filter;

  let info = `Lv.${game.level} · ${game.map}`;
  if (isBoosterOn()) info += " · 🔥 부스터 2배";
  document.getElementById("deer-info").innerText = info;
}

// 2. 강화 탭
function renderUpgrade() {
  const isMax = game.level >= MAX_LEVEL;
  const btn = document.getElementById("upgrade-btn");

  document.getElementById("upgrade-level").innerText = `고라니 Lv. ${game.level}` + (isMax ? " (MAX)" : "");
  document.getElementById("upgrade-desc").innerText = `클릭당 열매 ${fmt(getClickBerry())}`;
  btn.innerHTML = isMax ? "만렙" : `강화하기<br>열매 ${fmt(getUpgradePrice())}`;
  btn.disabled = isMax || game.berry < getUpgradePrice();
}

// 3.1 동료 탭
function renderMember() {
  let html = "";
  memberList.forEach((m, i) => {
    const lv = game.members[i];
    const price = getMemberPrice(i);
    const title = lv > 0 ? `${m.name} Lv.${lv}` : m.name;
    const btnText = lv > 0 ? "레벨업" : "영입";
    const disabled = game.berry < price ? "disabled" : "";

    html += `
      <div class="list-item">
        <div class="list-item-info">
          <span style="font-weight: bold;">${title}</span>
          <span>${getMemberEffectText(m)}</span>
          <span class="desc">${m.text}</span>
        </div>
        <button class="btn-action" onclick="buyMember(${i})" ${disabled}>${btnText}<br>${fmt(price)}</button>
      </div>`;
  });
  setHTML("tab-member", html);
}

// 3.2 펫 탭
function renderPet() {
  let html = "";
  petList.forEach((p, i) => {
    const have = game.pets[i];
    const btnText = have ? "보유중" : `구매<br>${fmt(p.price)}`;
    const disabled = have || game.berry < p.price ? "disabled" : "";

    html += `
      <div class="list-item">
        <div class="list-item-info">
          <span style="font-weight: bold;">${p.name}</span>
          <span>${p.text}</span>
        </div>
        <button class="btn-action" onclick="buyPet(${i})" ${disabled}>${btnText}</button>
      </div>`;
  });
  setHTML("tab-pet", html);
}

// 5. 스킨 탭
function renderSkin() {
  let html = "";
  skinList.forEach((s, i) => {
    let btnText = `🔒 ${s.text}`;
    if (game.skin === s.name) btnText = "적용중";
    else if (s.check()) btnText = "적용";

    html += `
      <div class="skin-card">
        <span style="font-size: 20px; height: 24px;">${s.icon}</span>
        <span>${s.name}</span>
        <button class="btn-action" style="width: 100%; padding: 4px;" onclick="selectSkin(${i})">${btnText}</button>
      </div>`;
  });
  setHTML("skin-grid", html);
}

// 6. 맵 탭
function renderMap() {
  const now = mapList.get(game.map);
  setHTML("map-current", `
    ${game.map} (선택됨 · 열매 x${now.bonus})
    <p style="font-size: 11px; font-weight: normal; margin-top: 4px;">${now.text}</p>`);

  let html = "";
  mapList.forEach((info, name) => {
    if (name === game.map) return; // 현재 맵은 위에 표시하니까 제외

    const bottom =
      game.level >= info.needLevel
        ? `<button class="btn-action" style="margin-top: 4px; width: 100%;" onclick="moveMap('${name}')">이동</button>`
        : `<p style="font-size: 9px; margin-top: 4px;">🔒 조건: Lv.${info.needLevel}</p>`;

    html += `
      <div class="map-card">
        <p style="font-weight: bold;">${name}</p>
        <p style="font-size: 9px;">열매 x${info.bonus}</p>
        ${bottom}
      </div>`;
  });
  setHTML("map-grid", html);
}

// 상점 탭
function renderShop() {
  const boosterBtn = document.getElementById("booster-btn");
  if (isBoosterOn()) {
    const left = Math.ceil((boosterEnd - Date.now()) / 1000);
    document.getElementById("booster-desc").innerText = `사용중! 남은 시간 ${left}초`;
    boosterBtn.innerHTML = "사용중";
    boosterBtn.disabled = true;
  } else {
    document.getElementById("booster-desc").innerText = `${BOOSTER_TIME}초 동안 모든 열매 2배`;
    boosterBtn.innerHTML = `구매<br>${fmt(getBoosterPrice())}`;
    boosterBtn.disabled = game.berry < getBoosterPrice();
  }

  const juhoBtn = document.getElementById("juho-btn");
  juhoBtn.innerHTML = `구매<br>${fmt(getJuhoPrice())}`;
  juhoBtn.disabled = game.berry < getJuhoPrice();
}

render(); // 처음 한 번 그리기

// 키보드 'd' (또는 'D')를 누르면 열매 9999999개 획득
window.addEventListener("keydown", (event) => {
  if (event.key === "d" || event.key === "D") {
    // 입력창이나 텍스트 영역에 타이핑 중일 때는 작동하지 않도록 예외 처리
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    
    addBerry(9999999);
    render();
  }
});

// 키보드 'f' (또는 'F')를 누르면 레벨을 1000으로 설정
window.addEventListener("keydown", (event) => {
  if (event.key === "f" || event.key === "F") {
    // 입력창이나 텍스트 영역에 타이핑 중일 때는 작동하지 않도록 예외 처리
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    
    game.level = 1000;
    render();
  }
});
