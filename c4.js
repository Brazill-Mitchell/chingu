
let realX
let realY
let canvas
let canvasBox
let relativePosX
let relativePosY
//Game tracker
let squareSize
let boardWidth
//Test values
let rows = 8
let columns = 8
let squareCount
// let squareIdList = []//idList format [[x,y,range],[x,y,range]] 
let squareIdList = []
let idListRed = []
let idListBlack = []
let turn = "red"
let turnsTaken = 0
let squareSelection
let boardFloor
let columnHeights = {}
let defaultSize = true

/* Set the height of each column based on the floor level,
which is also the 'Board Size'
*/
function setColumnHeights(){
    for (let x = 0; x < columns; x++){
        columnHeights[x] = boardFloor
    }
}


function setCanvas(){
    canvas = document.getElementById("canvas1");
    canvasBox = canvas.getBoundingClientRect();
}


function setMouseCoords(){
    realX = window.mouseX;
    realY = window.mouseY;
}

document.onmousemove = function(e){
    var event = e || window.event;
    window.mouseX = event.clientX;
    window.mouseY = event.clientY;
}

function displayPos(){
    setAbsolutePos();
    setRelativePos();
}
function setAbsolutePos(){
    let containerXPos = document.getElementById("container-x-pos");
    containerXPos.innerHTML = realX;
    let containerYPos = document.getElementById("container-y-pos");
    containerYPos.innerHTML = realY;
}

//    Match the mouse position with it's relative pixel position inside the canvas
function setRelativePos(){    
    relativePosX = realX - canvasBox.left;
    relativePosY = realY - canvasBox.top;
    
    document.getElementById("relative-x-pos").innerHTML = relativePosX;
    document.getElementById("relative-y-pos").innerHTML = relativePosY;
}
function showCanvasCoords(){
    setCanvas();
    document.getElementById("canvas-top").innerHTML = canvasBox.top;
    document.getElementById("canvas-bottom").innerHTML = canvasBox.floor;
    document.getElementById("canvas-right").innerHTML = canvasBox.right;
    document.getElementById("canvas-left").innerHTML = canvasBox.left;
}

//    Match the mouse position with it's relative pixel position inside the canvas
function relativePos(){    
    let canvasX = realX - canvasBox.left;
    let canvasY = realY - canvasBox.top;
    let canvasCoords = [canvasX,canvasY];
//    document.getElementById("relative-y-pos").innerHTML = canvasCoords[0];
    return canvasCoords;
}
function getRelativePos(dimension,pixelPos){
    let position = "";
    switch(dimension){
        case "x":
            position = pixelPos-canvasBox.left;
            break;
        case "y":
            position = pixelPos-canvasBox.top;
            break;
        default:
            console.log("@getRelativePos: no dimension given")
    }
    return position;
}

var mouseState = 0;

function mouseDown(){
    mouseState = 1;
}

function mouseUp(){
    mouseState = 0;
};

function setClickPos(){ 
    let x = document.getElementById("clickX");
    let y = document.getElementById("clickY");
    x.innerHTML = event.clientX;
    y.innerHTML = event.clientY;
    setRelativePos()
}

/* Creates a list with properties for each individual square on the board.
Assigns each square an X & Y pixel boundary, so that clicks on the canvas
can be matched with corresponding squares.
*/
let makeBoard = function (){
    let index = 0
    for (let y = 0; y < rows; y++){
        for (let x = 0; x < columns; x++){
            let range = getSquareRange([x,y])
            let squareInfo = {
                "index":index,
                "x":x,
                "y":y,
                "floor":boardFloor,//Represents the Y value of the square played
                "coord":[x,y],
                "startX":range.startX,
                "startY":range.startY,
                "endX":range.endX,
                "endY":range.endY,
                "played":false,
            }
            squareIdList.push(squareInfo)
            index++
        }
    }
    // console.log(squareIdList)
}

function getImageData(){
    ctx = canvas.getContext("2d");
    let imgData = ctx.getImageData(relativePos()[0],relativePos()[1],2,2);
    // console.log(imgData)
}

function checkRange(a,b){
    if (Math.abs(a-b) < 3){
        return true;
    }else{
        return false;
    }
}

/* Board properties
Get the width of the board to set the size of the squares
*/
let setBoardWidth = function() {
    setCanvas()
    boardWidth = canvasBox.right - canvasBox.left
}
let setSquareSize = ()=>{
    squareSize = boardWidth/columns
    squareCount = rows * columns
}

