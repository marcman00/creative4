var app = new Vue({
  el: '#app',
  data: {
    player: [],
    enemy:[],
    enemyAttackType:0,
    name: '',
    location: 'newPlayer',
    default_attack: 3,
    default_maxHp:12,
    default_defense:0,
    descriptions: [],
    combatMessage:'',
  },

   created:function() {
      // Initialize Descriptions()
	this.descriptions[0]=''; // teaching basics
	this.descriptions[1]='Take a rest at Ye Olde Tavern to fully restore your health' // inn
	this.descriptions[2]='Home of the finest blacksmith in the kingdom' // smithy
	this.descriptions[3]='Challenge the next tournament contender' // jousting

	this.descriptions[4]='Strengthen your equipment, increasing attack by 1' // attack
	this.descriptions[5]='Forge stronger armor, reducing damage taken by 1' // defense
	this.descriptions[6]='Enhance your armor, increasing your max health by 2' // maxHp
      // Check if a player save file already exists
      this.getPlayer();
   },

  computed: {
    recentAttack:function() {
	if (this.enemyAttackType===3)
	   return "images/lance.png"
	else if (this.enemyAttackType==2)
	  return "images/shield.png"
	else if (this.enemyAttackType==1)
	  return "images/sword.png"
	else
	  return "images/unknown.png";
    },
  },
  methods: {

   getPlayer: function() {
     axios.get("/api/player").then(response => {
	this.player=response.data;
	this.name=this.player.name;
	this.location=this.player.location;

     if (this.player.name.length>0) {
         this.location=this.player.location;
	 this.getEnemy();
	}
     return true;
    }).catch(err => {});


   },

  getEnemy:function() {
	axios.get("/api/enemy").then(response => {
     this.enemy=response.data;
     return true;
    }).catch(err => {});
   },

  newPlayer: function () {
	// Make sure a name has been entered
	if (this.name.length>0) {
	   this.name= this.name.charAt(0).toUpperCase() + this.name.slice(1);
	// Initialize player stats
	axios.post("/api/player", {
	   name:this.name,
	   defense:this.default_defense,
	   attack:this.default_attack,
	   maxHp:this.default_maxHp,
	   currentHp:this.default_maxHp,
	   battlesWon:0,
	   gold:0,
	   image:'', // finish later
	   location:'town',
	}).then(response => {
	//this.text="";
	   this.getPlayer();
	   return true;
	}).catch(err => { });

	let randomName=this.makeRandomName();
	// Initialize first enemy
	axios.post("/api/enemy", {
	  name:randomName,
	  defense:0,
	  attack:this.default_attack-1,
	  maxHp:this.default_maxHp/2,
	  currentHp:this.default_maxHp/2,
	  image:'', // will finish later
       }).then(response => {
	   this.getEnemy();
	   return true;
	}).catch(err => { });

	}
   },

   updatePlayer: function () {
	axios.post("/api/player", {
	   name: this.name,
	   defense: this.player.defense,
	   attack: this.player.attack,
	   maxHp: this.player.maxHp,
	   currentHp: this.player.currentHp,
	   battlesWon: this.player.battlesWon,
	   gold: this.player.gold,
	   image: this.player.image,
	   location: this.location,
	}).then(response => {
	this.getPlayer();
	   return true;
	}).catch(err => { });
   },

   updateEnemy: function () {
	axios.post("/api/enemy", {
	   name:this.enemy.name,
	   defense:this.enemy.defense,
	   attack:this.enemy.attack,
	   maxHp:this.enemy.maxHp,
	   currentHp:this.enemy.currentHp,
	   image:this.player.image,
	}).then(response => {
	   return true;
	}).catch(err => { });
   },

   retire:function() {
	axios.delete("/api/player").
	then(response => {
	  this.name='';
	  //this.getPlayer();
	  this.location='newPlayer';
	  this.updatePlayer();
	  return true;
	}).catch(err => {});
    },

   goInn:function() {
	this.location='inn';
	this.updatePlayer();
	},
   goSmithy:function() {
	this.location='smithy';
	this.updatePlayer();
	},
   goJousting:function() {
	this.location='jousting';
	this.updatePlayer();
	},
   goTown:function() {
	this.location='town';
	this.updatePlayer();
	},

   attack:function(type) {
	// play random sound effect
	let attackSound=1+Math.floor(Math.random()*4);
	let audio = new Audio('sound/attack'+attackSound+'.mp3');
	audio.play();

	// 1=sword, 2=shield, 3=lance
	let enemyAttack=1+Math.floor(Math.random() * 3); // returns a number between 1 and 3
	this.enemyAttackType=enemyAttack;
	if (type==1 && enemyAttack==2) {
		this.enemy.currentHp=this.enemy.currentHp-this.player.attack;
		this.combatMessage="Your sword got around the enemy's shield, dealing "+this.player.attack+" damage!";
	}
	else if (type==2 && enemyAttack==3) {
		this.enemy.currentHp=this.enemy.currentHp-this.player.attack;
		this.combatMessage="Your shield knocked away the enemy's lance, dealing "+this.player.attack+" damage!";
	}
	else if (type==3 && enemyAttack==1) {
		this.enemy.currentHp=this.enemy.currentHp-this.player.attack;
		this.combatMessage="Your lance stabbed the enemy, hitting them for "+this.player.attack+" damage!";
	}
	else if (type==2 && enemyAttack==1) {
		this.player.currentHp=this.player.currentHp-this.enemy.attack;
		this.combatMessage="The enemy's sword got the better of your shield. You took "+(this.enemy.attack-this.player.defense)+" damage!";
	}
	else if (type==3 && enemyAttack==2) {
		this.player.currentHp=this.player.currentHp-this.enemy.attack;
		this.combatMessage="The enemy's shield knocked your lance off balance, dealing "+(this.enemy.attack-this.player.defense)+
		" damage to you!";
	}	
	else if (type==1 && enemyAttack==3) {
		this.player.currentHp=this.player.currentHp-this.enemy.attack;
		this.combatMessage="The enemy's lancing skills were better than your swordsmanship. You received "+
			(this.enemy.attack-this.player.defense) + " damage!";
	}
	else
		this.combatMessage="You both chose the same weapon this round, resulting in a draw!"

	this.updateEnemy();

	if (this.player.currentHp<=0) {
	   this.location="death";
	}
	else if (this.enemy.currentHp<=0) {
		this.combatMessage='';
		this.location="victory";
		this.player.battlesWon++;
		this.player.gold+=5;
		this.enemyAttackType=0;
	
		let attackmod=this.player.battlesWon%2;
		let randomName=this.makeRandomName();
		// create a new, stronger enemy
		axios.post("/api/enemy", {
	 	name:randomName, // At some point, use random names
	  	defense:0,
	  	attack:this.enemy.attack+attackmod,
	  	maxHp:this.enemy.maxHp+1,
	 	currentHp:this.enemy.maxHp+1,
	  	image:'', // will finish later
       		}).then(response => {
	   	this.getEnemy();
	   	return true;
		}).catch(err => { });
	}
	this.updatePlayer();

	},

   rest:function() {
	if (this.player.gold>=2 && this.player.currentHp<this.player.maxHp) {
	  this.player.gold-=2;
	  this.player.currentHp=this.player.maxHp;
	  this.location='town';
	  this.updatePlayer();
	  let audio = new Audio('sound/purchase.mp3');
	  audio.play();
	}
  },
  upgrade:function(type) {
	let audio = new Audio('sound/purchase.mp3');
	
	if (type==='attack' && this.player.gold>=5) {
		this.player.attack++;
		this.player.gold-=5;
		this.updatePlayer();
		audio.play();
	}
	else if (type==='maxHp' && this.player.gold>=4) {
		this.player.maxHp+=2;
		this.player.currentHp+=2;
		this.player.gold-=4;
		this.updatePlayer();
		audio.play();
	}
	else if (type==='defense' && this.player.gold>=10) {
		this.player.defense++;
		this.player.gold-=10;
		this.updatePlayer();
		audio.play();
	}
	},
	makeRandomName:function() {
	  let first=['Sir','Count','Duke','Drake','Baron','','','Prince']
	  let second=['William','Arthur','Gawain','Francis','John','Henry','Robin','Lancelot','Rowan']
	  let third=['II','III','IV','the Terrible','the Great','the Brave','the Strong']
	  let firstChoice=Math.floor(Math.random() * first.length); 
	  let secondChoice=Math.floor(Math.random() * second.length);
	  let thirdChoice=Math.floor(Math.random() * third.length); 

	  let enemyName=first[firstChoice]+' '+second[secondChoice]+' '+third[thirdChoice];
	  return enemyName;
	}
}
});
