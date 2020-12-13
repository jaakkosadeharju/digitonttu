var Sounds = (function () {
    function Sounds() {
        var _this = this;
        this.mainVolume = 0.2;
        this.gameVolume = 0.2;
        this.fxVolume = 1;
        this.startGameTune = function () {
            _this.gameTune = new Audio('/audio/sleighride.mp3');
            _this.gameTune.loop = true;
            _this.gameTune.volume = _this.enabled ? _this.gameVolume : 0;
            _this.gameTune.play();
        };
        this.stopGameTune = function () {
            if (_this.gameTune) {
                _this.gameTune.pause();
                _this.gameTune = undefined;
            }
        };
        this.startMainTune = function () {
            _this.mainTune = new Audio('/audio/drummerboy.mp3');
            _this.mainTune.loop = true;
            _this.mainTune.volume = _this.enabled ? _this.mainVolume : 0;
            _this.mainTune.play();
        };
        this.stopMainTune = function () {
            if (_this.mainTune) {
                _this.mainTune.pause();
                _this.mainTune = undefined;
            }
        };
        this.playCollectSound = function () {
            if (_this.enabled) {
                var collectSound = new Audio('/audio/jingle.mp3');
                collectSound.play();
            }
        };
        this.toggleMute = function () {
            _this.enabled = !_this.enabled;
            if (_this.mainTune) {
                _this.mainTune.volume = _this.enabled ? _this.mainVolume : 0;
            }
            if (_this.gameTune) {
                _this.gameTune.volume = _this.enabled ? _this.gameVolume : 0;
            }
        };
        this.enabled = false;
    }
    return Sounds;
}());
export { Sounds };
//# sourceMappingURL=sounds.js.map