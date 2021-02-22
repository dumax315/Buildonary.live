const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
let connectCounter =0;
let openRooms = [];
let roomData = [];
let roomIntervals = [];
var words = ["ball", "bed", "island", "bowl", "grass", "banana", "rain", "bird", "heart", "rock", "key", "bread", "caterpillar", "doll", "worm", "mountains", "bench", "person", "corn", "drum", "milk", "oval", "bounce", "leg", "horse", "pizza", "turtle", "clock", "dream", "shoe", "neck", "elephant", "truck", "socks", "skateboard", "dinosaur", "cherry", "snake", "football", "mountain", "computer", "bone", "lollipop", "octopus", "circle", "flower", "bed", "comb", "rabbit", "pool", "moon", "ship", "nail", "lion", "dragon", "boy", "basketball", "backpack", "smile", "duck", "beach", "plant", "beak", "cup", "bell", "egg", "bee", "snail", "hand", "bunny", "daisy", "cow", "ant", "ring", "grapes", "pencil", "crab", "baby", "baseball", "branch", "pillow", "button", "door", "coin", "jacket", "ear", "girl", "hat", "book", "cloud", "robot", "motorcycle", "balloon", "helicopter", "bumblebee", "angel", "crayon", "stairs", "mouse", "window", "desk", "mitten", "alive", "sun", "giraffe", "slide", "boat", "hair", "feather", "leaf", "hamburger", "ghost", "pie", "Earth", "jellyfish", "blocks", "fork", "bug", "mouth", "blanket", "swing", "fire", "monster", "kite", "suitcase", "ladybug", "bear", "house", "sheep", "bow", "snowman", "music", "box", "diamond", "frog", "fish", "legs", "rocket", "bark", "ocean", "pants", "float", "tree", "shirt", "sea turtle", "lizard", "whale", "chicken", "sea", "jail", "kitten", "eye", "broom", "head", "alligator", "train", "bridge", "crack", "triangle", "bike", "zigzag", "hook", "star", "eyes", "curl", "knee", "feet", "cookie", "glasses", "love", "dog", "hippo", "pig", "nose", "spider", "night", "spider web", "airplane", "cat", "coat", "rainbow", "ants", "sunglasses", "owl", "popsicle", "zoo", "zebra", "snowflake", "inchworm", "monkey", "starfish", "table", "arm", "bus", "bat", "apple", "tail", "candy", "face", "line", "water", "purse", "bracelet", "flag", "bathroom", "fly", "chimney", "car", "finger", "ice cream", "river", "cheese", "king", "seashell", "wheel", "man", "woman", "camera", "butterfly", "cube", "chair", "light", "lemon", "orange", "spoon", "carrot", "Mickey Mouse", "jar", "Angel", "Eyeball", "Pizza", "Angry", "Fireworks", "Pumpkin", "Baby", "Flower", "Rainbow", "Beard", "Flying saucer", "Recycle", "Bible", "Giraffe", "Sand castle", "Bikini", "Glasses", "Snowflake", "Book", "High heel", "Stairs", "Bucket", "Ice cream", "Starfish", "Bumble bee", "Igloo", "Strawberry", "Butterfly", "Lady bug", "Sun", "Camera", "Lamp", "Tire", "Cat", "Lion", "Toast", "Church", "Mailbox", "Toothbrush", "Crayon", "Night", "Toothpaste", "Dolphin", "Nose", "Truck", "Egg", "Olympics", "Volleyball", "Eiffel Tower", "Peanut", "Stapler", "Desk", "Pay cheque", "Phone", "Paper", "Light", "Chair", "lamp", "Notepad", "Binder", "Calculator", "Calendar", "Sticky notes", "Pens", "Pencils", "Notebook", "Chairs", "Coffee", "Thermos", "Hot cup", "Glue", "Clipboard", "Paperclips", "Chocolate", "Secretary", "Work", "Paperwork", "Workload", "Employee", "Boredom", "Golf", "Laptop", "Sandcastle", "Monday", "Vanilla", "Bamboo", "Sneeze", "Scratch", "Celery", "Hammer", "Frog", "Tennis", "Hot dog", "Pants", "Bridge", "Bubblegum", "Candy bar", "Skiing", "Sledding", "Snowboarding", "Snowman", "Polar Bear", "Cream", "Waffle", "Pancakes", "Sundae", "Beach", "Sunglasses", "Surfboard", "Watermelon", "Baseball", "Bat", "Ball", "T-shirt", "Kiss", "Jellyfish", "Jelly", "Spider", "Broom", "Spiderweb", "Mummy", "Candy", "Bats", "Squirrels", "Basketball", "Water bottle", "Unicorn", "Dog leash", "Newspaper", "Hammock", "Video camera", "Money", "Smile", "Umbrella", "Picnic basket", "Teddy bear", "Ambulance", "pyramid", "Bacteria", "Goosebumps", "Platypus", "Tarantula", "Goldfish", "Skull", "Spider web", "Smoke", "Tree", "Ice", "Blanket", "Seaweed", "Flame", "Bubble", "Hair", "Tooth", "Leaf", "Worm", "Sky", "Apple", "Plane", "Cow", "House", "Dog", "Car", "Bed", "Furniture", "Train", "Paintings", "Drawing", "Cup", "Plate", "Bowl", "Cushion", "Sofa", "Sheet", "Kitchen", "Table", "Candle", "Shirt", "Clothes", "Dress", "Pillow", "Home", "Guitar", "Schoolbag", "Pencil Case", "Towel", "Watch", "Piano", "Pen", "Hat", "Shoes", "Socks", "Jeans", "Keyboard", "Bra", "Jacket", "Tie", "Bandage", "Scarf", "Cell Phone"];
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

