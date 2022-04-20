'use strict';

const workspaceContainer = document.querySelector('.workspace-container');
const referenceNoteColumn = document.querySelector('.reference-note-column');
const btnPlayPause = document.querySelector('.play-pause-btn');
const btnRecording = document.querySelector('.record-btn');
const btnSettings = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');

const AppState = {
  isPlaying: false,
  isRecording: false,
  isSettingsOpen: false,
};

//this is a test
