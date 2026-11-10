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
  seenStory: [], // 이미 본 컷씬 (story.js)
});
let game = NewGame();

let boosterEnd = 0; // 부스터 끝나는 시간 (저장 안 함)
let boosterReady = 0; // 부스터를 다시 살 수 있는 시간 (쿨타임)

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

  deerSprite.nod(big ? 1.5 : 1); // 고개 꾸벅 (홈런·크리티컬이면 더 크게)
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
  const price = 5 + 3 * Math.pow(game.level, 1.9);
  return Math.floor(price * getSmithRate());
};

// quiet : 꾹 누르기 중이면 true (열매 부족 알림창 안 띄움)
// 성공하면 true, 실패하면 false 를 돌려줌 (꾹 누르기가 멈출지 판단)
function upgradeDeer(quiet) {
  if (game.level >= MAX_LEVEL) {
    if (!quiet) alert("이미 만렙입니다!");
    return false;
  }
  if (!spend(getUpgradePrice(), quiet)) return false;

  game.level++;
  render();
  return true;
}

// ---------- 3.1 동료 12마리 ----------
// type
// auto   : 초당 열매 +value (레벨마다)
// click  : 클릭당 열매 +value (레벨마다)
// homerun: 클릭 시 value% 확률로 10배 (최대 50%, 확률이라 더하기)
// smith  : 강화·동료·펫 비용 × (1 - value%) 를 레벨마다 곱함 (곱연산, 최소 10%)
// newton : 모든 생산량 × (1 + value%) 를 레벨마다 곱함 (곱연산)
// sleep  : 오프라인 보상 × (1 + value%) 를 레벨마다 곱함 (곱연산)
const memberList = [
  {
    name: "엄마고라니",
    type: "auto",
    value: 1,
    price: 50,
    text: "애들 영양실조 걸리겠다! 자식 고라니들에게 먹일 사과가 부족해지자 주방용 뒤집개를 들고 직접 나무를 털러 나온 생활력 만렙 엄마.",
  },
  {
    name: "태권도 고라니",
    type: "click",
    value: 2,
    price: 150,
    text: "발차기로 나무를 침",
  },
  {
    name: "상인고라니",
    type: "auto",
    value: 5,
    price: 500,
    text: "돈 벌려고 옴",
  },
  {
    name: "나무꾼 고라니",
    type: "auto",
    value: 12,
    price: 1500,
    text: "나무를 베지 않고 때림",
  },
  {
    name: "잠자는고라니",
    type: "sleep",
    value: 20,
    price: 4000,
    text: "자고 있어도 열매가 나옴",
  },
  {
    name: "선생고라니",
    type: "click",
    value: 20,
    price: 10000,
    text: "고라니 학생들을 지킴",
  },
  {
    name: "외계인고라니",
    type: "auto",
    value: 80,
    price: 30000,
    text: "지구 침공하러 왔다가 도와줌",
  },
  {
    name: "소방관고라니",
    type: "auto",
    value: 200,
    price: 80000,
    text: "기후 위기 대응",
  },
  {
    name: "대장장이 고라니",
    type: "smith",
    value: 5,
    price: 150000,
    text: "장비 제작",
  },
  {
    name: "야구선수 고라니",
    type: "homerun",
    value: 2,
    price: 300000,
    text: "한 번에 엄청난 열매 획득",
  },
  {
    name: "중장비 기사 고라니",
    type: "auto",
    value: 1000,
    price: 600000,
    text: "포크레인으로 나무 흔듦",
  },
  {
    name: "뉴턴 고라니",
    type: "newton",
    value: 10,
    price: 1000000,
    text: "최적의 타격점 계산",
  },
];

// 동료 가격 : 레벨업할수록 1.2배씩 (곱연산) × 대장장이 할인
const getMemberPrice = (i) =>
  Math.floor(
    memberList[i].price * Math.pow(1.2, game.members[i]) * getSmithRate(),
  );

// 특정 type 동료들의 효과 합 (value × 동료 레벨)
const getMemberSum = (type) => {
  let sum = 0;
  memberList.forEach((m, i) => {
    if (m.type === type) sum += m.value * game.members[i];
  });
  return sum;
};

