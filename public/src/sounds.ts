// Royalty free music thanks to https://soundcloud.com/ashamaluevmusic

export class Sounds {
    constructor() {
        this.enabled = JSON.parse(localStorage.getItem('soundsEnabled')) !== false;
    }

    enabled: boolean;
    mainTune: HTMLAudioElement;
    gameTune: HTMLAudioElement;
    mainVolume = 0.15;
    gameVolume = 0.15;
    fxVolume = 1;

    startGameTune = () => {
        // Stop if running already;
        if (this.gameTune) {
            this.stopGameTune();
        }

        this.gameTune = new Audio('/audio/sleighride.mp3');
        // this.gameTune = new Audio('/audio/Rush%20Coil%20-%208-bit%20Christmas/Rush%20Coil%20-%208-bit%20Christmas%20-%2004%20Little%20Drummer%20Boy.mp3');
        this.gameTune.loop = true;
        this.gameTune.volume = this.enabled ? this.gameVolume : 0;
        this.gameTune.play();
    }

    stopGameTune = () => {
        this.stopTune(this.gameTune);
    }

    startMainTune = () => {
        // Stop if running already;
        if (this.mainTune) {
            this.stopMainTune();
        }

        this.mainTune = new Audio('/audio/Rush%20Coil%20-%208-bit%20Christmas/Rush%20Coil%20-%208-bit%20Christmas%20-%2012%20Auld%20Lang%20Syne.mp3');
        this.mainTune.loop = true;
        this.mainTune.volume = this.enabled ? this.mainVolume : 0;
        this.mainTune.play();
    }

    stopMainTune = () => {
        this.stopTune(this.mainTune);
    }

    stopTune = (tune: HTMLAudioElement) => {
        // Stop the game tune
        let h = setInterval(() => {
            if (tune) {
                tune.volume -= Math.min(0.01, tune.volume);

                if (tune.volume <= 0) {
                    tune.pause();
                    clearInterval(h);
                }
            }
        }, 100)
    }

    playCollectSound = () => {
        if (this.enabled) {
            let collectSound = new Audio('/audio/jingle.mp3');
            collectSound.volume = this.fxVolume;
            collectSound.play();
        }
    }

    toggleMute = () => {
        this.enabled = !this.enabled;

        localStorage.setItem('soundsEnabled', this.enabled ? 'true' : 'false');

        if (this.mainTune) {
            this.mainTune.volume = this.enabled ? this.mainVolume : 0;
        }
        if (this.gameTune) {
            this.gameTune.volume = this.enabled ? this.gameVolume : 0;
        }
    }
}