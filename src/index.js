'use strict';

import '../main.css';
import StatCache from './StatCache';
import Primitive from './Primitive';
import Player from './Player';
import Shaders from './shaders';
import Camera from './Camera';
import {
  formatTime,
  storeScore,
  getScore,
  getAllComponents,
  repeat,
  random,
  calculateBB,
  el
} from './Util';
import Input from './Input';
import m4 from './Matrix';
import Audio from 'beepbox';
import song from '../theme.json';

const FPS = new StatCache();
const DRAW = new StatCache();

// GAME CONFIGS
const RANDOM_SPEED = 1;
const PICKUP_POINTS = 100;
const PICKUP_TIME = 200;
const BOOST_TIME = 200;

// GAME VARIABLES
let sounds = new Audio();
let audio;
let debounceStats = 0;
let running;
let highScore;
let points;
let pickupCountdown;
let pickupMultiplier;
let boost;
let startOffset;

// LAYOUT ELEMENTS
const canvas = el('canvas');
const debug = el('#debug');
const time = el('#time');
const oldScore = el('#old');
const newScore = el('#new');
const popup = el('.popup');
const replay = el('#replay');
const music = el('#music');

const gl = canvas.getContext('webgl2');
if (!gl) {
  alert('Webgl2 is required to view this page. Please use another browser!');
}

const { Basic, MultiColored, Lighted } = Shaders(gl);
const { Node, Cube, Plane, Axis } = Primitive({ Basic });
const world = new Node();
const camera = new Camera({
  translation: [0, 2, 4],
  rotation: [0, 0, 0],
  aspect: gl.canvas.clientWidth / gl.canvas.clientHeight
});
const input = Input({ canvas });
const player = new Player({
  parent: world,
  components: [camera, input],
  translation: [0, 0.5, 0],
  rotation: [0, 0, 0]
});
const playerRender = new Cube({
  parent: player,
  shader: Lighted,
  translation: [0, 0, 0],
  color: repeat([0.3, 0.1, 0.2, 1], 36)
});
playerRender.tag = 'player';
playerRender.physics = (delta, objects) => {
  let self = playerRender;

  // If the localMatrix has changed, recalculate the bounding box
  calculateBB(self);

  objects
    .filter(o => o.id !== self.id && o.hasOwnProperty('boundingbox'))
    .forEach(other => {
      if (!other.rigid) return;
      if (!['obstacles', 'pickups', 'boosts'].includes(other.tag)) return;

      // update objects bounding boxes
      calculateBB(other);

      if (!self.intersects(other)) return;

      if (other.tag.startsWith('obstacle')) {
        running = false;
        sounds.note(440, 0.1);
        sounds.note(311.13, 0.1, 0.1);
        sounds.note(220.0, 0.4, 0.2);
      } else if (other.tag.startsWith('pickup')) {
        pickupMultiplier += 0.1;
        pickupCountdown = PICKUP_TIME;
        points = parseInt(
          points + PICKUP_POINTS * pickupMultiplier * (boost > 0 ? 2 : 1)
        );
        world.removeComponent(other.parent);
        sounds.note(440, 0.2);
      } else if (other.tag.startsWith('boosts')) {
        boost += BOOST_TIME;
        world.removeComponent(other.parent);
        sounds.note(523.25, 0.3);
      }
    });
};

input.update = delta => {
  const _speed = player.speed * (delta / 1000);
  const movement = input.getMovement().map(i => i * _speed);
  const out = m4.translate(player.localMatrix, ...movement);

  // Restrict the players movements
  let [x, y, z] = m4.getTranslation(out);
  if (x < 4 && x > -4) {
    player.localMatrix = m4.translate(player.localMatrix, ...movement);
  }

  let { Escape } = input.getKeys();
  if (debounceStats < 0 && Escape) {
    debounceStats = 250;
    el('#debug').classList.toggle('hide');
  }

  debounceStats -= delta;
};

let gameobjects = {
  obstacles: [],
  pickups: [],
  boosts: []
};
let obstacles = [];
let pickups = [];
let boosts = [];
function generateItem(collection, cargs, time) {
  let zLoc = time < 10000 ? (time / 10000) * -80 + -20 : -100;
  let parent = new Node({
    parent: world,
    translation: [Math.random() * 9 - 4.5, 0.5, zLoc]
  });

  let speed = RANDOM_SPEED ? 50 + Math.random() * 50 : 100;
  parent.update = delta => {
    parent.localMatrix = m4.translate(
      parent.localMatrix,
      0,
      0,
      delta / (boost > 0 ? speed / 2 : speed)
    );
  };

  let child = new Cube({
    parent,
    translation: [0, 0, 0],
    shader: Lighted,
    ...cargs
  });

  child.rigid = true;
  child.tag = collection;

  gameobjects[collection].push(parent);
  return parent;
}

function trimItems(collection, force = false) {
  let skip = false;
  let pos;
  return gameobjects[collection].filter(item => {
    if (skip && !force) return true;

    pos = m4.getTranslation(item.localMatrix);
    if (pos[2] <= 10 && !force) {
      skip = true;
      return item;
    }

    world.removeComponent(item);
    return false;
  });
}