// % 동료 효과 곱연산 : (1 + value%) 를 동료 레벨만큼 곱함
// 예) 뉴턴 Lv.3 → 1.1 × 1.1 × 1.1 = 1.331배
//    (더하기였다면 1 + 0.3 = 1.3배 → 레벨이 높을수록 차이가 커짐)
const getMemberPower = (type) => {
  let power = 1;
  memberList.forEach((m, i) => {
    if (m.type === type) power *= Math.pow(1 + m.value / 100, game.members[i]);
  });
  return power;
};

// 영입한 동료 수 (마술 모자 스킨 조건)
const getMemberCount = () => game.members.filter((lv) => lv > 0).length;

// 동료 효과 설명
const getMemberEffectText = (m) => {
  switch (m.type) {
    case "auto":
      return `초당 열매 +${m.value}`;
    case "click":
      return `클릭당 열매 +${m.value}`;
    case "homerun":
      return `홈런 확률 +${m.value}%`;
    case "smith":
      return `강화·동료·펫 비용 ×${1 - m.value / 100}씩`;
    case "newton":
      return `모든 생산량 ×${1 + m.value / 100}씩`;
    case "sleep":
      return `오프라인 보상 ×${1 + m.value / 100}씩`;
  }
};

function buyMember(i, quiet) {
  if (!spend(getMemberPrice(i), quiet)) return false;
  game.members[i]++;
  if (game.members[i] === 1) playStory(`member_${i}`); // 처음 영입하면 컷씬
  render();
  return true;
}

// ---------- 3.2 펫 ----------
const petList = [
  {
    name: "병아리",
    type: "click",
    bonus: 10,
    price: 500,
    text: "클릭 열매 +10%",
  },
  {
    name: "람쥐",
    type: "auto",
    bonus: 15,
    price: 1000,
    text: "초당 열매 +15%",
  },
  {
    name: "부엉이",
    type: "auto",
    bonus: 30,
    price: 50000,
    text: "밤에도 열매 수확, 초당 열매 +30%",
  },
];

// 펫 배율 곱연산 (type : "click" 또는 "auto")
// 예) 람쥐 + 부엉이 → 1.15 × 1.3 = 1.495배
const getPetPower = (type) => {
  let power = 1;
  petList.forEach((pet, i) => {
    if (game.pets[i] && pet.type === type) power *= 1 + pet.bonus / 100;
  });
  return power;
};

// 펫 가격 × 대장장이 할인
const getPetPrice = (i) => Math.floor(petList[i].price * getSmithRate());

