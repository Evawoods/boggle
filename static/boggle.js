class BoggleGame {
    // make a new game at this DOM id

    constructor(boardId, secs = 60) {
        this.secs = secs; //length of game
        this.showTimer();

        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);

        // every 1000ms, "tick"
        this.timer = setInterval(this.tick.bind(this), 1000);

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }

    // Show word in list of words

    showWord(word){
        $(".words", this.board).append($("<li>", { text: word }));
    }

    // show score in html

    showScore(){
        $(".score", this.board).text(this.score);
    }

    // show status msg

    showMessage(msg, cls){
        $(".msg", this.board).text(msg).removeClass().addClass(`msg ${cls}`);
    }

    // hangle submission of word if the word is valid and new/unique, score & show 

    async handleSubmit(evt){
        evt.preventDefault();
        const $word = $(".word", this.board);

        let word = $word.val();
        if(!word) return;

        if (this.words.has(word)){
            this.showMessage(`You've already found ${word}`, "error");
            return;
        }

        // check server for validity
        const resp = await axios.get("/check-word", { params: { word: word }});
        if (resp.data.result === "not-word"){
            this.showMessage(`${word} is not valid`, "error");
        }
        else if (resp.data.result === "not-on-board"){
            this.showMessage(`${word} is invalid on this board`, "error");
        }
        else{
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, "ok");
        }

        $word.val("").focus();
    }

    // update timer in DOM

    showTimer(){
        $(".timer", this.board).text(this.secs);
    }

    // Tick: handle a second of game time passing

    async tick() {
        this.secs -= 1;
        this.showTimer();

        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    // End game: score and update message

    async scoreGame() {
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.brokeRecord){
            this.showMessage(`New Record: ${this.score}`, "ok");
        }
        else{
            this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }
}