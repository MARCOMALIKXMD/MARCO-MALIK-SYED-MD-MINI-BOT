class TicTacToe {
    constructor(playerX, playerO) {
        this.playerX     = playerX;
        this.playerO     = playerO;
        this.board       = ['1','2','3','4','5','6','7','8','9'];
        this.currentTurn = playerX;
        this.winner      = null;
        this.turns       = 0;
    }

    render() { return [...this.board]; }

    turn(isO, pos) {
        if (pos < 0 || pos > 8) return false;
        if (!['1','2','3','4','5','6','7','8','9'].includes(this.board[pos])) return false;
        this.board[pos] = isO ? 'O' : 'X';
        this.turns++;
        const w = this._checkWinner();
        if (w) this.winner = isO ? this.playerO : this.playerX;
        else this.currentTurn = isO ? this.playerX : this.playerO;
        return true;
    }

    _checkWinner() {
        const b = this.board;
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        return lines.some(([a,c,d]) => b[a]===b[c]&&b[c]===b[d]&&['X','O'].includes(b[a]));
    }
}

module.exports = TicTacToe;
