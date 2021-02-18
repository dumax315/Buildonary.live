const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const openRooms = [];
let roomData = [];
let roomIntervals = [];
var words = ["Elephant", "Ocean", "Book", "Egg", "House", "Dog", "Ball", "Star", "Shirt", "Underwear", "Ice Cream", "Drum", "Christmas Tree", "Spider", "Shoe", "Smile", "Cup", "Hat", "Cookie", "Bird", "Kite", "Snowman", "Butterfly", "Cupcake", "Fish", "Grapes", "Socks", "Tv", "Bed", "Phone", "Doll", "Trash Can", "Skateboard", "Sleep", "Sad", "Airplane", "Nose", "Eyes", "Apple", "Sun", "Sandwich", "Cherry", "Bubble", "Moon", "Snow", "Candy", "Roof", "Book", "Rabbit", "Arm", "Arm", "Crayon", "Jump", "Pig", "Monkey", "Baby", "Happy", "Hopscotch", "Spider", "Bird", "Doll", "Wings", "Turtle", "Room", "Drum", "Ear", "Cheek", "Smile", "Jar", "Chin", "Telephone", "Mouth", "Basketball", "Tail", "Airplane", "Tree", "Star", "Point", "Scissors", "Elephant", "Jump", "Chair", "Pinch", "Mosquito", "Sunglasses", "Head", "Kick", "Football", "Skip", "Dance", "Alligator", "Stop", "Door", "Blinking", "Swing", "Pen", "Apple", "Car", "Spoon", "Sleep", "Pillow", "Flower", "Dog", "Sneeze", "Book", "Circle", "Icecream", "Milk", "Baseball", "Clap", "Kangaroo", "Balloon", "Drink", "Robot", "Chicken", "Rock", "Camera", "Book", "Rabbit", "Arm", "Arm", "Crayon", "Jump", "Pig", "Monkey", "Baby", "Happy", "Hopscotch", "Spider", "Bird", "Doll", "Wings", "Turtle", "Room", "Drum", "Ear", "Cheek", "Smile", "Jar", "Chin", "Telephone", "Mouth", "Basketball", "Tail", "Airplane", "Tree", "Star", "Baseball", "Clap", "Kangaroo", "Balloon", "Drink", "Robot", "Chicken", "Rock", "Camera", "Book", "Rabbit", "Arm", "Arm", "Crayon", "Jump", "Pig", "Monkey", "Baby", "Happy", "Hopscotch", "Spider", "Bird", "Doll", "Wings", "Turtle", "Room", "Drum", "Ear", "Cheek", "Smile", "Jar", "Chin", "Telephone", "Mouth", "Basketball", "Tail", "Airplane", "Tree", "Star", "Point", "Scissors", "Elephant", "Jump", "Chair", "Pinch", "Mosquito", "Sunglasses", "Head", "Kick", "Football"];
app.use( express.static('static'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/home.html');
});




app.get('/getUsername/:gameCode', (req, res) => {
  res.sendFile(__dirname + '/static/getUsername.html');
});

app.get('/newroom/:username', (req, res) => {
	var newRoom;
	while(true){
		newRoom = words[Math.floor((Math.random() * words.length))] + words[Math.floor((Math.random() * words.length))];
		if(!openRooms.includes(newRoom)){
			break;
		}	
	}
  res.redirect('/room/'+newRoom+"/?username="+req.params.username);
});

app.get('/newroom', (req, res) => {
	var newRoom;
	while(true){
		newRoom = words[Math.floor((Math.random() * words.length))] + words[Math.floor((Math.random() * words.length))];
		if(!openRooms.includes(newRoom)){
			break;
		}	
	}
  res.redirect('/getUsername/'+newRoom);
});

app.get('/room/:roomId', (req, res) => {
	console.log(req.query.username);
	if(req.query.username == undefined){
		res.redirect('/getUsername/'+req.params.roomId);
	}else{
		res.sendFile(__dirname + '/static/game.html');
	}
  
});

function findObjectByKey(array, key, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key].toString() == value.toString()) {
			return i;
		}
	}
	return null;
}

function endRound(myroom,locat){
	roomData[locat]["word"] = "";
	io.to(myroom).emit('round Over', roomData[locat]);
}

