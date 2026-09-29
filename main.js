// 기본 설정
const MAX_LEVEL = 800; // 만렙
const NewGame = () => ({
  berry: 0, // 현재 열매
  totalBerry: 0, // 지금까지 번 총량
  clickCount: 0, // 클릭 횟수
  level: 1, // 고라니 레벨
  members: new Array(12).fill(0), // 동료 레벨 (0 = 아직 영입 안 함)
  pets: [false, false], // 펫 보유 여부
  skin: "기본", // 적용중인 스킨
  map: "숲", // 현재 맵
  bgm: true,
  sfx: true,
  lastTime: Date.now(), // 마지막 접속 시간 (오프라인 보상용)
});
let game = NewGame();

// ---------- 2. 강화 ----------

// 3.1 동료 12마리
// type
// auto   : 초당 열매 +value (레벨마다)
// click  : 클릭당 열매 +value (레벨마다)
// homerun: 클릭 시 value% 확률로 10배
// smith  : 강화 비용 -value% (최대 50%)
// newton : 모든 생산량 +value%
// sleep  : 오프라인 보상 +value%
const memberList = [
  {
    name: "엄마고라니",
    type: "auto",
    value: 1,
    price: 50,
    text: "생활력 만렙",
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
];

// ---------- 5. 스킨 ----------

const skinList = [
  { name: "기본", text: "기본", check: () => true },
  {
    name: "마술 모자",
    text: "동료 3명 영입",
    check: () => getMemberCount() >= 3,
  },
  { name: "선글라스", text: "Lv.100", check: () => game.level >= 100 },
  {
    name: "빨간 목도리",
    text: "총 열매 1000",
    check: () => game.totalBerry >= 1000,
  },
  {
    name: "밀짚모자",
    text: "클릭 10,000회",
    check: () => game.clickCount >= 10000,
  },
  { name: "안전모", text: "Lv.300", check: () => game.level >= 300 },
  { name: "헤드폰", text: "Lv.500", check: () => game.level >= 500 },
  {
    name: "황금 고라니",
    text: "Lv.800 만렙",
    check: () => game.level >= MAX_LEVEL,
  },
];

// ---------- 6. 맵 ----------

const mapList = new Map();
mapList.set("숲", {
  needLevel: 1,
  bonus: 1,
  text: "중앙에 큰 나무 하나, 옆에는 풀숲",
});
mapList.set("하늘 위", {
  needLevel: 100,
  bonus: 1.5,
  text: "큰 나무의 윗부분",
});
mapList.set("개발 지역", {
  needLevel: 300,
  bonus: 2,
  text: "인간들이 숲을 개발하는 지역",
});
mapList.set("인간 도시", {
  needLevel: 500,
  bonus: 3,
  text: "고라니들의 첫 도시 진출",
});
mapList.set("숲 깊은 곳", {
  needLevel: MAX_LEVEL,
  bonus: 5,
  text: "최종 사건",
});

// ---------- HTML 요소 ----------
const berry_box = document.getElementById("berry");
const click_berry_box = document.querySelector("#click_berry .value");
const auto_berry_box = document.querySelector("#auto_berry .value");
const sum_berry_box = document.querySelector("#sum_berry .value");

// ---------- 계산 함수 ----------
const getClickBerry = () => game.level; // 클릭당 열매 = 레벨\

// ---------- 고라니 클릭 & 이펙트 ----------

function clickDeer(event) {
  const amount = getClickBerry();
  game.berry += amount; // 현재 열매
  game.totalBerry += amount; // 총 생산량
  game.clickCount++; // 클릭 횟수 (스킨용)
  render(); // 화면 숫자 렌더
}

// ---------- 저장 (localStorage) ----------

// ---------- 오프라인 보상 ----------

// ---------- 설정 : JSON 파일 내보내기 / 불러오기 ----------

// ---------- 화면 적용 ----------
function render() {
  berry_box.innerText = `열매 ${game.berry}`;
  click_berry_box.innerText = getClickBerry();
  sum_berry_box.innerText = game.totalBerry;
}

render();
