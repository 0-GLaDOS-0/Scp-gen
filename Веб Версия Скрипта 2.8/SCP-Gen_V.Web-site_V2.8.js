let startRoom = 45, mode, seed, type = [], obmen = [], seedNum, degr = [0, 1, 0, 2, 0, 1, 0, 3, 3, 1, 3, 2, 2, 1, 0], abc = "0123456789AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZzАаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЬьЫыЭэЮюЯя", floorplan = [], docking = [], ochered = [], endrooms = [], floorplanCount, generatorOn = false, genCount = 0, count, loop, g, zoneL={}, zoneH={}, zoneO={}, bigRoom, maxBigRoom = 3;
let maxrooms = 50, x1;
let minrooms = 20;
let nextStep = false;
let maxloop = 2;
let scores;

const fillTable = (mode='fill') => { //в зависимости от параметра mode эта функция либо БУДЕТ СТРОИТЬ ТАБЛИЦУ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ либо БУДЕТ ОЧИЩАТЬ ЗАПОЛНИНУЮ ТАБЛИЦУ И БУДЕТ ЗАПОЛНЯТЬ ЕЁ ПУСТЫМИ ЯЧЕЙКАМИ
	if (mode=='clear') {
		let table = document.getElementById('table');
		table.remove();

		let board = document.getElementById('board');
		table = document.createElement('table'); //значение переменной переписывается, потому что пред идущее значение уже бесполезно
		table.setAttribute('id', 'table');
		table.setAttribute('class', 'table');
		table.setAttribute('border', '0');
		table.setAttribute('cellpadding', '0');

		board.prepend(table)

		fillTable();

	} 
	else if (mode=='fill') {
		for (i = 0; i < 10; i++) {
			let trElement = document.createElement('tr')
			trElement.id = `${i}`

			for (j = 0; j < 10; j++) {
				let tdElement = document.createElement('td')
				let c = `${i}` + `${j}`
				tdElement.id = c

				let imgElement = document.createElement('img')
				imgElement.setAttribute('src', 'corridor_00.png')
				imgElement.setAttribute('alt', 'corridor_00')
				imgElement.setAttribute('id', `img_${c}`)
				
				trElement.append(tdElement)
				tdElement.append(imgElement)
			}

			let table = document.getElementById('table')
			table.append(trElement)
		};
	};
};

const visual = () => {
	for (i = 0; i < 10; i++) {
		for (j = 0; j < 10; j++) {
			let cordRoom = Number(`${i}` + `${j}`)
			if (docking[cordRoom] > 0) {
        let degr = [0, 1, 0, 2, 0, 1, 0, 3, 3, 1, 3, 2, 2, 1, 0], num = [1, 1, 3, 1, 5, 3, 7, 1, 3, 5, 7, 3, 7, 7, 15];
				let img = document.getElementById(`img_${i}${j}`)
        let sNum = num[docking[cordRoom]-1]
        if (sNum < 10)
        sNum = `0${sNum}`

				let file_img = `corridor_${sNum}.png`
				let s15 = docking[cordRoom]
				let rotate = degr[docking[cordRoom]-1]*90

				img.setAttribute('src', `${file_img}`)
				img.setAttribute('alt', `corridor_${s15}`)
				img.setAttribute('style', `transform: rotate(${rotate}deg)`)
			}
		}
	}
};

fillTable();

const build = () => {
  event.preventDefault(); //нужно только для того что бы страница не перезагружалась при нажатии "enter"
  setInterval(() => {
    if (scores != 0) {

      fillTable('clear');
      seed = document.getElementById("seed").value;
      if (!seed) {
  	    seed = makeseed();
      }
      seedNum = "";
      seed = strRepl(seed);
      for (let j=0;(j<seed.length && j < 8);j++) {
        seedNum += abc.indexOf(seed[j]);
        seedNum = new Random(+seedNum);
      }
      scores = 0;
      gen(scores - 1);
    }
    //-------------------------
    if (generatorOn && genCount < 200) {
      genCount++;
      start();
      if (nextStep) {
        genCount = 0;
        generatorOn = false;
        nextStep = false;
        dock();
        mapping();
        if (mode == 0) floorCopy(zoneL);
        if (mode == 1) floorCopy(zoneH);
        if (mode == 2) floorCopy(zoneO);
        visual();
        //place();
        console.log(`Сид: ${seed} ; Колец: ${loop} ; Биг рум: ${bigRoom} ; Количество: ${floorplanCount[3]}`);
      }
    }
  }, 50);
}