function startRound(myroom,mySocketId){
	var wordToGuess = words[Math.floor((Math.random() * words.length))];
	var locat = findObjectByKey(roomData, "code", myroom);
	var playerPlace = roomData[locat]["playerIds"].indexOf(roomData[locat]["currentPlayer"])
	playerPlace+=1;
	for(var i = 0; i < roomData[locat]["playerSolved"].length;i++ ){
		roomData[locat]["playerSolved"][i] = false;
	}
	if(playerPlace == 0) {
		roomData[locat]["currentPlayer"] = roomData[locat]["playerIds"][0];
	} else if(playerPlace >=roomData[locat]["playerIds"].length){
		roomData[locat]["currentPlayer"] = roomData[locat]["playerIds"][0];
		playerPlace = 0;
	}else{
		roomData[locat]["currentPlayer"] = roomData[locat]["playerIds"][playerPlace];
	}
	clearTimeout(roomIntervals[locat]["timeOut"]);
	roomData[locat]["playerSolved"][playerPlace] = true;
	//game timer code in millisecends twice
	roomData[locat]["time"] = new Date().getTime()+75000;
	roomIntervals[locat]["timeOut"] = setTimeout(endRound, 75000,myroom,locat);
	console.log(roomData[locat]["time"]);
	roomData[locat]["board"] = [];
	roomData[locat]["word"] = wordToGuess;
	io.to(myroom).emit('New Round', roomData[locat]);
	io.to(myroom).emit('game Update', roomData[locat], mySocketId);
}

io.on('connection', (socket) => {
	let myroom;
	let myUserName;
	let mySocketId = socket.id;
  console.log('a user connected');
	console.log(socket.id)

	socket.on('disconnecting', () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
		try {
			var locat = findObjectByKey(roomData, "code", myroom);
			locatPlace = roomData[locat].playerIds.indexOf(socket.id);
			console.log(locatPlace)
			if(locatPlace == roomData[locat]["currentPlayer"]){
				clearTimeout(roomIntervals[locat]["timeOut"]);
				startRound(myroom,mySocketId);
			};
			roomData[locat].playerIds.splice(locatPlace,1);
			roomData[locat].playerNames.splice(locatPlace,1);
			roomData[locat].playerScores.splice(locatPlace,1);
			roomData[locat].playerSolved.splice(locatPlace,1);
			io.to(myroom).emit('update Users', roomData[locat]);
			
		}
		catch(err) {
			console.log(err);
		}
		
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
	//Message
	socket.on('chat message', (msg) => {

		var locat = findObjectByKey(roomData, "code", myroom);
		var playerInfoLocation = roomData[locat]["playerIds"].indexOf(socket.id);
		if(msg.toLowerCase() == roomData[locat]["word"].toLowerCase()){
			var now = new Date().getTime();
			// Find the distance between now and the count down date
			var distance = Math.floor((roomData[locat]["time"] - now)/100);
			
			if(!roomData[locat]["playerSolved"][playerInfoLocation]){
				roomData[locat]["playerScores"][playerInfoLocation] += distance;
				roomData[locat]["playerSolved"][playerInfoLocation] = true;
				io.to(myroom).emit('update Users', roomData[locat]);
				if(roomData[locat]["playerSolved"].indexOf(false)==-1){
					clearTimeout(roomIntervals[locat]["timeOut"]);
					endRound(myroom,locat);
				}
			}
			
		}else{

			io.to(myroom).emit('chat message', msg, roomData[locat]["playerNames"][playerInfoLocation]);
		}

  });

	socket.on('enter room', (msg) => {
    console.log(msg);
		socket.join(msg);
		var locat;
		if(!openRooms.includes(msg)){
			openRooms.push(msg);
			roomIntervals.push({"roomName":msg});
			roomData.push({"code":msg, "playerIds":[socket.id], "playerNames":[myUserName], "playerScores":[0],"playerSolved":[false]})
			locat = roomData.length-1;
		}else{
			locat = findObjectByKey(roomData, "code", msg);
			roomData[locat].playerIds.push(socket.id);
			roomData[locat].playerNames.push(myUserName);
			roomData[locat].playerScores.push(0);
			roomData[locat].playerSolved.push(false);
		}
		myroom = msg;
		io.to(myroom).emit('update Users', roomData[locat]);
		console.log(roomData);
  });

	socket.on('set Username', (msg) => {
		myUserName = msg;
    console.log(msg);
		
  });

	socket.on('start Round', () => {
		startRound(myroom,mySocketId);
		
		
  });


	socket.on('game Update Build', (msg) => {
		var locat = findObjectByKey(roomData, "code", myroom);
		roomData[locat]["board"] = msg;
		
		io.to(myroom).emit('game Update', roomData[locat], mySocketId);
		
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});