let graphSize = 20.0;
let board = JXG.JSXGraph.initBoard('graph', {
  boundingbox: [ -graphSize, graphSize, graphSize, -graphSize],
  axis: false,
  showNavigation: false,
  showCopyright: false
});
// x軸とy軸を表示
let xAxis = board.create('axis', [[-graphSize, 0], [graphSize, 0]], {name: 'X', strokeColor: 'black'});
let yAxis = board.create('axis', [[0, -graphSize], [0, graphSize]], {name: 'Y', strokeColor: 'black'});
//軸タイトルを表示
let text_css = 'font-family: "Times New Roman", Times, "serif"; font-style: italic';
board.create('text', [graphSize-1, 1, 'x'],{ fontSize: 16, cssStyle: text_css, fixed: true });
board.create('text', [1, graphSize-1, 'y'],{ fontSize: 16, cssStyle: text_css, fixed: true });

let currentGraph = null;
let currentA = null;
let currentB = null;
let currentC = null;
let currentALine = null;
let currentBLine = null;
let currentCLine = null;
let f = null;
let method = null;
let pointAValue, pointBValue;
let tangent = null;
let tangentCGlider = null;
let tangentXpoint = null;
let reset = false;

// 最大繰り返し回数
let maxRepeatCount = 100;

function graphInput() {
  let eqInput = document.querySelector('#equation');
  let pointAInput = document.querySelector('#pointA');
  let pointBInput = document.querySelector('#pointB');
  let equ = eqInput.value.trim();
  let pointA = pointAInput.value.trim();
  let pointB = pointBInput.value.trim();
  method = document.querySelector('input[name="method"]:checked').value;
  reset = false;

  // 数式の入力なしの場合
  if (!equ) {
    board.removeObject(currentGraph);
    currentGraph = null;
  }
  // 既存グラフを消す
  if (currentGraph !== null) {
    board.removeObject(currentGraph);
    currentGraph = null;
  }
  // 数式を関数に変換
  try {
    f = new Function('x', 'return ' + equ);
    f(0);
  } catch (e) {
    alert('数式が正しくありません: ' + e.message);
    return;
  }
  // グラフ描画
  if (f !== null) {
    currentGraph = board.create('functiongraph', [f], {
      strokeColor: '#32CD32',
      strokeWidth: 3
    });
  }else {
    board.removeObject(currentGraph);
    currentGraph = null;
  }
  
  // 点Aの表示
  if(pointA !== null && pointA !== '') {
    pointAValue = parseFloat(pointA);
    if (!isNaN(pointAValue)) {
      if (currentA !== null) {
        board.removeObject(currentA);
        currentA = null;
      }
      currentA = board.create('point', [pointAValue, 0], { name: 'A', color: 'red', fixed: true});
    } else {
      alert('点Aの値が正しくありません');
    }
  } else {
    if (currentA !== null) {
      board.removeObject(currentA);
      currentA = null;
    }
  }
  // 点Bの表示
  if(pointB !== null && pointB !== '' && method === 'bisection') {
    pointBValue = parseFloat(pointB);
    if (!isNaN(pointBValue)) {
      if (currentB !== null) {
        board.removeObject(currentB);
        currentB = null;
      }
      currentB = board.create('point', [pointBValue, 0], { name: 'B', color: 'blue', fixed: true});
    } else {
      alert('点Bの値が正しくありません');
    }
  } else {
    if (currentB !== null) {
      board.removeObject(currentB);
      currentB = null;
    }
  }

  // 点Aの線
  if(currentA !== null && f(pointAValue) !== undefined){
    if(currentALine !== null){
      board.removeObject(currentALine);
      currentALine = null;
    }
    currentALine = board.create('segment', [[pointAValue, 0], [pointAValue, f(pointAValue)]], {
      strokeColor: 'red',
      dash: 2,
      fixed: true
    });
  }else if (currentALine !== null){
    board.removeObject(currentALine);
    currentALine = null;
  }
  // 点Bの線
  if(currentB !== null && f(pointBValue) !== undefined){
    if(currentBLine !== null){
      board.removeObject(currentBLine);
      currentBLine = null;
    }
    currentBLine = board.create('segment', [[pointBValue, 0], [pointBValue, f(pointBValue)]], {
      strokeColor: 'blue',
      dash: 2,
      fixed: true
    });
  }else if (currentBLine !== null){
    board.removeObject(currentBLine);
    currentBLine = null;
  }
  // 点Cと線Cを削除
  if (currentC !== null) {
    board.removeObject(currentC);
    currentC = null;
  }
  if (currentCLine !== null) {
    board.removeObject(currentCLine);
    currentCLine = null;
  }
}

