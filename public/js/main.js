// Get a reference to the database service
var database = firebase.database();

function writeUserData(userId, name, group, imageUrl) {
    database.ref('users/' + userId).set({
        username: name,
        group: group,
        profile_picture : imageUrl
    });
}

var userRef = firebase.database().ref('users/');
userRef.on('value', function(snapshot) {
    document.querySelector('#test').innerHTML = snapshot.val()[123].username;
});

writeUserData('123', 'user', '5', 'no-image');