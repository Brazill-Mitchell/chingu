
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
let idList = []
let turn = "red"


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
    
    document.getElementById("relative-x-pos").innerHTML = relativePos();
    document.getElementById("relative-y-pos").innerHTML = relativePos();
}
function showCanvasCoords(){
    setCanvas();
    document.getElementById("canvas-top").innerHTML = canvasBox.top;
    document.getElementById("canvas-bottom").innerHTML = canvasBox.bottom;
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
                "played":false
            }
            idList.push(squareInfo)
        }
        index++
    }
    console.log(idList)
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

//Retreive an Object that represents the Selected Square
function getSquare(){
    let square = []
    for (let x = 0; x < idList.length; x++){
        if (relativePosX > idList[x].startX && relativePosX < idList[x].endX && relativePosY > idList[x].startY && relativePosY < idList[x].endY){
            console.log("Square ID: " + idList[x].id)
                square = idList[x]
                return square
            
        }else{
            // console.log("No matches")
        }
        // console.log("Square Info:" + idList[x].id)
        // console.log("Y: " + idList[x].startY)
        // console.log("X: " + idList[x].startX)
    }
}

function handleClick(){
    let x = event.clientX
    let y = event.clientY
    if (x >= canvasBox.left && x <= canvasBox.right && y >= canvasBox.top && y <= canvasBox.bottom){
    }
    pixelX = event.clientX
    pixelY = event.clientY
    setClickPos()
    // // setBoardWidth()
    // // setSquareSize()
    // // makeBoard()
    // checkSquare()
    // console.log("Square Range: " + getSquareRange(squareIdList[3]))
    // console.log("Board width: " + boardWidth)
    // makeBoard()
    getSquare()
    setSpace()
}

//Draw grid lines from top row and from right to left
function drawGrid(){
    let ctx = canvas.getContext("2d")
    let length = boardWidth

    for (let x = 0; x < idList.length; x++){
        if(idList[x].id[0] === 0){//Draw Horizontal Lines
            ctx.beginPath()
            ctx.moveTo(0,idList[x].endY)//Start at [0,endY]
            ctx.lineTo(boardWidth,idList[x].endY)//End at [right,endY]
            ctx.stroke()
        }if(idList[x].id[1] === 0){//Draw Vertical Lines
            ctx.beginPath()
            ctx.moveTo(idList[x].endX,0)
            ctx.lineTo(idList[x].endX,boardWidth)
            ctx.stroke()
        }
    }
}

//Fill the chosen square and change turns
function setSpace(){
    if(!getSquare().played){
        try{
            if (turn === "red"){
                fillSquareRed()
                idList[getSquare().index].played = true
                setTurn()
            }else if(turn === "black"){
                fillSquareBlack()
                idList[getSquare().index].played = true
                setTurn()
            }
        }catch(error){
            console.log(error)
    
        }
    }else if(getSquare().played){
        return
    }

}

function fillSquareRed(){
    let ctx = canvas.getContext("2d")
    ctx.beginPath();
    ctx.rect(getSquare().startX, getSquare().startY, squareSize, squareSize);
    ctx.fillStyle = "red";
    ctx.fill();
    idList[getSquare().index].played = true
}

function fillSquareBlack(){
    let ctx = canvas.getContext("2d")
    ctx.beginPath();
    ctx.rect(getSquare().startX, getSquare().startY, squareSize, squareSize);
    ctx.fillStyle = "black";
    ctx.fill();
    idList[getSquare().index].played = true

}

function setTurn(){
    if (turn === "red"){
        turn = "black"
    }else if(turn === "black"){
        turn = "red"
    }
}