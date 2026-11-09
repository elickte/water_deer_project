// =====================================================
// 고라니 키우기 - story.js
// 컷씬(스토리) 대사 + 컷씬 보여주는 기능
// main.js 보다 먼저 불러와야 함
// =====================================================

// ---------- 컷씬 대사 ----------
// 한 장면 = { img, char, name, text }
//  img  : 장면 그림 (생략하면 앞 장면 그림 유지, "map" 이면 지금 맵 배경)
//         ["a.png", "b.jpg"] 처럼 배열이면 앞 그림이 없을 때 다음 그림을 대신 씀
//  char : 캐릭터 그림 (투명 PNG, 생략하면 앞 장면 유지, "" 이면 숨김)
//  name : 말하는 사람 (생략하면 나레이션)
//  text : 대사
const S = "assets/story/"; // 장면 그림 폴더
const C = "assets/chars/"; // 캐릭터 그림 폴더
const HERO = "deer.png"; // 주인공 = 지금 고라니 그림 그대로 사용

const storyList = {
  // ===== 처음 시작 =====
  intro: [
    { img: S + "intro_1.jpg", char: "", text: "옛날 옛적, 사람들이 잘 모르는 깊은 숲에 고라니들이 살고 있었어요." },
    { text: "숲 한가운데에는 사과가 주렁주렁 열리는 커다란 나무가 있었죠." },
    { img: S + "intro_2.jpg", text: "그런데 어느 날, 숲 저편에서 '부릉부릉' 낯선 소리가 들려오기 시작했어요." },
    { char: HERO, name: "고라니", text: "뭐, 뭐야...? 저 노란 쇳덩어리는...?!" },
    { img: [S + "intro_3.png", S + "intro_2.jpg"], char: "", text: "인간들이 숲을 밀어내기 시작한 거예요. 나무가 쓰러질 때마다 고라니들의 먹을거리도 줄어들었어요." },
    { img: [S + "intro_4.png", S + "intro_1.jpg"], char: HERO, name: "고라니", text: "이대로는 안 돼... 내가 열매를 모아서 우리 숲을 지킬 거야!" },
    { char: "", text: "고라니를 톡톡 눌러 열매를 모으고, 동료를 모아 고라니 왕국을 키워 보세요!" },
  ],

  // ===== 동료 영입 (memberList 순서와 같음) =====
  member_0: [
    { img: "map", char: C + "member_0.png", name: "엄마고라니", text: "애들 영양실조 걸리겠다!!" },
    { text: "주방용 뒤집개를 든 엄마고라니가 직접 나무를 털러 나왔어요." },
    { name: "엄마고라니", text: "사과는 엄마가 책임진다. 너는 밥이나 잘 챙겨 먹어!" },
  ],
  member_1: [
    { img: "map", char: C + "member_1.png", name: "태권도 고라니", text: "얍!! 나무도 발차기 한 방이면 끝이지!" },
    { char: HERO, name: "고라니", text: "나, 나무 부러지면 안 돼요...!" },
    { char: C + "member_1.png", name: "태권도 고라니", text: "걱정 마라. 사과만 쏙 떨어뜨리는 정권 발차기다!" },
  ],
  member_2: [
    { img: "map", char: C + "member_2.png", name: "상인고라니", text: "열매가 모이는 곳이 여기라고? 흐흐, 돈 냄새가 나는군." },
    { char: HERO, name: "고라니", text: "같이 숲을 지켜 주실 거죠...?" },
    { char: C + "member_2.png", name: "상인고라니", text: "물론이지! ...대신 수수료는 쪼오끔 뗀다?" },
  ],
  member_3: [
    { img: "map", char: C + "member_3.png", name: "나무꾼 고라니", text: "나무는 베는 게 아니라, 쳐서 열매만 털어내는 거다." },
    { name: "나무꾼 고라니", text: "인간들의 무분별한 벌목, 더는 못 참는다. 참된 벌목 기술을 보여 주마!" },
  ],
  member_4: [
    { img: "map", char: C + "member_4.png", name: "잠자는고라니", text: "쿨... 쿨..." },
    { text: "한숨 자고 일어나 보니, 잠자던 숲이 통째로 밀려 있었어요." },
    { name: "잠자는고라니", text: "내 침대를 돌려줘... 도와줄게... 근데 자면서 해도 되지...?" },
    { char: "", text: "잠자는고라니는 게임을 꺼 둔 동안에도 열매를 모아 줘요." },
  ],
  member_5: [
    { img: "map", char: C + "member_5.png", name: "선생고라니", text: "얘들아, 줄 서! 숲이 위험하면 학교도 위험하다!" },
    { name: "선생고라니", text: "우리 고라니 학생들은 내가 지킨다. 선생님도 끼워 주렴." },
  ],
  member_6: [
    { img: "map", char: "", text: "갑자기 하늘에서 동그란 비행접시가 내려왔어요!" },
    { char: C + "member_6.png", name: "외계인고라니", text: "지구를 침공하러 왔는데... 어? 너 우리 먼 친척 아니냐?" },
    { name: "외계인고라니", text: "친척이 싸우는데 가만히 있을 순 없지. 침공은 다음에 하겠다!" },
  ],
  member_7: [
    { img: "map", char: C + "member_7.png", name: "소방관고라니", text: "요즘 기후 위기 때문에 산불이 잦아. 이럴 때일수록 모여야지!" },
    { name: "소방관고라니", text: "숲은 내가 지킨다. 물대포 준비 완료!" },
  ],
  member_8: [
    { img: "map", char: C + "member_8.png", name: "대장장이 고라니", text: "내 망치질 한 번이면 나무도 울고 갈 거다." },
    { name: "대장장이 고라니", text: "악력만 10년 키웠지. 이제 장비는 내가 만든다. 강화가 훨씬 싸질 거다!" },
  ],
  member_9: [
    { img: "map", char: "", text: "인간들의 야구장에 난입했다가 홈런 타격폼을 깨우친 고라니가 나타났어요." },
    { char: C + "member_9.png", name: "야구선수 고라니", text: "사과도 공이랑 똑같아. 제대로 맞히면... 홈런이다!" },
  ],
  member_10: [
    { img: "map", char: "", text: "공사장에 버려진 포크레인이 '부릉' 하고 움직이기 시작했어요." },
    { char: C + "member_10.png", name: "중장비 기사 고라니", text: "얼떨결에 운전석에 앉았는데... 어라, 이거 되네?" },
    { name: "중장비 기사 고라니", text: "숲을 밀던 이 포크레인, 이제는 나무 흔드는 데 쓴다!" },
  ],
  member_11: [
    { img: "map", char: "", text: "나무 아래서 졸던 고라니의 머리 위로... 사과 하나가 툭 떨어졌어요." },
    { char: C + "member_11.png", name: "뉴턴 고라니", text: "유레카!! 사과는 아래로 떨어진다... 즉, 최적의 타격점은 바로 여기다!" },
    { name: "뉴턴 고라니", text: "물리학으로 모든 생산량을 끌어올려 주지." },
  ],

  // ===== 맵 해금 (맵 이름과 같음) : 장면 그림은 그 맵 배경을 그대로 씀 =====
  "map_하늘 위": [
    { img: "assets/maps/sky.jpg", char: "", text: "큰 나무를 타고 끝까지 올라가 보니... 나무가 구름 위까지 닿아 있었어요!" },
    { char: HERO, name: "고라니", text: "여기 사과는 햇빛을 잔뜩 받아서 더 크고 달아!" },
    { char: "", text: "새 맵 '하늘 위'가 열렸어요! (모든 열매 x1.5)" },
  ],
  "map_개발 지역": [
    { img: "assets/maps/dev.jpg", char: "", text: "숲의 끝자락. 인간들이 나무를 베고 땅을 파헤치고 있었어요." },
    { char: HERO, name: "고라니", text: "여기가... 원래 우리 숲이었어." },
    { name: "고라니", text: "더는 물러서지 않을 거야. 여기서도 열매를 모으자!" },
    { char: "", text: "새 맵 '개발 지역'이 열렸어요! (모든 열매 x2)" },
  ],
  "map_인간 도시": [
    { img: "assets/maps/city.jpg", char: "", text: "고라니들이 처음으로 인간들의 도시에 발을 들였어요." },
    { char: HERO, name: "고라니", text: "빵빵! 시끄럽고 반짝반짝해... 그래도 가로수엔 열매가 열리네?" },
    { name: "고라니", text: "인간들에게 숲이 왜 소중한지 보여 주자!" },
    { char: "", text: "새 맵 '인간 도시'가 열렸어요! (모든 열매 x3)" },
  ],
  // 마지막 맵 = 엔딩
  "map_숲 깊은 곳": [
    { img: [S + "ending_1.png", "assets/maps/deep_forest.jpg"], char: "", text: "드디어 만렙이 된 고라니. 그때, 숲 가장 깊은 곳에서 빛이 새어 나왔어요." },
    { text: "그곳엔 처음 보는 거대한 사과나무, '숲의 심장'이 있었어요." },
    { img: [S + "ending_2.png", "assets/maps/deep_forest.jpg"], name: "숲의 목소리", text: "고라니야... 네가 모은 열매 덕분에 숲이 다시 숨을 쉬는구나." },
    { text: "고라니들이 키운 숲을 본 인간들도, 결국 개발을 멈추기로 했어요." },
    { img: [S + "ending_3.png", "assets/maps/forest.jpg"], char: HERO, name: "고라니", text: "우리 숲은... 우리가 지킨다!" },
    { char: "", text: "- 고라니 키우기 끝 -\n함께해 줘서 고마워요! 계속 플레이할 수 있어요." },
  ],
};

