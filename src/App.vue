<template>
  <div id="app">
    <div class="mobile-only">
      phon does not currently work on mobile,
      to use phon please visit us on your desktop
      computer ❤️
    </div>
    <template v-if="loading">
      Loading...
    </template>
    <template v-else>
      <div class="global-settings">
        <div class="setting">
          <div class="setting__label">
            BPM
          </div>
          <input
            v-model="global.tempo"
            type="number"
          >
        </div>
        <div class="setting">
          <div class="setting__label">
            Measures
          </div>
          <input
            v-model="activeBeat.measures"
            :max="MAX_MEASURES"
            type="number"
            @change="newMeasures"
          >
        </div>
        <div class="flex-grow" />
        <div>
          <button
            class="settings__button settings__button--solo"
            @click="saveBeat"
          >
            Save
          </button>
        </div>
        <div>
          <label
            class="settings__button settings__button--solo"
            @change="loadBeat"
          >
            Load
            <input type="file" />
          </label>
        </div>
        <div>
          <button
            :class="{'settings__button--selected': !this.global.paused}"
            class="settings__button settings__button--solo"
            @click="togglePlay"
          >
            Play
          </button>
        </div>
      </div>
      <div
        v-for="(channel, index) in activeBeat.channels"
        :key="channel.id"
        :class="['channel--' + (index+ 1)]"
        class="channel"
      >
        <div class="channel__details">
          <div class="channel__name">
            {{ channel.name }}
          </div>
          <div class="channel__settings">
            <button
              :class="{ 'settings__button--selected': ((channel.queueMuted !== null && channel.queueMuted) || channel.muted) && global.soloChannelId !== channel.id }"
              class='settings__button settings__button--small'
              @click="toggleChannelMute(channel)"
            >
              Mute
            </button>
            <button
              :class="{ 'settings__button--selected': global.soloChannelId === channel.id }"
              class='settings__button settings__button--small'
              @click="toggleChannelSolo(channel)"
            >
              Solo
            </button>
          </div>
        </div>
        <div class="channel__notes">
          <div
            v-for="i in totalBeats"
            :key="i"
            :class="{
              'beat--active': i - 1 === timer.currentBeat && !global.paused,
              'beat--has-notes': channel.noteGrid[i - 1].notes.length,
              'beat--focused': selectedNotes.id == channel.noteGrid[i - 1].id,
              'beat--muted': (
                (channel.noteGrid[i - 1].muted || channel.muted)
                || (global.soloChannelId && channel.id !== global.soloChannelId)
              ),
              'beat--hide': (i - 1) % (SMALLEST_NOTE_SIZE / channel.gridSize.total) !== 0,
            }"
            class="beat"
            @click="selectNoteCluster(channel.noteGrid[i - 1], channel)"
            @dblclick="channel.noteGrid[i - 1].muted = !channel.noteGrid[i - 1].muted"
          />
        </div>
      </div>
      <div class="channel">
        <div class="channel__details">
          <div class="channel__name">
            New Channel
          </div>
          <div class="channel__settings">
            <select v-model="newChannelTypeId">
              <option
                v-for="instrumentType in INSTRUMENT_TYPES"
                :key="instrumentType.id"
                :value="instrumentType.id"
                v-text="instrumentType.name"
              />
            </select>
          </div>
        </div>
        <div class="channel__notes">
          <button
            class="settings__button settings__button--solo"
            @click="addNewChannel"
          >
            + New Channel
          </button>
        </div>
      </div>
      <div
        v-if="selectedChannel && selectedChannel.id && selectedNotes && selectedNotes.id"
        :class="['editor--' + selectedChannel.id]"
        class="editor"
      >
        <div class="track-settings">
          <div class="setting__title">
            Track Settings
          </div>
          <div class="setting">
            <div class="setting__label">
              Grid Size
            </div>
            <div class="setting__values">
              <button
                v-for="gs in gridSizes"
                :key="gs.name"
                :class="{'settings__button--selected': selectedChannel.gridSize.name === gs.name}"
                class="settings__button"
                v-text="gs.name"
                @click="selectedChannel.gridSize = gs;"
              />
            </div>
          </div>
          <div class="setting">
            <div class="setting__label">
              Volume
            </div>
            <div class="setting__values">
              <input
                v-model="selectedChannel.volume"
                type="range"
                min="0"
                max="2"
                step="0.01"
                class="slider"
              >
            </div>
          </div>
          <div class="setting">
            <div class="setting__label">
              Pan
            </div>
            <div class="setting__values">
              <input
                v-model="selectedChannel.pan"
                type="range"
                min="-1"
                max="1"
                step="0.01"
                class="slider"
              >
            </div>
          </div>
          <div class="setting">
            <div class="setting__label">
              Delay
            </div>
            <div class="setting__values">
              <button
                v-for="nl in noteLengths"
                :key="nl.name"
                :class="{'settings__button--selected': selectedChannel.delayGrain.name === nl.name}"
                class="settings__button"
                v-text="nl.name"
                @click="selectedChannel.delayGrain = nl;"
              />
            </div>
          </div>
          <!-- <div class="setting">
            <div class="setting__label">
              Reverb Size
            </div>
            <div class="setting__values">
              <button
                v-for="nl in noteLengths"
                :key="nl.name"
                :class="{'settings__button--selected': selectedChannel.effects.reverb.size.name === nl.name}"
                class="settings__button"
                v-text="nl.name"
                @click="selectedChannel.effects.reverb.size = nl;"
              />
            </div>
          </div>
          <div class="setting">
            <div class="setting__label">
              Reverb (Dry)
            </div>
            <div class="setting__values">
              <input
                v-model="selectedChannel.effects.reverb.dry"
                type="range"
                min="0"
                max="1"
                step="0.01"
                class="slider"
              >
            </div>
          </div>
          <div class="setting">
            <div class="setting__label">
              Reverb (Wet)
            </div>
            <div class="setting__values">
              <input
                v-model="selectedChannel.effects.reverb.wet"
                type="range"
                min="0"
                max="5"
                step="0.01"
                class="slider"
              >
            </div>
          </div> -->
          <template v-if="selectedChannel.instrument.type === INSTRUMENT_TYPE_SYNTH">
            <div class="setting__title">
              Instrument Settings
            </div>
            <div class="setting">
              <div class="setting__label">
                Transpose
              </div>
              <div class="setting__values">
                <input type="number" v-model="selectedChannel.effects.transpose.octaves">
              </div>
            </div>
            <div class="setting">
              <div class="setting__label">
                Attack
              </div>
              <div class="setting__values">
                <button
                  v-for="nl in noteLengths"
                  :key="nl.name"
                  :class="{'settings__button--selected': selectedChannel.attack.name === nl.name}"
                  class="settings__button"
                  v-text="nl.name"
                  @click="selectedChannel.attack = nl;"
                />
              </div>
            </div>
            <div class="setting">
              <div class="setting__label">
                Sustain
              </div>
              <div class="setting__values">
                <button
                  v-for="nl in noteLengths"
                  :key="nl.name"
                  :class="{'settings__button--selected': selectedChannel.sustain.name === nl.name}"
                  class="settings__button"
                  v-text="nl.name"
                  @click="selectedChannel.sustain = nl;"
                />
              </div>
            </div>
            <div class="setting">
              <div class="setting__label">
                Release
              </div>
              <div class="setting__values">
                <button
                  v-for="nl in noteLengths"
                  :key="nl.name"
                  :class="{'settings__button--selected': selectedChannel.release.name === nl.name}"
                  class="settings__button"
                  v-text="nl.name"
                  @click="selectedChannel.release = nl;"
                />
              </div>
            </div>
            <div class="setting">
              <div class="setting__label">
                Oscillators
              </div>
              <div
                v-for="osc in selectedChannel.instrument.oscillators"
                :key="osc.id"
                class="setting__values"
              >
                <div class="settings__row">
                  <div>
                    <div class="mb-5">
                      WAVEFORM:
                    </div>
                    <select v-model="osc.type">
                      <option
                        v-for="ot in OSCILLATOR_TYPES"
                        :key="ot.name"
                        :value="ot.value"
                        v-text="ot.name"
                      />
                    </select>
                  </div>
                  <div>
                    <div class="mb-5">
                      Transpose:
                    </div>
                    <input type="number" v-model="osc.transforms.transpose">
                  </div>
                </div>
              </div>
              <div class="settings__values">
                <button
                  class="settings__button settings__button--solo"
                  @click="selectedChannel.instrument.addNewOscillator()"
                >
                  + Add Oscillator
                </button>
              </div>
            </div>
          </template>
          <template v-else-if="selectedChannel.instrument.type === INSTRUMENT_TYPE_DRUM_MACHINE">
            <div class="setting__title">
              Sample Library
            </div>
            <div
              v-for="(sample, name) in sampleLibrary.buffer"
              :key="name"
              class="sample-library__row"
              @click="sampleLibrary.playSound(name, selectedChannel.volume)"
              @dblclick="selectedChannel.instrument.samples.push({name, sample})"
            >
              {{name}}
            </div>
          </template>
        </div>
        <div
          v-if="selectedChannel.instrument.type === INSTRUMENT_TYPE_SYNTH"
          class="piano-roll"
        >
          <template
            v-for="octave in NOTES_MAP.C.length"
          >
            <div
              v-for="(value, note) in NOTES_MAP"
              :key="note + '-' + octave"
              :class="{
                ['piano-roll__key--' + note]: true,
                'piano-roll__key--selected': (
                  selectedNotesKeys.has(note + (octave - 1))
                ),
              }"
              :name="note + (octave - 1)"
              class="piano-roll__key"
              @click="toggleNote(note, octave - 1)"
            >
              <span v-if="note === 'C'">
                {{note + (octave - 1)}}
              </span>
            </div>
          </template>
        </div>
        <div
          v-if="selectedChannel.instrument.type === INSTRUMENT_TYPE_DRUM_MACHINE"
          class="drum-machine"
        >
          <div
            v-for="(sample, index) in selectedChannel.instrument.samples.length"
            :key="index"
            :class="{'drum-machine__sample--selected': selectedNotes.notes[index]}"
            class="drum-machine__sample"
            @click="toggleSample(index)"
          >
            {{ sample && sample.name }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import NOTES_MAP from './constants/notes_map';
import {
  SMALLEST_NOTE_SIZE,
  MAX_MEASURES,
  NoteGridFactory,
  NoteFactory,
  LATCH,
} from './constants/notes';
import {
  SOLO_TYPE_NO_RESET,
  SOLO_TYPE_RESET_ON_LOOP,
  GlobalConfigFactory,
  BeatFactory,
  ChannelFactory,
} from './constants/general';
import {
  INSTRUMENT_TYPES,
  INSTRUMENT_TYPE_SYNTH,
  INSTRUMENT_TYPE_DRUM_MACHINE,
} from './constants/instruments';
import {Synth, OSCILLATOR_TYPES} from './instruments/synth';
import {SampleLibrary} from './instruments/sampleLibrary';
import {mergeDeep} from './helpers/object';

const audioContext = new AudioContext();

export default {
  data() {
    return {
      audio: audioContext,
      global: new GlobalConfigFactory(),
      beats: [
        new BeatFactory()
      ],
      compressor: null,
      activeBeatIndex: 0,
      timer: {
        currentBeat: 0
      },
      firstNoteTime: null,
      selectedNotes: {},
      selectedChannel: {},
      clipboard: {
        notes: null,
        channel: null,
      },
      newChannelTypeId: INSTRUMENT_TYPES[0].id,
      sampleLibrary: new SampleLibrary(audioContext),
      loading: true,
      draggingSample: null,
      NOTES_MAP,
      MAX_MEASURES,
      INSTRUMENT_TYPES,
      INSTRUMENT_TYPE_SYNTH,
      INSTRUMENT_TYPE_DRUM_MACHINE,
      OSCILLATOR_TYPES,
      SMALLEST_NOTE_SIZE,
    }
  },

  computed: {
    activeBeat() {
      return this.beats[this.activeBeatIndex];
    },

    totalBeats() {
      return SMALLEST_NOTE_SIZE * this.activeBeat.measures;
    },

    smallestBeat() {
      return this.noteLengths.find(nl => nl.total === SMALLEST_NOTE_SIZE);
    },

    displayBeat() {
      return Math.floor(
        this.timer.currentBeat / 4 / this.activeBeat.measures
      ) + 1;
    },

    immediate() {
      return {
        name: '0',
        duration: 0,
      }
    },

    thirtySecondNote() {
      return {
        name: '1/32',
        total: this.activeBeat.measures * 32,
        duration: 7.5 / this.global.tempo,
      };
    },

    sixteenthNote() {
      return {
        name: '1/16',
        total: this.activeBeat.measures * 16,
        duration: 15 / this.global.tempo,
      };
    },

    eighthNote() {
      return {
        name: '1/8',
        total: this.activeBeat.measures * 8,
        duration: 30 / this.global.tempo,
      };
    },

    quarterNote() {
      return {
        name: '1/4',
        total: this.activeBeat.measures * 4,
        duration: 60 / this.global.tempo,
      };
    },

    triplet() {
      return {
        name: '1/3',
        total: this.activeBeat.measures * 3,
        duration: 90 / this.global.tempo,
      };
    },

    halfNote() {
      return {
        name: '1/2',
        total: this.activeBeat.measures * 2,
        duration: 120 / this.global.tempo,
      };
    },

    wholeNote() {
      return {
        name: '1',
        total: this.activeBeat.measures,
        duration: 240 / this.global.tempo,
      };
    },

    gridSizes() {
      return [
        this.wholeNote,
        this.halfNote,
        this.quarterNote,
        this.eighthNote,
        this.sixteenthNote,
        this.thirtySecondNote,
      ];
    },

    noteLengths() {
      return [
        this.wholeNote,
        this.halfNote,
        this.triplet,
        this.quarterNote,
        this.eighthNote,
        this.sixteenthNote,
        this.thirtySecondNote,
        this.immediate,
      ];
    },

    selectedNotesKeys() {
      if (!this.selectedNotes) return;
      const keys = new Set();

      this.selectedNotes.notes.forEach(note => {
        keys.add(note.note + note.octave);
      });

      return keys;
    },
  },

  created: async function() {
    const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

    if (iOS) return;

    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('paste', this.handlePaste);
    window.addEventListener('keydown', this.handleKeyPress);

    this.initMasterEffects();

    this.addNewChannel();

    await this.sampleLibrary.loadAll();

    this.loading = false;
  },

  methods: {
    newMeasures() {
      this.activeBeat.channels.forEach(channel => {
        channel.noteGrid.forEach((grid, index) => {
          const indexToCopy = index % SMALLEST_NOTE_SIZE;

          grid.notes = [...channel.noteGrid[indexToCopy].notes];

          channel.noteGrid.forEach(grid => {
          const keysToDelete = [];

          for (let i=0; i < grid.notes.length; i++) {
            if (!grid.notes[i]) keysToDelete.push(i);
          }

          keysToDelete.forEach(key => {
            delete grid.notes[key];
          })
        });
        });
      });
    },

    handleKeyPress($event) {
      if ($event.metaKey) return;  // don't restrict CMD button hot keys
      $event.preventDefault();

      if (this.selectedChannel.id) {
        const callbackHit = this.handleChannelNavigation($event);

        if (callbackHit) return;
      } else {
        // For first key press
        const channel = this.activeBeat.channels[0];
        if (channel) this.selectNoteCluster(channel.noteGrid[0], channel);
        return;
      }


      if ($event.code === 'Space') this.togglePlay();
      else if ($event.key === '+') this.addNewChannel();
    },

    handleChannelNavigation($event) {
      if ($event.code === 'KeyM') {
        this.toggleChannelMute(this.selectedChannel);
        return true;
      } else if ($event.code === 'KeyS') {
        this.toggleChannelSolo(this.selectedChannel);
        return true;
      }

      const channelMax = this.activeBeat.channels.length;
      let channelIndex = this.activeBeat.channels.findIndex(
        c => c.id === this.selectedChannel.id
      );

      const noteMax = SMALLEST_NOTE_SIZE * this.activeBeat.measures;
      const noteInterval = SMALLEST_NOTE_SIZE / this.selectedChannel.gridSize.total;
      let noteIndex = this.selectedChannel.noteGrid.findIndex(
        ng => ng.id === this.selectedNotes.id
      );

      if (this.selectedNotes.id) {
        if (noteIndex !== -1) {
          if ($event.code === 'ArrowRight') {
            noteIndex = noteIndex + noteInterval;
            if (noteIndex >= noteMax) noteIndex = 0;
            this.selectNoteCluster(this.selectedChannel.noteGrid[noteIndex], this.selectedChannel);
            return true;
          } else if ($event.code === 'ArrowLeft') {
            noteIndex = noteIndex - noteInterval;
            if (noteIndex < 0) noteIndex = noteMax - noteInterval;
            this.selectNoteCluster(this.selectedChannel.noteGrid[noteIndex], this.selectedChannel);
            return true;
          }
        }
        if ($event.code === 'Backspace') {
          this.selectedNotes.notes = [];
          return true;
        }
      }

      if (channelIndex !== -1) {
        if ($event.code === 'ArrowDown') {
          channelIndex = channelIndex + 1;
          if (channelIndex >= channelMax) channelIndex = 0;

          const channel = this.activeBeat.channels[channelIndex];
          this.selectNoteCluster(channel.noteGrid[noteIndex], channel);
          return true;
        } else if ($event.code === 'ArrowUp') {
          channelIndex = channelIndex - 1;
          if (channelIndex < 0) channelIndex = channelMax - 1;

          const channel = this.activeBeat.channels[channelIndex];
          this.selectNoteCluster(channel.noteGrid[noteIndex], channel);
          return true;
        }

        if ($event.code === 'Minus') {
          this.activeBeat.channels.splice(
            channelIndex, 1
          );

          if (channelIndex >= channelMax) channelMax - 1;

          const channel = this.activeBeat.channels[channelIndex];
          this.selectNoteCluster(channel.noteGrid[noteIndex], channel);
          return true;
        }
      } else {
        const channel = this.activeBeat.channels[0];
        if (channel) this.selectNoteCluster(channel.noteGrid[0], channel);

        return true;
      }
    },

    toggleChannelMute(channel) {
      channel.muted = !channel.muted;
    },

    toggleChannelSolo(channel) {
      this.global.soloChannelId = this.global.soloChannelId === channel.id ? null : channel.id;
      if (this.global.soloChannelId) channel.muted = false;
    },

    handleCopy() {
      if (this.selectedNotes) {
        this.clipboard.notes = [...this.selectedNotes.notes];
      }
    },

    handlePaste() {
      if (this.selectedNotes && this.clipboard.notes) {
        this.selectedNotes.notes = [...this.clipboard.notes];
      }
    },

    initMasterEffects() {
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -10;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      this.compressor = compressor;

      this.compressor.connect(audioContext.destination);
    },

    selectNoteCluster: async function(noteGrid, channel) {
      const alreadyShowingPianoRoll = !!this.selectedNotes.id;
      this.selectedNotes = noteGrid;
      this.selectedChannel = channel;

      await this.$nextTick();

      const pianoRoll = this.$el.querySelector('.piano-roll');

      if (pianoRoll) {
        const firstSelectedNote = pianoRoll.querySelector('.piano-roll__key--selected');

        if (firstSelectedNote) {
          firstSelectedNote.scrollIntoView({inline: 'start'});
        } else {
          pianoRoll.querySelector(
            '[name=C5]'
          ).scrollIntoView({inline: 'start'});
        }
      }
    },

    togglePlay() {
      this.global.paused = !this.global.paused;

      if (!this.global.paused) {
        this.startLoop();
      }
    },

    startLoop() {
      this.global.paused = false;
      this.firstNoteTime = audioContext.currentTime;
      this.runLoop(true);
    },

    runLoop(firstNote) {
      if (this.global.paused) return;

      const currentTime = audioContext.currentTime;
      const currentBeat = Math.floor(
        (currentTime - this.firstNoteTime)
        / this.thirtySecondNote.duration
      ) % this.totalBeats;

      if (currentBeat === 0) {
        this.handleFirstBeat();
      }

      if (this.timer.currentBeat !== currentBeat || firstNote) {
        this.timer.currentBeat = currentBeat;

        this.playNotes();
      }

      window.requestAnimationFrame(() => this.runLoop());
    },

    addNewChannel() {
      const instrumentType = INSTRUMENT_TYPES.find(it => it.id === this.newChannelTypeId);

      if (instrumentType) {
        let channel = new ChannelFactory();
        this.activeBeat.channelNumber++;

        channel.name = `${this.activeBeat.channelNumber} - ${instrumentType.name}`;
        channel.instrument = new instrumentType.class(
          audioContext,
          this.compressor,
        );
        channel.noteGrid = new NoteGridFactory(
          this.activeBeat.measures,
        );
        channel.gridSize = this.sixteenthNote;
        channel.attack = this.immediate;
        channel.sustain = this.quarterNote;
        channel.release = this.wholeNote;
        channel.delayGrain = this.immediate;
        channel.effects.reverb.size = this.immediate;

        this.activeBeat.channels.push(
          channel
        );
      }
    },

    handleFirstBeat() {
      if (this.global.soloType === SOLO_TYPE_RESET_ON_LOOP) {
        this.global.soloChannelId = null;
      }

      this.activeBeat.channels.forEach(channel => {
        if (channel.queueMuted === false || channel.queueMuted === true) {
          channel.muted = channel.queueMuted;
          channel.queueMuted = null;
        }
      });
    },

    toggleSample(index) {
      if (this.selectedNotes.notes[index]) delete this.selectedNotes.notes[index];
      else this.selectedNotes.notes[index] = true;

      this.$forceUpdate();

      if (
          this.global.paused
        ) {
        this.selectedChannel.instrument.play(
          index,
          this.selectedChannel.volume,
          this.selectedChannel.pan,
          null,
          this.selectedChannel.delayGrain.duration,
          this.selectedChannel.delayGrain.total,
          this.selectedChannel.effects.reverb,
        );
      }
    },

    saveBeat() {
      const save = {
        global: this.global,
        beats: this.beats,
      };
      const string = JSON.stringify(save);
      const file = new Blob([string], {type: 'json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
    },

    loadBeat($e) {
      const files = $e.target.files;

      const fileReader = new FileReader();
      const me = this;
      fileReader.onload = () => {
        const beatToLoad = fileReader.result;

        try {
          const string = atob(beatToLoad.split(',')[1]);
          const object = JSON.parse(string);

          mergeDeep(me, object);

          me.beats.forEach((beat) => {
            beat.channels.forEach(channel => {
              const instrumentType = INSTRUMENT_TYPES.find(
                it => it.id === channel.instrument.type
              );

              const oldChannel = {...channel};

              channel.instrument = new instrumentType.class(
                audioContext,
                me.compressor,
              );

              mergeDeep(channel.instrument, oldChannel.instrument);

              if (instrumentType.id === INSTRUMENT_TYPE_DRUM_MACHINE) {
                channel.instrument.samples.forEach(sample => {
                  sample.sample = me.sampleLibrary.buffer[sample.name];
                });

                channel.noteGrid.forEach(grid => {
                  const keysToDelete = [];

                  for (let i=0; i < grid.notes.length; i++) {
                    if (!grid.notes[i]) keysToDelete.push(i);
                  }

                  keysToDelete.forEach(key => {
                    delete grid.notes[key];
                  })
                });
              }
            });

            me.$forceUpdate();
          })
        } catch(e) {
          alert('Could not read file');

          throw e;
        }
      }
      fileReader.readAsDataURL(files[0]);
    },

    toggleNote(note, octave) {
      const existingNoteIndex = this.selectedNotes.notes.findIndex(n => {
        return n.note === note && n.octave === octave;
      });

      if (existingNoteIndex !== -1)
        this.selectedNotes.notes.splice(existingNoteIndex, 1);
      else {
        const noteObj = new NoteFactory(note, octave);
        this.selectedNotes.notes.push(
          noteObj
        );

        if (
          this.global.paused
        ) {
          this.selectedChannel.instrument.play(
            {
              note: noteObj,
              release: this.selectedChannel.release.duration,
              sustain: this.selectedChannel.sustain.duration,
              attack: this.selectedChannel.attack.duration,
              volume: this.selectedChannel.volume,
              pan: this.selectedChannel.pan,
              delay: this.selectedChannel.delayGrain.duration,
              numberOfDelayGrains: this.selectedChannel.delayGrain.total,
              reverb: this.selectedChannel.effects.reverb,
            }
          )
        }
      }
    },

    playNotes() {
      this.activeBeat.channels.forEach((channel) => {
        if (channel.muted) return;

        if (
          this.global.soloChannelId
          && channel.id !== this.global.soloChannelId
        ) return;
        const index = this.timer.currentBeat;

        const notes = channel.noteGrid[index];

        if (!notes || notes.muted) return;

        if (notes.notes && notes.notes.length) {
          notes.notes.forEach((note, index) => {
            if (channel.instrument.type === INSTRUMENT_TYPE_SYNTH) {
              const playableNote = {...note};

              if (
                channel.effects &&
                channel.effects.transpose &&
                note.octave
              ) {
                playableNote.octave += +channel.effects.transpose.octaves;
              }

              const release = channel.release;
              const sustain = channel.sustain;
              const attack = channel.attack;

              channel.instrument.play(
                {
                  note: playableNote,
                  attack: attack.duration,
                  release: release.duration,
                  sustain: sustain.duration,
                  volume: channel.volume,
                  pan: channel.pan,
                  delay: channel.delayGrain.duration,
                  numberOfDelayGrains: channel.delayGrain.total,
                  reverb: channel.effects.reverb,
                }
              );
            } else if (
              channel.instrument.type === INSTRUMENT_TYPE_DRUM_MACHINE
            ) {
              channel.instrument.play(
                index,
                channel.volume,
                channel.pan,
                null,
                channel.delayGrain.duration,
                channel.delayGrain.total,
                channel.effects.reverb,
              );
            }
          });
        }
      });
    }
  },
}
</script>
<style lang="less">
html, body {
  margin: 0;
  background: darken(#00565d, 11%);
  font-size: 18px;
}
* {
  box-sizing: border-box;
}
#app {
  font-family: 'Titillium Web', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 100%;
  height: 100%;
  color: lighten(#A1B6B5, 20%);
  user-select: none;
  padding: 110px 20px 230px;
  font-weight: bold;
}

input[type=text], input[type=number], select {
  background: lighten(#00272A, 10%);
  border: 1px solid lighten(#00272A, 20%);
  border-radius: 5px;
  padding: 5px 10px;
  color: lighten(#A1B6B5, 20%);
  font-size: 18px;
  font-weight: bold;
}

select {
  width: 100%;
  font-size: 12px;

  &:focus {
    outline: none;
    border: 1px solid lighten(#00272A, 25%);
  }
}

.channel {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}

.channel__details {
  margin-right: 20px;
  width: 160px;
  text-align: left;
  flex-shrink: 0;
}
.channel__name {
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.channel__settings {
  display: flex;
  margin-top: 5px;
}

.channel__notes {
  display: flex;
  width: 90%;
  justify-content: space-between;
  align-items: center;
}

.beat {
  width: 30px;
  flex-grow: 1;
  margin-right: 5px;
  transition: opacity 0.15s ease;

  &:after {
    display: block;
    content: ' ';
    width: 100%;
    max-width: 30px;
    height: 30px;
    border: 0px solid lighten(#00272A, 20%);
    border-radius: 5px;
    cursor: pointer;
    opacity: 1;
    background: lighten(#00272A, 10%);
  }

  &:nth-of-type(32n - 31):after {
    border-width: 2px;
  }
}

.beat--focused:after {
  border-color: darken(#00b5c3, 6%);
}

.beat--muted:after {
  opacity: 0.25;
}

.beat--has-notes:after {
  background: darkgoldenrod;
}

@colors: #EF6E9C, #00A5B9, #755AF4, darken(#00EEA0, 10%), #DF9500, #F75B1A, #0092E5, #ACCBCE, #F53F00, #00D7EA, darken(#00EEA0, 5%);
.backgrounds(@list, @i: 1) when (@i <= length(@list)) {
  @color: extract(@list, @i);

  .channel--@{i} .beat--has-notes:after {
    background: lighten(@color, 10%);
    border-color: lighten(@color, 10%);
  }

  .channel--@{i} .settings__button--selected {
    background: lighten(@color, 10%);
  }

  .channel--@{i} .beat--active:after {
    background: @color;
  }

  .channel--@{i} .beat--focused:after {
    border-color: darken(@color, 10%);
    border-width: 2px;
  }

  // recursive call for the next color
  .backgrounds(@list, @i + 1);
}

// application
.backgrounds(@colors);

.beat--active:after {
  background: red;
}

.beat--hide {
  display: none;
}

.editor {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  border-top: 2px solid #008690;
  height: 200px;
  background: darken(#00565d, 11%);
}

.setting__title {
  text-transform: uppercase;
  font-weight: bold;
  font-size: 24px;
  margin-bottom: 10px;
  letter-spacing: 0.2em;
}

.setting__label {
  text-transform: uppercase;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
}

.setting {
  margin-bottom: 20px;
  letter-spacing: 0.1em;
}

.track-settings {
  width: 40%;
  max-height: 200px;
  overflow-y: auto;
  padding: 5px 30px;
  border-right: 2px solid #008690;
}

.drum-machine {
  display: flex;
  flex-wrap: wrap;
  width: 240px;
  padding: 5px 20px;
}

.drum-machine__sample {
  width: 28%;
  height: 28%;
  margin: 5px;
  background: #00565d;
  border-radius: 5%;
  transition: 0.15s ease;
}

.drum-machine__sample--selected {
  margin: 5px;
  background: darken(#00b5c3, 6%);
  border-radius: 5%;
}

.mb-5 {
  margin-bottom: 5px;
}

.settings__row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 10px;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50%;

    * {
      width: 50%;
      font-size: 14px;
    }
  }
}

.settings__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  transition: 0.15s ease;
  color: #A1B6B5;
  width: 40px;
  height: 40px;
  font-size: 14px;
  font-weight: bold;
  transition: 0.15s ease;
  border: 1px solid #008690;
  outline: none !important;
  text-transform: uppercase;

  &.settings__button--solo {
    width: auto;
    border-radius: 5px !important;
    margin-top: 5px;
    letter-spacing: 0.1em;
  }

  &.settings__button--small {
    width: 20px;
    height: 20px;
    font-size: 12px;
    flex-grow: 1;
  }

  &:not(.settings__button--selected):hover {
    background:darken(#00565d, 3%);
  }

  &:not(:first-of-type) {
    border-left: none;
  }

  &:not(.settings__button--small):not(:last-of-type) {
    border-right: none;
  }

  &:first-of-type {
    border-radius: 5px 0 0 5px;
  }

  &:last-of-type {
    border-radius: 0 5px 5px 0;
  }
}

.settings__button--selected {
  background: darken(#00b5c3, 6%);
  color: darken(#008690, 25%);
  font-weight: normal;

  &:focus {
    outline: none;
  }
}

.piano-roll {
  width: 60%;
  display: flex;
  position: relative;
  overflow: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 50%;
  background: lighten(#008690, 10%);
  color: darken(#008690, 20%);
  transition: 0.15s ease;
}

.piano-roll__key {
  display: flex;
  align-items: flex-end;
  padding-bottom: 20px;
  justify-content: center;
  width: 50px;
  height: 200px;
  border-right: 1px solid #333;
  flex-shrink: 0;
  scroll-snap-align: start;
  cursor: pointer;
}

.piano-roll__key--selected {
  background: darken(#00b5c3, 15%);
}

.piano-roll__key--Db,
.piano-roll__key--Eb,
.piano-roll__key--Gb,
.piano-roll__key--Ab,
.piano-roll__key--Bb {
  position: relative;
  width: 0px;
  border: none;
  overflow: visible;

  &:after {
    content: ' ';
    display: block;
    position: absolute;
    top: 0px;
    background: black;
    border: 1px solid black;
    border-top: none;
    color: white;
    width: 30px;
    height: 100px;
  }

  &.piano-roll__key--selected {
    &:after {
      background: darken(#00b5c3, 6%);
    }
  }
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 25px;
  background: #00565d;
  outline: none;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: darken(#00b5c3, 6%);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: darken(#00b5c3, 6%);
  cursor: pointer;
}

.sample-library__row {
  width: 100%;
  text-align: left;
  padding: 5px;
  cursor: pointer;

  &:hover {
    background: darken(#00b5c3, 10%)
  }
}

.global-settings {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 2px solid #008690;
  background: darken(#00565d, 11%);

  > * {
    margin-right: 20px;
    text-align: left;
  }
}

.flex-grow {
  flex-grow: 1;
}

.align-right {
  text-align: right;
}

input[type=file] {
  display: none;
}

label {
  display: inline-block;
  padding: 1px 7px 2px;
}

.mobile-only {
  display: none;
}

@media (max-width: 1000px) {
  .mobile-only {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: darken(#00565d, 11%);
    z-index: 10;
  }
}
</style>
