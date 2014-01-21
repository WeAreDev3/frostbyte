var Character = require('./character'),
    Gun = require('./gun');

var Player = Character.extend({
    init: function(socket, lobby) {
        this.socket = socket;
        this.lobby = lobby;

        var x = this.lobby.game.width / 2,
            y = this.lobby.game.height / 2;

        this._super(this.socket.id, x, y);

        // Input from client
        this.input = {
            'u': false, // Up
            'd': false, // Down
            'l': false, // Left
            'r': false, // Right
            'mouse': false // Mouse down
        };

        this.setHitPoints(100);
        this.setSize(12);
        this.setSpeed(100);
        this.setMobility(10);
        this.setDirection(0);
        this.setColor(77, 144, 254);
        this.setGun('full-auto');

        // Add the player onto the socket to be used elsewhere
        this.socket.player = this;
    },
    setGun: function(gun) {
        // Can pass in an actual Gun object or the type of gun
        if (gun instanceof Gun) {
            this.gun = gun;
        } else {
            this.gun = new Gun(this, gun);
        }
    },
    parseMessage: function(message) {
        var command = message[0],
            parameters = message.substring(1, message.length).split(',');

        // console.log(command, parameters);

        // Handle each command that we know
        switch (command) {
            case 'd': // Handle the 'd' command (Direction)
                this.setDirection(+parameters[0]);
                break;

            case 'i': // Handle the 'i' command (Input)
                switch (parameters[0]) {
                    case 'ut':
                    case 'dt':
                    case 'lt':
                    case 'rt':
                        // The move Up, Down, Left, and Right keys are pressed
                        this.input[parameters[0][0]] = true;
                        break;

                    case 'uf':
                    case 'df':
                    case 'lf':
                    case 'rf':
                        // The move Up, Down, Left, and Right keys are released
                        this.input[parameters[0][0]] = false;
                        break;

                    case 'mt':
                        // The Mouse is pressed
                        this.input.mouse = true;
                        break;

                    case 'mf':
                        // The Mouse is released
                        this.input.mouse = false;
                        break;
                }
                // console.log('i', parameters, this.input);
                break;
        }

    },
    hit: function (damage) {
        this.hitPoints -= damage;
        console.log('you just got hit, yo!')
        if (this.hitPoints <= 0) {
            this.kill();
        };
    },
    kill: function () {
        this.lobby.removePlayer(this);
    },
    update: function(timeElapsed) {
        // Move the player if needed
        if (this.input.u) { // Up
            this.y -= this.speed * timeElapsed;
        }
        if (this.input.d) { // Down
            this.y += this.speed * timeElapsed;
        }
        if (this.input.l) { // Left
            this.x -= this.speed * timeElapsed;
        }
        if (this.input.r) { // Right
            this.x += this.speed * timeElapsed;
        }

        // If the player goes off the screen
        if (this.x < 0) {
            this.setPosition(0, this.y);
        }
        if (this.x > this.lobby.game.width) {
            this.setPosition(this.lobby.game.width, this.y);
        }
        if (this.y < 0) {
            this.setPosition(this.x, 0);
        }
        if (this.y > this.lobby.game.height) {
            this.setPosition(this.x, this.lobby.game.height);
        }

        // Handle the gun firing
        if (this.input.mouse) {
            this.gun.fire();
        }

        this.gun.timeSinceLastFire += timeElapsed;

        if (!this.input.mouse && this.gun.timeSinceLastFire > this.gun.rate) {
            this.gun.timeSinceLastFire = this.gun.rate;
        }

        if (!this.input.mouse && this.gun.wasFired) {
            this.gun.wasFired = false;
        }
    }
});

module.exports = Player;