function buyPet(i) {
  if (game.pets[i]) return;
  if (!spend(getPetPrice(i))) return;
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
// sprite : 스킨 고라니 그림 (skins.js 의 SKIN_IMAGES, 원본은 assets/skins 폴더)
//          → 움직이는 고라니 그림 자체를 바꿔서, 모자·망토도 같이 움직임
// icon   : sprite 가 없는 스킨은 이 이모지를 머리 위에 얹음 (헤드폰은 아직 그림 없음)
// thumb  : 스킨 탭에 보여줄 작은 그림
const SK = "assets/skins/";
const skinList = [
  { name: "기본", text: "기본", thumb: "deer.png", check: () => true },
  {
    name: "마술 모자",
    text: "동료 3명 영입",
    sprite: SKIN_IMAGES.magic_hat,
    thumb: SK + "magic_hat.png",
    check: () => getMemberCount() >= 3,
  },
  {
    name: "선글라스",
    text: "Lv.100",
    sprite: SKIN_IMAGES.sunglasses,
    thumb: SK + "sunglasses.png",
    check: () => game.level >= 100,
  },
  {
    name: "빨간 목도리",
    text: "총 열매 1000",
    sprite: SKIN_IMAGES.red_scarf,
    thumb: SK + "red_scarf.png",
    check: () => game.totalBerry >= 1000,
  },
  {
    name: "밀짚모자",
    text: "클릭 10,000회",
    sprite: SKIN_IMAGES.straw_hat,
    thumb: SK + "straw_hat.png",
    check: () => game.clickCount >= 10000,
  },
  {
    name: "안전모",
    text: "Lv.300",
    sprite: SKIN_IMAGES.helmet,
    thumb: SK + "helmet.png",
    check: () => game.level >= 300,
  },
  {
    name: "헤드폰",
    text: "Lv.500",
    sprite: SKIN_IMAGES.headphones,
    thumb: SK + "headphones.png",
    check: () => game.level >= 500,
  },
  {
    name: "황금 고라니",
    text: "Lv.800 만렙",
    sprite: SKIN_IMAGES.gold,
    thumb: SK + "gold.png",
    check: () => game.level >= MAX_LEVEL,
  },
];

const SKIN_PAD = 100; // 스킨 그림 둘레 여백 (skins.js 참고)

// 움직이는 고라니에 스킨 입히기 (스킨이 바뀔 때만 실행)
function applySkin(skin) {
  deerSprite.setSrc(skin.sprite, SKIN_PAD); // sprite 가 없으면 기본 고라니
  document.getElementById("skin-icon").innerText = skin.icon || "";
}

function selectSkin(i) {
  const skin = skinList[i];
  if (!skin.check()) return alert(`잠금 조건: ${skin.text}`);
  game.skin = skin.name;
  render();
}

// ---------- 6. 맵 ----------
// needLevel : 해금 레벨 / bonus : 모든 열매 배율
// bg     : 맵 배경 그림 (assets/maps 폴더)
// ground : 배경 그림에서 땅 높이 (위에서부터 %). 고라니 발이 여기에 닿음
//          → 고라니가 떠 보이면 숫자를 키우고, 땅에 파묻히면 줄이기
// filter : 배경 그림을 못 불러왔을 때, 기본 숲 그림에 입힐 색감
const FOREST_BG = "assets/maps/forest.jpg";
const ISTOCK_FOREST =
  "https://media.istockphoto.com/id/1326389468/vector/beautiful-sunlit-forest.jpg?s=612x612&w=0&k=20&c=ik0tGlKOhIY4w85MvSnhgF05MogXxP2CDDBbHb-d57M=";
const MP = "assets/maps/";

const mapList = new Map();
mapList.set("숲", {
  needLevel: 1,
  bonus: 1,
  text: "중앙에 큰 나무 하나, 옆에는 풀숲",
  bg: ISTOCK_FOREST, // 첫 번째 맵은 원래 쓰던 숲 그림
  ground: 88,
  filter: "none",
});
mapList.set("하늘 위", {
  needLevel: 100,
  bonus: 1.5,
  text: "큰 나무의 윗부분",
  bg: MP + "sky.jpg",
  ground: 79,
  filter: "hue-rotate(160deg) brightness(1.2)",
});
mapList.set("개발 지역", {
  needLevel: 300,
  bonus: 2,
  text: "인간들이 숲을 개발하는 지역",
  bg: MP + "dev.jpg",
  ground: 84,
  filter: "sepia(0.8) saturate(0.7)",
});
mapList.set("인간 도시", {
  needLevel: 500,
  bonus: 3,
  text: "고라니들의 첫 도시 진출",
  bg: MP + "city.jpg",
  ground: 90,
  filter: "grayscale(1) contrast(1.1)",
});
mapList.set("숲 깊은 곳", {
  needLevel: MAX_LEVEL,
  bonus: 5,
  text: "최종 사건",
  bg: MP + "deep_forest.jpg",
  ground: 80,
  filter: "brightness(0.45) saturate(1.3)",
});

// 지금 화면에 보이는 맵 배경 주소 (컷씬에서 img: "map" 일 때 사용)
const getMapBg = () => document.getElementById("background-img").src;
const getMapGround = () => {
  // 배경을 못 불러와서 기본 숲 그림(forest.jpg)으로 바뀐 경우엔 그 그림의 땅 높이
  if (document.getElementById("background-img").dataset.fallback === "1")
    return 82;
  return mapList.get(game.map).ground;
};

// 배경 높이(px) : 화면 맨 위 ~ 탭 버튼 바로 위까지 (main.html 의 #background-img 와 같게)
const BG_HEIGHT = 260;
// 메인 화면(tab-main)이 배경 위에서 시작하는 높이 (padding 10 + margin 40)
const MAIN_TOP = 50;
// 고라니 그림(150px) 안에서 발바닥 위치 (deer-move.js : (915 + 40) / 1000)
const DEER_FEET = 150 * 0.955;

// 고라니 발을 배경의 땅 높이에 맞추기
function placeDeer() {
  const groundY = (BG_HEIGHT * getMapGround()) / 100; // 배경에서 땅의 y 좌표
  document.getElementById("deer-box").style.top =
    `${groundY - MAIN_TOP - DEER_FEET}px`;
  renderCrew(); // 땅 높이가 바뀌면 동료들 위치도 다시
}

// ---------- 배경에 서 있는 동료들 ----------
// 고라니 양옆에 2줄로 서 있음 (왼쪽 3명 + 오른쪽 3명) × 2줄
// x     : 가로 위치 (메인 화면 왼쪽에서 px, 동료 그림의 가운데 기준)
// back  : true 면 뒷줄 (살짝 위에 서고 앞줄보다 먼저 그려져서 뒤에 보임)
// 화면 밖으로 잘리지 않게 바깥쪽 동료는 안쪽으로 붙여 둠
const CREW_SLOTS = [
  { x: 62, back: false }, // 0 엄마고라니
  { x: 256, back: false }, // 1 태권도 고라니
  { x: 100, back: false }, // 2 상인고라니
  { x: 294, back: false }, // 3 나무꾼 고라니
  { x: 82, back: true }, // 4 잠자는고라니
  { x: 276, back: true }, // 5 선생고라니
  { x: 24, back: false }, // 6 외계인고라니
  { x: 331, back: false }, // 7 소방관고라니
  { x: 118, back: true }, // 8 대장장이 고라니
  { x: 240, back: true }, // 9 야구선수 고라니
  { x: 40, back: true }, // 10 중장비 기사 고라니 (포크레인이라 그림이 넓음)
  { x: 314, back: true }, // 11 뉴턴 고라니
];
const CREW_HEIGHT = 54; // 동료 키(px) : 앞줄 뒷줄 모두 같은 크기
const CREW_BIG = { 10: 1.2 }; // 포크레인은 고라니가 작게 보여서 그림을 조금 더 크게
const CREW_BACK_UP = 38; // 뒷줄은 앞줄보다 이만큼 위에 섬(px)

function renderCrew() {
  const groundY = (BG_HEIGHT * getMapGround()) / 100 - MAIN_TOP; // 메인 화면 안에서 땅 높이
  let back = "";
  let front = "";
  memberList.forEach((m, i) => {
    if (game.members[i] === 0) return; // 영입 안 한 동료는 안 보임
    const slot = CREW_SLOTS[i];
    const h = CREW_HEIGHT * (CREW_BIG[i] || 1);
    const feet = slot.back ? groundY - CREW_BACK_UP : groundY + 2;
    const flip = slot.x < 178 ? "flip" : ""; // 왼쪽 동료는 고라니(가운데) 쪽을 보게
    const html = `
      <div class="crew-member ${flip}" style="left: ${slot.x}px; top: ${feet - h}px; height: ${h}px; animation-delay: -${i * 0.37}s;">
        <img src="assets/chars/member_${i}.png" alt="${m.name}">
      </div>`;
    if (slot.back) back += html;
    else front += html;
  });
  setHTML("crew", back + front); // 뒷줄을 먼저 → 앞줄이 위에 겹쳐 보임
}

// 레벨이 조건에 닿은 맵은 해금 컷씬 보여주기 (숲은 인트로가 대신함)
function checkMapUnlock() {
  mapList.forEach((info, name) => {
    if (name !== "숲" && game.level >= info.needLevel) playStory(`map_${name}`);
  });
}

function moveMap(name) {
  const { needLevel } = mapList.get(name); // 구조 분해 할당
  if (game.level < needLevel)
    return alert(`Lv.${needLevel} 이상만 이동할 수 있습니다.`);
  game.map = name;
  render();
}

// ---------- 상점 ----------
const BOOSTER_TIME = 30; // 부스터 지속 시간 (초)

const BOOSTER_COOLDOWN = 120; // 쿨타임 (초) : 구매한 때부터 2분 뒤에 다시 구매 가능

const isBoosterOn = () => Date.now() < boosterEnd;
const getBoosterCooldown = () =>
  Math.max(0, Math.ceil((boosterReady - Date.now()) / 1000));

// 초 → "1:05"
const fmtTime = (sec) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

// 하이퍼 부스터 가격 : 최소 500, 초당 열매가 많아지면 같이 비싸짐
const getBoosterPrice = () => Math.max(500, getAutoBerry() * 20);

// 부스터 가격 : 최소 100, 클릭당 열매에 따라 비싸짐
const getJuhoPrice = () => Math.max(100, getClickBerry() * 20);

function buyBooster() {
  if (isBoosterOn()) return alert("이미 부스터 사용중입니다.");
  if (getBoosterCooldown() > 0)
    return alert(`쿨타임 ${fmtTime(getBoosterCooldown())} 남았어요.`);
  if (!spend(getBoosterPrice())) return;
  boosterEnd = Date.now() + BOOSTER_TIME * 1000;
  boosterReady = Date.now() + BOOSTER_COOLDOWN * 1000;
  render();
}

function buyJuho() {
  const price = getJuhoPrice();
  if (!spend(price)) return;

  // 30% 확률로 꽝, 아니면 가격의 0.5 ~ 3배
  if (getRandomInteger(1, 100) <= 30) {
    alert("김진수가 열매를 들고 도망갔다... (꽝)");
  } else {
    const prize = getRandomInteger(Math.floor(price / 2), price * 3);
    addBerry(prize);
    alert(`이주호가 열매 ${fmt(prize)}개를 가져왔다!`);
  }
  render();
}

// ---------- 움직이는 고라니 (deer-sprite.js) ----------
const deerSprite = DeerSprite.create(document.getElementById("deer-canvas"));
// 스킨 아이콘이 머리를 따라 움직이게 (190, 205 = 그림에서 머리 꼭대기 위치)
deerSprite.attachToHead(document.getElementById("skin-icon"), 190, 205);

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

// 열매 쓰기 : 모자라면 false (quiet 면 알림창 안 띄움)
const spend = (price, quiet) => {
  if (game.berry < price) {
    if (!quiet) alert(`열매가 부족합니다! (필요: ${fmt(price)})`);
    return false;
  }
  game.berry -= price;
  return true;
};

const getMapBonus = () => mapList.get(game.map).bonus;
// 대장장이 : 강화 비용 배율 (0.95 × 0.95 × ... , 최소 0.1 = 90% 할인)
const getSmithRate = () => Math.max(getMemberPowerDown("smith"), 0.1);
const getHomerunChance = () => Math.min(getMemberSum("homerun"), 50); // 최대 50%

// 깎는 효과 곱연산 : (1 - value%) 를 동료 레벨만큼 곱함
function getMemberPowerDown(type) {
  let rate = 1;
  memberList.forEach((m, i) => {
    if (m.type === type) rate *= Math.pow(1 - m.value / 100, game.members[i]);
  });
  return rate;
}

// 공통 배율 = 맵 × 뉴턴 × 부스터 (전부 곱하기)
const getMultiplier = () => {
  let value = getMapBonus() * getMemberPower("newton");
  if (isBoosterOn()) value *= 2;
  return value;
};

// 클릭당 열매 = (레벨 + 클릭 동료) × 펫 × 공통 배율
const getClickBerry = () => {
  const base = game.level + getMemberSum("click");
  return Math.floor(base * getPetPower("click") * getMultiplier());
};

// 초당 열매 = 자동 동료 × 펫 × 공통 배율
const getAutoBerry = () => {
  const base = getMemberSum("auto");
  return Math.floor(base * getPetPower("auto") * getMultiplier());
};

// ---------- 꾹 누르기 (강화·동료 버튼) ----------
// 누르고 있으면 처음엔 천천히, 점점 빠르게 반복
// action(quiet) 이 false 를 돌려주면 (열매 부족, 만렙) 멈춤
let holdTimer = null;

function startHold(event, action) {
  if (event.button !== 0) return; // 왼쪽 클릭(또는 터치)만
  stopHold();
  if (!action(false)) return; // 첫 번째는 그냥 클릭처럼 (부족하면 알림)

  let delay = 400; // 0.4초 기다렸다가 반복 시작
  const repeat = () => {
    if (!action(true)) return stopHold();
    delay = Math.max(30, delay * 0.8); // 반복할수록 빨라짐 (최대 0.03초 간격)
    holdTimer = setTimeout(repeat, delay);
  };
  holdTimer = setTimeout(repeat, delay);
}

function stopHold() {
  clearTimeout(holdTimer);
  holdTimer = null;
}

// 손을 떼면 어디서든 멈춤 (버튼 밖에서 떼도)
document.addEventListener("pointerup", stopHold);
document.addEventListener("pointercancel", stopHold);
window.addEventListener("blur", stopHold);

// ---------- 탭 전환 (HTML 에서 옮겨옴) ----------
// 열려 있는 탭 버튼을 한 번 더 누르면 창을 닫고 홈으로
function openTab(tabId, btnElement) {
  const target = document.getElementById(tabId);
  if (btnElement && target.classList.contains("active")) {
    tabId = "tab-main";
    btnElement = null;
  }

  const screens = document.querySelectorAll(".game-screen");
  screens.forEach((screen) => screen.classList.remove("active"));

  const buttons = document.querySelectorAll(".tab-group button");
  buttons.forEach((btn) => btn.classList.remove("active-btn"));

  document.getElementById(tabId).classList.add("active");
  if (tabId === "tab-main") placeDeer(); // 홈이 다시 보일 때 고라니 위치 맞추기

  if (btnElement) {
    btnElement.classList.add("active-btn");
  }
}

// ---------- 7. 저장 (localStorage) ----------
const SAVE_KEY = "water_deer_save"; // 브라우저에 저장할 이름

function saveGame() {
  game.lastTime = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

// 저장 데이터를 game 에 넣기 : 없는 값은 기본값, 배열 길이도 맞춤
// (옛날 세이브라 값이 빠져 있어도 안 깨지게)
function applySave(data) {
  const base = NewGame();
  game = { ...base, ...data };
  game.members = base.members.map((v, i) => Number(data.members?.[i]) || 0);
  game.pets = base.pets.map((v, i) => Boolean(data.pets?.[i]));
  game.seenStory = Array.isArray(data.seenStory) ? data.seenStory : [];
  if (!mapList.has(game.map)) game.map = "숲";
  if (!skinList.some((s) => s.name === game.skin)) game.skin = "기본";
}

// 시작할 때 저장된 데이터 불러오기 + 오프라인 보상
function loadGame() {
  const text = localStorage.getItem(SAVE_KEY);
  if (!text) return;
  try {
    applySave(JSON.parse(text));
    giveOfflineReward();
  } catch (e) {
    console.log("저장 데이터가 깨져서 새로 시작합니다.", e);
  }
}

setInterval(saveGame, 5000); // 5초마다 자동 저장
window.addEventListener("beforeunload", saveGame); // 창 닫을 때도 저장

// ---------- 오프라인 보상 ----------
// 마지막 접속 시간(lastTime)과 지금 시간을 비교해서
// 게임을 꺼 둔 동안 모였을 열매를 줌 = 초당 열매 × 지난 시간(초) × 잠자는고라니 배율
const OFFLINE_MAX_HOURS = 8; // 최대 8시간까지만 쳐 줌
const OFFLINE_MIN_SEC = 60; // 1분 안에 다시 켜면 보상 없음

function giveOfflineReward() {
  const passed = Math.floor((Date.now() - game.lastTime) / 1000); // 지난 시간(초)
  if (passed < OFFLINE_MIN_SEC) return;

  const sec = Math.min(passed, OFFLINE_MAX_HOURS * 60 * 60);
  const sleep = getMemberPower("sleep"); // 잠자는고라니 배율 (곱연산)
  const reward = Math.floor(getAutoBerry() * sec * sleep);
  if (reward <= 0) return; // 초당 열매가 없으면 보상도 없음

  addBerry(reward); // 바로 넣어 둠 (창을 그냥 닫아도 보상은 받은 것)
  game.lastTime = Date.now();
  showOfflinePopup(passed, sec, reward, sleep);
}

// 초 → "2시간 13분"
function fmtDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

function showOfflinePopup(passed, sec, reward, sleep) {
  let text = `자리를 비운 ${fmtDuration(passed)} 동안`;
  if (passed > sec) text += `\n(최대 ${OFFLINE_MAX_HOURS}시간까지만 쳐 줘요)`;
  document.getElementById("offline-time").innerText = text;
  document.getElementById("offline-reward").innerText = `열매 +${fmt(reward)}`;
  document.getElementById("offline-sleep").innerText =
    sleep > 1 ? `잠자는고라니 보너스 ×${sleep.toFixed(2)}` : "";
  document.getElementById("offline-popup").classList.add("show");
}

function closeOfflinePopup() {
  document.getElementById("offline-popup").classList.remove("show");
}

// ---------- 8. JSON 내보내기 / 불러오기 ----------
// 내보내기 : game 을 JSON 파일로 다운로드
function exportSave() {
  saveGame();
  const json = JSON.stringify(game, null, 2); // 보기 좋게 줄바꿈
  const blob = new Blob([json], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  a.download = `water_deer_save_${date}.json`; // 파일 이름에 한글을 쓰면 이름이 깨지는 브라우저가 있어서 영어로
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000); // 다운로드가 시작된 뒤에 정리
}

// 불러오기 버튼 : 숨겨진 파일 선택창 열기
function importSave() {
  document.getElementById("save-file").click();
}

// 파일을 고르면 실행됨
function onSaveFile(input) {
  const file = input.files[0];
  input.value = ""; // 같은 파일을 다시 골라도 실행되게
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (typeof data !== "object" || data.level === undefined)
        throw new Error("세이브 파일 아님");
      applySave(data);
      saveGame();
      refreshAll();
      alert(`불러오기 완료! (Lv.${game.level}, 열매 ${fmt(game.berry)})`);
    } catch (e) {
      alert("세이브 파일이 아니거나 깨진 파일이에요.");
    }
  };
  reader.readAsText(file);
}

