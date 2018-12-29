function load() {
    myGameArea.start();
}

function restart() {
  myGameArea.board = [
    [new Rook('black', 0, 0), new Knight('black', 0, 1), new Bishop('black', 0, 2), new Queen('black', 0, 3), new King('black', 0, 4), new Bishop('black', 0, 5), new Knight('black', 0, 6), new Rook('black', 0, 7)],
    [new Pawn('black', 1, 0), new Pawn('black', 1, 1), new Pawn('black', 1, 2), new Pawn('black', 1, 3), new Pawn('black', 1, 4), new Pawn('black', 1, 5), new Pawn('black', 1, 6), new Pawn('black', 1, 7)],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [new Pawn('white', 6, 0), new Pawn('white', 6, 1), new Pawn('white', 6, 2), new Pawn('white', 6, 3), new Pawn('white', 6, 4), new Pawn('white', 6, 5), new Pawn('white', 6, 6), new Pawn('white', 6, 7)],
    [new Rook('white', 7, 0), new Knight('white', 7, 1), new Bishop('white', 7, 2), new Queen('white', 7, 3), new King('white', 7, 4), new Bishop('white', 7, 5), new Knight('white', 7, 6), new Rook('white', 7, 7)],
  ];
  myGameArea.turn = 'white';
  myGameArea.turn_num = 1;
  myGameArea.selected = null;
  myGameArea.options = [];
  //En Passant information
  myGameArea.en_passant = [];
  myGameArea.available_to_en_passant = [null, null];
  // King information
  myGameArea.mate = false;
  myGameArea.king_position = {'white' : [7,4], 'black' : [0,4]};

  myGameArea.update();
}

class ChessPiece {
  constructor(color, r, c) {
    this.color = color;
    this.r = r;
    this.c = c;
  }
}

class Pawn extends ChessPiece {
  constructor(color, r, c) {
    super(color, r, c);
    this.type = 'pawn';
    this.image;
    if (color == 'white') {
      this.image = document.getElementById('white_pawn');
      this.direction = -1;
    } else {
      this.image = document.getElementById('black_pawn');
      this.direction = 1;
    }
    this.moved = false;
  }

  getLegalMoves() {
    var options = [];
    var en_passant = [];
    // Travel Move
    if (myGameArea.onBoard(this.r+this.direction, this.c) && myGameArea.board[this.r+this.direction][this.c] == null) {
      options.push([this.r+this.direction, this.c]);
    }
    if (!this.moved && myGameArea.board[this.r+(2*this.direction)][this.c] == null && myGameArea.board[this.r+this.direction][this.c] == null) {
      options.push([this.r+(2*this.direction), this.c]);
    }
    // Attach Move
    if (myGameArea.onBoard(this.r+this.direction, this.c - 1) && myGameArea.board[this.r+this.direction][this.c - 1] != null
     && myGameArea.board[this.r+this.direction][this.c - 1].color != this.color) {
      options.push([this.r+this.direction, this.c - 1]);
    }
    if (myGameArea.onBoard(this.r+this.direction, this.c + 1) && myGameArea.board[this.r+this.direction][this.c + 1] != null
     && myGameArea.board[this.r+this.direction][this.c + 1].color != this.color) {
      options.push([this.r+this.direction, this.c + 1]);
    }
    // En Passant Move
    if (myGameArea.available_to_en_passant[0] == this.r && myGameArea.available_to_en_passant[1] == this.c-1
     && myGameArea.onBoard(this.r+this.direction, this.c - 1) && myGameArea.board[this.r+this.direction][this.c - 1] == null
     && myGameArea.board[this.r][this.c - 1] != null && myGameArea.board[this.r][this.c - 1].color != this.color) {
      options.push([this.r+this.direction, this.c - 1]);
      en_passant.push([this.r+this.direction, this.c - 1]);
    }
    if (myGameArea.available_to_en_passant[0] == this.r && myGameArea.available_to_en_passant[1] == this.c+1
     &&myGameArea.onBoard(this.r+this.direction, this.c + 1) && myGameArea.board[this.r+this.direction][this.c + 1] == null
     && myGameArea.board[this.r][this.c + 1] != null && myGameArea.board[this.r][this.c + 1].color != this.color) {
      options.push([this.r+this.direction, this.c + 1]);
      en_passant.push([this.r+this.direction, this.c + 1]);
    }
    myGameArea.options = options;
    myGameArea.en_passant = en_passant;
  }

