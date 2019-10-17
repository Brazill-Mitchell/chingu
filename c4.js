
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
let won = false

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

function handleClick(){

    if(won === false){
        let x = event.clientX
        let y = event.clientY

        pixelX = event.clientX
        pixelY = event.clientY
        setClickPos()

        /* Execute canvas operations only when mouse is on canvas */
        if (x >= canvasBox.left && x <= canvasBox.right && y >= canvasBox.top && y <= canvasBox.bottom){

        clickSquare()
        setSpace()
        displaySquarePlayed()
        }
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

/* If there is no winner, toggle who's turn it is */
function setTurn(){
    if(won === true){
        return
    }else{
        if (turn === "red"){
            turn = "black"
            let turnDisplay = document.getElementById("turn-display")
            let turnColor = "background-color: " + turn
            turnDisplay.style = turnColor
        }else if(turn === "black"){
            turn = "red"
            let turnDisplay = document.getElementById("turn-display")
            let turnColor = "background-color: " + turn
            turnDisplay.style = turnColor
        }
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
                    return rowList
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
                    return columnList
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
    Check in one direction(higher or lower) until count === 4
    Reset count when streak is broken or row(Y) changes  
    Then try the other direction
    */

    for (let x = 0; x < indexSortedList.length; x++){
        /* For each square, check for diagonal to the left, then right if none are found .
        If checkDiagonal returns false, streak resets.
        If streak reaches 4, function ends and winner is found
        */
        let matchLength = 4
        let streak = 1
        let diagonalList = []
        diagonalList.push(indexSortedList[x])

        let currentSquare = indexSortedList[x]
        /* Check for diagonals to the left */
        
        for (let l = 0; l < matchLength; l++){
            /* End if winner is found .
            Continue if streak isn't broken.
            */
            if(streak >= matchLength){
                console.log("Match! " + diagonalList)
                return diagonalList
            } 
            let diagonal = checkDiagonal(currentSquare,"left",streak)
            /* If diagonal to the left is found, add to the list,
            then check for a winner */
            if(diagonal){
                diagonalList.push(diagonal)
                streak ++
                if(streak >=matchLength){
                    console.log("Match! " + diagonalList)
                    return diagonalList
                }
                }
            else{ /* If no diagonals are found to the left, try the right */
                console.log("No Diagonal")
                streak = 1
                diagonal = []

                /* Check for diagonals to the right */
                if(streak >= matchLength){
                    console.log("Match! " + diagonalList)
                    return diagonalList
                }
                for (let r = 0; r < matchLength; r++){
                    let diagonal = checkDiagonal(indexSortedList[r],"right",r,streak)
                    if(diagonal){
                        diagonalList.push(diagonal)
                        streak ++
                        if(streak >= matchLength){
                            console.log("Match! " + diagonalList)
                            return diagonalList
                        }
                        
                    }
                }        
            }
        }

    /* Check for single diagonal match in specified direction 
    Return the square that is diagonal, or false if there is none
    */
    function checkDiagonal(square,direction,matchCount){
        /* Multiplying the x & y by the current number of matches 
        will increment the x & y positions by 1 each time a match is made
        */
            let xShift /* -1 for left, 1 for right */
            if (direction === "left"){
                xShift = -1 * matchCount
            }else{
                xShift = matchCount
            }
            
            let diagonalSquare = checkSquare(square,xShift,matchCount)
            
            /* Query the list for a square that matches specified x & y 
            */
            function checkSquare(square,xShift,matchCount){
                try{
                    let foundSquare
                    for (let x = 1; indexSortedList.length; x++){
                        if (indexSortedList[x].y === (square.y + matchCount) && indexSortedList[x].x === (square.x + xShift)){
                            foundSquare = indexSortedList[x]
                            console.log('Diagonal found: ' + foundSquare)
                            return foundSquare
                        }
                    }
                }catch{
                    console.log("checkDiagonal(): checkSquare(): out of bounds: " + square)
                    return false
                }
            }
            return diagonalSquare
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

        let winningSet

        if(findHorizontalMatches(indexSort(listSelected))){
            winningSet = findHorizontalMatches(indexSort(listSelected))
            console.log("Horizontal Match Found!")
        }else if(findVerticalMatches(squaresSortX(listSelected))){
            winningSet = findVerticalMatches(squaresSortX(listSelected))
            console.log("Vertical Match Found!")
        }else if(findDiagonalMatches(indexSort(listSelected))){
            winningSet = findDiagonalMatches(indexSort(listSelected))
            console.log("Diagonal Match Found!")
        }

        if(winningSet){
            won = true
            showWinningSquares(winningSet)
        }
        
        
    }else{
        return
    }
    
}

/* Display the winning Squares */
function showWinningSquares(winningSet){
    for (let x = 0; x < winningSet.length; x++){
        let ctx = canvas.getContext("2d")
        ctx.beginPath();
        ctx.rect(winningSet[x].startX, winningSet[x].startY, squareSize, squareSize);
        ctx.fillStyle = "rgb(255,224,100)";
        ctx.fill();
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