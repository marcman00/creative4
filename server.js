const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// Accept incoming POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'))

let player = {};
let enemy={};
let highScores=[];
//let id = 0;

app.get('/api/player', (req, res) => {
  res.send(player);
});

app.get('/api/enemy', (req, res) => {
  res.send(enemy);
});

app.get('/api/scores', (req, res) => {
  res.send(highScores);
});

app.post('/api/player', (req, res) => {
  player = {name:req.body.name, attack: req.body.attack,
	defense:req.body.defense, currentHp:req.body.currentHp,
	maxHp:req.body.maxHp, battlesWon:req.body.battlesWon, gold:req.body.gold, image:req.body.image,location:req.body.location};
  res.send(player);
});

app.post('/api/enemy', (req, res) => {
  enemy = {name:req.body.name, attack: req.body.attack,
	defense:req.body.defense, currentHp:req.body.currentHp,
	maxHp:req.body.maxHp, image:req.body.image};
  res.send(enemy);
});

app.post("/api/scores", (req,res) => {
   let newScore= {name:req.body.name, score:req.body.score};
   highScores.push(newScore);
   highScores.sort(function(a,b) { return a.score < b.score });
   if (highScores.length>5)
     highScores.splice(5);
   res.send(highScores);
});
/*
app.put('/api/player/:stat', (req,res) => {
	let id = parseInt(req.params.id);
 	let itemsMap = items.map(item => { return item.id; });
  	let index = itemsMap.indexOf(id);
  	let item = items[index];
 	item.completed = req.body.completed;
  	item.text = req.body.text;
	item.priority=req.body.priority;
  	// handle drag and drop re-ordering
  	if (req.body.orderChange) {
    	   let indexTarget = itemsMap.indexOf(req.body.orderTarget);
    	   items.splice(index,1);
    	   items.splice(indexTarget,0,item);
  	}
  res.send(item);
});
*/

app.delete('/api/player',(req,res) => {
  player={};
  enemy={};
  res.sendStatus(200);
});

app.listen(3000, () => console.log('Server listening on port 3000!'))
