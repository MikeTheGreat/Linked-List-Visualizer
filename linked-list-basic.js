var animSpeed = 4
const easing = 0.05 * animSpeed
const boxSize = 35;
const varHeadSpacing = 140;
const textCellPadding = 10;

const headXinit = 30;
const headYinit = 50;

var nodeDistX = boxSize * 3
var nodeDistY = boxSize * 3

var posXinit = headXinit;
var posYinit = headYinit;

var pageCutX = 600;

var controlsHeight = document.getElementById("controlMain").offsetHeight

//COLORS
const YELLOW = [255, 242, 0]
const BASE_BLUE = [41, 89, 126]
const LIGHT_YELLOW = [171, 176, 62]
const WHITE = [255, 255, 255]
const LIGHT_ORANGE = [176, 128, 62]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCellWidth(value) {
    return Math.max(boxSize, textWidth(String(value)) + (textCellPadding * 2));
}

function drawArrowHeadAtEnd(startX, startY, endX, endY, size = 8) {
    const angle = atan2(endY - startY, endX - startX);
    push();
    translate(endX, endY);
    rotate(angle);
    triangle(0, 0, -size, -size * 0.5, -size, size * 0.5);
    pop();
}

class indexNode {
    constructor() {
        this.value = "H"
        this.x = 500
        this.y = posYinit
        this.color = BASE_BLUE
    }
    draw() {
        strokeWeight(1)
        stroke(28, 42, 53)
        fill(this.color[0], this.color[1], this.color[2])
        rect(this.x + boxSize / 2, this.y + boxSize / 2, boxSize, boxSize)

        noStroke()

        //triangle
        push() //start new drawing state
        var offset = 15
        var angle = 90
        translate(this.x + boxSize / 2, this.y - boxSize / 2 + 7);
        rotate(0); //rotates the arrow point
        triangle(-offset * 0.8, offset, offset * 0.8, offset, 0, -offset / 10); //draws the arrow point as a triangle
        pop();

        //text
        fill(WHITE)
        text(this.value, this.x + boxSize / 2, this.y + boxSize / 2)
    }

    async movePos(newX, newY) {
        // console.log("OLD X: " + this.x + ",Y: " + this.y)
        // console.log("X: " + newX + ",Y: " + newY)
        for (let i = 0; i <= (150 / animSpeed); i++) {
            this.x = this.x + (newX - this.x) * easing
            this.y = this.y + (newY - this.y) * easing
            await sleep(2)
        }

        this.x = newX
        this.y = newY
    }
}

class searchNode {
    constructor() {
        this.x = -100
        this.y = posYinit
    }
    draw() {
        if (search_icon_base) {
            image(search_icon_base, this.x, this.y, 40, 40);
            return;
        }

        // Fallback icon for local file:// runs where image fetches can fail.
        noFill();
        stroke(255);
        strokeWeight(2);
        ellipse(this.x + 16, this.y + 16, 16, 16);
        line(this.x + 22, this.y + 22, this.x + 30, this.y + 30);
    }

    async movePos(newX, newY) {
        // console.log("OLD X: " + this.x + ",Y: " + this.y)
        // console.log("X: " + newX + ",Y: " + newY)
        for (let i = 0; i <= (150 / animSpeed); i++) {
            this.x = this.x + (newX - this.x) * easing
            this.y = this.y + (newY - this.y) * easing
            await sleep(2)
        }

        this.x = newX
        this.y = newY
    }
}

class LinkedList {
    constructor(label, index) {
        this.label = label;
        this.head = null;
        this.size = 0;
        this.nodes = [];
        this.x = headXinit
        this.y = headYinit + (index * varHeadSpacing)
        this.color = LIGHT_ORANGE
        this.offsetY = boxSize / 2;
    }

    getNodeStartY() {
        return this.y;
    }

    getNodeStartX() {
        return this.x + boxSize + nodeDistX + 15;
    }

    draw() {
        const ink = bwMode ? 0 : 255
        const [cr, cg, cb] = bwMode ? [255, 255, 255] : this.color

        // Label above pointer cell
        noStroke()
        fill(ink)
        text(this.label, this.x + boxSize / 2, this.y - 10)

        // Pointer cell only (label cell hidden)
        strokeWeight(1)
        stroke(28, 42, 53)
        fill(cr, cg, cb)
        rect(this.x + boxSize / 2, this.y + boxSize / 2, boxSize, boxSize)

        //LINE
        if (this.head != null) {
            stroke(ink)
            fill(ink)
            const startX = this.x + boxSize
            const startY = this.y + this.offsetY
            const endX = this.head.x
            const endY = this.head.y + this.offsetY
            line(startX, startY, endX, endY)
            drawArrowHeadAtEnd(startX, startY, endX, endY)
        }
    }

