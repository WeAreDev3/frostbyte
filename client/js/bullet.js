Bullet = function(gun, speed, direction) {
    this.gun = gun;
    this.speed = speed;
    this.direction = direction;
    this.x1 = this.gun.player.x - (5 + this.gun.player.size) * Math.cos(this.direction);
    this.y1 = this.gun.player.y - (5 + this.gun.player.size) * Math.sin(this.direction);
    this.x2 = this.x1 - 10 * Math.cos(this.direction);
    this.y2 = this.y1 - 10 * Math.sin(this.direction);
    this.prevX = this.x1;

    bullets.push(this);
};

Bullet.prototype.draw = function() {
    var x1 = this.x1 * scale,
        x2 = this.x2 * scale,
        y1 = this.y1 * scale,
        y2 = this.y2 * scale;

    context.beginPath();
    context.moveTo(x1, y1);

    context.lineTo(x2, y2);

    context.lineWidth = 1;
    context.strokeStyle = '#000';
    context.stroke();
    context.closePath();
};

Bullet.prototype.update = function(timeElapsed) {
    if (this.x1 < 0 || this.x1 > 1600 || this.y1 < 0 || this.y1 > 1000) {
        bullets.splice(bullets.indexOf(this), 1);
        return;
    }

    var m = (this.y2 - this.y1) / (this.x2 - this.x1),
        m2 = -1 / m,
        intersection = [];

    for (var i = 0, len = enemies.length; i < len; i++) {
        // Notes...
        intersection[0] = ((enemies[i].x * -m2) + (this.x1 * m) + enemies[i].y - this.y1) / (m - m2);
        intersection[1] = m * intersection[0] - (m * this.x1) + this.y1;

        var distanceFromBulletLine = Math.sqrt(Math.pow((enemies[i].x - intersection[0]), 2) + Math.pow((enemies[i].y - intersection[1]), 2)),
            isIntersectionOnBullet = this.x2 > this.prevX ? intersection[0] > this.prevX && intersection[0] < this.x2 : intersection[0] < this.prevX && intersection[0] > this.x2;

        if (distanceFromBulletLine <= enemies[i].size && isIntersectionOnBullet && enemies[i].health > 0) {
            enemies[i].hit(this.gun.damage);
            bullets.splice(bullets.indexOf(this), 1);
            return;
        }
    }

    this.prevX = this.x1;
    this.x1 -= this.speed * Math.cos(this.direction) * timeElapsed * 100;
    this.y1 -= this.speed * Math.sin(this.direction) * timeElapsed * 100;
    this.x2 = this.x1 - 10 * Math.cos(this.direction);
    this.y2 = this.y1 - 10 * Math.sin(this.direction);
};
