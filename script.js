// --------------------- COINS ---------------------
let coins = parseInt(localStorage.getItem('coins')) || 0;
document.getElementById('coins').textContent = coins;

// --------------------- BASE EARNINGS ---------------------
const baseEarnings = {
  "common":1,
  "rare":50,
  "epic":500,
  "legendary":50000,
  "mythic":5000000,
  "titanic":1000000000
};

// --------------------- TRAITS ---------------------
const traits = [
  {name:"Gold", multiplier:1.0},
  {name:"Diamond", multiplier:1.2},
  {name:"Rainbow", multiplier:1.5},
  {name:"Crimson", multiplier:1.8},
  {name:"Toxic", multiplier:2.0}
];

// --------------------- CHARACTER CLASS ---------------------
class Character {
  constructor(name, emoji, rarity) {
    this.name = name;
    this.emoji = emoji;
    this.rarity = rarity;
    this.trait = null;
    this.multiplier = 1;
  }

  assignTrait(trait) {
    this.trait = trait.name;
    this.multiplier = trait.multiplier;
  }

  earnings() {
    return Math.floor((baseEarnings[this.rarity] || 1) * this.multiplier);
  }

  displayName() {
    return `${this.emoji} ${this.name}`;
  }
}

// --------------------- PACK CLASS ---------------------
class Pack {
  constructor(name, cost, unlock, items) {
    this.name = name;
    this.cost = cost;
    this.unlock = unlock;
    this.items = items; // array of Character objects
  }

  spin() {
    let r = Math.random()*100;
    let cumulative = 0;
    for (let item of this.items) {
      cumulative += item.chance;
      if (r <= cumulative) return Object.assign(new Character(item.name,item.emoji,item.rarity), item);
    }
    return Object.assign(new Character(this.items[0].name,this.items[0].emoji,this.items[0].rarity), this.items[0]);
  }
}

// --------------------- PACKS ---------------------
const packs = [
  new Pack("Normal Pack",10,0,[{name:"Cat",emoji:"🐱",rarity:"common",chance:50},{name:"Dog",emoji:"🐶",rarity:"common",chance:50}]),
  new Pack("Event Pack",50,50,[{name:"Owl",emoji:"🦉",rarity:"rare",chance:50},{name:"Unicorn",emoji:"🦄",rarity:"epic",chance:50}]),
  new Pack("Mystic Pack",200,200,[{name:"Griffin",emoji:"🦅",rarity:"epic",chance:50},{name:"Hydra",emoji:"🐉",rarity:"mythic",chance:50}]),
  new Pack("Legend Pack",1000,1000,[{name:"Dragon",emoji:"🐲",rarity:"legendary",chance:50},{name:"Phoenix",emoji:"🔥",rarity:"legendary",chance:50}]),
  new Pack("Epic Pack",5000,5000,[{name:"Titan",emoji:"👹",rarity:"titanic",chance:50}]),
  new Pack("Ultimate Pack",50000,50000,[{name:"Galactic Titan",emoji:"👽",rarity:"titanic",chance:100}]),
  new Pack("Celestial Pack",500000,500000,[{name:"Celestial Dragon",emoji:"🌌",rarity:"titanic",chance:100}]),
  new Pack("Stellar Pack",5000000,5000000,[{name:"Stellar Phoenix",emoji:"🌠",rarity:"titanic",chance:100}]),
  new Pack("Galaxy Pack",50000000,50000000,[{name:"Galaxy Hydra",emoji:"🌌🐉",rarity:"titanic",chance:100}]),
  new Pack("Cosmic Pack",500000000,500000000,[{name:"Cosmic Leviathan",emoji:"🌌👹",rarity:"titanic",chance:100}]),
  new Pack("Titan Pack",1000000000000,1000000000,[{name:"Omega Dragon",emoji:"🐉💥",rarity:"titanic",chance:100}])
];

// --------------------- INVENTORY ---------------------
let rawInventory = JSON.parse(localStorage.getItem('inventory')) || [];
let inventory = rawInventory.map(item => {
  let char = new Character(item.name, item.emoji, item.rarity);
  char.trait = item.trait;
  char.multiplier = item.multiplier;
  return char;
});