//Draw grid lines from top row and from right to left
function drawGrid(){
    let ctx = canvas.getContext("2d")
    let length = boardWidth

    for (let x = 0; x < squareIdList.length; x++){
        if(squareIdList[x].coord[0] === 0){//Draw Horizontal Lines
            ctx.beginPath()
            ctx.moveTo(0,squareIdList[x].endY)//Start at [0,endY]
            ctx.lineTo(boardWidth,squareIdList[x].endY)//End at [right,endY]
            ctx.stroke()
        }if(squareIdList[x].coord[1] === 0){//Draw Vertical Lines
            ctx.beginPath()
            ctx.moveTo(squareIdList[x].endX,0)
            ctx.lineTo(squareIdList[x].endX,boardWidth)
            ctx.stroke()
        }
    }
}
// Calculate the pixel range that will make up each square
function getSquareRange(id){
    let x = id[0]
    let y = id[1]
//Starting point for each space
    let displaceX = x*squareSize
    let displaceY = y*squareSize
//End point for each space
    let edgeX = displaceX + squareSize
    let edgeY = displaceY + squareSize

    let range = {
        "startX":displaceX,
        "startY":displaceY,
        "endX":edgeX,
        "endY":edgeY
    }
    // console.log(range)
    return range
}

/*--Assign a value to the space that was set--
Identifies the actual space on the canvas that was clicked,
then matches that space with the relevant item in the squareIdList.
Stops if selected column is full
*/
function clickSquare(){
    let square = []
    for (let x = 0; x < squareIdList.length; x++){
        /* Takes the click position and finds the X & Y boundaries for that coordinate,
        and matches with the appropriate array item
        */
        if (relativePosX > squareIdList[x].startX && relativePosX < squareIdList[x].endX && relativePosY > squareIdList[x].startY && relativePosY < squareIdList[x].endY){
                clickedSquare = squareIdList[x]

                if(columnHeights[clickedSquare.x] > -1){
                    square = findFloor(clickedSquare)
                    square.floor = columnHeights[square.x]
                    squareSelection = square
                    console.log("Index: " + squareSelection.index)
                    console.log("Square Floor: " + squareSelection.floor)
                    console.log("Column Height: " + columnHeights[square.x])
                    console.log('------------------------------------------')
                    return
                }else{
                    console.log("Column is full")
                    return
                }
        }
    }
}

        /* Find the floor for the clicked square */

function findFloor(clickedSquare){
/* Get the height of the column selected.
Find the difference between the heigth and the Y value of the selected square.
Add the # of rows * 8 to find the appropriate index
*/

/* Get height of selected row.
    Find the difference between column height and click height
    */
/* Check if click was below or above the column floor
    If it's below,  
*/
    let diff = Math.abs(clickedSquare.y - columnHeights[clickedSquare.x])
/*Find the square at the floor of the Selected Column
*/
    let floorSquare
    if(clickedSquare.y > columnHeights[clickedSquare.x]){
        floorSquare = squareIdList[clickedSquare.index - ( diff * 8)]
    }else if (clickedSquare.y < columnHeights[clickedSquare.x]){
        floorSquare = squareIdList[clickedSquare.index + (diff * 8)]
    }else{
        floorSquare = clickedSquare
    }
    return floorSquare
}

// Select the chosen square from the list using the index
// function findSquare(index){
//     let square = (
//         function(squareIdList){
//             return (squareIdList[index] ===)
//     })
// } 

function handleClick(){
    let x = event.clientX
    let y = event.clientY

    pixelX = event.clientX
    pixelY = event.clientY
    setClickPos()
//Execute canvas operations only when mouse is on canvas
    if (x >= canvasBox.left && x <= canvasBox.right && y >= canvasBox.top && y <= canvasBox.bottom){

    clickSquare()
    setSpace()
    displaySquarePlayed()
    }
    
    
}

function displaySquarePlayed(){
    let squareX = document.getElementById("squareX")
    let squareY = document.getElementById("squareY")
    squareX.innerHTML= squareSelection.x
    squareY.innerHTML = squareSelection.floor
}

/* Finds the lowest unfilled square, then
 fills the space depending on which turn it is
 */
