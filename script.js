'use strict';

const btnPlayPause = document.querySelector('.play-pause-btn');
const btnRecord = document.querySelector('.record-btn');
const playhead = document.querySelector('.playhead');
const workspace = document.querySelector('.workspace');

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
  constructor(note, velocity, startTime, endTime) {
    this.note = note;
    this.velocity = velocity;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

(function () {
  navigator.requestMIDIAccess
    ? navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    : alert('WebMidi is not supported in this browser');
})();

const keypressHandler = function (event) {
  if (event.keyCode === 32) return playbackHandler();
};

const playbackHandler = function () {
  if (!AppState.isPlaying && !AppState.isRecording) return startPlayback();
  if (AppState.isPlaying && !AppState.isRecording) return stopPlayback();
};

const recordHandler = function () {
  if (!AppState.isRecording && AppState.isPlaying) {
    console.log(playbackInterval);
    clearInterval(playbackInterval);
    return startRecording();
  }
  if (!AppState.isRecording && !AppState.isPlaying) return startRecording();
  return stopRecording();
};

function onMIDISuccess(midiAccess) {
  midiAccess.addEventListener('statechange', (event) =>
    updateMIDIDevices(event.target)
  );
  updateMIDIDevices(midiAccess);
}

function onMIDIFailure() {
  alert('Failed to connect to midi');
}

function updateMIDIDevices(midiAccess) {
  const inputs = midiAccess.inputs;
  inputs.forEach((input) =>
    input.addEventListener('midimessage', onMIDIMessage)
  );
}

function onMIDIMessage(event) {
  if (AppState.isRecording && event.data[0] === 144) {
    notes.push(new Note(event.data[1], event.data[2], playheadPos));
    notes.sort((a, b) => {
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
    return;
  }
  if (AppState.isRecording && event.data[0] === 128) {
    notes.forEach((note) => {
      if (note.note === event.data[1] && note.endTime == null) {
        note.endTime = playheadPos;
        console.log(notes);
        return;
      }
    });
  }
}

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

const movePlayhead = function () {
  playbackInterval = setInterval(function () {
    playheadPos = playheadPos < 6000 ? (playheadPos += 1) : 0;
    playhead.style.transform = `translateX(${playheadPos / 62.5}vw)`;
  }, 10);
};

const startPlayback = function () {
  AppState.isPlaying = true;
  movePlayhead();
};

const stopPlayback = function () {
  AppState.isPlaying = false;
  clearInterval(playbackInterval);
  playbackQueue.forEach((time) => {
    clearTimeout(time);
  });
};

const startRecording = function () {
  AppState.isPlaying = false;
  AppState.isRecording = true;
  btnRecord.classList.add('recording');
  movePlayhead();
};

const stopRecording = function () {
  AppState.isRecording = false;
  btnRecord.classList.remove('recording');
  clearInterval(playbackInterval);
};

const playNote = function (note) {
  // Tone.js
};

document.addEventListener('keydown', (event) => {
  keypressHandler(event);
});

workspace.addEventListener('click', (event) => {
  if (!AppState.isPlaying && !AppState.isRecording)
    setPlayheadPosition(event.clientX);
});

btnPlayPause.addEventListener('click', () => {
  btnPlayPause.blur();
  playbackHandler();
});

btnRecord.addEventListener('click', () => {
  btnRecord.blur();
  recordHandler();
});