  move(r_new, c_new) {
    this.moved = true;
    var enemy_color = this.color == 'white' ? 'black' : 'white';
    if (r_new == myGameArea.king_position[enemy_color][0] && c_new == myGameArea.king_position[enemy_color][1]) {
      myGameArea.mate = true;
    }
    myGameArea.board[r_new][c_new] = myGameArea.board[this.r][this.c];
    myGameArea.board[this.r][this.c] = null;

    if (myGameArea.inEnPassant([r_new, c_new])) {
      myGameArea.board[r_new - this.direction][c_new] = null;
    }

    if (Math.abs(r_new - this.r) == 2) {
      myGameArea.available_to_en_passant = [r_new, c_new];
    }


    this.r = r_new;
    this.c = c_new;
    // Pawn Promotion
    if ((this.color == 'white' && this.r == 0) || (this.color == 'black' && this.r == 7)) {
      var promoted_piece = prompt('Pawn Promotion!\nChoose your new piece (Queen, Knight, Bishop, Rook):', "Queen");
      if (promoted_piece == null || promoted_piece == "" || promoted_piece == "Queen" || promoted_piece == "queen") {
        myGameArea.board[this.r][this.c] = new Queen(this.color, this.r, this.c);
      } else if (promoted_piece == "Knight" || promoted_piece == "knight") {
        myGameArea.board[this.r][this.c] = new Knight(this.color, this.r, this.c);
      } else if (promoted_piece == "Bishop" || promoted_piece == "bishop") {
        myGameArea.board[this.r][this.c] = new Bishop(this.color, this.r, this.c);
      } else if (promoted_piece == "Rook" || promoted_piece == "Rook") {
        myGameArea.board[this.r][this.c] = new Rook(this.color, this.r, this.c);
      }
    }

    myGameArea.check(this.color);
    myGameArea.newTurn();
  }
}

class Rook extends ChessPiece {
  constructor(color, r, c) {
    super(color, r, c);
    this.type = 'rook';
    this.image;
    if (color == 'white') {
      this.image = document.getElementById('white_rook');
    } else {
      this.image = document.getElementById('black_rook');
    }
    this.moved = false;
  }

  getLegalMoves() {
    var options = [];
    var ints = [-1, 0, 1];

    for (var a = 0; a < ints.length; a++) {
      var i = ints[a];
      for (var b = 0; b < ints.length; b++) {
        var j = ints[b];
        if ((i == 0 || j == 0) && i != j) {
          for (var k = 1; k < 8; k++) {
            if (myGameArea.onBoard(this.r+i*k, this.c+j*k) && myGameArea.board[this.r+i*k][this.c+j*k] == null) {
              options.push([this.r+i*k, this.c+j*k]);
            } else if (myGameArea.onBoard(this.r+i*k, this.c+j*k) && myGameArea.board[this.r+i*k][this.c+j*k] != null
             && myGameArea.board[this.r+i*k][this.c+j*k].color != this.color) {
              options.push([this.r+i*k, this.c+j*k]);
              break;
            } else {
              break;
            }
          }
        }
      }
    }

    // Castling


    myGameArea.options = options;
  }

  move(r_new, c_new) {
    var enemy_color = this.color == 'white' ? 'black' : 'white';
    if (r_new == myGameArea.king_position[enemy_color][0] && c_new == myGameArea.king_position[enemy_color][1]) {
      myGameArea.checkmate = true;
    }
    myGameArea.board[r_new][c_new] = myGameArea.board[this.r][this.c];
    myGameArea.board[this.r][this.c] = null;

    this.r = r_new;
    this.c = c_new;

    myGameArea.check(this.color);
    myGameArea.newTurn();
  }
}

class Knight extends ChessPiece {
  constructor(color, r, c) {
    super(color, r, c);
    this.type = 'knight';
    this.image;
    if (color == 'white') {
      this.image = document.getElementById('white_knight');
    } else {
      this.image = document.getElementById('black_knight');
    }
  }