    drawNodes() {
        for (const node of this.nodes) {
            node.draw()
        }
    }

    async insertAtTail(element) {
        // creates a new node

        var posX = this.getNodeStartX()
        var posY = this.getNodeStartY()

        var node = new Node(element, -50, posY);
        this.nodes.push(node)
        await node.movePos(posX, posY + boxSize + 10)

        // to store current node
        var current;

        // if list is Empty add the
        // element and make it head
        if (this.head == null) {
            await node.movePos(posX, posY)
            this.head = node;
        }
        else {
            current = this.head;

            // iterate to the end of the
            // list
            posX += nodeDistX
            await node.movePos(posX, posY + boxSize + 10)

            while (current.next) {
                posX += nodeDistX
                if (posX + nodeDistX < windowWidth - pageCutX) {
                    await node.movePos(posX, posY + boxSize + 10)
                }
                else {
                    posX = this.getNodeStartX()
                    posY += nodeDistY
                    await node.movePos(posX, posY + boxSize + 10)
                }


                current = current.next;
            }

            await node.movePos(posX, posY)
            // add node
            current.next = node;
        }
        this.size++;
    }
    async insertAtHead(element) {

        const posY = this.getNodeStartY()
        const posX = this.getNodeStartX()
        var node = new Node(element, -50, posY);
        this.nodes.unshift(node)
        await node.movePos(posX, posY + boxSize + 10)
        await sleep(70)
        node.next = this.head
        this.head = node
        await this.adjustAtNodeForward(this.head)
    }

    async deleteAtTail() {
        if (!this.head) {
            return;
        }

        if (!this.head.next) {
            await this.head.movePos(this.head.x, this.head.y + boxSize + 10)
            await this.head.movePos(-100, this.head.y)
            this.head = null;
            this.nodes.pop()
            return
        }
        let previous = this.head;
        let node = this.head.next;


        while (node.next) {
            await sNode.movePos(node.x, node.y + boxSize + 10)
            previous = node;
            node = node.next;

        }
        await sNode.movePos(node.x, node.y + boxSize + 10)
        previous.next = null;
        await sNode.movePos(-100, sNode.y)
        await node.movePos(node.x, node.y + boxSize + 10)
        await node.movePos(-100, node.y)
        this.nodes.pop()

        //RETURN INITIAL POSITION OF sNode
        sNode.x = -100
        sNode.y = this.getNodeStartY()
    }

    async deleteAtHead() {
        var del = this.head
        if (!del) {
            return;
        }
        //del.movePos(-50, posYinit)


        this.head = this.head.next;
        del.next = null
        await del.movePos((boxSize * -2) - 10, del.y)
        // for(let [index, node] of nodes.entries()){
        //   if(del == node) nodes.splice(index, 1)
        // }
        this.nodes.shift()

        if (this.head != null) this.adjustAtNodeForward(this.head)
    }

    async getAt(index, animNode) {
        let counter = 0;
        let node = this.head;
        while (node) {
            await animNode.movePos(node.x, node.y + boxSize + 10)
            console.log("time")
            if (counter == index) {
                if (node.x + nodeDistX < windowWidth - pageCutX) {
                    await animNode.movePos(node.x + nodeDistX, node.y + boxSize + 10)
                }
                else {
                    await animNode.movePos(node.x + nodeDistX, node.y + nodeDistY + boxSize + 10)
                }


                return node;
            }
            counter++;
            node = node.next;
        }
        return null;
    }

    async insertAtIndex(data, index) {
        // if the list is empty i.e. head = null
        var posX = this.getNodeStartX()
        var posY = this.getNodeStartY()

        //await node.movePos(posX, posY + boxSize + 10)

        if (!this.head) {
            this.insertAtHead(data)
            return;
        }
        // if new node needs to be inserted at the front of the list i.e. before the head. 
        if (index == 0) {
            this.insertAtHead(data)
            return;
        }
        // else, use getAt() to find the previous node.
        let newNode = new Node(data, -100, posY);
        this.nodes.splice(index, 0, newNode);

        const previous = await this.getAt(index - 1, newNode);

        if (!previous) {
            await newNode.movePos(-100, newNode.y)
            this.nodes.splice(index, 1);
            return
        }
        newNode.next = previous.next;
        previous.next = newNode;

        await this.adjustAtNodeForward(this.head)
    }

