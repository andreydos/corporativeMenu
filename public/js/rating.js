var ratings = document.querySelectorAll('.places__item--rating-list');
console.log(ratings);
for (var i = 0, len = ratings.length; i < len; i++) {
    var current = ratings[i];
    current.addEventListener('click', function (e) {
        var target = e.target;
        if (target.nodeName='SPAN') {
            var filledStar = target.parentNode.parentNode.querySelector('.rating-list--item.current');
            switch (target.title) {
                case '1':
                    filledStar.style.width = '20%';
                    break;
                case '2':
                    filledStar.style.width = '40%';
                    break;
                case '3':
                    filledStar.style.width = '60%';
                    break;
                case '4':
                    filledStar.style.width = '80%';
                    break;
                case '5':
                    filledStar.style.width = '100%';
                    break;
            }
        }

        var date = current.parentNode.parentNode.parentNode.id,
            currentOrder,
            user;
        if ( date ) {
            user = firebase.auth().currentUser;
            console.log('USER: ', user);

            currentOrder = orderBySingleButton(date);

            if (currentOrder) {
                console.log(currentOrder);
                socket.emit('save order to db', { date: date, currentOrder: currentOrder, user: user.uid });
            }
        }
    });





}