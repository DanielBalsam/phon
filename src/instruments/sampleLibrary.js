export class SampleLibrary {
  constructor(
    context,
  ) {
    this.context = context;
    this.urls = [
      "HAT-606 CHH.wav", "HAT-707 CHH 2.wav", "KIK-808 DeepK p.wav", "KIK-Gloom Kick.wav", "PRC-808 Hrd Clp.wav", "SNR-626 Snare 1.wav", "SNR-909 Atak Sn.wav", "TEK-8000 Clave.wav", "TEK-808 Maraca.wav", "TOM-626 Tom1 Md.wav", "HAT-606 OHH.wav", "HAT-707 OHH.wav", "KIK-808 Rap K1.wav", "KIK-Kick Butt!.wav", "PRC-909 Clap.wav", "SNR-626 Snare 3.wav", "SNR-909 SplatSn.wav", "TEK-808 Cga Hi.wav", "TEK-808 Rim.wav", "TOM-626 Tom2 Hi.wav", "HAT-626 CHH 1.wav", "HAT-808 Hrd CHH.wav", "KIK-808 Rap K2.wav", "PRC-626 Clap.wav", "PRC-Burst Clap.wav", "SNR-808 Clip Sn.wav", "SNR-909 Tite Sn.wav", "TEK-808 Cga Lo.wav", "TOM-606 Tom 1.wav", "TOM-626 Tom2 Lo.wav", "HAT-626 CHH 2.wav", "HAT-808 Hrd OHH.wav", "KIK-Basic Kick.wav", "PRC-707 Clap.wav", "PRC-Crap Snap.wav", "SNR-808 Deep Sn.wav", "SNR-__Deep__ Sn.wav", "TEK-808 Cga Mid.wav", "TOM-606 Tom 2.wav", "TOM-626 Tom2 Md.wav", "HAT-626 OHH.wav", "KIK-4 2 Floor K.wav", "KIK-Brute Kick.wav", "PRC-808 ChzClap.wav", "PRC-Dance Snap.wav", "SNR-808 Hard Sn.wav", "TEK-80's TekPrc.wav", "TEK-808 Clave.wav", "TOM-626 Tom1 Hi.wav", "TOM-707 Tom Hi.wav", "HAT-707 CHH 1.wav", "KIK-808 DeepK f.wav", "KIK-Dirt Kick 1.wav", "PRC-808 Clap.wav", "PRC-Dirt Clap.wav", "SNR-808 MarchSn.wav", "TEK-8000 Cga Mt.wav", "TEK-808 Cowbell.wav", "TOM-626 Tom1 Lo.wav", "TOM-707 Tom Lo.wav"
    ];
    this.buffer = {};
    this.loaded = false;
  }

  loadSound(url, index) {
    let request = new XMLHttpRequest();
    request.open('get', `/sounds/${url}`, true);
    request.responseType = 'arraybuffer';
    let thisBuffer = this;
    request.onload = function() {
      thisBuffer.context.decodeAudioData(request.response, function(buffer) {
        thisBuffer.buffer[url] = buffer;
        if(index == thisBuffer.urls.length-1) {
          this.loaded = true;
        }
      });
    };
    request.send();
  };

  loadAll() {
    this.urls.forEach((url, index) => {
      this.loadSound(url, index);
    })
  }

  playSound(url, volume) {
    const sound = {};
    sound.gainNode = this.context.createGain();
    sound.source = this.context.createBufferSource();
    sound.source.buffer = this.buffer[url];
    sound.source.connect(sound.gainNode);
    sound.gainNode.connect(this.context.destination);
    sound.gainNode.gain.setValueAtTime(0.3 * volume, this.context.currentTime);
    sound.source.start(this.context.currentTime);
  }

  getSoundByIndex(index) {
    return this.buffer[index];
  }
}