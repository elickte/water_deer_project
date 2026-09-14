//box 붙은rjsmss html에 사용할거
let berry = 0; //게임 데이터
let berry_box = document.getElementById("berry"); //게임에 보여줄 데이ㅓㅌ

let upgrade = 1; //아직 없음
let click_berry = 1;

let click_berry_box = document.getElementById("click_berry"); // 업글 등등하면 늘어날 클릭베리
let auto_berry_box = document.getElementById("auto_berry"); // 자동베리
let sum_berry_box = document.getElementById("sum_berry"); // 지금까지 번 총량

function clickDeer() {
  berry = berry + click_berry;
  berry_box.innerHTML = "열매 " + berry;
  //   if (clickDeer) return berry + 1; //업그레이드 하면 +1에 업그레이드 곱하면 될듯
}
