"use strict";

const game = new NumberGame();
const find = (id) => document.getElementById(id);
const screens = ["start-screen", "game-screen", "result-screen", "ranking-screen", "presentation-screen"];
const nicknameInput = find("nickname");
const board = find("board");
let nickname = "";
let countdownTimeout = null;
let timerFrame = null;
let feedbackTimeout = null;

function showScreen(id)
{
    for (const screen of screens)
    {
        find(screen).hidden = screen !== id;
    }
}

function clearScheduledWork()
{
    clearTimeout(countdownTimeout);
    clearTimeout(feedbackTimeout);
    cancelAnimationFrame(timerFrame);
}

function renderProgress()
{
    find("next-number").textContent = String(Math.min(game.nextNumber, 25)).padStart(2, "0");
    find("progress-text").textContent = `${game.completedCount} / 25 완료`;
}

function renderTimer()
{
    find("timer").textContent = (game.elapsedMs / 1000).toFixed(3);
    if (game.status === "playing")
    {
        timerFrame = requestAnimationFrame(renderTimer);
    }
}

function renderBoard()
{
    board.replaceChildren();
    for (const number of game.numbers)
    {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "number-button";
        button.textContent = number;
        button.dataset.number = number;
        button.setAttribute("aria-label", `${number}`);
        board.append(button);
    }
}

function beginGame()
{
    clearScheduledWork();
    game.prepare();
    showScreen("game-screen");
    find("player-name").textContent = nickname;
    find("timer").textContent = "0.000";
    find("game-message").textContent = "잠시 후 시작합니다.";
    board.hidden = true;
    find("countdown").hidden = false;
    renderBoard();
    renderProgress();

    let remaining = 3;
    find("countdown-number").textContent = remaining;
    find("exit-button").focus({ preventScroll: true });
    const tick = () =>
    {
        if (game.status !== "countdown")
        {
            return;
        }
        remaining -= 1;
        if (remaining > 0)
        {
            find("countdown-number").textContent = remaining;
            countdownTimeout = setTimeout(tick, 1000);
            return;
        }
        // 화면 표시 변경과 시작 시각 기록을 같은 작업에서 처리한다.
        find("countdown").hidden = true;
        board.hidden = false;
        game.start();
        find("game-message").textContent = "1부터 순서대로 선택하세요.";
        renderTimer();
        board.querySelector("button").focus({ preventScroll: true });
    };
    countdownTimeout = setTimeout(tick, 1000);
}

function finishGame()
{
    clearScheduledWork();
    find("result-player").textContent = nickname;
    find("result-time").textContent = (game.elapsedMs / 1000).toFixed(3);
    showScreen("result-screen");
    find("result-title").focus({ preventScroll: true });
}

function returnHome()
{
    clearScheduledWork();
    game.reset();
    showScreen("start-screen");
    nicknameInput.focus({ preventScroll: true });
}

find("start-form").addEventListener("submit", (event) =>
{
    event.preventDefault();
    const value = nicknameInput.value.trim();
    if (!/^[가-힣a-zA-Z0-9]{2,10}$/.test(value))
    {
        find("nickname-error").textContent = "한글·영문·숫자로 2~10자를 입력해주세요.";
        nicknameInput.setAttribute("aria-invalid", "true");
        nicknameInput.focus();
        return;
    }
    nickname = value;
    nicknameInput.value = value;
    find("nickname-error").textContent = "";
    nicknameInput.removeAttribute("aria-invalid");
    beginGame();
});

nicknameInput.addEventListener("input", () =>
{
    find("nickname-error").textContent = "";
    nicknameInput.removeAttribute("aria-invalid");
});

board.addEventListener("click", (event) =>
{
    const button = event.target.closest("button[data-number]");
    if (!button || button.disabled)
    {
        return;
    }
    const result = game.select(Number(button.dataset.number));
    if (result === "ignored")
    {
        return;
    }
    clearTimeout(feedbackTimeout);
    if (result === "wrong")
    {
        button.classList.remove("wrong");
        button.classList.add("wrong");
        find("game-message").textContent = `지금은 ${game.nextNumber}을(를) 선택해주세요.`;
        feedbackTimeout = setTimeout(() =>
        {
            board.querySelectorAll(".wrong").forEach((tile) => tile.classList.remove("wrong"));
            find("game-message").textContent = "다음 숫자를 찾아보세요.";
        }, 700);
        return;
    }
    board.querySelectorAll(".wrong").forEach((tile) => tile.classList.remove("wrong"));
    button.classList.add("done");
    button.disabled = true;
    button.setAttribute("aria-label", `${button.dataset.number}, 선택 완료`);
    find("game-message").textContent = "좋아요! 다음 숫자를 찾아보세요.";
    renderProgress();
    if (result === "finished")
    {
        finishGame();
    }
});

find("retry-button").addEventListener("click", beginGame);
find("home-button").addEventListener("click", returnHome);
find("exit-button").addEventListener("click", returnHome);

find("nav-home-button").addEventListener("click", returnHome);
find("ranking-home-button").addEventListener("click", returnHome);
find("ranking-button").addEventListener("click", () =>
{
    showScreen("ranking-screen");
    find("ranking-title").focus({ preventScroll: true });
});
find("ranking-retry-button").addEventListener("click", () =>
{
    if (nickname)
    {
        beginGame();
    }
    else
    {
        returnHome();
    }
});
find("presentation-button").addEventListener("click", () =>
{
    clearScheduledWork();
    game.reset();
    showScreen("presentation-screen");
    find("presentation-title").focus({ preventScroll: true });
});
