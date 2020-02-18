# phon

phon is a DAW (Digital Audio Workstation) written to run in the browser utilzing the Web Audio API and Vue.js. phon is in active development, and it will be a while before we're fully featured.

[https://phon.fm/](https://phon.fm/)

## Project setup
```
npm install
```

```
npm run serve
```

## phon basics

phon has two types of channels that can be created at the moment - synths and drum machines. The way that these two types of channels work are slightly different.

Synth channels using oscillators to generate sounds on the fly. when you click on a beat in a synth track the editor will open up a piano roll where you can draw in notes. To the left of the piano roll are the synth's settings where you can add oscilattors, change the attack, sustain, and decay of the synth.

Drum machines work a little differently, in the settings tab you will see a list of all of the samples that are loaded into phon's sample library. Double clicking on sample will add that sample to a beat pad on the right hand side, once your samples are selected you can click on that sample to activate it for that specific beat.

Both channels types have a number of settings in common. these include grid-size, volume, pan, delay, and reverb.

You can save and load tracks, but there is currently no way to record and export phon sessions as .wav or .mp3 files.

## Major todos

1. Running a DAW in a single-threaded language like JavaScript presents a singular core issue. This is that it is impossible to guarantee that code will execute at the _exact_ time that we want it to. This is an unfortunate problem for writing music, where timing is everything. Since microsecond variations in timing are acceptable, this should be a solvable problem. Currently the timing is reasonable under a subset of conditions, below I've listed some of the issues to solve:
    1. The reverb (using the soundbank-reverb npm package) causes major timing issues. I will likely write my own reverb plugin that is optimized for phon's specific use case. For now, I'd recommend _not_ adding reverb to any tracks.
    2. If we increase the number of measures to more than 4, we will start to get missed beats and delayed beats and other issues. My working theory is that this has nothing to do with audio but has to do with DOM updating, since DOM updating is quite expensive. The code is written in a way that there should be nothing unique from beat to beat, and there shouldn't be particularly more information stored at 8 measures than at 4. The way to test this hypothesis would be to only show the user one measure at a time.
    3. The Web Audio API lets you schedule sound to play at a time, rather than triggering at your current execution time. When I originally began writing this, I used this process to schedule the entire measure at once at the start. This will guarantee that within our measure things are spaced properly. However, I moved away from this approach because it presents two problems of its own. (1) For suffienctly complex beats the execution time to start a measure becomes noticeable so that while the measure lines up perfectly there can be a delay when looping which unacceptable. (2) It made the execution of certain effects I want to add (like tremolo) more complicated. However, I've become convinced that there's probably a best of both worlds scenario and that some degree of pre-scheduling will be neccessary.
2. The first pass of this was built in a week, with a hard deadline of when I was scheduled to present what I had completed. As a result, there's a number of obvious refactoring that needs to happen in the main App.vue file, as that file is confusing and monolithic and could easily be compoentized. The use-case for a store is obvious and needs to be implemented.
3. For similarly reasons as the todo above, phon doesn't have unit tests yet - this is not acceptable for the long-term health of this project.
4. The responsiveness and web accessibility of phon is frankly non-existant. This is not acceptable for the long-term usability of this project. There is definitely a path to accessibility, and providing an interface that is usable by those who are vision impaired is a prerequisite to a serious release.
5. There are a few random bugs, that could be easily fixed with some work:
    1. The way the drum machine was set up, keys need to be fully deleted in order to not trigger the drum sample. Yet when copying a drum machine beat or loading in from a saved file, for some reason the key gets copied anyway. As a horrible but quick solution to this bug I discovered a few hours before presenting, I run around and delete the keys I don't need. This is super inefficient, and it shouldn't take too long to find the source of this issue.
    2. If a new feature is added, it invalidates old save files. There should be some brainstorming and research around good paradigms to minimize this.
    3. It is possible, through synth design to cause a painful amount of clipping. I should probably institute some way of auto reducing gain when the user exceeds some limit but this might also encourage bad mixing habits. Should research how other DAWs deal with that issue.
6. There's also a number of features I'd like to implement in the near term.
    1. Most obvious would be being able to record and export a session as an MP3. Long term, this would draw inspiration from the UX distinctions in Ableton's live and session modes but for now it'll just spit out a file when you stop recording.
    2. More effects, and a better interface for managing them. Some effects I want to add are to fix reverb, add chorus, add tremolo, add EQ, and add distortion. All of these should be fairly easy to implement on a simplistic level, but the way the effects and settings are all shoved next to the piano roll is not scalable as a UX pattern.
    3. More hot keys, and better copying and cutting. Ultimately, the goal is to make it so that the interface is primarily navigated without the use of a mouse.
    4. Live performance features. Currently there is support for making it so tracks unsolo, mute, and effects turn on when the beat loops back to the begining. My vision with this funcionality is to flesh it out so that it can become a powerful tool to add fills and dynamic movements on multiple tracks on the fly. These features are currently disabled because they will probably more confusing than helpful at this point.

## Contact me

If you're interested in learning more about phon, have questions, or want to contribute please reach out to me at [danielbalsam@gmail.com](danielbalsam@gmail.com).