function updateBoost(delta) {
  if (boost > 0) {
    boost -= delta;
  } else {
    boost = 0;
  }
}

function updatePickupStats(delta) {
  if (pickupCountdown > 0) {
    pickupCountdown -= delta;
  } else {
    pickupMultiplier = 1;
  }
}

function getThemesong() {
  return new Audio(song);
}

function toggleMusic() {
  if (audio.context.state === 'running') {
    audio.context.suspend();
  } else {
    audio.context.resume();
  }

  music.classList.toggle('off');
}

function endGame(points) {
  let highScore = getScore();
  if (points > highScore) {
    storeScore(points);
  }
  if (audio.context.state === 'running') {
    audio.context.suspend();
    audio = getThemesong();
  }

  popup.classList.toggle('hide');
}

function startGame() {
  popup.classList.toggle('hide');
  resetGameData();
  render();
}

function resetGameData() {
  music.onclick = music.onclick || toggleMusic;
  replay.onclick = replay.onclick || startGame;

  // Reset audio to begining on each data reset.
  audio && audio.context.close();
  audio = getThemesong();
  audio.loop();

  // Start playing theme if it was on
  if (music.classList.contains('off')) {
    audio.context.suspend();
  }

  player.setMatrix();
  gameobjects[obstacles] = trimItems('obstacles', true);
  gameobjects[pickups] = trimItems('pickups', true);
  gameobjects[boosts] = trimItems('boosts', true);
  boost = 0;
  pickupMultiplier = 0;
  pickupCountdown = 0;
  highScore = getScore();
  points = 0;
  startOffset = undefined;
  running = true;
}

let oarg = { color: repeat([1, 0, 0, 1], 36) };
let parg = { color: repeat([0, 1, 0, 1], 36), scale: [0.5, 0.5, 0.5] };
let barg = { color: repeat([1, 1, 0, 1], 36), scale: [0.3, 0.3, 0.3] };
let bOdds = 0;
let oOdds = 0;
let pOdds = 0;
let multiplier = 1;
function generator(time) {
  multiplier = (boost > 0 ? 2 : 1) + 0.5 * (time / 15000);

  bOdds = 0.002 * multiplier;
  oOdds = 0.004 * multiplier;
  pOdds = 0.006 * multiplier;

  random(pOdds, () => generateItem('pickups', parg, time)) ||
    random(oOdds, () => generateItem('obstacles', oarg, time)) ||
    random(bOdds, () => generateItem('boosts', barg, time));
}

const floor = new Plane({
  parent: world,
  translation: [0, 0, -220],
  scale: [10, 1, 500],
  color: [0.7, 0.7, 0.7]
});
const rWall = new Plane({
  parent: world,
  translation: [-5, 1, -220],
  rotation: [0, 0, -1],
  scale: [2, 3, 500],
  color: [0.3, 0.3, 0.3]
});
const lWall = new Plane({
  parent: world,
  translation: [5, 1, -220],
  rotation: [0, 0, 1],
  scale: [2, 3, 500],
  color: [0.3, 0.3, 0.3]
});

// RENDER
let lastRender = 0;
let delta;
let entities;
let sessionTime = 0;
function render(timestamp = 0) {
  if (!running) return endGame(points);
  if (startOffset === undefined && timestamp !== 0) {
    startOffset = timestamp;
  }

  sessionTime = timestamp - startOffset || 0;
  delta = timestamp - lastRender;

  // Update game variables
  updateBoost(delta / 10);
  updatePickupStats(delta / 10);

  // Define the viewport dimensions.
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  world.updateWorldMatrix();
  entities = getAllComponents(world);
  entities.forEach(item => {
    if (item.update) item.update(delta);
    if (item.physics) item.physics(delta, entities);
    if (item.render) item.render({ camera });
  });

  // Clean up all game objects
  gameobjects[obstacles] = trimItems('obstacles');
  gameobjects[pickups] = trimItems('pickups');
  gameobjects[boosts] = trimItems('boosts');
  generator(sessionTime);

  if (debug) {
    FPS.add(1000 / delta);
    DRAW.add(delta);

    debug.innerText = `frame ms: ${DRAW.get()}
    fps: ${FPS.get()}
    obstacles: ${gameobjects[obstacles].length}
    pickups: ${gameobjects[pickups].length}
    boosts: ${gameobjects[boosts].length}
    running: ${running}
    time: ${parseInt(timestamp / 1000)}
    sessionTime: ${parseInt(sessionTime / 1000)}
    startOffset: ${startOffset}
    boost: ${parseInt(boost)}
    multiplier: ${multiplier}
    pickup multiplier: ${pickupMultiplier}
    pickup countdown: ${pickupCountdown}
    highscore: ${highScore}
    points: ${points}
    `;

    time.innerText = `${formatTime(parseInt(sessionTime / 60000))}:${formatTime(
      parseInt(sessionTime / 1000) % 60
    )}:${formatTime(parseInt(sessionTime) % 100)}`;

    oldScore.innerText = `Top: ${points > highScore ? points : highScore}`;
    newScore.innerText = `Score: ${points}`;
  }
  lastRender = timestamp;
  return requestAnimationFrame(render);
}

// Start the game for the first time and immediately pause it.
resetGameData();
render();
running = false;
