var order = {
    date: '',
    mainDish: '',
    sideDish: '',
    meat:'',
    salad: ''
};

var socket = io.connect('http://localhost:3001');

function main() {
    var pattern = Trianglify({
        width: window.innerWidth,
        height: window.innerHeight
    });
    document.body.appendChild(pattern.canvas())

    document.querySelector('.table').addEventListener('click', function (e) {
        var target = e.target,
            date = target.dataset.date,
            currentOrder,
            user;
        if ( !date || target.nodeName !== 'INPUT') {
            return;
        }

        user = firebase.auth().currentUser;


        if (target.classList.contains('order-all-except-main')) {
            currentOrder = orderByAllButtons(date, target.checked, false);
        }

        if (target.classList.contains('order-all')) {
            currentOrder = orderByAllButtons(date, target.checked, true);
        }

        if (target.classList.contains('dish-item')) {
            currentOrder = orderBySingleButton(date);
        }

        if (currentOrder) {
            console.log(currentOrder);
            socket.emit('save order to db', { date: date, currentOrder: currentOrder, user: user.uid });
        }
    });
}

function orderByAllButtons(date, isChecked, isContainMainDish) {
    var currentOrder,
        dishes = [],
        dayContainer;
    dayContainer = document.getElementById(date);
    currentOrder = JSON.parse(JSON.stringify(order));
    currentOrder.date = date;
    if (isContainMainDish) {
        dishes = dayContainer.querySelectorAll('.dish-item');
        dayContainer.querySelector('.order-all-except-main').checked = false;

    } else {
        dishes = dayContainer.querySelectorAll('.dish-item:not(.main-dish)');
        dayContainer.querySelector('.dish-item.main-dish').checked = false;
        dayContainer.querySelector('.order-all').checked = false;
    }
    for (var i = 0, len = dishes.length; i < len; i++) {
        var current = dishes[i];
        if (isChecked) {
            current.checked = true;
            currentOrder[current.dataset.type] = {name: current.value, status: true};
        } else {
            current.checked = false;
            currentOrder[current.dataset.type] = {name: current.value, status: false};
        }
    }
    return currentOrder;

}

function orderBySingleButton (date) {
    if ( !date )  return;
    var currentOrder,
        dayContainer  = document.getElementById(date),
        dishes = dayContainer.querySelectorAll('.dish-item');
    dayContainer.querySelector('.order-all-except-main').checked = false;
    dayContainer.querySelector('.order-all').checked = false;
    currentOrder = JSON.parse(JSON.stringify(order));
    currentOrder.date = date;
    for (var i = 0, len = dishes.length; i < len; i++) {
        var current = dishes[i];
        if (current.checked) {
            currentOrder[current.dataset.type] = {name: current.value, status: true};
        } else {
            currentOrder[current.dataset.type] = {name: current.value, status: false};
        }
    }
    return currentOrder;
}

function saveOrder(date, order) {
    if ( !date || !order ) return;
    var database = firebase.database();

    var user = firebase.auth().currentUser;

    database.ref('orders/' + date + '/' + user.uid).set(function () {
        //add current user email
        order['user'] = user.email;
        return order;
    }());


    // function writeData(date, order) {
    // }

    // var userRef = firebase.database().ref('users/');
    // userRef.on('value', function(snapshot) {
    //     document.querySelector('#test').innerHTML = snapshot.val()[123].username;
    // });

    // writeData(date, order);
}



document.addEventListener("DOMContentLoaded", main);