// 스토리 그림의 땅 높이 (위에서부터 %) : 캐릭터 발이 여기에 닿음
// 목록에 없는 그림은 82%
const STORY_GROUND = {
  "assets/story/intro_1.jpg": 82,
  "assets/story/intro_2.jpg": 82,
  "assets/maps/forest.jpg": 82,
  "assets/maps/sky.jpg": 79,
  "assets/maps/dev.jpg": 84,
  "assets/maps/city.jpg": 90,
  "assets/maps/deep_forest.jpg": 80,
};

// 캐릭터 발을 그림의 땅 높이에 맞추기
function placeStoryChar(ground) {
  const box = document.querySelector(".cut-char-box");
  box.style.bottom = `${100 - ground}%`;
  box.style.height = `${Math.min(72, ground - 6)}%`; // 머리가 위로 안 잘리게
}

// ---------- 컷씬 보여주기 ----------
const storyQueue = []; // 보여줄 컷씬 대기열 (여러 개가 한 번에 생기면 차례대로)
let storyScenes = null; // 지금 보여주는 장면들
let storyIndex = 0; // 지금 몇 번째 장면인지
let typingTimer = null; // 글자 한 글자씩 나오는 타이머
let typingDone = true;

// 컷씬 실행 : 이미 본 컷씬이면 무시
function playStory(id) {
  if (!storyList[id]) return;
  if (game.seenStory.includes(id)) return;
  if (storyQueue.includes(id)) return;

  storyQueue.push(id);
  if (!storyScenes) nextStory(); // 지금 보는 컷씬이 없으면 바로 시작
}