function endRound(myroom,locat,mySocketId){
	try{
		roomIntervals[locat]["timeOut"] = setTimeout(startRound, 15000,myroom,mySocketId);
		var total = 0;
		for(var i =0;i<roomData[locat]["playerScores"].length;i++){
			total += roomData[locat]["playerScores"][i];
		}
		var playerPlace = roomData[locat]["playerIds"].indexOf(roomData[locat]["currentPlayer"]);
		roomData[locat]["playerScores"][playerPlace] += Math.floor(total/ roomData[locat]["playerScores"].length);
		io.to(myroom).emit('round Over', roomData[locat]);
		roomData[locat]["word"] = "";
	}
	catch(err) {
	console.log(err);
	}
}

function startRound(myroom,mySocketId,rounds = 1,timeToBuild = 100){
	try{

	var stillGoing = true;
	var wordToGuess = words[Math.floor((Math.random() * words.length))];
	var locat = findObjectByKey(roomData, "code", myroom);
	var playerPlace = roomData[locat]["playerIds"].indexOf(roomData[locat]["currentPlayer"])
	playerPlace+=1;
	for(var i = 0; i < roomData[locat]["playerSolved"].length;i++ ){
		roomData[locat]["playerSolved"][i] = false;
	}
	if(playerPlace == 0) {
		roomData[locat]["currentPlayer"] = roomData[locat]["playerIds"][0];
		roomData[locat]["rounds"] = rounds;
		roomData[locat]["roundsLeft"] = rounds;
		roomData[locat]["timeToBuild"] = timeToBuild;
	} else if(playerPlace >=roomData[locat]["playerIds"].length){
		roomData[locat]["currentPlayer"] = roomData[locat]["playerIds"][0];
		
		roomData[locat]["roundsLeft"] -= 1;
		if(roomData[locat]["roundsLeft"]<1){
			//game over code
			stillGoing = false;
			roomData[locat]["board"] = [];
			for(var i =0;i<roomData[locat]["playerScores"].length;i++){
				roomData[locat]["playerScores"][i] = 0;
			}
			roomData[locat]["currentPlayer"] = "";
			console.log(roomData[locat])
			io.to(myroom).emit('end Game', roomData[locat]);
			
			
		}else{
			playerPlace = 0;
		}
	}else{
		roomData[locat]["currentPlayer"] = roomData[locat]["playerIds"][playerPlace];
	}
	
	clearTimeout(roomIntervals[locat]["timeOut"]);

	
	console.log(stillGoing)
	if(stillGoing){
		roomData[locat]["playerSolved"][playerPlace] = true;
		//game timer code in millisecends twice
		roomData[locat]["time"] = new Date().getTime()+roomData[locat]["timeToBuild"] *1000;
		roomIntervals[locat]["timeOut"] = setTimeout(endRound, roomData[locat]["timeToBuild"] *1000,myroom,locat,mySocketId);
		console.log(roomData[locat]["time"]);
		roomData[locat]["board"] = [];
		roomData[locat]["word"] = wordToGuess;
		io.to(myroom).emit('New Round', roomData[locat]);
		io.to(myroom).emit('game Update', roomData[locat], mySocketId);
		io.to(myroom).emit('update Users', roomData[locat]);
	}
	}
	catch(err) {
	console.log(err);
	}
}

io.on('connection', (socket) => {
	let myroom;
	let myUserName;
	let mySocketId = socket.id;
  console.log('a user connected');
	console.log(socket.id)
	connectCounter++;
	socket.on('disconnecting', () => {
    
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
		connectCounter--;
    console.log('user disconnected');
		console.log(connectCounter); //number of socket clients connected
		if(connectCounter == 0) {
			openRooms = [];
			roomData = [];
			roomIntervals = [];
		}
		console.log(roomData);
  });
	//Message
	socket.on('chat message', (msg) => {

		var locat = findObjectByKey(roomData, "code", myroom);
		var playerInfoLocation = roomData[locat]["playerIds"].indexOf(socket.id);
		try {
			if(msg.toLowerCase() == roomData[locat]["word"].toLowerCase()){
			var now = new Date().getTime();
			// Find the distance between now and the count down date
			var distance = Math.floor((roomData[locat]["time"] - now)/100);
			
			if(!roomData[locat]["playerSolved"][playerInfoLocation]){
				roomData[locat]["playerScores"][playerInfoLocation] += distance;
				roomData[locat]["playerSolved"][playerInfoLocation] = true;
				io.to(myroom).emit('update Users', roomData[locat]);
				io.to(myroom).emit('chat message', "Guessed the Answer!", roomData[locat]["playerNames"][playerInfoLocation]);
				if(roomData[locat]["playerSolved"].indexOf(false)==-1){
					clearTimeout(roomIntervals[locat]["timeOut"]);
					endRound(myroom,locat,socket.id);
				}
			}
			
			}else{

				io.to(myroom).emit('chat message', msg.substring(0, 20), roomData[locat]["playerNames"][playerInfoLocation]);
			}
			
		}
		catch(err) {
			io.to(myroom).emit('chat message', msg.substring(0, 20), roomData[locat]["playerNames"][playerInfoLocation]);
			console.log(err);
		}
		

  });

	socket.on('enter room', (msg) => {
    console.log(msg);
		msg = msg.toLowerCase()
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
		myUserName = msg.substring(0, 14);
    console.log(msg);
		
  });

	socket.on('start Round', (msg, timeToBuild) => {

		startRound(myroom,mySocketId,msg,timeToBuild);
		
		
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