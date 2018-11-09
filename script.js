class Mine {
    constructor(height, width, total_bomb) {
        this.height = height;
        this.width = width;
        this.total_bomb = total_bomb;
        this.mine = [];
    }

    // Input: height, width. (At least 8 * 8)
    // Output: Randomly created 2d array with 1 stands for bomb and 0 for no bomb. 
    // Output size: (height + 1) * (width + 1). Additional margin. Margin-size: 1. Margin value: 0.
    createMine() {
        // Use 2d array mine to store the location of bombs.
        // Add additional margins to mine array for further convenience.
        // Initialize a (height + 2)* (width + 2) mine with no bomb, margin size 1.
        // Add margin because in this way it's easier to count bombsb in the following steps.

        for(let i = 0; i < this.height + 2; i++){
            this.mine[i] = [];
            for (let j = 0; j < this.width + 2; j++){
                this.mine[i][j] = 0;
            }
        }

        // Scatter bombs randomly to the 2d array. 1 stands for bomb, 0 - no bomb.
        for (let i = 0; i < this.total_bomb; i++) {
            let location = this.generateRandomLocation();
            let x = location[0];
            let y = location[1];

            this.mine[x][y] = 1;
        }

        return this.mine;
    }

    // Output: [x,y], x -> [1, height], y -> [1, width].
    generateRandomLocation(){
        let x = Math.floor(Math.random() * this.height + 1);
        let y = Math.floor(Math.random() * this.width + 1);
        if (this.mine[x][y] === 0) {
            return [x,y];
        } else {
            return this.generateRandomLocation();
        }
    }

    // Render. Draw the mine field.
    // Draw the mine field with buttons.
    drawMine(){
        // Draw the mine using buttons.
        // Set each button with id i-j to refer to the location in the 2d array. 
        let mine = this.createMine();

        for(let i = 1; i <= height; i++){
            $("#minefield").append("<div class = 'mine'>");
            for (let j = 1; j <= width; j++){
                $("#minefield").append("<button x = " + i + " y = " + j + 
                " hasBomb = " + mine[i][j] + " id = " + i + "-" + j + 
                " clicked = 0" + ">" + mine[i][j] +"</button>");
            }
            $("#minefield").append("</div>");
        }
    };

    // Calculate how many surrounding bombs.
    // Input: int i and j. i ranges from [1, height], j ranges from [1, width].
    countBomb(i, j) {
        return this.mine[i-1][j-1] + this.mine[i-1][j] + this.mine[i-1][j+1] +
                this.mine[i][j-1] + this.mine[i][j+1] +
                this.mine[i+1][j-1] + this.mine[i+1][j] + this.mine[i+1][j+1];
    }

    // Input: the id of button.
    clickButton(id) {
        let cur_button = $("#"+id);

        cur_button.css("background-color", "white");
        cur_button.attr("clicked", 1);

        if(parseInt(cur_button.attr("hasBomb")) === 1){
            alert("Bomb!!!");
            location.reload();
        } else {
            // See if surrounding has bomb.
            let x = parseInt(cur_button.attr("x"));
            let y = parseInt(cur_button.attr("y"));
            let count = this.countBomb(x, y);
            if (count !== 0) {
                cur_button.html("<a class = 'bomb_count'>" + count + "</a>");
            } else {
                // If the current field has no bomb, then explore the adjacent ones (8 at max).
                // Keep exploring until find bomb.
                cur_button.text("");
                // Traverse all adjacent field.
                for (let i = x - 1; i <= x + 1; i++) {
                    for (let j = y - 1; j <= y + 1; j++) {
                        // Generate button id.
                        let adj_id = i + "-" + j;
                        // Fake click on unclicked ones iteratively.
                        if ($("#"+adj_id).attr("clicked") === '0') {
                            mine.clickButton(adj_id);
                        }
                    }
                }
            }
        }
    }

    // Getters.
    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getTotalBomb() {
        return this.total_bomb;
    }

    getMine() {
        return this.mine;
    }
}