// --------------------- DISPLAY PACKS ---------------------
function displayPacks(){
  const packDiv = document.getElementById('packs');
  packDiv.innerHTML = '';
  packs.forEach(p=>{
    if(coins>=p.unlock || coins===0){
      const btn = document.createElement('button');
      btn.className='pack-btn';
      btn.textContent=`${p.name} (${p.cost.toLocaleString()} Coins)`;
      btn.onclick=()=>spinPack(p.name);
      packDiv.appendChild(btn);
    }
  });
}
displayPacks();

// --------------------- SPIN PACK WITH ANIMATION ---------------------
function spinPack(packName){
  const pack = packs.find(p=>p.name===packName);
  if(!pack) return;
  if(coins<pack.cost && coins>0) return alert("Not enough coins!");
  coins -= pack.cost;
  document.getElementById('coins').textContent=coins;
  localStorage.setItem('coins',coins);

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "Spinning... 🎲";

  // Spin animation sequence
  const spinDuration = 2000; // 2 seconds
  const spinInterval = 100; // 0.1s per change
  let elapsed = 0;

  const spinTimer = setInterval(() => {
    const randomChar = pack.items[Math.floor(Math.random() * pack.items.length)];
    resultDiv.innerHTML = `<span class="character">${randomChar.emoji} ${randomChar.name}</span>`;
    elapsed += spinInterval;
    if(elapsed >= spinDuration){
      clearInterval(spinTimer);

      // Actual reward
      const reward = pack.spin();
      reward.assignTrait(traits[Math.floor(Math.random()*traits.length)]);
      inventory.push(reward);
      localStorage.setItem('inventory',JSON.stringify(inventory));
      showResult(reward);
      updateInventory();
      displayPacks();
    }
  }, spinInterval);
}

// --------------------- SHOW RESULT WITH SPARKLE & SOUND ---------------------
function showResult(item){
  const div=document.getElementById('result');
  
  let sparkle = '';
  if(["rare","epic","legendary","mythic","titanic"].includes(item.rarity)){
    sparkle = '<span class="sparkle">✨</span>';
    if(typeof Audio !== "undefined"){
      const audio = new Audio('https://www.myinstants.com/media/sounds/magic-chime.mp3');
      audio.volume = 0.3;
      audio.play();
    }
  }

  div.innerHTML=`<span class="trait trait-${item.trait}">${item.trait}</span> <span class="character">${item.displayName()}</span> <span class="${item.rarity}">${item.rarity}</span> ${sparkle}`;
}

// --------------------- UPDATE INVENTORY ---------------------
function updateInventory(){
  const invList=document.getElementById('inventory');
  invList.innerHTML='';
  inventory.forEach((item,index)=>{
    const li=document.createElement('li');
    li.innerHTML=`<span class="trait trait-${item.trait}">${item.trait}</span> <span class="character">${item.displayName()}</span> <span class="${item.rarity}">${item.rarity}</span> <span class="earnings">+${item.earnings().toLocaleString()} per tick</span> <button onclick="sellItem(${index})">Sell</button>`;
    invList.appendChild(li);
  });
}

// --------------------- SELL FUNCTIONS ---------------------
function sellItem(index){
  const item=inventory[index];
  coins += item.earnings();
  inventory.splice(index,1);
  localStorage.setItem('coins',coins);
  localStorage.setItem('inventory',JSON.stringify(inventory));
  document.getElementById('coins').textContent=coins;
  updateInventory();
  displayPacks();
}

function sellAll(){
  let total=0;
  inventory.forEach(item=>{ total+=item.earnings(); });
  coins += total;
  inventory=[];
  localStorage.setItem('coins',coins);
  localStorage.setItem('inventory',JSON.stringify(inventory));
  document.getElementById('coins').textContent=coins;
  updateInventory();
  displayPacks();
}

// --------------------- PASSIVE EARNINGS ---------------------
function earnCoinsOverTime(){
  let total=0;
  inventory.forEach(item=>{ total+=item.earnings(); });
  if(total>0){
    coins += total;
    document.getElementById('coins').textContent=coins;
    localStorage.setItem('coins',coins);
    updateInventory();
    displayPacks();
  }
}
setInterval(earnCoinsOverTime,1000); // every second