  getLegalMoves() {
    var options = [];
    var moves = [
      [2,1],
      [2,-1],
      [-2,1],
      [-2,-1],
      [1,2],
      [1,-2],
      [-1,2],
      [-1,-2],
    ];

    for (var i = 0; i < moves.length; i++) {
      if (myGameArea.onBoard(this.r+moves[i][0], this.c+moves[i][1]) &&
       (myGameArea.board[this.r+moves[i][0]][this.c+moves[i][1]] == null || myGameArea.board[this.r+moves[i][0]][this.c+moves[i][1]].color != this.color)) {
        options.push([this.r+moves[i][0], this.c+moves[i][1]]);
      }
    }

    myGameArea.options = options;
  }

  move(r_new, c_new) {
    var enemy_color = this.color == 'white' ? 'black' : 'white';
    if (r_new == myGameArea.king_position[enemy_color][0] && c_new == myGameArea.king_position[enemy_color][1]) {
      myGameArea.checkmate = true;
    }
    myGameArea.board[r_new][c_new] = myGameArea.board[this.r][this.c];
    myGameArea.board[this.r][this.c] = null;

    this.r = r_new;
    this.c = c_new;

    myGameArea.check(this.color);
    myGameArea.newTurn();
  }
}

class Bishop extends ChessPiece {
  constructor(color, r, c) {
    super(color, r, c);
    this.type = 'bishop';
    this.image;
    if (color == 'white') {
      this.image = document.getElementById('white_bishop');
    } else {
      this.image = document.getElementById('black_bishop');
    }
  }

  getLegalMoves() {
    var options = [];
    var ints = [-1, 1];

    for (var a = 0; a < ints.length; a++) {
      var i = ints[a];
      for (var b = 0; b < ints.length; b++) {
        var j = ints[b];
        for (var k = 1; k < 8; k++) {
          if (myGameArea.onBoard(this.r+i*k, this.c+j*k) && myGameArea.board[this.r+i*k][this.c+j*k] == null) {
            options.push([this.r+i*k, this.c+j*k]);
          } else if (myGameArea.onBoard(this.r+i*k, this.c+j*k) && myGameArea.board[this.r+i*k][this.c+j*k] != null
           && myGameArea.board[this.r+i*k][this.c+j*k].color != this.color) {
            options.push([this.r+i*k, this.c+j*k]);
            break;
          } else {
            break;
          }
        }
      }
    }
    myGameArea.options = options;
  }

  move(r_new, c_new) {
    var enemy_color = this.color == 'white' ? 'black' : 'white';
    if (r_new == myGameArea.king_position[enemy_color][0] && c_new == myGameArea.king_position[enemy_color][1]) {
      myGameArea.checkmate = true;
    }
    myGameArea.board[r_new][c_new] = myGameArea.board[this.r][this.c];
    myGameArea.board[this.r][this.c] = null;

    this.r = r_new;
    this.c = c_new;

    myGameArea.check(this.color);
    myGameArea.newTurn();
  }
}

class Queen extends ChessPiece {
  constructor(color, r, c) {
    super(color, r, c);
    this.type = 'queen';
    this.image;
    if (color == 'white') {
      this.image = document.getElementById('white_queen');
    } else {
      this.image = document.getElementById('black_queen');
    }
  }

  getLegalMoves() {
    var options = [];
    var ints = [-1, 0, 1];

    for (var a = 0; a < ints.length; a++) {
      var i = ints[a];
      for (var b = 0; b < ints.length; b++) {
        var j = ints[b];
        for (var k = 1; k < 8; k++) {
          if (myGameArea.onBoard(this.r+i*k, this.c+j*k) && myGameArea.board[this.r+i*k][this.c+j*k] == null) {
            options.push([this.r+i*k, this.c+j*k]);
          } else if (myGameArea.onBoard(this.r+i*k, this.c+j*k) && myGameArea.board[this.r+i*k][this.c+j*k] != null
           && myGameArea.board[this.r+i*k][this.c+j*k].color != this.color) {
            options.push([this.r+i*k, this.c+j*k]);
            break;
          } else {
            break;
          }
        }
      }
    }
    myGameArea.options = options;
  }

  move(r_new, c_new) {
    var enemy_color = this.color == 'white' ? 'black' : 'white';
    if (r_new == myGameArea.king_position[enemy_color][0] && c_new == myGameArea.king_position[enemy_color][1]) {
      myGameArea.checkmate = true;
    }
    myGameArea.board[r_new][c_new] = myGameArea.board[this.r][this.c];
    myGameArea.board[this.r][this.c] = null;

    this.r = r_new;
    this.c = c_new;

    myGameArea.check(this.color);
    myGameArea.newTurn();
  }
}

