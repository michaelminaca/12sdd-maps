'use strict';

const btnPlayPause = document.querySelector('.play-pause-btn');
const btnRecord = document.querySelector('.record-btn');
const playhead = document.querySelector('.playhead');
const workspace = document.querySelector('.workspace');

const notes = [];
const playbackQueue = [];
let playheadPos = 0;
let playbackInterval = null;

const WORKSPACE_WIDTH = 96;
const UNITS_PER_VW = 62.5;

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

const sampler = new Tone.Sampler({
  urls: {
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
  },
  release: 1,
  baseUrl: 'https://tonejs.github.io/audio/salamander/',
}).toDestination();

Tone.loaded().then(() => {
  navigator.requestMIDIAccess
    ? navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    : alert('WebMidi is not supported in this browser');
});

const keypressHandler = function (event) {
  if (event.keyCode === 32) return playbackHandler();
};

const playbackHandler = function () {
  if (!AppState.isPlaying && !AppState.isRecording) return startPlayback();
  if (AppState.isPlaying && !AppState.isRecording) return stopPlayback();
};

const recordHandler = function () {
  if (!AppState.isRecording && AppState.isPlaying) {
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

const onMIDIMessage = function (event) {
  toggleNote(event.data);
  if (AppState.isRecording) {
    addNoteToArray(event.data);
  }
};

const toggleNote = function (midiNoteData) {
  if (midiNoteData[0] === 144) {
    return;
  }
  if (midiNoteData[0] === 128) {
    return;
  }
};

const addNoteToArray = function (midiNoteData) {
  if (midiNoteData[0] === 144) {
    notes.push(new Note(midiNoteData[1], midiNoteData[2], playheadPos));
    notes.sort((a, b) => {
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
    return;
  }
  if (midiNoteData[0] === 128) {
    notes.forEach((note) => {
      if (note.note === midiNoteData[1] && note.endTime == null) {
        note.endTime = playheadPos;
        console.log(notes);
        return;
      }
    });
  }
};

const setPlayheadPosition = function (mouseX) {
  playheadPos = calcPlayheadPosition(mouseX);
  playhead.style.transform = `translateX(${playheadPos / 62.5}vw)`;
};

const calcPlayheadPosition = function (mouseX) {
  const vw = (mouseX * 100) / document.documentElement.clientWidth - 3;
  if (vw >= 0 && vw <= WORKSPACE_WIDTH)
    return Math.round(
      ((mouseX * 100) / document.documentElement.clientWidth - 3) * UNITS_PER_VW
    );
  if (vw < 0) return 0;
  return Math.round(WORKSPACE_WIDTH * UNITS_PER_VW);
};

const movePlayhead = function () {
  notes.forEach((note) => {
    if (note.startTime > playheadPos) {
      playbackQueue.push(
        setTimeout(playNote(note), note.startTime - playheadPos)
      );
    }
  });

  playbackInterval = setInterval(function () {
    playheadPos = playheadPos < 6000 ? (playheadPos += 1) : 0;
    playhead.style.transform = `translateX(${playheadPos / 62.5}vw)`;
  }, 10);
};

const stopMovingPlayhead = function () {
  clearInterval(playbackInterval);
  playbackQueue.forEach((timeout) => {
    clearTimeout(timeout);
  });
};

const startPlayback = function () {
  AppState.isPlaying = true;
  movePlayhead();
};

const stopPlayback = function () {
  AppState.isPlaying = false;
  stopMovingPlayhead();
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
  stopMovingPlayhead();
};

const playNote = function (note) {
  sampler.triggerAttackRelease(note.note, note.endTime - note.startTime);
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