// アニメーション
function graphAnimation() {
  method = document.querySelector('input[name="method"]:checked').value;
  let tolerance = parseFloat(document.querySelector('input[name="tolerance"]:checked').value);
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  document.querySelector('#result').textContent = '計算中...';
  document.querySelector('#repetition').textContent = '計算中...';
  board.removeObject(currentC);
  currentC = null;
  board.removeObject(currentCLine);
  currentCLine = null;
  board.removeObject(tangent);
  tangent = null;
  board.removeObject(tangentCGlider);
  tangentCGlider = null;
  board.removeObject(tangentXpoint);
  tangentXpoint = null;

  let sleepTime = 500;
  // 二分法のアニメーション
  if(method === 'bisection') {
    if (pointAValue !== undefined && pointBValue !== undefined && f(0) !== undefined) {
      const animeNibun = async () => {
        for(let i = 0; i < maxRepeatCount; i++){
          await sleep(sleepTime);
          if (reset) {
            graphReset();
            return;
          }
          // 点Cの表示
          if (currentC !== null) {
            board.removeObject(currentC);
            currentC = null;
          }
          if (currentCLine !== null) {
            board.removeObject(currentCLine);
            currentCLine = null;
          }
          let pointCValue = (pointAValue + pointBValue) / 2;
          currentC = board.create('point', [pointCValue, 0], { name: 'C', color: 'green', fixed: true});
          currentCLine = board.create('segment', [[pointCValue, 0], [pointCValue, f(pointCValue)]], {
            strokeColor: 'green',
            dash: 2,
            fixed: true
          });
          await sleep(sleepTime);
          if (reset) {
            graphReset();
            return;
          }
          // 判定、点AorBの移動
          if (f(pointCValue) <= tolerance && f(pointCValue) >= -tolerance) {
            document.querySelector('#result').textContent = 'x = ' + pointCValue.toFixed(4);
            document.querySelector('#repetition').textContent = (i + 1) + '回';
            return;
          }else if (f(pointAValue) * f(pointBValue) > 0) {
            document.querySelector('#result').textContent = '解なし';
            document.querySelector('#repetition').textContent = '---';
            return;
          }else if(f(pointCValue) > 0){
            if (f(pointAValue) > 0) {
              pointAValue = pointCValue;
              board.removeObject(currentA);
              currentA = null;
              currentA = board.create('point', [pointAValue, 0], { name: 'A', color: 'red', fixed: true});
              board.removeObject(currentALine);
              currentALine = null;
              currentALine = board.create('segment', [[pointAValue, 0], [pointAValue, f(pointAValue)]], {
                strokeColor: 'red',
                dash: 2,
                fixed: true
              });
            } else {
              pointBValue = pointCValue;
              board.removeObject(currentB);
              currentB = null;
              currentB = board.create('point', [pointBValue, 0], { name: 'B', color: 'blue', fixed: true});
              board.removeObject(currentBLine);
              currentBLine = null;
              currentBLine = board.create('segment', [[pointBValue, 0], [pointBValue, f(pointBValue)]], {
                strokeColor: 'blue',
                dash: 2,
                fixed: true
              });
            }
          }else if(f(pointCValue) < 0){
            if (f(pointAValue) < 0) {
             pointAValue = pointCValue;
              board.removeObject(currentA);
              currentA = null;
              currentA = board.create('point', [pointAValue, 0], { name: 'A', color: 'red', fixed: true});
              board.removeObject(currentALine);
              currentALine = null;
              currentALine = board.create('segment', [[pointAValue, 0], [pointAValue, f(pointAValue)]], {
                strokeColor: 'red',
                dash: 2,
                fixed: true
              });
            } else {
              pointBValue = pointCValue;
              board.removeObject(currentB);
              currentB = null;
              currentB = board.create('point', [pointBValue, 0], { name: 'B', color: 'blue', fixed: true});
              board.removeObject(currentBLine);
              currentBLine = null;
              currentBLine = board.create('segment', [[pointBValue, 0], [pointBValue, f(pointBValue)]], {
                strokeColor: 'blue',
                dash: 2,
                fixed: true
              });
            }
          }
          board.removeObject(currentC);
          currentC = null;
          board.removeObject(currentCLine);
          currentCLine = null;
        }
        document.querySelector('#result').textContent = '---';
        document.querySelector('#repetition').textContent = maxRepeatCount + '回以上';
        return;
      }
      animeNibun();
    }
  // ニュートン法のアニメーション
  }else if(method === 'newton') {
    if (pointAValue !== undefined && f(0) !== undefined) {
      let preAValue;
      let nowAValue;
      let nowCValue;
      const animeNewton = async () => {
        for (let i = 0; i < maxRepeatCount; i++){
          await sleep(sleepTime);
          if (reset) {
            graphReset();
            return;
          }
          tangentCGlider = board.create('glider', [pointAValue, f(pointAValue), currentGraph], {name: '', color: 'green', fixed: true});
          tangent = board.create('tangent', [tangentCGlider], {
            strokeColor: 'green',
            strokeWidth: 2,
            fixed: true
          });
          tangentXpoint = board.create('intersection',[tangent, xAxis, 0],{ name: 'C', color: 'green', fixed: true});
          let tangentXValue = tangentXpoint.X();
          await sleep(sleepTime);
          if (reset) {
            graphReset();
            return;
          }
          // 判定
          if (f(tangentXValue) <= tolerance && f(tangentXValue) >= -tolerance) {
            document.querySelector('#result').textContent = 'x = ' + tangentXValue.toFixed(4);
            document.querySelector('#repetition').textContent = (i + 1) + '回';
            return;
          }
          preAValue = nowAValue;
          nowAValue = pointAValue;
          nowCValue = tangentXValue;
          if(i > 10){
            if(preAValue > nowAValue && preAValue < nowCValue || preAValue < nowAValue && preAValue > nowCValue) {
              document.querySelector('#result').textContent = '解なし';
              document.querySelector('#repetition').textContent = '---';
              return;
            }
          }

          board.removeObject(currentA);
          currentA = null;
          board.removeObject(currentALine);
          currentALine = null;
          board.removeObject(tangent);
          board.removeObject(tangentCGlider);
          board.removeObject(tangentXpoint);
          pointAValue = tangentXValue;
          currentA = board.create('point', [pointAValue, 0], { name: 'A', color: 'red', fixed: true});
          currentALine = board.create('segment', [[pointAValue, 0], [pointAValue, f(pointAValue)]], {
            strokeColor: 'red',
            dash: 2,
            fixed: true
          });
        }
        document.querySelector('#result').textContent = '---';
        document.querySelector('#repetition').textContent = maxRepeatCount + '回以上';
        return;
      }
      animeNewton();
    }
  }
  document.querySelector('#result').textContent = '---';
  document.querySelector('#repetition').textContent = '---';
}

