export class Sounds {
    constructor() {
        this.enabled = JSON.parse(localStorage.getItem('soundsEnabled')) !== false;
    }

    enabled: boolean;
    mainTune: HTMLAudioElement;
    gameTune: HTMLAudioElement;
    mainVolume = 0.2;
    gameVolume = 0.2;
    fxVolume = 1;

    startGameTune = () => {
        this.gameTune = new Audio('/audio/sleighride.mp3');
        this.gameTune.loop = true;
        this.gameTune.volume = this.enabled ? this.gameVolume : 0;
        this.gameTune.play();
    }
    stopGameTune = () => {
        // Stop the game tune
        if (this.gameTune) {
            this.gameTune.pause();
            this.gameTune = undefined;
        }
    }
    startMainTune = () => {
        this.mainTune = new Audio('/audio/drummerboy.mp3');
        this.mainTune.loop = true;
        this.mainTune.volume = this.enabled ? this.mainVolume : 0;
        this.mainTune.play();
    }
    stopMainTune = () => {
        // Stop the game tune
        if (this.mainTune) {
            this.mainTune.pause();
            this.mainTune = undefined;
        }
    }

    playCollectSound = () => {
        if (this.enabled) {
            let collectSound = new Audio('/audio/jingle.mp3');
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