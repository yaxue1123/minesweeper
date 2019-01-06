$("document").ready(function(){
        // #############################################################################
        // ################################# Timer and Status ##########################
        // Set a timer starting at 0. Execuate countSecond to add time every 1000 millisecond (1 second).
        // Max time is 999, which is about 16.65 minutes. If the user cannot figure it out in such 
        // a period, forget about it ...
        // Input: order of start, stop.
        // Start the timer when user clicks new game button or originally click a field.
        // Stop the timer when user suceeds or fails the game.
        let time = 0;
        let time_stop = true;
        let interval = setInterval(function() {
            if (!time_stop) {
                if (time < 999) {
                    time += 1;
                }
                // Show passed time on the game page.
                $("#timer").text(time); 
            }
        }, 1000);

        // Disable context menu on the page completely.
        $("#mine-field").contextmenu(function() {
            return false;
        });
        // A variable to track game status: init, inactive (win or fail), active.
        // Only in active mode can click mine field.
        let status = "init";

        // Toggle between different menu selection.
        // ################################################################################
        // ################################# Scorebord ####################################
        // Current user's scoreboard.
        // Score value is the time a user takes to win a game. The smaller the score, the higher the rank is.
        // ########## improve: use combination of difficulty level and time? width * height / time. 
        let score = [0];
        
        $("#scoreboard").click(function() {
            $(".score-page").css("display", "flex");
            $(".main").css("display", "none");
            $(".instruction-page").css("display", "none");
            $(".about-page").css("display", "none");
        });


        // ################################################################################
        // ################################ Introduction ##################################
        $("#instruction").click(function() {
            $(".score-page").css("display", "none");
            $(".main").css("display", "none");
            $(".instruction-page").css("display", "block");
            $(".about-page").css("display", "none");
        });

        // ################################################################################
        // ################################### About ######################################
        $("#about").click(function() {
            $(".score-page").css("display", "none");
            $(".main").css("display", "none");
            $(".instruction-page").css("display", "none");
            $(".about-page").css("display", "block");
        });

        // ################################################################################
        // #################################### Level #####################################
        $(".dropdown").click(function() {
            if ($(".main").css("display") === "none") {
                $(".score-page").css("display", "none");
                $(".main").css("display", "flex");
                $(".instruction-page").css("display", "none");
                $(".about-page").css("display", "none");
            }
        });

        // Start a new game based on user's choice or input.
        // User change game level by drop down list.
        $("#beginner").click(function(){
            $("#height").val(8);
            $("#width").val(8);
            $("#total-bomb").val(10);  

            // Fake click on new game.
            $(".control-btn").click();
        })

        $("#intermediate").click(function(){
            $("#height").val(16);
            $("#width").val(16);
            $("#total-bomb").val(40);  

            // Fake click on new game.
            $(".control-btn").click();
        })

        $("#expert").click(function(){
            $("#height").val(30);
            $("#width").val(40);
            $("#total-bomb").val(160);  

            // Fake click on new game.
            $(".control-btn").click();
        })

        $(".control-btn").click(function() {
            // Test if the use customized game is legal. 
            // Height <- [8, 30], width <- [8, 40], num of bombs <- [1, height * width - 1]
            let height = parseInt($("#height").val());
            let width = parseInt($("#width").val());
            let total_bomb = parseInt($("#total-bomb").val());
            let control_field = $(".control-field-1");

            // Remove warning first.
            $("div").remove(".input-warning");

            if (height > 30 || height < 8) {
                time_stop = true;
                $("<div class='input-warning'>Please input valid height between 8 and 30.</div>")
                    .insertAfter(control_field);
            } else if (width > 40 || width < 8) {
                time_stop = true;
                $("<div class='input-warning'>Please input valid width between 8 and 40.</div>")
                    .insertAfter(control_field);
            } else if ($("#total-bomb").val() === "" || total_bomb < 1 || total_bomb > height * width - 1) {
                time_stop = true;
                $("<div class='input-warning'>Please input valid number of bomb between 1 and number of fields - 1.</div>")
                    .insertAfter(control_field);
            } else {
                // If all input is valid, trigger a new game.
                // Remove the old mine field.
                $(".btn").remove();
                // Remove all breaks.
                $("br").remove();
                // Remove current message.
                $(".message-field").remove();
                // Draw new minefield.
                newGame();
                // Mark game status as "ongoing".
                status = "active";
                // Start the timer.
                // time should start from 0.
                time = 0;
                time_stop = false;
            }
        });
   
        function newGame(){
            // Game level: 8*8 for beginner (10 bombs), 16 * 16 for intermediate (40 bombs),
            // 40 wide * 30 tall for expert (160 bombs),
            // also allow users to customize.
            let height = parseInt($("#height").val());
            let width = parseInt($("#width").val());
            let total_bomb = parseInt($("#total-bomb").val());

            let mine = new Mine(height, width, total_bomb);
            
            let minefield = mine.createMine();

            let userFoundBomb = 0;

            let userMarked = 0;

            $("#left-bomb").css("color", "black");

            // Draw the mine field with buttons.
            function drawMine(){
                // Draw the mine using buttons.
                // Set each button with id i-j to refer to the location in the 2d array. 
                // Attribute clicked stores how many times this button is clicked.
                for(let i = 1; i <= height; i++){
                    for (let j = 1; j <= width; j++){
                        $("#mine-field").append("<a class = 'btn' x = " + i + " y = " + j + 
                        " hasBomb = " + minefield[i][j] + " id = " + i + "-" + j + 
                        " clicked = 0 rclicked = 0" + ">" + "</a>");
                    }
                    $("#mine-field").append("<br>");
                }
            }

            drawMine();

            // Add left-bomb based on user input. Initial: total bombs.
            $("#left-bomb").text(total_bomb);

            // Calculate how many surrounding bombs.
            // Input: int i and j. i ranges from [1, height], j ranges from [1, width].
            function countBomb(i, j) {
                return minefield[i-1][j-1] + minefield[i-1][j] + minefield[i-1][j+1] +
                        minefield[i][j-1] + minefield[i][j+1] +
                        minefield[i+1][j-1] + minefield[i+1][j] + minefield[i+1][j+1];

            }

            // Calculate how many surrounding bombs.
            // If a surrouding field rclicked attr is 1, then it is marked.
            function countMarked(x, y) {
                let marked = 0;
                for (let i = x - 1; i < x + 2; i++) {
                    for (let j = y - 1; j < y + 2; j++) {
                        if($("#" + i + "-" + j).attr("rclicked") === '1') {
                            marked += 1;
                        }
                    }
                }
                return marked;
            }
        
            // Input: the id of button.
            function clickButton(id) {
                // Initial click.
                if(time_stop === true && status === 'init') {
                     // Mark game status as "ongoing".
                    status = "active";
                    // Start the timer.
                    // time should start from 0.
                    time = 0;
                    time_stop = false;
                }

                let cur_button = $("#"+id);

                // Change clicked fields' background color and track clicked time of right click.
                cur_button.css("background-color", "white");
                cur_button.attr("clicked", 1);

                if(parseInt(cur_button.attr("hasBomb")) === 1){
                    // Mark status as lose.
                    status = "inactive";
                    // Stop the timer.
                    time_stop = true;
                    // Show failure message.
                    $(".main").append("<div class = 'message-field'></div>");
                    $(".message-field").append("<div>Bomb! You failed.</div>");
                    // Mark all mine fields as bomb.
                    $(".btn[hasbomb='1']").html("").append("<span class='btn-span'><i class='fas fa-bomb'></i></span>");
                    // Mark all wrongly marked field if any.
                    $(".btn[hasbomb='0'][rclicked='1']").html("")
                        .append("<span class='btn-span'><i class='fas fa-times'></i></span>");
                } else {
                    // See if surrounding has bomb.
                    let x = parseInt(cur_button.attr("x"));
                    let y = parseInt(cur_button.attr("y"));
                    let count = countBomb(x, y);
                    if (count !== 0) {
                        // First click. Unreveal the field.
                        if (cur_button.has("span").length === 0) {
                            cur_button.html("<span class = 'btn-span'>" + count + "</span>");
                        } else {
                            // Check surrounding marked count.
                            // If surrounding marked equals to the num on this field.
                            // Fake click all surrounding fields.
                            if (countMarked(x, y) === count) {
                                // if mark count is same with bomb count, fake click all surrounding field.
                                for (let i = x - 1; i <= x + 1; i++) {
                                    for (let j = y - 1; j <= y + 1; j++) {
                                        // Generate button id.
                                        let adj_id = i + "-" + j;
                                        // Fake click on unclicked ones.
                                        if ($("#"+adj_id).attr("clicked") === '0' &&
                                            $("#"+adj_id).attr("rclicked") !== '1') {
                                            clickButton(adj_id);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // If the current field has no bomb, then explore the adjacent ones (8 at max).
                        // Keep exploring until find bomb.
                        // Traverse all adjacent field.
                        for (let i = x - 1; i <= x + 1; i++) {
                            for (let j = y - 1; j <= y + 1; j++) {
                                // Generate button id.
                                let adj_id = i + "-" + j;
                                // Fake click on unclicked ones.
                                if ($("#"+adj_id).attr("clicked") === '0' && 
                                    $("#"+adj_id).attr("rclicked") === '0') {
                                    clickButton(adj_id);
                                }
                            }
                        }
                    }

                }
            }

            // User can right click to mark bomb.
            // User wins when marking all bombs.
            $(".btn").mousedown(function(e) {
                // ################## CLICK ######################
                // reveal the field.
                if (e.which === 1 && !e.shiftKey && (status === "active" || status === "init") 
                        && $(this).attr("rclicked") === '0') {
                    clickButton($(this).attr("id"));
                }
                // ################## RIGHT CLICK OR SHIFT + CLICK######################
                // mark or unmark the field.
                // on computer: right click or shift + click; mobile: long click.
                // first right click: X to mark bomb, second: ? to mark unsure, third: cancel mark.
                if (parseInt($(this).attr("clicked")) === 0 && 
                    (e.which === 3 || (e.shiftKey && e.which === 1))) {
                    let rclicked_times = parseInt($(this).attr("rclicked"));
                    // Base on current rclicked value to decide next value.
                    switch (rclicked_times) {
                        case 0: 
                            rclicked_times = 1;
                            break;
                        case 1:
                            rclicked_times = 2;
                            break;
                        case 2:
                            rclicked_times = 0;
                            break;
                    }

                    $(this).attr("rclicked", rclicked_times);

                    // limit the mark number within the total bomb number's range.
                    // when equals, only allow change from flag to ? to null, no more flag!
                    // ##### FLAG ######
                    if (userMarked <= total_bomb) {
                        // Flag.
                        if ($(this).attr("rclicked") === '1' && userMarked < total_bomb) {
                            if (userMarked < total_bomb) {
                                $(this).html("<span class='btn-span'><i class='far fa-flag'></i></span>");
                            }
                            userMarked += 1; 
                            // If the user marks is bomb, record this.
                            if ($(this).attr("hasBomb") === "1") {
                                userFoundBomb += 1;
                            }
                            // Change left bombs by - 1.
                            $("#left-bomb").text(total_bomb - userMarked);
                        } else if ($(this).children().children().hasClass('fa-flag')) {
                            // ?.
                            // only flag can be changed to ?.
                            $(this).html("<span class='btn-span'><i class='fas fa-question'></i></span>");
                            // Now user canceled the marked field.
                            userMarked -= 1;
                            // update left bombs.
                            $("#left-bomb").text(total_bomb - userMarked);
                            // If the user orginal mark is bomb, erase the correct mark.
                            if ($(this).attr("hasBomb") === "1") {
                                userFoundBomb -= 1;
                            }   
                        } else if ($(this).children().children().hasClass('fa-question')) {
                            // only apply to ?.
                            $(this).text("");
                        }

                        if(userMarked === total_bomb) {
                            $("#left-bomb").css("color", "red");
                        } else {
                            $("#left-bomb").css("color", "black");
                        }
                    } 
    
                    // If user found all bombs, win!
                    if (userFoundBomb === total_bomb) {
                        // User has found all bombs. Auto click the rest ones.
                        $(".btn[clicked='0'][rclicked='0']").css("background-color", "#FFF");
                        // Add message indicating success.
                        $(".main").append("<div class = 'message-field'></div>");
                        $(".message-field").append("Congratulations! You win!");
                        // Give current score and a link to scoreboard.
                        let this_score = calculateScore(time);
                        $(".message-field")
                            .append("<div class='score-list'>Score: <a class='setting'>" + this_score + "</a></div>");
                        // Mark status as win.
                        status = "inactive";
                        score.push(this_score);
                        // Sort score from high to low.
                        score.sort(function(x, y) {
                            return x < y ? 1 : -1;
                        });
                        // Update score board. Remove the old one.
                        $("tr").remove();
                        $("table").append("<tr><td>Rank</td><td>Score</td></tr>");
                        for (let s in score) {
                            if (s < score.length - 1) {
                                // If has user score record, don't need the score of 0.
                                $("table").append("<tr><td>#" + (parseInt(s) + 1) + "</td><td>" 
                                + score[s] + "</td></tr>");
                            }
                        }
                        // Stop the timer.
                        time_stop = true;
                    }
                }
            });

            function calculateScore(time) {
                let height = parseInt($("#height").val());
                let width = parseInt($("#width").val());
                let total_bomb = parseInt($("#total-bomb").val());

                return Math.round(Math.pow(total_bomb, 2) * height * width / time);
            }
        }
        
        // Default new game when user open this page.
        newGame();

        // Dropdown button.
        // drop-down menu.
        // When the user is on the game panel, effective dropdown. Or user clicks to go back to game panel.
        if ($(".main").css("display") === "flex") {
            document.querySelectorAll(".dropbtn").forEach(function(el){
                el.addEventListener("click",function(e){
                    var el = e.currentTarget.nextElementSibling;

                    if (el.classList.contains("dropdown-content-show")){
                        el.classList.remove("dropdown-content-show");
                        el.classList.add("dropdown-content");
                    } else{
                        el.classList.remove("dropdown-content");
                        el.classList.add("dropdown-content-show");
                    }
                });
            });
        }
})

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