// ---------- 9. 데이터 초기화 ----------
// 실수로 누르지 않게 두 번 물어봄
function resetGame() {
  if (!confirm("정말 데이터를 초기화할까요?\n모든 진행 상황이 사라져요."))
    return;
  if (!confirm("마지막으로 확인할게요.\n되돌릴 수 없어요. 정말 초기화할까요?"))
    return;

  localStorage.removeItem(SAVE_KEY);
  game = NewGame();
  boosterEnd = 0;
  boosterReady = 0;
  refreshAll();
  openTab("tab-main", null);
  alert("초기화했어요. 처음부터 시작합니다!");
  playStory("intro");
}

// 불러오기·초기화 뒤 : 화면을 처음부터 다시 그리기
function refreshAll() {
  for (const key in lastHtml) delete lastHtml[key]; // 목록 다시 그리게
  document.getElementById("deer-box").dataset.skin = ""; // 스킨 다시 입히게
  document.getElementById("background-img").dataset.map = ""; // 배경 다시 불러오게
  render();
}

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

  checkMapUnlock(); // 맵 해금 컷씬 확인
}

// 메인 : 스킨, 배경, 정보
function renderMain() {
  // 스킨 : 바뀌었을 때만 고라니 그림 교체
  const skin = skinList.find((s) => s.name === game.skin);
  const deerBox = document.getElementById("deer-box");
  if (deerBox.dataset.skin !== skin.name) {
    deerBox.dataset.skin = skin.name;
    applySkin(skin);
  }

  // 맵 배경 : 맵이 바뀌었을 때만 그림 교체, 그림이 없으면 기본 숲 + 색감
  const map = mapList.get(game.map);
  const bgImg = document.getElementById("background-img");
  if (bgImg.dataset.map !== game.map) {
    bgImg.dataset.map = game.map;
    bgImg.style.filter = "none";
    bgImg.dataset.fallback = "0";
    bgImg.onerror = () => {
      bgImg.onerror = null;
      bgImg.src = FOREST_BG;
      bgImg.style.filter = map.filter;
      bgImg.dataset.fallback = "1";
      placeDeer();
    };
    bgImg.src = map.bg;
    placeDeer();
  }

  renderCrew(); // 새로 영입한 동료가 있으면 배경에 추가 (바뀐 게 없으면 그대로)

  let info = `Lv.${game.level} · ${game.map}`;
  if (isBoosterOn()) info += " · 🔥2배"; // 자리가 좁아서 짧게
  document.getElementById("deer-info").innerText = info;
}