// 대기열에서 다음 컷씬 꺼내기
function nextStory() {
  const id = storyQueue.shift();
  const box = document.getElementById("cutscene");

  if (!id) {
    storyScenes = null;
    box.classList.remove("show");
    return;
  }

  game.seenStory.push(id);
  stopHold(); // 꾹 누르기 중이었으면 멈춤
  storyScenes = storyList[id];
  storyIndex = 0;
  box.classList.add("show");
  showScene();
}

// 장면 하나 그리기
function showScene() {
  const scene = storyScenes[storyIndex];

  // 장면 그림 (img 가 있을 때만 바꿈)
  if (scene.img !== undefined) {
    const src = scene.img === "map" ? getMapBg() : scene.img;
    setStoryImage(document.getElementById("cut-img"), src);

    // 땅 높이 : 맵 배경이면 그 맵 값, 아니면 목록에서 찾기
    const first = Array.isArray(src) ? src[src.length - 1] : src;
    const ground = scene.img === "map" ? getMapGround() : STORY_GROUND[first] || 82;
    placeStoryChar(ground);
  }

  // 캐릭터 그림
  if (scene.char !== undefined) {
    setStoryImage(document.getElementById("cut-char"), scene.char);
  }

  // 이름표 (없으면 나레이션)
  const nameBox = document.getElementById("cut-name");
  nameBox.innerText = scene.name || "";
  nameBox.style.display = scene.name ? "block" : "none";
  document.getElementById("cut-text").classList.toggle("narration", !scene.name);

  // 진행 표시 (3 / 7)
  document.getElementById("cut-page").innerText = `${storyIndex + 1} / ${storyScenes.length}`;

  typeText(scene.text);
}

// 그림 넣기 : src 가 배열이면 앞에서부터 있는 그림을 씀
//            전부 없으면 "그림 준비중" 칸 보여주기
function setStoryImage(img, src) {
  const holder = img.nextElementSibling; // 바로 다음 칸이 "준비중" 표시
  if (!src) {
    img.style.display = "none";
    holder.style.display = "none";
    return;
  }
  const list = Array.isArray(src) ? src : [src];
  const key = list.join("|");
  if (img.dataset.src === key) return; // 같은 그림이면 그대로

  img.dataset.src = key;
  img.style.display = "block";
  holder.style.display = "none";
  let n = 0;
  img.onerror = () => {
    n++;
    if (n < list.length) {
      img.src = list[n]; // 다음 후보 그림
    } else {
      img.style.display = "none";
      holder.style.display = "flex";
      holder.innerText = `그림 준비중\n${list[0]}`;
    }
  };
  img.src = list[0];
}

// 대사를 한 글자씩 출력
function typeText(text) {
  const textBox = document.getElementById("cut-text");
  let i = 0;
  textBox.innerText = "";
  typingDone = false;
  document.getElementById("cut-next").style.visibility = "hidden";

  clearInterval(typingTimer);
  typingTimer = setInterval(() => {
    i++;
    textBox.innerText = text.slice(0, i);
    if (i >= text.length) finishTyping(text);
  }, 35);
}

function finishTyping(text) {
  clearInterval(typingTimer);
  document.getElementById("cut-text").innerText = text;
  typingDone = true;
  document.getElementById("cut-next").style.visibility = "visible";
}

// 화면 클릭 : 글자가 나오는 중이면 바로 다 보여주고, 아니면 다음 장면
function clickStory() {
  if (!storyScenes) return;

  if (!typingDone) {
    finishTyping(storyScenes[storyIndex].text);
    return;
  }

  storyIndex++;
  if (storyIndex >= storyScenes.length) {
    nextStory();
  } else {
    showScene();
  }
}

// 건너뛰기 : 지금 컷씬만 끝냄
function skipStory(event) {
  event.stopPropagation(); // 화면 클릭(clickStory)까지 실행되지 않게
  clearInterval(typingTimer);
  nextStory();
}
