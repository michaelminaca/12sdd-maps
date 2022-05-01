'use strict';

// Buttons
const btnPlayPause = document.querySelector('.play-pause-btn');
const btnRecording = document.querySelector('.record-btn');
const btnSettings = document.querySelector('.settings-btn');

//Timeline
const playhead = document.querySelector('.playhead');
const playheadHead = document.querySelector('.playhead-head');

//Workspace
const workspace = document.querySelector('.workspace');
const settingsMenu = document.querySelector('.settings-menu');

const notes = [];
const playbackQueue = [];
let playheadPos = 0;
let playbackInterval = null;

const workspaceWidth = 96;
const unitsPerVW = 62.5;

const AppState = {
  isPlaying: false,
  isRecording: false,
};

class Note {
  constructor(note, velocity, time, duration) {
    this.note = note;
    this.velocity = velocity;
    this.time = time;
    this.duration = duration;
  }
}

// (function () {
//   navigator.requestMIDIAccess
//     ? navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
//     : alert('WebMidi is not supported in this browser');
// })();

// function onMIDISuccess(midiAccess) {
//   midiAccess.addEventListener('statechange', (event) =>
//     updateMIDIDevices(event.target)
//   );
//   const inputs = midiAccess.inputs;
//   inputs.forEach((input) =>
//     input.addEventListener('midimessage', () => console.log('midimessage'))
//   );
// }

// function onMIDIFailure() {
//   alert('Failed to connect to midi');
// }

// function updateMIDIDevices(midiAccess) {}

// function onMIDIMessage(event) {
//   console.log('event');
// }

const keypressHandler = function (event) {
  if (event.keyCode === 32) playbackHandler();
};

const playbackHandler = function () {
  AppState.isPlaying ? stopPlayback() : startPlayback();
};

const setPlayheadPosition = function (mouseX) {
  playheadPos = calcPlayheadPosition(mouseX);
  playhead.style.transform = `translateX(${playheadPos / 62.5}vw)`;
};

const calcPlayheadPosition = function (mouseX) {
  const vw = (mouseX * 100) / document.documentElement.clientWidth - 3;
  if (vw >= 0 && vw <= workspaceWidth)
    return Math.round(
      ((mouseX * 100) / document.documentElement.clientWidth - 3) * unitsPerVW
    );
  if (vw < 0) return 0;
  return Math.round(workspaceWidth * unitsPerVW);
};

const calcPlayheadPlaybackPosition = function (headPos) {
  if (headPos >= 0 && headPos < 6000) return headPos++;
  return 0;
};

const stopPlayback = function () {
  clearInterval(playbackInterval);
  AppState.isPlaying = false;
};

const startPlayback = function () {
  AppState.isPlaying = true;
  playbackInterval = setInterval(function () {
    playheadPos = playheadPos < 6000 ? (playheadPos += 1) : 0;
    playhead.style.transform = `translateX(${playheadPos / 62.5}vw)`;
  }, 10);
};

const playNote = function (note) {
  // Tone.js
};

document.addEventListener('keydown', (event) => {
  keypressHandler(event);
});

workspace.addEventListener('click', (event) => {
  if (!AppState.isPlaying) setPlayheadPosition(event.clientX);
});

btnPlayPause.addEventListener('click', (event) => {
  btnPlayPause.blur();
  playbackHandler();
});