// グラフのリセット
function graphReset(){
  if (currentGraph !== null) {
    board.removeObject(currentGraph);
    currentGraph = null;
  }
  if (currentA !== null) {
    board.removeObject(currentA);
    currentA = null;
  }
  if (currentB !== null) {
    board.removeObject(currentB);
    currentB = null;
  }
  if (currentC !== null) {
    board.removeObject(currentC);
    currentC = null;
  }
  if (currentALine !== null) {
    board.removeObject(currentALine);
    currentALine = null;
  }
  if (currentBLine !== null) {
    board.removeObject(currentBLine);
    currentBLine = null;
  }
  if (currentCLine !== null) {
    board.removeObject(currentCLine);
    currentCLine = null;
  }
  if (tangent !== null) {
    board.removeObject(tangent);
    tangent = null;
  }
  if (tangentCGlider !== null) {
    board.removeObject(tangentCGlider);
    tangentCGlider = null;
  }
  if (tangentXpoint !== null) {
    board.removeObject(tangentXpoint);
    tangentXpoint = null;
  }
  document.querySelector('#result').textContent = '---';
  document.querySelector('#repetition').textContent = '---';
}

// STARTボタンにイベント追加
window.addEventListener('DOMContentLoaded', function() {
  let startBtn = document.querySelector('#startBtn');
  let resetBtn = document.querySelector('#resetBtn');
  if (startBtn && resetBtn) {
    startBtn.addEventListener('click', function(){
      graphInput();
      graphAnimation();
    });
    resetBtn.addEventListener('click', function(){
      reset = true;
      graphReset();
    });
  }
});
