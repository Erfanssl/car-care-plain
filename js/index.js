const container = document.querySelector('.container');
const scoreContainer = document.querySelector('#score-container');
const scoreEl = document.querySelector('.score p:nth-child(2)');
const boosterEl = document.querySelector('#score-container .booster p:nth-child(2)');
const levelEl = document.querySelector('.level p:nth-child(2)');
const modal = document.querySelector('#modal');
const modalScoreEl = document.querySelector('.final-score');
const startBtn = document.querySelector('#modal button');
const road = document.querySelector('.road');
const mainCar = document.querySelector('.car-main');
const levelUp = document.querySelector('.level-up');
const scoreUp = document.querySelector('.score-up');

const INITIAL_STATE = {
    allowToRenderCar: true,
    start: false,
    finish: true,
    score: 2,
    booster: 1,
    consecutiveTrue: 0,
    speed: 1,
    presetObjects: [],
    carId: 1,
    timer: 0,
    level: 1,
    timers: [],
    intervals: [],
    win: false
};

const state = JSON.parse(JSON.stringify(INITIAL_STATE));

function numberSeparator(num) {
    return num.toString().split('').reverse().join('').replace(/\d{3}(?=\d)/g, (n) => n + ',').split('').reverse().join('');
}

startBtn.onclick = () => {
    state.start = true;
    state.finish = false;
    container.style.filter = 'unset';
    modal.classList.add('hide');
    scoreContainer.classList.remove('hide');
    road.style.animation = `road steps(200) ${ state.speed * 3 }s infinite`;
    mainCar.style.transition = `all ${ state.speed }s`;
    scoreEl.innerText = state.score;
    boosterEl.innerText = state.booster;
    levelEl.innerText = state.level;
    const interval = setInterval(() => {
        state.speed += .1;
        updateSpeed(state.speed);
        state.level += 1;
        levelEl.innerText = state.level;

        if (state.level >= 9) {
            state.finish = true;
            state.start = false;
            state.win = true;

            return;
        }

        levelUp.classList.add('show');

        setTimeout(() => {
            levelUp.classList.remove('show');
        }, 1000);

    }, 30000);
    state.intervals.push(interval);

    runGame();
};

function gameEnd() {
    mainCar.style.transition = 'unset';
    road.style.animation = 'unset';
    modal.classList.remove('hide');
    if (state.win) {
        [].slice.call(modal.children).forEach(child => { if (child.classList.contains('win')) { child.classList.remove('hide') } else { child.classList.add('hide') } });
    } else {
        [].slice.call(modal.children).forEach(child => { if (!child.classList.contains('win')) child.classList.remove('hide') });
    }
    modalScoreEl.innerText = `Score is: ${ numberSeparator(state.score) }`;
    state.start = false;
    state.finish = true;
    container.style.filter = 'blur(3px)';
    scoreContainer.classList.add('hide');
    state.presetObjects.forEach(obj => {
        if (obj.object) {
            obj.object.style.animation = 'unset';
            if (obj.object.parentNode) obj.object.parentNode.removeChild(obj.object);
        }
    });

    state.timers.forEach(timer => {
        clearTimeout(timer);
    });

    state.intervals.forEach(interval => {
        clearInterval(interval);
    });

    for (let key in state) {
        state[key] = INITIAL_STATE[key];
    }
}

function renderCar (speed) {
    if (state.start && !state.finish) {
        const side = ['left', 'right'];
        const randomSide = side[Math.floor(Math.random() * side.length)];

        // Generate a new img element
        const carImage = new Image();
        const source = `../assets/car${ Math.ceil(Math.random() * 6) }.svg`;
        carImage.src = source;
        carImage.classList.add('car');
        carImage.style.animation = `car steps(400) ${ 4 / speed }s 1`;

        if (randomSide === 'left') {
            carImage.classList.add('car-left');
        } else {
            carImage.classList.add('car-right');
        }

        container.appendChild(carImage);
        const carObj = {
            id: state.carId,
            object: carImage,
            hasMet: false
        };
        state.presetObjects.push(carObj);
        state.carId += 1;

        const timerOne = setTimeout(() => {
            if (carImage.parentNode) carImage.parentNode.removeChild(carImage);
            state.presetObjects = state.presetObjects.filter(object => object.id !== carObj.id);
            state.timers = state.timers.filter(timer => timer !== timerOne);
        }, 3500 / speed);

        state.timers.push(timerOne);

        state.allowToRenderCar = false;
        const timesToRenderCar = [1500 / speed, 2000 / speed, 2500 / speed];
        const timerTwo = setTimeout(() => {
            state.allowToRenderCar = true;
            state.timers = state.timers.filter(timer => timer !== timerTwo);
        }, timesToRenderCar[Math.floor(Math.random() * timesToRenderCar.length)]);

        state.timers.push(timerTwo);
    }
}

function updateSpeed(speed) {
    road.style.animationDuration = 3 / speed + 's';
    mainCar.style.transitionDuration = 1 - (speed - 1) + 's';

}

function collisionDetector(objectOne, objectTwo) {
    const objectOneData = objectOne.getBoundingClientRect();
    const objectTwoData = objectTwo.getBoundingClientRect();

    return (
        ((objectOneData.top + objectOneData.height) >= objectTwoData.top + 30) &&
        ((objectOneData.bottom - objectOneData.height) <= objectTwoData.bottom - 30) &&
        ((objectOneData.left + objectOneData.width >= objectTwoData.left + 30)) &&
        ((objectOneData.right - objectOneData.width) <= objectTwoData.right - 30)
    );
}

function meetDetector(objectOne, objectTwo) {
    const objectOneData = objectOne.getBoundingClientRect();
    const objectTwoData = objectTwo.getBoundingClientRect();

    return objectOneData.top >= objectTwoData.top;
}

function updateScore() {
    state.consecutiveTrue += 1;

    if (state.consecutiveTrue >= 5) {
        state.booster += 1;
        state.consecutiveTrue = 0;
    }

    const increment = state.booster * 2;

    state.score += increment;

    scoreEl.innerText = numberSeparator(state.score);
    boosterEl.innerText = numberSeparator(state.booster);

    scoreUp.innerText = `+${numberSeparator(increment)}`;
    scoreUp.classList.add('show');

    setTimeout(() => {
        scoreUp.classList.remove('show');
    }, 1000);
}

function runGame() {
    let animation = requestAnimationFrame(coreGame);

    function coreGame() {
        animation = requestAnimationFrame(coreGame);

        if (state.allowToRenderCar) {
            renderCar(state.speed);
        }

        state.presetObjects.forEach(obj => {
            if (collisionDetector(obj.object, mainCar)) {
                state.finish = true;
                state.start = false;
            }

            if (!obj.hasMet && meetDetector(obj.object, mainCar)) {
                obj.hasMet = true;
                updateScore();
            }
        });

        if (state.start === true) {

        }

        if (state.finish === true) {
            cancelAnimationFrame(animation);
            gameEnd();
        }
    }
}

window.onkeydown = (e) => {
    if (e.keyCode === 37) {
        mainCar.style.transform = "translateX(0)";
    }

    else if (e.keyCode === 39) {
        mainCar.style.transform = 'translateX(245%)';
    }
};