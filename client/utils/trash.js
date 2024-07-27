// const cars = [];

// for (let i = 1; i <= 6; i++) {
//     const source = `./assets/car${ i }.svg`;
//     const car = new Image();
//     car.classList.add('car');
//     car.src = source;
//
//     cars.push(car);
// }

// function render4() {
//     cars[4].classList.add('car-right');
//     cars[4].style.animation = 'car steps(400) 5s 1';
//     container.appendChild(cars[4]);
//
//     setTimeout(() => {
//         cars[4].parentNode.removeChild(cars[4]);
//
//         setTimeout(() => {
//             render4();
//         }, 1000);
//     }, 5000);
// }
//
// render4();