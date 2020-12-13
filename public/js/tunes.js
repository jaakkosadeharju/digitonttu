var Tunes = (function () {
    function Tunes() {
        var _this = this;
        this.startGameTune = function () {
            _this.gameTune = new Audio('/audio/sleighride.mp3');
            _this.gameTune.loop = true;
            _this.gameTune.volume = 0.2;
            _this.gameTune.play();
        };
        this.endGameTune = function () {
        };
        this.playCollectSound = function () {
            var collectSound = new Audio('/audio/jingle.mp3');
            collectSound.play();
        };
    }
    return Tunes;
}());
//# sourceMappingURL=tunes.js.map