class King extends ChessPiece {
  constructor(color, r, c) {
    super(color, r, c);
    this.type = 'king';
    this.image;
    if (color == 'white') {
      this.image = document.getElementById('white_king');
    } else {
      this.image = document.getElementById('black_king');
    }
    this.moved = false;
  }

  getLegalMoves() {
    var options = [];
    var ints = [-1, 0, 1];
    for (var a = 0; a < ints.length; a++) {
      var i = ints[a];
      for (var b = 0; b < ints.length; b++) {
        var j = ints[b];
        if ((i != 0 || j != 0) && myGameArea.onBoard(this.r+i, this.c+j) &&
         (myGameArea.board[this.r+i][this.c+j] == null || myGameArea.board[this.r+i][this.c+j].color != this.color)) {
          options.push([this.r+i, this.c+j]);
        }
      }
    }

    // Castling


    myGameArea.options = options;
  }

  move(r_new, c_new) {
    var enemy_color = this.color == 'white' ? 'black' : 'white';
    if (r_new == myGameArea.king_position[enemy_color][0] && c_new == myGameArea.king_position[enemy_color][1]) {
      myGameArea.checkmate = true;
    }
    myGameArea.board[r_new][c_new] = myGameArea.board[this.r][this.c];
    myGameArea.board[this.r][this.c] = null;

    this.r = r_new;
    this.c = c_new;

    myGameArea.king_position[this.color] = [r_new, c_new];

    myGameArea.check(this.color);
    myGameArea.newTurn();
  }
}