function setSpace(){
    let lowestSquareY = getLowestSquareY()

    if(turn === "red"){
        fillSquareRed(squareSelection.startX,lowestSquareY)
        squareIdList[squareSelection.index].played = true
        squareIdList[squareSelection.index].floor = columnHeights[squareSelection.x]
        freeSpaceAdvance(squareSelection.x)
        idListUpdate()
        turnsTaken += 1
        checkWin()
        setTurn()
    }else if(turn === "black"){
        fillSquareBlack(squareSelection.startX,lowestSquareY)
        squareIdList[squareSelection.index].played = true
        squareIdList[squareSelection.index].floor = columnHeights[squareSelection.x]
        freeSpaceAdvance(squareSelection.x)
        idListUpdate()
        turnsTaken += 1
        checkWin()
        setTurn()
    }
}
//Fill Selected square Red
function fillSquareRed(x,y){
    let ctx = canvas.getContext("2d")
    ctx.beginPath();
    ctx.rect(x, y, squareSize, squareSize);
    ctx.fillStyle = "red";
    ctx.fill();
}
//Fill Selected square Black
function fillSquareBlack(x,y){
    let ctx = canvas.getContext("2d")
    ctx.beginPath();
    ctx.rect(x, y, squareSize, squareSize);
    ctx.fillStyle = "black";
    ctx.fill();
}

function setTurn(){
    if (turn === "red"){
        turn = "black"
    }else if(turn === "black"){
        turn = "red"
    }
}
//Find the lowest free space in selected column
function freeSpaceGet(x){
    let column = columnHeights[x]
    return column
}

function getLowestSquareY(){
    let column = squareSelection.x//Get Selected column
    let bottom = freeSpaceGet(column)//Find the lowest free space in the column
    let lowestSquareY = bottom * squareSize

    return lowestSquareY
}

/* Increase the height of the lowest free space */
function freeSpaceAdvance(x){
    columnHeights[x] -= 1
}
/* Add Selected Square to player's list of squares */
function idListUpdate(){
    if (turn === "red"){
        idListRed.push(squareSelection)
    }else if (turn ==="black"){
        idListBlack.push(squareSelection)
    }
}

/* Sort the Squares in ascending order by Index  */
function indexSort(listSelected){
    let list = listSelected
    function compare(a,b){
        if (a.index < b.index) return -1;
        if (a.index > b.index) return 1;
        return 0;
    }
    let sorted = list.sort(compare)
    return sorted
}

/* Sort the player's spaces ascending order by X value*/
function squaresSortX(squareList){
    let list = squareList
    function compare(a,b){
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        if (a.x === b.x){
            if (a.floor < b.floor) return -1;
            if (a.floor > b.floor) return 1;
        }
        return 0;
    }
    let sorted = list.sort(compare)
    // console.log(sorted)
    return sorted
}


            /* Find Horizontal Matches */
function findHorizontalMatches(listSelected){
    /* Choose the list based on the turn */ 
    let playedSquareList = listSelected
    /*Scan the list for matches.
    Increment count each time a consecutive square is found.
    Reset if the streak is broken.*/

   /*Break the list up into rows*/
   let rowList = []
   let row = 0 /*Get the row of the previous square*/
   let streak = 1
   let previousX = 0 /* square X value to compare */


    for (let x = 0; x < playedSquareList.length; x++){
        /* Get the row of the current square. */
        let currentRow = playedSquareList[x].y

        /* If new square is on a different row, streak is broken.
        Set to new row, set previousX to x of current square
        Reset streak */
        if (currentRow != row){ 
            row = playedSquareList[x].y
            rowList = []
            rowList.push(playedSquareList[x])
            previousX = playedSquareList[x].x 
            streak = 1           
        }else if(currentRow === row){ /* Increment streak if row is the same */
            /* Check if X is consecutive with previous X. 
            If so, increment the streak & set Previous X.
            */
            if(Math.abs(playedSquareList[x].x - previousX) === 1){
                streak += 1
                rowList.push(playedSquareList[x])
                previousX = playedSquareList[x].x
                /* Check if Consecutives of 4 or more are found */
                if(streak >= 4){
                    console.log("Streak Found, Match: " + rowList)
                    return true
                }
            }else{ /* Reset if squares are not consecutive */
                streak = 1
                rowList = []
                previousX = playedSquareList[x].x
            }
        }
    }
}            

            /* Find Vertical Matches */