function makeseed() {
  let seed = "";
  for (let j=0;j<8;j++) {
    seed += abc[Math.floor(Math.random()*abc.length)];
  }
  return seed;
}
function gen(n) {
  if (n == 2) startRoom = obmen[1] || 45;
  else startRoom = 45;
  mode = n;
  generatorOn = true;
}

function floor(f, j = 1) {
    for (let i=0; i<100; i+=j)
    f(i);
}
function circleLength(mom, j) {
    let map = [], ochered = [];
    map[mom] = 2;
    ochered.push(mom);
    for (let i = 0; i<100; i++) {
        let room = ochered.shift();
        
        let x = room % 10;
        let dirs = [], arr1 = [];
        
        if (docking[room] < 0)
        dirs = getDir(-1 * docking[room]);
        if (room > 9 && !dirs.includes(1))
        arr1.push(room-10);
        
        if (x < 9 && !dirs.includes(2))
        arr1.push(room+1);
        
        if (room < 90 && !dirs.includes(4))
        arr1.push(room+10);
        
        if (x > 0 && !dirs.includes(8))
        arr1.push(room-1);
        
        for (let check of arr1) {
            if (floorplan[check] == 5 && map[check] == undefined) {
                if (check == j && room !== mom) {
                return map[room];
                }
                if (check !== j) {
                map[check] = map[room] + 1;
                ochered.push(check);
                }
            }
        }
    }
    return 0;
}

function getDir(num) {
    let arr = [];
    
    for (let n of [8, 4, 2, 1]) {
        if (num - n >= 0) {
            arr.push(n);
            num -= n;
        }
    }
    return arr;
}
function unDock2(mother, from, to, dir, znak = -1) {
    if (to == mother || floorplan[to] < 5 || floorplan[to] == undefined)
    return 0;
    
      let dir1 = dir * 4;
     
      if (dir1 > 8)
      dir1 = dir / 4;
      
      docking[from] += znak * dir;
      docking[to] += znak * dir1;
      return 1;
  return 0;
}

function unDock(mother, j) {
    let circle = circleLength(mother, j);
  let x1 = j % 10;
    g = [];
    line(floorplan, 5, x1, j, () => unDock2(mother, j, j - 1, 8), () => unDock2(mother, j, j + 1, 2), () => unDock2(mother, j, j - 10, 1), () => unDock2(mother, j, j + 10, 4));
    
    if (circle > 15 && loop < maxloop) {
        loop++;
        line(floorplan, 5, x1, j, () => f(mother, j, j - 1, 8), () => f(mother, j, j + 1, 2), () => f(mother, j, j - 10, 1), () => f(mother, j, j + 10, 4));
        let n = g[random(g.length)];
        unDock2(mother, j, n[0], n[1], 1);
        //return 0;
    }
    
    //return g;
}

function f(mother, j, i, num) {
    if (mother != i)
        g.push([i, num]);
}


function floorCopy(obj) {
    obj.floorplan = [...floorplan];
    obj.type = [...type];
    obj.docking = [...docking];
}

function start() {
  for (let k = 0; k < 50; k++) {
    floor((i) => floorplan[i] = 0);
    floor((i) => docking[i] = 0);
    floorplanCount = [0, 0, 0, 0];
    endrooms = [];
    type = [];
    ochered = [];
    nAdd(startRoom);
    if (mode == 1) hard(startRoom);
    if (mode == 2) type[startRoom] = obmen[0];
  
    loop = 0;
    bigRoom = 0;
    while (floorplanCount[3] <= maxrooms && ochered.length > 0) {
    let i = ochered.shift();
    let x = i % 10; 
     if (x > 0) 
     visit(i - 1, i);
     if (x < 9) 
     visit(i + 1, i);
     if (i > 9)
     visit(i - 10, i);
     if (i < 90)
     visit(i + 10, i);
  }
  if (loop < maxloop || floorplanCount[3] < minrooms || endCount() < 4) {
  continue;
  }
  if (mode == 1) {
    let arr = arrSide();
    if (Math.abs(floorplanCount[1] - floorplanCount[2]) > 10 || arr.length < 2 || type[arr[0]] != type[arr[1]]) {
  continue;
  }
  obmen = [type[arr[0]+9], ...arr];
  }
  if (mode == 2) {
    if (floorplan[obmen[1]] != 5 || floorplan[obmen[2]] != 5 || !nCount(obmen[1]) || !nCount(obmen[2]) || floorplan[obmen[2]+1] != 5 || floorplan[obmen[1]+1] != 5) {
    continue;
  }}
  nextStep = true;
  break;
  }
}

function endCount() {
    let c = 0;
    for (let i=0; i<100; i++) {
        if (nCount(i) && floorplan[i] == 5)
        c++;
    }
    if (mode == 1 || mode == 2) c -= 2;
    return c;
}