var myGameArea = {
    canvas : document.createElement("canvas"),

    start : function() {
        this.canvas.width = 576;
        this.canvas.height = 576;
        this.canvas.id = 'canvas';
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        document.addEventListener('click', this.getClickCoordinates);

        // Coordinates in [Row, Column]
        this.board = [
          [new Rook('black', 0, 0), new Knight('black', 0, 1), new Bishop('black', 0, 2), new Queen('black', 0, 3), new King('black', 0, 4), new Bishop('black', 0, 5), new Knight('black', 0, 6), new Rook('black', 0, 7)],
          [new Pawn('black', 1, 0), new Pawn('black', 1, 1), new Pawn('black', 1, 2), new Pawn('black', 1, 3), new Pawn('black', 1, 4), new Pawn('black', 1, 5), new Pawn('black', 1, 6), new Pawn('black', 1, 7)],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [new Pawn('white', 6, 0), new Pawn('white', 6, 1), new Pawn('white', 6, 2), new Pawn('white', 6, 3), new Pawn('white', 6, 4), new Pawn('white', 6, 5), new Pawn('white', 6, 6), new Pawn('white', 6, 7)],
          [new Rook('white', 7, 0), new Knight('white', 7, 1), new Bishop('white', 7, 2), new Queen('white', 7, 3), new King('white', 7, 4), new Bishop('white', 7, 5), new Knight('white', 7, 6), new Rook('white', 7, 7)],
        ];
        this.turn = 'white';
        this.turn_num = 1;
        this.selected = null;
        this.options = [];
        //En Passant information
        this.en_passant = [];
        this.available_to_en_passant = [null, null];
        // King information
        this.checkmate = false;
        this.king_position = {'white' : [7,4], 'black' : [0,4]};

        this.update();
    },

    update : function() {
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j+=2) {
          this.context.fillStyle = i%2==0 ? "#BFADA3" : "#504746";
          this.context.fillRect(j*72, i*72, 72, 72);
          if (this.board[i][j] != null) {
            this.context.drawImage(this.board[i][j].image, j*72, i*72, 72, 72);
          }
          this.context.fillStyle = i%2==0 ? "#504746" : "#BFADA3";
          this.context.fillRect((j+1)*72, i*72, 72, 72);
          if (this.board[i][j+1] != null) {
            this.context.drawImage(this.board[i][j+1].image, (j+1)*72, i*72, 72, 72);
          }
        }
      }

    },

    getClickCoordinates : function(event) {
      var x = event.clientX;
      var y = event.clientY;
      var r = Math.floor((y - 3) / 72);
      var c = Math.floor((x - 3) / 72);
      if (r >= 8 || c >= 8) {
        console.log('out of bounds');
        myGameArea.selected = null;
        myGameArea.options = [];
        myGameArea.update();
      } else if (myGameArea.selected != null && myGameArea.inOptions([r,c])) {
        console.log('move');
        myGameArea.moveChessPiece(myGameArea.selected[0], myGameArea.selected[1], r, c);
        myGameArea.selected = null;
        myGameArea.options = [];
        myGameArea.update();
      } else if (myGameArea.selected != null && !myGameArea.inOptions([r,c])) {
        console.log('reset');
        myGameArea.selected = null;
        myGameArea.options = [];
        myGameArea.update();
      } else if (myGameArea.board[r][c] != null && myGameArea.board[r][c].color == myGameArea.turn) {
        console.log('select');
        myGameArea.board[r][c].getLegalMoves();
        myGameArea.drawOptions();
        myGameArea.selected = [r,c];

        var select_im = document.getElementById('select');
        myGameArea.context.drawImage(select_im, c*72, r*72, 72, 72);
      }
    },

    drawOptions : function() {
      var option_im = document.getElementById('option');
      var attack_im = document.getElementById('attack');
      for (var i = 0; i < this.options.length; i++) {
        if (this.board[this.options[i][0]][this.options[i][1]] == null && !this.inEnPassant(this.options[i])) {
          this.context.drawImage(option_im, this.options[i][1]*72, this.options[i][0]*72);
        } else {
          this.context.drawImage(attack_im, this.options[i][1]*72, this.options[i][0]*72);
        }
      }
    },

    moveChessPiece : function(r_old, c_old, r_new, c_new) {
      this.board[r_old][c_old].move(r_new, c_new);
      this.update();
    },

    inOptions : function(coords) {
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i][0] == coords[0] && this.options[i][1] == coords[1]) {
          return true;
        }
      }
      return false;
    },

    inEnPassant : function(coords) {
      for (var i = 0; i < this.en_passant.length; i++) {
        if (this.en_passant[i][0] == coords[0] && this.en_passant[i][1] == coords[1]) {
          return true;
        }
      }
      return false;
    },

    onBoard : function(r, c) {
      return (r >= 0 && r < 8 && c >= 0 && c < 8);
    },

    newTurn : function() {
      if (this.checkmate) {
        window.confirm(this.turn + " has won the game!");
        this.turn = 'game over';
      } else {
        this.turn = this.turn == 'white' ? 'black' : 'white';
        this.turn_num += 1;
        this.selected = null;
        this.options = [];
        //En Passant information
        this.en_passant = [];
      }
    },

    check : function(self_color) {
      // Checking if new options check enemy king
      var enemy_color = self_color == 'white' ? 'black' : 'white';
      var enemy_king_position = this.king_position[enemy_color];
      var dummy_pieces = [
        new Pawn(enemy_color, enemy_king_position[0], enemy_king_position[1]),
        new Rook(enemy_color, enemy_king_position[0], enemy_king_position[1]),
        new Knight(enemy_color, enemy_king_position[0], enemy_king_position[1]),
        new Bishop(enemy_color, enemy_king_position[0], enemy_king_position[1]),
        new King(enemy_color, enemy_king_position[0], enemy_king_position[1]),
        new Queen(enemy_color, enemy_king_position[0], enemy_king_position[1]),
      ];

      var attack_positions = [];

      for (var i = 0; i < dummy_pieces.length; i++) {
        dummy_pieces[i].getLegalMoves();
        for (var j = 0; j < this.options.length; j++) {
          if (this.board[this.options[j][0]][this.options[j][1]] != null && this.board[this.options[j][0]][this.options[j][1]].color == self_color
           && this.board[this.options[j][0]][this.options[j][1]].type == dummy_pieces[i].type) {
            attack_positions.push(this.options[j]);
          }
        }
      }

      if (attack_positions.length > 0) {
        alert(enemy_color + " king is in check!");
        var attack_im = document.getElementById('attack');
        for (var i = 0; i < attack_positions.length; i++) {
          this.context.drawImage(attack_im, attack_positions[i][1]*72, attack_positions[i][0]*72);
        }
      }
    },
}