// 2. 강화 탭
function renderUpgrade() {
  const isMax = game.level >= MAX_LEVEL;
  const btn = document.getElementById("upgrade-btn");

  document.getElementById("upgrade-level").innerText =
    `고라니 Lv. ${game.level}` + (isMax ? " (MAX)" : "");
  document.getElementById("upgrade-desc").innerText =
    `클릭당 열매 ${fmt(getClickBerry())}`;
  btn.innerHTML = isMax ? "만렙" : `강화하기<br>열매 ${fmt(getUpgradePrice())}`;
  btn.disabled = isMax || game.berry < getUpgradePrice();
}

// % 동료는 지금 총 효과도 보여주기 : (지금 ×1.33)
function getMemberNowText(m, lv) {
  if (lv === 0) return "";
  if (m.type === "newton" || m.type === "sleep") {
    return ` (지금 ×${Math.pow(1 + m.value / 100, lv).toFixed(2)})`;
  }
  if (m.type === "smith") {
    return ` (지금 ×${Math.max(Math.pow(1 - m.value / 100, lv), 0.1).toFixed(2)})`;
  }
  return "";
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
          <span>${getMemberEffectText(m)}${getMemberNowText(m, lv)}</span>
          <span class="desc">${m.text}</span>
        </div>
        <button class="btn-action hold-btn" onpointerdown="startHold(event, (q) => buyMember(${i}, q))" ${disabled}>${btnText}<br>${fmt(price)}</button>
      </div>`;
  });
  setHTML("tab-member", html);
}

// 3.2 펫 탭
function renderPet() {
  let html = "";
  petList.forEach((p, i) => {
    const have = game.pets[i];
    const price = getPetPrice(i);
    const btnText = have ? "보유중" : `구매<br>${fmt(price)}`;
    const disabled = have || game.berry < price ? "disabled" : "";

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
    const open = s.check(); // 해금됐는지
    let btnText = `🔒 ${s.text}`;
    if (game.skin === s.name) btnText = "적용중";
    else if (open) btnText = "적용";

    // 해금 전에는 그림을 검은 실루엣으로, 이름은 ??? 로 가림
    const imgStyle = open ? "" : "filter: brightness(0); opacity: 0.35;";
    html += `
      <div class="skin-card">
        <img src="${s.thumb}" alt="스킨" style="height: 48px; ${imgStyle}">
        <span>${open ? s.name : "???"}</span>
        <button class="btn-action" style="width: 100%; padding: 4px;" onclick="selectSkin(${i})">${btnText}</button>
      </div>`;
  });
  setHTML("skin-grid", html);
}

// 6. 맵 탭
function renderMap() {
  const now = mapList.get(game.map);
  setHTML(
    "map-current",
    `
    ${game.map} (선택됨 · 열매 x${now.bonus})
    <p style="font-size: 11px; font-weight: normal; margin-top: 4px;">${now.text}</p>`,
  );

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
    document.getElementById("booster-desc").innerText =
      `사용중! 남은 시간 ${left}초`;
    boosterBtn.innerHTML = "사용중";
    boosterBtn.disabled = true;
  } else if (getBoosterCooldown() > 0) {
    // 쿨타임 중
    document.getElementById("booster-desc").innerText =
      `쿨타임 ${fmtTime(getBoosterCooldown())} 남음`;
    boosterBtn.innerHTML = "쿨타임";
    boosterBtn.disabled = true;
  } else {
    document.getElementById("booster-desc").innerText =
      `${BOOSTER_TIME}초 동안 모든 열매 2배 (쿨타임 2분)`;
    boosterBtn.innerHTML = `구매<br>${fmt(getBoosterPrice())}`;
    boosterBtn.disabled = game.berry < getBoosterPrice();
  }

  const juhoBtn = document.getElementById("juho-btn");
  juhoBtn.innerHTML = `구매<br>${fmt(getJuhoPrice())}`;
  juhoBtn.disabled = game.berry < getJuhoPrice();
}

loadGame(); // 저장된 데이터가 있으면 불러오기
render(); // 처음 한 번 그리기
playStory("intro"); // 처음 시작 컷씬 (이미 봤으면 안 나옴)

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
