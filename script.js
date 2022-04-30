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

const setPlayheadPosition = function (mouseX) {
  playheadPos = calcPlayheadPosition(mouseX);
  playhead.style.transform = `translateX(${playheadPos / 62.5}vw)`;
};

const calcPlayheadPosition = function (mouseX) {
  const vw = (mouseX * 100) / document.documentElement.clientWidth - 3;
  if (vw >= 0 && vw <= 96)
    return Math.round(
      ((mouseX * 100) / document.documentElement.clientWidth - 3) * 62.5
    );
  if (vw < 0) return 0;
  return Math.round(96 * 62.5);
};

workspace.addEventListener('click', (event) => {
  setPlayheadPosition(event.clientX);
});