function findVerticalMatches(xSortedList){
    /* Choose the list based on the turn */ 
    let playedSquareList = xSortedList
    /*Scan the list for matches.
    Increment count each time a consecutive square is found.
    Reset if the streak is broken.*/

   /*Break the list up into rows*/
   let columnList = []
   let column = 0 /*Get the row of the previous square*/
   let streak = 1
   let previousY = 0 /* square X value to compare */

    
    for (let y = 0; y < playedSquareList.length; y++){
        /* Get the column of the current square. */
        let currentColumn = playedSquareList[y].x

        /* If new square is on a different row, streak is broken.
        Set to new row, set previousX to x of current square
        Reset streak */
        if (currentColumn != column){ 
            column = playedSquareList[y].x
            columnList = []
            columnList.push(playedSquareList[y])
            previousY = playedSquareList[y].y
            streak = 1           
        }else if(currentColumn === column){ /* Increment streak if row is the same */
            /* Check if X is consecutive with previous X. 
            If so, increment the streak & set Previous X.
            */
            if(Math.abs(playedSquareList[y].y - previousY) === 1){
                streak += 1
                columnList.push(playedSquareList[y])
                previousY = playedSquareList[y].y
                /* Check if Consecutives of 4 or more are found */
                if(streak >= 4){
                    console.log("Streak Found, Match: " + columnList)
                    return true
                }
            }else{ /* Reset if squares are not consecutive */
                streak = 1
                columnList = []
                previousY = playedSquareList[y].y
            }
        }
    }
}  

            /* Find Diagonal Matches */
