import {INSTRUMENT_TYPE_DRUM_MACHINE} from '../constants/instruments';

export class DrumMachine {
  constructor(
    context,
    compressor,
  ) {
    this.context = context;
    this.compressor = compressor;
    this.samples = [];
    this.type=INSTRUMENT_TYPE_DRUM_MACHINE
  }

  play(index, volume, pan, startTime, delay, numberOfDelayGrains) {
    const sound = {};
    sound.gainNode = this.context.createGain();
    sound.panNode = this.context.createStereoPanner();
    sound.source = this.context.createBufferSource();
    if (!this.samples[index]) return;
    if (!startTime) startTime = this.context.currentTime;
    sound.source.buffer = this.samples[index].sample;
    sound.source.connect(sound.gainNode);
    sound.gainNode.connect(sound.panNode);
    sound.panNode.connect(this.compressor);
    sound.gainNode.gain.setValueAtTime(
      0.3 * volume,
      startTime,
    );
    sound.panNode.pan.setValueAtTime(
      pan * 1,
      startTime,
    )
    sound.source.start(startTime);

    if (delay && numberOfDelayGrains) {
      for (let i=2; i < numberOfDelayGrains; i++) {
        const newVolume = volume * (1 / (i * 2));
        const newStartTime = startTime + (delay * (i - 1));

        if (newVolume < 0.01) continue;

        this.play(index, newVolume, pan, newStartTime, 0, 0)
      }
    }
  }
}