    async deleteAtIndex(index) {
        if (!this.head) {
            this.deleteAtHead()
            return;
        }
        if (index === 0) {
            this.deleteAtHead()
            return;
        }

        const previous = await this.getAt(index - 1, sNode);

        if (!previous || !previous.next) {
            await sNode.movePos(-100, sNode.y)
            sNode.x = -100
            sNode.y = this.getNodeStartY()
            return;
        }

        await sNode.movePos(-100, sNode.y)
        await previous.next.movePos(previous.next.x, previous.next.y + boxSize + 10)
        await previous.next.movePos(-100, previous.next.y)

        previous.next = previous.next.next;

        this.nodes.splice(index, 1)

        //RETURN INITIAL POSITION OF sNode
        sNode.x = -100
        sNode.y = this.getNodeStartY()

        await this.adjustAtNodeForward(this.head)
    }

    async adjustAtNodeForward(current) {
        var posX = this.getNodeStartX()
        var posY = this.getNodeStartY()

        while (current) {

            if (posX + nodeDistX < windowWidth - pageCutX) {
                current.movePos(posX, posY)
            }
            else {
                posX = this.getNodeStartX()
                posY += nodeDistY
                current.movePos(posX, posY)
            }
            posX += nodeDistX
            await sleep(20)

            current = current.next;
        }
    }
    async printList() {
        var current = this.head
        while (current) {
            console.log(current)
            current = current.next
        }
    }
}

class Node {
    constructor(value, x, y) {
        this.value = value;
        this.next = null;
        this.color = BASE_BLUE
        this.x = x
        this.y = y
        this.endx = x
        this.endy = y
        this.offsetY = boxSize / 2
    }
    async draw() {
        const dataCellWidth = getCellWidth(this.value)
        const ink = bwMode ? 0 : 255
        const [cr, cg, cb] = bwMode ? [255, 255, 255] : this.color
        const isEllipsis = this.value === "..."

        if (isEllipsis) {
            noStroke()
            fill(ink)
            textSize(24)
            text("...", this.x + (dataCellWidth + boxSize) / 2, this.y + boxSize / 2)
            textSize(12)
        } else {
            // Labels above cells
            noStroke()
            fill(ink)
            textSize(10)
            text("data", this.x + dataCellWidth / 2, this.y - 10)
            text("next", this.x + dataCellWidth + boxSize / 2, this.y - 10)
            textSize(12)

            strokeWeight(1)
            stroke(28, 42, 53)
            fill(cr, cg, cb)
            rect(this.x + dataCellWidth / 2, this.y + boxSize / 2, dataCellWidth, boxSize)
            rect(this.x + dataCellWidth + boxSize / 2, this.y + boxSize / 2, boxSize, boxSize)
            noStroke()
            fill(ink)
            text(this.value, this.x + dataCellWidth / 2, this.y + boxSize / 2)

            if (this.next == null) {
                noStroke()
                fill(ink)
                textSize(10)
                text("null", this.x + dataCellWidth + boxSize / 2, this.y + boxSize / 2)
                textSize(12)
            }
        }

        if (this.next != null) {
            // console.log(this.endx == this.next.x)
            //console.log(Math.round(this.endx) == Math.round(this.next.x))
            if (Math.round(this.endx) != Math.round(this.next.x)) {
                console.log("Here")
                this.endx = this.endx + (this.next.x - this.endx) * easing
                this.endy = this.endy + (this.next.y - this.endy) * easing
            }
            else {
                this.endx = this.next.x
                this.endy = this.next.y
            }

            stroke(ink)
            fill(ink)
            const startX = this.x + dataCellWidth + boxSize
            const startY = this.y + this.offsetY
            const endX = this.endx
            const endY = this.endy + this.offsetY
            line(startX, startY, endX, endY)
            drawArrowHeadAtEnd(startX, startY, endX, endY)

        }
    }
    async movePos(newX, newY) {
        if (this.next) {
            this.endx = this.next.x
            this.endy = this.next.y
        }
        else {
            this.endx = newX
            this.endy = newY
        }
        for (let i = 0; i <= (150 / animSpeed); i++) {
            this.x = this.x + (newX - this.x) * easing
            this.y = this.y + (newY - this.y) * easing
            await sleep(2)
        }

        this.x = newX
        this.y = newY

    }
}

