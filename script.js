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
}