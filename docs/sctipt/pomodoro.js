function getParameters() {
    // URLパラメーターを定義
    const params = new URL(window.location.href).searchParams;
    const breakString = params.get("break") || "5";
    const workString = params.get("work") || "25";
    const startHourString = params.get("start") || "9";
    const stateString = params.get("state") || "1";
    const counterString = params.get("counter") || "1";
    const volumeString = params.get("vol") || "0";
    const outsideString = params.get("outside") || "1";
    return {
        break: parseInt(breakString, 10),
        work: parseInt(workString, 10),
        startHour: parseInt(startHourString, 10),
        displayState: parseInt(stateString, 10),
        displayCounter: parseInt(counterString, 10),
        displayVolume: parseInt(volumeString, 10),
        displayOutside: parseInt(outsideString, 10),
    };
}
// パラメーターを取得
const parameters = getParameters();

function zeroPadding(number, length) {
    // 指定桁まで 0 を追加
    return number.toString().padStart(length, "0");
}

function calculateClassName(parameters) {
    // 現在時間のステータス算出
    const date = new Date();
    const minutes = date.getMinutes();
    const interval = parameters.work + parameters.break;
    const minutesInInterval = minutes % interval;
    return minutesInInterval < parameters.work ? "work" : "break";
}

function calculateTimerText(parameters) {
    // タイマー表示の作成
    const date = new Date();
    const currentTime = date.getTime();
    const startDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        parameters.startHour
    );
    const elapsedTime = currentTime - startDateTime.getTime();
    const interval = (parameters.work + parameters.break) * 60 * 1000;

    let remainingTime;
    const minutesInInterval = Math.floor((elapsedTime % interval) / 1000 / 60);
    if (minutesInInterval < parameters.work) {
        remainingTime = parameters.work * 60 * 1000 - (elapsedTime % interval);
    } else {
        remainingTime = interval - (elapsedTime % interval);
    }

    const remainingMinutes = Math.floor(remainingTime / 1000 / 60);
    const remainingSeconds = Math.floor((remainingTime / 1000) % 60);
    return [
        zeroPadding(remainingMinutes, 2),
        zeroPadding(remainingSeconds, 2),
    ].join(":");
}

function displayParameters(parameters) {
    return `work ${parameters.work} | break ${parameters.break}`;
}

function switchScene(parameters) {
    // Work と Break の切替
    const date = new Date();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const interval = parameters.work + parameters.break;
    const minutesInInterval = minutes % interval;
    if (seconds === 0) {
        const volumeSlider = document.getElementById("volume-slider").value;
        console.log(volumeSlider);
        if (minutesInInterval === 0) {
            switchToWorkScene();
            playSound("sound/学校のチャイム.mp3", volumeSlider);
        } else if (minutesInInterval === parameters.work) {
            switchToBreakScene();
            playSound("sound/「そこまで」.mp3", volumeSlider);
        }
    }
    function playSound(source, volume) {
        // 音源・音量を指定して再生
        if (volume !== "0") {
            const audio = new Audio(source);
            audio.volume = volume;
            audio.play();
        }
    }
}

function switchToBreakScene() {
    if (window.obsstudio) {
        window.obsstudio.setCurrentScene("Break");
    }
}

function switchToWorkScene() {
    if (window.obsstudio) {
        window.obsstudio.setCurrentScene("Work");
    }
}

function displayState(parameters) {
    if (parameters.displayState) {
        document.getElementById("state").textContent = document.getElementById("timer").className;
        document.body.style.fontSize = "16vw";
        document.body.style.flexDirection = 'column';
    }
}

function hideRange(rangeList) {
    // 要素の非表示設定
    rangeList.forEach(rangeId => {
        const rangeElement = document.getElementById(rangeId);
        rangeElement.style.display = "none";
    });
}

if (parameters.displayVolume === 0) {
    const range = ["volume"]
    hideRange(range);
}

setInterval(function () {
    const parameters = getParameters();
    const element = document.getElementById("timer")
    element.textContent = calculateTimerText(parameters);
    element.className = calculateClassName(parameters);
    const status = document.getElementById("status");
    status.textContent = displayParameters(parameters);
    switchScene(parameters);
    displayState(parameters);
    displayVolume(parameters);
}, 1000);