function arrSide() {
    let room1 = [], room2 = [];
  for (let i = 0;i < 10; i++) {
    if (nCount(i*10 + 9) && floorplan[i*10+8] == 5 && floorplan[i*10 + 9] == 5) {
        if (type[i*10+9] == 1) room1.push(i*10);
        if (type[i*10+9] == 2) room2.push(i*10);
    }
  }
  if (room1.length < 2 && room2.length < 2) return [0];
  let arr = room2.length >= room1.length ? room2 : room1;
  shuffle(arr);
  return arr;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = random(i+1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function hard(i) {
  ochered.shift();
  let arr = [-10, 1, 10, -1, -10], num = random(4);
  nAdd(i+arr[num], 2);
  nAdd(i+arr[num+1], 1);
}

function nAdd(i, type1 = 0) {
    floorplan[i] = 5;
    type[i] = type1;
    floorplanCount[3]++;
    floorplanCount[type1]++;
    ochered.push(i);
    let x1 = i % 10;
  if (x1 > 0 && floorplan[i - 1] < 5) floorplan[i - 1] += 1;
  if (x1 < 9 && floorplan[i + 1] < 5) floorplan[i + 1] += 1;
  if (i > 9 && floorplan[i - 10] < 5) floorplan[i - 10] += 1;
  if (i < 90 && floorplan[i + 10] < 5) floorplan[i + 10] += 1;
}

function nCount(i) {
  let x1 = i % 10;
  count = 0;
  let d = docking[i] || 0;
  line(floorplan, 5, x1, i, () => count++)
  if (count == 1 || (d==1 || d==2 || d==4 || d==8))
    return true;
    
  return false;
}
function line(arr, n, x1, i, f1, f2 = f1, f3=f1, f4=f1) {
  if (x1 > 0 && (arr[i-1] == n || arr[i-1] == undefined))
  f1();
  if (x1 < 9 && (arr[i+1] == n || arr[i+1] == undefined))
  f2();
  if (i > 9 && (arr[i-10] == n || arr[i-10] == undefined))
  f3();
  if (i < 90 && (arr[i+10] == n || arr[i+10] == undefined))
  f4();
}

function nType(i, c = type[i]) {
  let x1 = i % 10;
  count = 0;
  line(type, c, x1, i, () => count++)
  if (x1 == 0) count++;
  if (x1 == 9) count++;
  if (i < 10) count++;
  if (i > 89) count++;
  if (count > 3) return true;
  else return false;
}

function visit(j, from) {
    if (mode == 1 && !nType(j, type[from]))
        return;
    
    if (floorplan[j] == undefined || floorplan[j] > 4)
        return;

    if (random() < 0.5 && (j != startRoom + 10 || mode == 2))
        return;
        
    if (floorplan[j] > 1 && loop >= maxloop)
        return;
        
    if (floorplanCount[3] >= maxrooms)
        return;
  
    if (loop < maxloop) {
      x1 = j % 10;
         if (x1 > 0 && floorplan[j-1] + floorplan[j+9] + floorplan[j+10] > 14) {
           bigR(j, from);
     return;      
    }
    else if (x1 < 9 && floorplan[j+10] + floorplan[j+11] + floorplan[j+1] > 14) {
      bigR(j, from);
     return;
    }
    else if (x1 < 9 && floorplan[j+1] + floorplan[j-9] + floorplan[j-10] > 14) {
      bigR(j, from);
     return;
    }
    else if (x1 > 0 && floorplan[j-10] + floorplan[j-11] + floorplan[j-1] > 14) {
      bigR(j, from);
     return;
    }
    else if (floorplan[j] > 1) {
        nAdd(j, type[from]);
        floorplan[j] = 5;
        unDock(from, j)
    } }
     if (floorplan[j] < 2)
    nAdd(j, type[from]);
    return;
}
function bigR(j, i) {
      nAdd(j, type[i]);
      unDock(i, j);
}
function dock() {
  floor((j) => {
      x1 = j % 10;
    if (floorplan[j] > 4)
    line(floorplan, 5, x1, j, () => docking[j] += 8, () => docking[j] += 2, () => docking[j] += 1, () => docking[j] += 4);
  });
}
function Random(seed) {
  seed = (seed || 9) % 2147483647;
  return {
    next: function() {
      return seed = seed * 48271 % 2147483647;
    }, 
  };
};
function random(n = 0) {
  let num1 = `${seedNum.next()}`, num2 = `${seedNum.next()}`;
  let res = parseFloat(`0.${num1[num1.length-2]}${num2[num2.length-2]}${num1[num1.length-4]}${num2[num2.length-4]}`);
  if (!n)
  return res
  return Math.floor(res*n);
}
function map1(arr, num, min = 1, max = min) {
  for (let j=0;j < random(max-min+1)+min;j++) {
  floorplan[arr.splice(random(arr.length), 1)] = num;
  }
}
function mapping() {
    let straight = [], triple = [], corner = [];
    for (let j = 0; j < 100; j++) {
  if (floorplan[j] == 5 && nCount(j))
  endrooms.push(j);
  if (docking[j] == 5 || docking[j] == 10)
  straight.push(j);
  if (docking[j] == 14 || docking[j] == 13 || docking[j] == 11 || docking[j] == 7)
  triple.push(j);
  if (docking[j] == 3 || docking[j] == 6 || docking[j] == 12 || docking[j] == 9)
  corner.push(j);
  
  
}
if (mode == 0) {
  map1(endrooms, 0);
floorplan[endrooms.pop()] = 1;
floorplan[endrooms.shift()] = 1;
  if (triple.length > straight.length)
  map1(triple, 2);
  else map1(straight, 2);
  map1(endrooms, 3);
  map1(straight, 4);
  map1(endrooms, 6);
  map1(endrooms, 7);
  map1(endrooms, 8);
  map1(endrooms, 9);
  map1(straight, 10, 1, 3);
  map1(straight, 11, 2, 5);
  }
  if (mode == 1) {
      floorplan[endrooms.splice(endrooms.indexOf(obmen[1]+9), 1)] = 13;
      floorplan[endrooms.splice(endrooms.indexOf(obmen[2]+9), 1)] = 13;
      floorplan[startRoom] = 18;
      floorplan[endrooms.pop()] = 14;
      floorplan[endrooms.shift()] = 14;
      map1(endrooms, 15);
      map1(straight, 16);
      map1(straight, 17, 2);
      map1(endrooms, 19);
      map1(straight, 20, 0, 3);
      map1(straight, 21);
      map1(straight, 22);
      map1(triple, 23, 0, 1);
      map1(endrooms, 24, 0, 1);
      floor((i) => {
          if (floorplan[i] == 5)
          floorplan[i] = 12;
      });
  }
  if (mode == 2) {
      floorplan[endrooms.splice(endrooms.indexOf(obmen[1]), 1)] = 26;
      floorplan[endrooms.splice(endrooms.indexOf(obmen[2]), 1)] = 26;
      map1(endrooms, 27);
      map1(endrooms, 28);
      map1(endrooms, 29);
      map1(corner, 32);
      map1(straight, 33, 0, 2);
      map1(straight, 34, 0, 2);
      map1(straight, 35, 0, 2);
      map1(straight, 36, 0, 2);
      floor((i) => {
          if (floorplan[i] == 5)
          floorplan[i] = 25;
      });
      for (let i=0; i < endrooms.length; i++) {
        floorplan[endrooms[i]] = random(2)+30;
      }
  }
}
function place() {
    let startX = startRoom % 10;
    let startY = (startRoom - startX) / 10;
    let num = [1, 1, 3, 1, 5, 3, 7, 1, 3, 5, 7, 3, 7, 7, 15], rooms = ["D-class", "exit_L", "SCP-173", "office", "toilet", "corridor_L", "SCP-914", "SCP-372", "SCP-012", "armory_L", "gateway", "greenhouse", "corridor_H", "exit_H", "elevator", "SCP-096", "SCP-049", "alpha", "server", "SCP-079", "tesla", "SCP-939", "HID", "armory_H", "SCP-106", "corridor_O", "exit_O", "gates_A", "gates_B", "shelter", "impasse_Big", "impasse_Small", "intercom", "office_Big", "office_Medium", "office_Small", "corridor_conference"];
    for (let j=0;j<100;j++) {
        let x1 = j % 10;
        let y1 = (j - x1) / 10;
        if (docking[j]) {
            try {
              over.runCommand(`structure load ${rooms[floorplan[j]]}_${num[docking[j]-1]} ${centreX + (startX -x1)*26} ${z1} ${centreY + (startY-y1)*26} ${degr[docking[j]-1]*90}_degrees`)
            } catch {
                console.warn(`${docking[j]} [${j}]`);
            }
        }
    }
}

function strRepl(str) {
  let from = "укехаросмУКЕНХВАРОСМИТ0ёЁЙ3", to = "ykexapocmYKEHXBAPOCMNTOeENЗ";
  for (let i=0;i<str.length;i++) {
    if (from.includes(str[i])) {
      str = str.replaceAt(i, to[from.indexOf(str[i])]);
    }
  }
  return str;
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
