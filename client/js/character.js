Character = function(specs) {
    this.type = specs.type;
    this.name = specs.name;
    this.hp = specs.hp;
    this.health = 100; // Percent
    this.size = specs.size;
    this.speed = specs.speed;
    this.mobility = specs.mobility;
    this.x = specs.x;
    this.y = specs.y;
    this.direction = specs.direction;
    this.gun = specs.gun;
    this.gun.player = this;
    this.color = specs.color;
    this.transparency = 1;
    this.id = '';
};

Character.prototype.draw = function() {
    var x = this.x * scale,
        y = this.y * scale,
        size = this.size * scale;

    var namePositionX = x - (context.measureText(this.name).width / 2),
        namePositionY = y + (size * 2);
 
    // Draws Body
    context.fillStyle = this.color;

    if (this.type == 'player') {
        // Square
        context.save();
        context.translate(x, y);
        context.rotate(this.direction);
        context.fillRect(-1 * size, -1 * size, size * 2, size * 2);
        context.restore();

        context.fillStyle = '#000';
        context.font = 'normal ' + this.size * scale + 'pt Roboto'
        context.fillText(this.name, namePositionX, namePositionY);
    } else {
        // Circle
        context.beginPath();
        context.arc(x, y, size, 0, 2 * Math.PI, false);
        context.fill();
        context.closePath();
    }
};

Character.prototype.setState = function(state) {
    this.x = state.x;
    this.y = state.y;
    this.direction = state.direction;
};

Character.prototype.update = function(timeElapsed) {
    var damageDone = 100 - this.health,
        inputs = {
            'move': [],
            'direction': this.direction
        };

    if (this.type === 'player') {
        if (input.w) { // Up (Press W)
            this.y -= this.speed * timeElapsed;
            inputs.move.push('u');
        }
        if (input.s) { // Down (Press S)
            this.y += this.speed * timeElapsed;
            inputs.move.push('d');
        }
        if (input.a) { // Left (Press A)
            this.x -= this.speed * timeElapsed;
            inputs.move.push('l');
        }
        if (input.d) { // Right (Press D)
            this.x += this.speed * timeElapsed;
            inputs.move.push('r');
        }

        if (inputs.move.length) {
            inputs.move = inputs.move.join(',')
            // console.log('sending input:', inputs.move);
            socket.send('m' + inputs.move);
        }

        this.direction = (Math.atan2((crosshairs.y - this.y), (crosshairs.x - this.x)) + Math.PI).toFixed(5);

        if (this.direction !== inputs.direction) {
            socket.send('d' + this.direction);
        }

        if (input.mouseDown) {
            this.gun.fire();
        }

        this.gun.timeSinceLastFire += timeElapsed;

        if (!input.mouseDown && this.gun.timeSinceLastFire >= this.gun.rate) {
            this.gun.timeSinceLastFire = this.gun.rate;
        }

        if (!input.mouseDown) {
            this.gun.wasFired = false;
        }

    } else {
        this.x += this.speed * Math.cos(this.direction) * timeElapsed;
        this.y += this.speed * Math.sin(this.direction) * timeElapsed;

        if (this.x < 0 || this.x > 1600 || this.y < 0 || this.y > 1000) {
            this.direction += Math.PI;
        }

        if (this.mobility < 0) {
            this.direction += Math.PI / this.mobility * timeElapsed;
        }

        this.color = 'rgba(' + parseInt(255 - (damageDone * 1.28)) + ',' + parseInt(0 + (damageDone * 1.28)) + ',' + parseInt(0 + (damageDone * 1.28)) + ',' + this.transparency + ')';

        if (this.health <= 0) {
            this.transparency -= timeElapsed * 2;
        }
        if (this.transparency <= 0) {
            enemies.splice(enemies.indexOf(this), 1);
        }
    }
};

Character.prototype.hit = function(damage) {
    this.health -= damage;

    if (this.health <= 0) {
        this.kill();
    }
};

Character.prototype.kill = function() {
    this.health = 0;
    this.speed = 0;
    this.mobility = 0;
};
