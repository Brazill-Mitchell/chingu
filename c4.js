
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
let rowHeights = {}
let defaultSize = true

function setRowHeights(){
    for (let x = 0; x < columns; x++){
        rowHeights[x] = boardFloor
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

//Populate the Board with squares and assign an ID to each square
// let makeBoard = function (){
//     for (let y = 0; y < rows; y++){
//         for (let x = 0; x < columns; x++){

//             let range = getSquareRange([x,y])
//             let coord = [x,y,range]
//             squareIdList.push(coord)//ID format [x,y]
//         }

//     }
//     console.log(squareIdList)
// }

let makeBoard = function (){
    let index = 0
    for (let y = 0; y < rows; y++){
        for (let x = 0; x < columns; x++){
            let range = getSquareRange([x,y])
            let squareInfo = {
                "id":[x,y],
                "x":x,
                "y":y,
                "startX":range.startX,
                "startY":range.startY,
                "endX":range.endX,
                "endY":range.endY,
                "index":index,
                "played":false,
                "floor":boardFloor//Represents the actual placement of the square played
            }
            squareIdList.push(squareInfo)
        }
        index++
    }
    console.log(squareIdList)
}

function getImageData(){
    ctx = canvas.getContext("2d");
    let imgData = ctx.getImageData(relativePos()[0],relativePos()[1],2,2);
    console.log(imgData)
}

function checkRange(a,b){
    if (Math.abs(a-b) < 3){
        return true;
    }else{
        return false;
    }
}

// Board properties
//Get the width of the board to set the size of the squares
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
        if(squareIdList[x].id[0] === 0){//Draw Horizontal Lines
            ctx.beginPath()
            ctx.moveTo(0,squareIdList[x].endY)//Start at [0,endY]
            ctx.lineTo(boardWidth,squareIdList[x].endY)//End at [right,endY]
            ctx.stroke()
        }if(squareIdList[x].id[1] === 0){//Draw Vertical Lines
            ctx.beginPath()
            ctx.moveTo(squareIdList[x].endX,0)
            ctx.lineTo(squareIdList[x].endX,boardWidth)
            ctx.stroke()
        }
    }
}

//Outline the range of pixels that make up each square 
// function getSquareRange(id){
//     let x = id[0]
//     let y = id[1]
// //Starting point for each space
//     let displaceX = x*squareSize
//     let displaceY = y*squareSize
// //End point for each space
//     let edgeX = displaceX + squareSize
//     let edgeY = displaceY + squareSize

//     let rangeX = [displaceX,edgeX]
//     let rangeY = [displaceY,edgeY]
//     console.log([rangeX,rangeY])
//     return [rangeX,rangeY]
// }

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

//Set a value for the actual square that was clicked
function clickSquare(){
    let square = []
    for (let x = 0; x < squareIdList.length; x++){
        if (relativePosX > squareIdList[x].startX && relativePosX < squareIdList[x].endX && relativePosY > squareIdList[x].startY && relativePosY < squareIdList[x].endY){
            // console.log("Square ID: " + squareIdList[x].id)
                square = squareIdList[x]
                square.floor = rowHeights[square.x]
                squareSelection = square
                console.log("Row: " + squareSelection.x)
                console.log("Square Floor: " + squareSelection.floor)

            
        }else{
        }
    }
}