function findDiagonalMatches(indexSortedList){
    /* For each square in the list, check to see if there are squares where:
    Y value is 1 lower && X value is either 1 higher or 1 lower.
    If there is a match, check if X was higher or lower.
    Continue checking in that direction(higher or lower) until count === 4
    Reset count when streak is broken or row(Y) changes  
    */

    for (let x = 0; x > indexSortedList.length; x++){
        /* Check for diagonal to the right, then left if none are found .
        If checkDiagonal returns false, streak resets.
        When streak reaches 4, function ends and winner is found
        */
        let matchLength = 4
        let streak = 1
        let diagonalList = []

        /* Check for diagonals to the left */
        
        for (let l = 0; l < matchLength; l++){
            let diagonal = checkDiagonal(indexSortedList[l],"left",l,streak)
            if(diagonal){ /* End if winner is found .
                Continue if streak isn't broken.
                */
                if(streak >= matchLength){
                    console.log("Match! " + diagonalList)
                    return
                } 
                else{
                    diagonalList.push(diagonal)
                    streak ++
                }
            }else{ /* If no diagonals are found to the left, try the right */
                console.log("No Diagonal")
                streak = 1
                diagonal = []

                /* Check for diagonals to the right */

                for (let r = 0; r < matchLength; r++){
                    let diagonal = checkDiagonal(indexSortedList[r],"right",r,streak)
                    if(diagonal){
                        diagonalList.push(diagonal)
                        streak ++
                    }else{

                    }
                }        
            }

        }

    /* Check for single diagonal match in specified direction 
   Return the square that is diagonal, or false if there is none
   */
  function checkDiagonal(square,direction,currentPosition,matchCount){
      /* Multiplying the x & y by the current number of matches 
      will increment the x & y positions by 1 each time a match is made
      */
        let xShift /* -1 for left, 1 for right */
        if (direction === "left"){
            xShift = -1 * matchCount
        }else{
            xShift = matchCount
        }
        
        let diagonalSquare = checkSquare(square,currentPosition,xShift,matchCount)
        
        /* Query the list for a square that matches specified x & y 
        */
        function checkSquare(square,currentPosition,xShift,matchCount){
            try{
                let foundSquare
                for (let x = currentPosition; indexSortedList.length; x++){
                    if (indexSortedList[x].y === (square.y + matchCount) && indexSortedList[x].x === (square.x + xShift)){
                        foundSquare = indexSortedList[x]
                        return foundSquare
                    }
                    console.log('Diagonal found: ' + foundSquare)
                    return foundSquare
                }
            }catch{
                console.log("checkDiagonal(): checkSquare(): out of bounds: " + square)
                return false
            }
        }
        return diagonalSquare
    }
}

                /* CheckConsecutives */

/*Check for consecutive patterns
 Returns all groups of consecutive patterns of 4 or more
 Returns which dimension (X and/or Y) was consecutive. 
 If only one is consecutive, the next step will be to check for 
 identical patterns that match the consecutive squares.
Returns object:
 consecutiveGroups = {
                "x":consecutivesListX,
                "y":consecutivesListY
            }
where x or y will contain a list of squares with consecutive X or Y values
*/

    function checkConsecutives(orderedList){
        let consecutivesListX = []
        let consecutivesListY = []
    // Will hold the list of consecutive values
        let consecutives = []

    /*Check for Consecutive X values
    If 4 consecutive values are found, return the consecutives list
    */
        for(let x = 1; x < orderedList.length; x++){
            if(consecutives.length >= 4 ){
                // console.log("Consecutives: " + consecutives.length)
                // return consecutives
            }
            /* Checks for consecutive X values by finding whether the 
            difference between current & next value is equal to 1.
            Then adds consecutive items to the consecutive list
            */
            if (Math.abs(orderedList[x].x - orderedList[x-1].x) === 1){
                if(consecutives.length < 1){//Adds first item to list when list is empty 
                    if(x === 1){
                        consecutives.push(orderedList[0])
                        consecutives.push(orderedList[1])
                    }else{
                        consecutives.push(orderedList[x])
                    }
                }else{// Adds current item when list is not empty
                    consecutives.push(orderedList[x])
                }

            /*Reset list if consecutive streak is broken
            Add consecutive items to consecutivesListX if there are 4 or more
            */
            }else if (consecutives.length >= 4){
                consecutivesListX.push(consecutives)
                consecutives = [];
            }
        }
        // Add consecutives to consecutiveListX if they haven't been already
        if (consecutives.length >= 4){
            consecutivesListX.push(consecutives)
            consecutives = []
        }
        
            /*Check for Consecutive Y values*/

    /*Checks for horizontal matches by identifying consecutive Y values
    Stops the loop if 4 consecutive values are found and returns the consecutives list.
    */
   
    for(let y = 1; y < orderedList.length; y++){
    if(consecutives.length >= 4 ){
        // console.log("Consecutives: " + consecutives.length)
    }
    /* Checks for consecutive Y values by finding whether the 
    difference between current & next value is equal to 1.
    Then adds consecutive items to the consecutive list
    */
    if (Math.abs(orderedList[y].y - orderedList[y-1].y) === 1){
        if(consecutives.length < 1){//Adds first item to list when list is empty 
            if(y === 1){
                consecutives.push(orderedList[0])
                consecutives.push(orderedList[1])
            }else{
                consecutives.push(orderedList[y])
            }
        }else{// Adds current item when list is not empty
            consecutives.push(orderedList[y])
        }

    /*Reset list if consecutive streak is broken
    Add consecutive items to consecutivesListY if there are 4 or more
    */
    }else if (consecutives.length >= 4){
        consecutivesListY.push(consecutives)
        consecutives = [];
    }
}
// Add consecutives to consecutiveListY if they haven't been already
if (consecutives.length >= 4){
    consecutivesListY.push(consecutives)
    consecutives = []
}
    /*Check if consecutives list has any values before continuing
        
    */
        if(consecutivesListX.length >= 1 || consecutivesListY.length >= 1){
            // console.log("Consecutives X: " + consecutivesListX)
            // console.log("Consecutives Y: " + consecutivesListY)

            let consecutiveGroups = {
                "x":consecutivesListX,
                "y":consecutivesListY
            }
            return consecutiveGroups
        }
        console.log("No consecutives")
    }

                /* CheckIdentical*/

/*Check for number of Identical Values in a List.
Function only runs if there were no diagonal matches
Use to determine if squares are in same row/column.
The list passed to checkIdentical contain values that were consecutive on either the X or Y axis.
*/
function checkIdentical(consecutivesList){
/*One axis has been sorted for consecutive matches.
CheckIdentical() checks to see if there identical values in the same positions there are consecutive values. 
An empty sortedConsecutives list means there were no consecutive values for one of X or Y.
*/
    let findIdenticalY = consecutivesList.x
    let findIdenticalX = consecutivesList.y

/* Check for identical matches in X, then Y.
For sortedConsecutivesX, checks the Y value of each item.
For sortedConsecutivesY, checks the X value of each item.
If a winning set is found, the function ends and a winner is chosen
*/
    let matchList = []


    /* Check for Y matches first */
    if(findIdenticalY.length > 0){
        for (let y = 0; y < findIdenticalY.length; y++){
            /* Iterate through the lists.
            If there are 4 or more identical values, group them together in matchesList
            */
                    for (let i = 0; i < findIdenticalY[y].length;){
            /*Compare the current Y value with the upcoming one. 
            If the right number of matches are made, the game has been won
            If a non-match is found, the matchList is emptied and will start over with the new value.
            */
            /*When the list is empty, add the first two to avoid comparing to a number larger than the size of the array
            */
                        if (matchList.length === 0){
                            // Check if they match before adding them to the array
                            try{
                                if(findIdenticalY[y][i].floor === findIdenticalY[y][i+1].floor ){
                                    matchList.push(findIdenticalY[y][i])
                                    matchList.push(findIdenticalY[y][i+1])
                                }
                                i++
                            }
                            catch(e){
                                console.log("findIdenticalY: "+ findIdenticalY[y][i])
                                i++
                            }
                        }
                        /* Check if the current value matches the following value */
                        else if (findIdenticalY[y][i].floor === findIdenticalY[y][i-1].floor){
                            matchList.push(findIdenticalY[y][i])
                            /* Check for winner */
                            if (matchList.length >= 4){
                                console.log("Winner")
                                console.log(matchList)
                            }
                        }
                        /* Empty the matchList if a non-match is found */
                        else{
                            matchList = []
                        }
                        i++
                    }
                }
    }


    /* Check for X matches if none are found for Y */

    if (findIdenticalX.length > 0){
        for (let x = 0; x < findIdenticalX.length; x++){
            /* Iterate through the lists.
            If there are 4 or more identical values, group them together in matchesList
            */
                    for (let i = 0; i < findIdenticalX[x].length; i++){
            /*Compare the current Y value with the upcoming one. 
            If the right number of matches are made, the game has been won
            If a non-match is found, the matchList is emptied and will start over with the new value.
            */
           /*When the list is empty, add the first two to avoid comparing to a number larger than the size of the array
           */
                        if (matchList.length === 0){
                            // Check if they match before adding them to the array
                            if(findIdenticalX[x][i].x === findIdenticalX[x][i+1].x ){
                                matchList.push(findIdenticalX[x][i])
                                matchList.push(findIdenticalX[x][i+1])
                            }
                            i++
                        }
                        else if(matchList.length > 0){
                            if(findIdenticalX[x][i-1].x === findIdenticalX[x][i].x){
                                matchList.push(findIdenticalX[x][i])
                                /* Check for winner */
                                if (matchList.length >= 4){
                                    console.log("Winner")
                                    console.log(matchList)
                                    return
                                }
                            }
                        }
                        /* Empty the matchList if a non-match is found */
                        else{
                            matchList = []
                        }
                    }
                }
    }

}

//Check for a winner
function checkWin(){
    if(turnsTaken >= 7){

        let listSelected = []
        //Determine which player's list to check
        if(turn === "red"){
            listSelected = idListRed
        }else if(turn === "black"){
            listSelected = idListBlack
        }

        // let check = false
        // try{
        //     check = checkConsecutives(squaresSortX(listSelected))
        // }catch(e){
        //     // console.log('No Consecutive Matches Yet')
        // }
        // if (check){    
        //     if(checkIdentical(check)){
        //         // console.log("Connect 4!")
        //         return true
        //     }else{
        //         // console.log('No winner Yet')
        //         return false
        //     }
        // }else{
        //     // console.log('No winner Yet')
        //     return false
        // }

        findDiagonalMatches(indexSort(listSelected))

        if(findHorizontalMatches(indexSort(listSelected))){
            console.log("Horizontal Match Found!")
            return
        }else if(findVerticalMatches(squaresSortX(listSelected))){
            console.log("Vertical Match Found!")
            return
        }
        
    }else{
        // console.log('No winner Yet')
        return
    }
    
}

function buildBoard(){
//Clear Previous settings
    setCanvas()
    clearGameBoard()
    squareIdList = []
    if (defaultSize){
    }else{
        let gridSize = parseInt(document.getElementById("setSquareCount").value)
        columns = gridSize
    rows = gridSize
    }
    

    setBoardFloor()
    setBoardWidth();
    setSquareSize();
    setColumnHeights()
    makeBoard();
    drawGrid();
    defaultSize = false
}

function clearGameBoard(){
    ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,canvas.width,canvas.height)
}

function setDefaultSize(){
    columns = 8
    rows = 8
}
function setBoardFloor(){
    boardFloor = rows-1
}