function handleAdj() {
    nodeDistX = parseInt(document.getElementById("widthDistAdj").value)
    nodeDistY = parseInt(document.getElementById("heightDistAdj").value)
    pageCutX = parseInt(document.getElementById("cutoffAdj").value)

    for (const list of linkedLists) {
        list.adjustAtNodeForward(list.head)
    }
}

function getSelectedList() {
    if (!linkedLists.length) {
        return null;
    }

    const picker = document.getElementById("headNodePicker")
    const selectedLabel = picker.value
    const selectedList = linkedLists.find((list) => list.label === selectedLabel)
    return selectedList || linkedLists[0]
}

function refreshHeadNodePicker() {
    const picker = document.getElementById("headNodePicker")
    const previousValue = picker.value
    picker.innerHTML = ""

    for (const list of linkedLists) {
        const option = document.createElement("option")
        option.value = list.label
        option.textContent = list.label
        picker.appendChild(option)
    }

    if (!linkedLists.length) {
        return
    }

    const hasPrevious = linkedLists.some((list) => list.label === previousValue)
    picker.value = hasPrevious ? previousValue : linkedLists[0].label
}

function relayoutLinkedLists() {
    for (let i = 0; i < linkedLists.length; i++) {
        const list = linkedLists[i]
        list.y = headYinit + (i * varHeadSpacing)
        if (list.head) {
            list.adjustAtNodeForward(list.head)
        }
    }
}

function addVar(label) {
    const trimmedLabel = label.trim()
    if (!trimmedLabel) {
        return false
    }
    const existing = linkedLists.some((list) => list.label === trimmedLabel)
    if (existing) {
        return false
    }

    const list = new LinkedList(trimmedLabel, linkedLists.length)
    linkedLists.push(list)
    relayoutLinkedLists()
    refreshHeadNodePicker()
    document.getElementById("headNodePicker").value = trimmedLabel
    return true
}

//DOM VARIABLES
var buttonControls = document.getElementsByClassName("buttonControls");
//GENERAL FUNCTIONS

function disableButtonControls() {
    for (button of buttonControls) {
        button.disabled = true
    }
}

function enableButtonControls() {
    for (button of buttonControls) {
        button.disabled = false
    }
    statusText = ""
}

document.getElementById("animSlider").innerHTML = document.getElementById("myRange").value
animSpeed = document.getElementById("myRange").value

function handleSliderAnimChange() {
    output = document.getElementById("myRange").value
    //document.getElementById("animSlider").innerHTML = output * 50
    document.getElementById("animSlider").innerHTML = output
    animSpeed = output
    //var output = 
    //output.innerHTML = slider.value; // Display the default slider value
}

function handleAddVar() {
    const varNameInput = document.getElementById("varNameInput")
    const varName = varNameInput.value

    if (!varName || !varName.trim()) {
        statusText = "Var name cannot be empty"
        return
    }

    if (!addVar(varName)) {
        statusText = "Var already exists"
        return
    }

    varNameInput.value = ""
    statusText = "Added var: " + varName.trim()
}

async function handleDeleteVar() {
    disableButtonControls()
    const list = getSelectedList()

    if (!list) {
        enableButtonControls()
        return
    }

    const removedLabel = list.label
    linkedLists = linkedLists.filter((item) => item !== list)
    relayoutLinkedLists()
    refreshHeadNodePicker()
    statusText = "Deleted var: " + removedLabel
    enableButtonControls()
}



//CONTROLS FUNCTIONS
async function handleInsertAtTail() {

    disableButtonControls()
    const list = getSelectedList()
    let element = document.getElementById("functionElement").value
    if (!list || element == "" || element == null) {
        enableButtonControls()
        return
    }
    statusText = "Running: Insert at Tail(" + parseInt(element) + ") on " + list.label
    await list.insertAtTail(element)
    console.log("YES")
    enableButtonControls()
}