function handleClick(){
    let x = event.clientX
    let y = event.clientY

    pixelX = event.clientX
    pixelY = event.clientY
    setClickPos()
//Execute canvas operations only when mouse if one canvas
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

function setSpace(){
    let lowestSquareY = getLowestSquareY()

    if(turn === "red"){
        fillSquareRed(squareSelection.startX,lowestSquareY)
        squareIdList[squareSelection.index].played = true
        squareIdList[squareSelection.index].floor = rowHeights[squareIdList[squareSelection.x]]
        freeSpaceAdvance(squareSelection.x)
        idListUpdate()
        turnsTaken += 1
        checkWin()
        setTurn()
    }else if(turn === "black"){
        fillSquareBlack(squareSelection.startX,lowestSquareY)
        squareIdList[squareSelection.index].played = true
        squareIdList[squareSelection.index].floor = rowHeights[squareIdList[squareSelection.x]]
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
    let row = rowHeights[x]
    return row
}

function getLowestSquareY(){
    let row = squareSelection.x//Get Selected row
    let bottom = freeSpaceGet(row)//Find the lowest free space in the row
    let lowestSquareY = bottom * squareSize

    return lowestSquareY
}

//Increase the height of the lowest free space
function freeSpaceAdvance(x){
    rowHeights[x] -= 1
}
//Add Selected Square to player's list of squares
function idListUpdate(){
    if (turn === "red"){
        idListRed.push(squareSelection)
    }else if (turn ==="black"){
        idListBlack.push(squareSelection)
    }
}
//Sort the players spaces in numerical order
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

//Check for consecutive values
//Returns all groups of consecutive values of 4 or more
function checkConsecutives(orderedList){
    let consecutivesListX = []
    let consecutivesListY = []
    let consecutives = []
//Check for Consecutive X values
    for(let x = 1; x < orderedList.length; x++){
        if(consecutives.length >= 4 ){//If 4 consecutive values are found, return the consecutives.length list
            console.log("Consecutives: " + consecutives.length)
            // return consecutives
        }
        if ((orderedList[x].x - orderedList[x-1].x) === 1){//Add consecutive items to the list 
            if(x === 1){//Adds first item to list 
                consecutives.push(orderedList[0])
            }
            consecutives.push(orderedList[x])
            consecutives.length = consecutives.length
        }else{//Reset list if consecutive streak is broken
            consecutivesListX.push(consecutives)
            consecutives = [];
            consecutives.length = consecutives.length
        }
    }
    if(consecutivesListX.length >= 1 ){//Check consecutivesListX.length before continuing
        console.log("Consecutives groups: " + consecutivesListX)
    }
    consecutives = []
//Check for Consecutive Y values
    for(let x = 1; x < orderedList.length; x++){
        if(consecutives.length >= 4 ){//If 4 consecutive values are found, return the consecutives.length list
            console.log("Consecutives: " + consecutives.length)
            // return consecutives
        }
        if ((orderedList[x].floor - orderedList[x-1].floor) === 1){//Add consecutive items to the list 
            if(x === 1){//Adds first item to list 
                consecutives.push(orderedList[0])
            }
            consecutives.push(orderedList[x])
            consecutives.length = consecutives.length
        }else{//Reset list if consecutive streak is broken
            consecutivesListY.push(consecutives)
            consecutives = [];
            consecutives.length = consecutives.length
        }
    }
    if(consecutivesListY.length >= 1 ){//Check consecutiveListY.length before continuing
        console.log("Consecutives groups: " + consecutives)
        let consecutiveGroups = {
            "x":consecutivesListX,
            "y":consecutivesListY
        }
        return consecutiveGroups
    }
    console.log("No consecutives")
    return false
}

//Check for number of Identical Values in a List
//Use to determine if squares are in same row/column
function checkIdentical(list){
    let unique = []
    let matchList = []
//Check for squares in same row
    //Make a list of unique items
    for (let x = 0; x < list.length; x++){
        if (unique.includes(list[x]).x){
            continue
        }else if (!unique.includes(list[x].x)){//Adds new items to Unique Array
            unique.push(list[x])
        }
    }
    //Count number of occurences for each square
    for(let x = 0; x < unique.length; x++){
        matchList = []//Reset Match List if there were less than 4 Matches
        let matches = 0
        for (let i = 0; i < list.length; i++){
            if (unique[x].x === list[i].x){//If coordinate occurs more than once, is added to Match List
                matchList.push(list[i])
                matches++
            }
            if (matches >= 4){
                console.log("Matches: " + matches)
                console.log("Unique values: " + unique)
                console.log("All Values: " + list)
                console.log("Match List: " + matchList[3].floor)
                return true
            }
        }
    }
    //Check for squares in same row
    //Make a list of unique items
    for (let x = 0; x < list.length; x++){
        if (unique.includes(list[x]).floor){
            continue
        }else if (!unique.includes(list[x].floor)){//Adds new items to Unique Array
            unique.push(list[x])
        }
    }
    //Count number of occurences for each square
    for(let x = 0; x < unique.length; x++){
        matchList = []//Reset Match List if there were less than 4 Matches
        let matches = 0
        for (let i = 0; i < list.length; i++){
            if (unique[x].floor === list[i].floor){//If coordinate occurs more than once, is added to Match List
                matchList.push(list[i])
                matches++
            }
            if (matches >= 4){
                console.log("Matches: " + matches)
                console.log("Unique values: " + unique)
                console.log("All Values: " + list)
                console.log("Match List: " + matchList)
                return true
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

        let check
        if (check = checkConsecutives(squaresSortX(listSelected))){    
            if(checkIdentical(check)){
                console.log("Connect 4!")
                return true
            }else{
                return false
            }
        }else{
            return false
        }
    }else{
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
    setRowHeights()
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