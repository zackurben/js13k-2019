'use strict';

import '../main.css';
import StatCache from './StatCache';
import Primitive from './Primitive';
import Player from './Player';
import Shaders from './shaders';
import Camera from './Camera';
import Data from '../data/data.json';
import Triangulation from './Triangulator';
import {
  radToDisplayDeg,
  displayMat,
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

// CONFIG
const RANDOM_SPEED = 1;
const PICKUP_POINTS = 100;
const PICKUP_TIME = 100;
const BOOST_TIME = 200;

let debounceStats = 0;
let running = true;
let points = getScore();
let pickupCountdown = 0;
let pickupMultiplier = 0;
let boost = 0;

const canvas = el('canvas');
const debug = el('#debug');
const time = el('#time');
const oldScore = el('#old');
const newScore = el('#new');
const popup = el('.popup');
const replay = el('#replay');

const gl = canvas.getContext('webgl2');
if (!gl) {
  alert('Webgl2 is required to view this page. Please use another browser!');
}

const { Basic, MultiColored, Line, Lighted } = Shaders(gl);
const { Node, Cube, Plane, Axis } = Primitive({ Basic, Line });
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
      } else if (other.tag.startsWith('pickup')) {
        pickupMultiplier += 0.1;
        pickupCountdown = PICKUP_TIME;
        points = parseInt(points + PICKUP_POINTS * pickupMultiplier);
        world.removeComponent(other.parent);
      } else if (other.tag.startsWith('boosts')) {
        boost += BOOST_TIME;
        world.removeComponent(other.parent);
      }
    });
};

input.update = delta => {
  const _rspeed = input.viewSpeed * (delta / 1000);
  const [x, y, z] = input.getRotation().map(i => (i *= _rspeed));
  player.localMatrix = m4.multiply(player.localMatrix, m4.xRotation(x));
  player.localMatrix = m4.multiply(player.localMatrix, m4.yRotation(y));
  player.localMatrix = m4.multiply(player.localMatrix, m4.zRotation(z));

  const _speed = player.speed * (delta / 1000);
  const movement = input.getMovement().map(i => i * _speed);
  player.localMatrix = m4.translate(player.localMatrix, ...movement);

  let { Escape } = input.getKeys();
  if (debounceStats < 0 && Escape) {
    debounceStats = 250;
    el('#debug').classList.toggle('hide');
  }

  debounceStats -= delta;
};

const FPS = new StatCache();
const DRAW = new StatCache();

let gameobjects = {
  obstacles: [],
  pickups: [],
  boosts: []
};
let obstacles = [];
let pickups = [];
let boosts = [];
function generateItem(collection, cargs) {
  let parent = new Node({
    parent: world,
    translation: [Math.random() * 9 - 4.5, 0.5, -100]
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

function trimItems(collection) {
  let skip = false;
  let pos;
  return gameobjects[collection].filter(item => {
    if (skip) return true;

    pos = m4.getTranslation(item.localMatrix);
    if (pos[2] <= 10) {
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

function endGame(points) {
  let highScore = getScore();
  if (points > highScore) {
    storeScore(points);
  }

  popup.classList.toggle('hide');
  replay.onclick = replay.onclick || startGame;
}

function startGame() {
  popup.classList.toggle('hide');
  running = true;
  render();
}

let oarg = { color: repeat([1, 0, 0, 1], 36) };
let parg = { color: repeat([0, 1, 0, 1], 36), scale: [0.5, 0.5, 0.5] };
let barg = { color: repeat([1, 1, 0, 1], 36), scale: [0.3, 0.3, 0.3] };
let bOdds = 0;
let oOdds = 0;
let pOdds = 0;
let multiplier = 1;
function generator(time) {
  multiplier = (boost > 0 ? 2 : 1) + 0.3 * (time / 30000);

  bOdds = 0.002 * multiplier;
  oOdds = 0.004 * multiplier;
  pOdds = 0.004 * multiplier;

  random(pOdds, () => generateItem('pickups', parg)) ||
    random(oOdds, () => generateItem('obstacles', oarg)) ||
    random(bOdds, () => generateItem('boosts', barg));
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
const axis = new Axis({
  parent: world,
  scale: [10, 10, 10]
});

// RENDER
let lastRender = 0;
let delta;
let entities;
function render(timestamp = 0) {
  if (!running) return endGame(points);

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
  generator(timestamp);

  if (debug) {
    FPS.add(1000 / delta);
    DRAW.add(delta);

    debug.innerText = `frame ms: ${DRAW.get()}
    fps: ${FPS.get()}
    world world: ${displayMat(world.worldMatrix)}
    player world: ${displayMat(player.worldMatrix)}
    obstacles: ${gameobjects[obstacles].length}
    pickups: ${gameobjects[pickups].length}
    boosts: ${gameobjects[boosts].length}
    running: ${running}
    time: parseInt(timestamp / 1000)
    boost: ${parseInt(boost)}
    multiplier: ${pickupMultiplier}
    pickup countdown: ${pickupCountdown}
    points: ${points}
    `;

    time.innerText = `${formatTime(parseInt(timestamp / 60000))}:${formatTime(
      parseInt(timestamp / 1000) % 60
    )}:${formatTime(parseInt(timestamp) % 100)}`;

    oldScore.innerText = `Top: ${points}`;
    newScore.innerText = `Score: ${points}`;
  }
  lastRender = timestamp;
  return requestAnimationFrame(render);
}
render();