async function handleInsertAtHead() {

    disableButtonControls()
    const list = getSelectedList()
    let element = document.getElementById("functionElement").value
    if (!list || element == "" || element == null) {
        enableButtonControls()
        return
    }
    statusText = "Running: Insert at Head(" + parseInt(element) + ") on " + list.label
    await list.insertAtHead(element)
    console.log("YES")
    enableButtonControls()
}

async function handleDeleteAtHead() {

    disableButtonControls()
    const list = getSelectedList()
    let element = document.getElementById("functionElement").value
    // if(element == "" || element == null) {
    //   enableButtonControls()
    //   return
    // }
    if (!list) {
        enableButtonControls()
        return
    }

    statusText = "Running: Delete at Head on " + list.label
    await list.deleteAtHead()

    enableButtonControls()
}

async function handleDeleteAtTail() {

    disableButtonControls()
    const list = getSelectedList()
    let element = document.getElementById("functionElement").value
    // if(element == "" || element == null) {
    //   //enableButtonControls()
    //   return
    // }
    if (!list) {
        enableButtonControls()
        return
    }

    statusText = "Running: Delete at Tail on " + list.label
    await list.deleteAtTail()

    enableButtonControls()
}

async function handleInsertAtIndex() {

    disableButtonControls()
    const list = getSelectedList()
    let index = document.getElementById("functionIndex").value
    let element = document.getElementById("functionElement").value
    if (!list || index == "" || index == null || isNaN(index) || element == "" || element == null) {
        enableButtonControls()
        return
    }
    statusText = "Running: Insert " + parseInt(element) + " at Index " + parseInt(index) + " on " + list.label
    await list.insertAtIndex(element, parseInt(index))

    enableButtonControls()
}

async function handleDeleteAtIndex() {

    disableButtonControls()
    const list = getSelectedList()
    let index = document.getElementById("functionIndex").value
    if (!list || index == "" || index == null || isNaN(index)) {
        enableButtonControls()
        return
    }
    statusText = "Running: Delete At Index " + parseInt(index) + " on " + list.label
    await list.deleteAtIndex(parseInt(index))

    enableButtonControls()
}

var bwMode = false

function handleBwToggle() {
    bwMode = !bwMode
    document.getElementById("bwToggleBtn").textContent = bwMode ? "Color" : "B&W"
}

var linkedLists = []
var iNode = new indexNode()
var sNode

var statusText = ""

var search_icon_base

async function setup() {
    //createCanvas(400, 400);
    let cnv = createCanvas(windowWidth, windowHeight - controlsHeight);
    cnv.parent("sketchHolder");
    console.log(cnv)

    loadImage(
        'assets/search_1.png',
        (img) => {
            search_icon_base = img;
        },
        () => {
            search_icon_base = null;
        }
    );

    sNode = new searchNode()

    addVar("H")

    rectMode(CENTER)
    textAlign(CENTER, CENTER)

    // nodes.push(new Node(2, 10, 10));
    // await ll.insertAtHead(4)
    // await ll.insertAtHead(5)
    // await ll.insertAtHead(6)
    // await ll.insertAtHead(7)
    // await ll.insertAtTail(8)
    // await ll.insertAtTail(9)
    // await ll.insertAtTail(10)
    // await ll.insertAtTail(11)
    // await ll.insertAtTail(12)

    // nodes.push(new Node(3, 120, 10));

    // nodes[0].next = nodes[1]
    pixelDensity(1);
}

function draw() {
    background(bwMode ? "#ffffff" : "#1c2a35");
    textAlign(CENTER, CENTER)
    for (const list of linkedLists) {
        list.draw();
        list.drawNodes();
    }

    sNode.draw()

    //iNode.draw()

    const cutColor = bwMode ? [0, 0, 0] : BASE_BLUE
    stroke(cutColor)
    fill(cutColor)
    line(windowWidth - pageCutX, 0, windowWidth - pageCutX, windowHeight)
    text("CUT", windowWidth - pageCutX + 20, 20)

    fill(bwMode ? 0 : 255)
    textAlign(LEFT, TOP)
    text(statusText, 10, 10)
}

function mousePressed() {
    // console.log(mouseX, mouseY)
    if (mouseButton === RIGHT) {
        //ll.printList()
        // console.log(nodes)
    }
}

function windowResized() {
    controlsHeight = document.getElementById("controlMain").offsetHeight
    resizeCanvas(windowWidth, windowHeight - controlsHeight)
}



