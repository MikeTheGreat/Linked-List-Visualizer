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
    positionAltTextPanel()
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
    updateAltText()
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
    updateAltText()
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

function generateSVG() {
    const ink        = bwMode ? '#000000' : '#ffffff';
    const bg         = bwMode ? '#ffffff' : '#1c2a35';
    const cellFill   = bwMode ? '#ffffff' : '#29597e';
    const headFill   = bwMode ? '#ffffff' : '#b0803e';
    const border     = '#1c2a35';

    // Measure text width independently of p5's canvas state
    const _measureCtx = document.createElement('canvas').getContext('2d');
    function cellWidth(value) {
        _measureCtx.font = '12px "Open Sans", sans-serif';
        return Math.max(boxSize, _measureCtx.measureText(String(value)).width + textCellPadding * 2);
    }

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // rectMode(CENTER): cx/cy are center coords
    function svgRect(cx, cy, w, h, fill) {
        return `<rect x="${cx - w/2}" y="${cy - h/2}" width="${w}" height="${h}" fill="${fill}" stroke="${border}" stroke-width="1"/>`;
    }

    function svgText(content, cx, cy, size, fill) {
        return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="'Open Sans',sans-serif" font-size="${size}" fill="${fill}">${esc(content)}</text>`;
    }

    function svgArrow(x1, y1, x2, y2) {
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ink}" stroke-width="1" marker-end="url(#arr)"/>`;
    }

    if (linkedLists.length === 0) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect width="200" height="60" fill="${bg}"/>${svgText('No lists', 100, 30, 12, ink)}</svg>`;
    }

    // Compute bounding box across all lists and nodes
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const list of linkedLists) {
        bx0 = Math.min(bx0, list.x);
        by0 = Math.min(by0, list.y - 25);
        bx1 = Math.max(bx1, list.x + boxSize);
        by1 = Math.max(by1, list.y + boxSize);
        for (let cur = list.head; cur; cur = cur.next) {
            const dw = cellWidth(cur.value);
            bx0 = Math.min(bx0, cur.x);
            by0 = Math.min(by0, cur.y - 25);
            bx1 = Math.max(bx1, cur.x + dw + boxSize);
            by1 = Math.max(by1, cur.y + boxSize);
        }
    }

    const pad = 20;
    const W = bx1 - bx0 + pad * 2;
    const H = by1 - by0 + pad * 2;
    const vx = bx0 - pad;
    const vy = by0 - pad;

    const parts = [];
    parts.push(`<rect x="${vx}" y="${vy}" width="${W}" height="${H}" fill="${bg}"/>`);

    for (const list of linkedLists) {
        // Variable label above pointer cell
        parts.push(svgText(list.label, list.x + boxSize/2, list.y - 10, 12, ink));

        // Pointer cell
        parts.push(svgRect(list.x + boxSize/2, list.y + boxSize/2, boxSize, boxSize, headFill));

        // Arrow from pointer cell to head
        if (list.head !== null) {
            parts.push(svgArrow(
                list.x + boxSize, list.y + list.offsetY,
                list.head.x,     list.head.y + list.head.offsetY
            ));
        }

        // Nodes
        for (let cur = list.head; cur; cur = cur.next) {
            const dw = cellWidth(cur.value);
            const nx = cur.x, ny = cur.y;
            const isEllipsis = cur.value === '...';

            if (isEllipsis) {
                parts.push(svgText('...', nx + (dw + boxSize)/2, ny + boxSize/2, 24, ink));
            } else {
                // "data" / "next" labels above cells
                parts.push(svgText('data', nx + dw/2,          ny - 10, 10, ink));
                parts.push(svgText('next', nx + dw + boxSize/2, ny - 10, 10, ink));

                // Data cell and next cell
                parts.push(svgRect(nx + dw/2,          ny + boxSize/2, dw,      boxSize, cellFill));
                parts.push(svgRect(nx + dw + boxSize/2, ny + boxSize/2, boxSize, boxSize, cellFill));

                // Value text and null/arrow in next cell
                parts.push(svgText(cur.value, nx + dw/2, ny + boxSize/2, 12, ink));
                if (cur.next === null) {
                    parts.push(svgText('null', nx + dw + boxSize/2, ny + boxSize/2, 10, ink));
                }
            }

            // Arrow to next node
            if (cur.next !== null) {
                parts.push(svgArrow(
                    nx + dw + boxSize,        ny + cur.offsetY,
                    cur.next.x, cur.next.y + cur.next.offsetY
                ));
            }
        }
    }

    const defs = `<defs><marker id="arr" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${ink}"/></marker></defs>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${vx} ${vy} ${W} ${H}">\n${defs}\n${parts.join('\n')}\n</svg>`;
}

async function handleCopyAsSVG() {
    const svg  = generateSVG();
    const html = `<!DOCTYPE html><html><body>${svg}</body></html>`;
    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html':  new Blob([html], { type: 'text/html' }),
                'text/plain': new Blob([svg],  { type: 'text/plain' })
            })
        ]);
        statusText = "SVG copied to clipboard";
    } catch (e) {
        try {
            await navigator.clipboard.writeText(svg);
            statusText = "SVG copied as text";
        } catch (e2) {
            statusText = "Copy failed";
        }
    }
}

function generateAltText() {
    if (linkedLists.length === 0) {
        return "No linked lists defined.";
    }

    const count = linkedLists.length;

    function joinLabels(lists) {
        if (lists.length === 1) return `"${lists[0].label}"`;
        if (lists.length === 2) return `"${lists[0].label}" and "${lists[1].label}"`;
        return lists.slice(0, -1).map(l => `"${l.label}"`).join(', ') + `, and "${lists[lists.length - 1].label}"`;
    }

    function ordinalWord(n) {
        if (n >= 1 && n <= 10) {
            return ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"][n - 1];
        }
        const mod100 = n % 100;
        const mod10 = n % 10;
        if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
        if (mod10 === 1) return `${n}st`;
        if (mod10 === 2) return `${n}nd`;
        if (mod10 === 3) return `${n}rd`;
        return `${n}th`;
    }

    function countNodes(head) {
        let c = 0, hasEllipsis = false;
        for (let n = head; n; n = n.next) {
            if (n.value === "...") hasEllipsis = true;
            c++;
        }
        return { c, hasEllipsis };
    }

    const intro = count === 1
        ? `There is 1 linked list, headed by ${joinLabels(linkedLists)}.`
        : `There are ${count} linked lists, headed by ${joinLabels(linkedLists)}.`;

    const sections = [intro];

    for (const list of linkedLists) {
        const label = list.label;
        const sentences = [];

        if (list.head === null) {
            sentences.push(`The "${label}" variable is the head of an empty list (it points to null).`);
        } else {
            const { c: nodeCount, hasEllipsis } = countNodes(list.head);

            if (hasEllipsis) {
                sentences.push(`The "${label}" variable is the head of a list containing an unknown number of nodes.`);
            } else if (nodeCount === 1) {
                sentences.push(`The "${label}" variable is the head of a 1-node list.`);
            } else {
                sentences.push(`The "${label}" variable is the head of a ${nodeCount}-node list.`);
            }

            let current = list.head;
            let i = 1;
            let usePositional = true;
            let afterEllipsis = false;

            while (current !== null) {
                const isLast = current.next === null;
                const isEllipsis = current.value === "...";

                if (afterEllipsis) {
                    if (isEllipsis) {
                        sentences.push(`An arrow from that ellipsis leads to another ellipsis, again indicating an unknown number of additional nodes.`);
                    } else if (isLast) {
                        sentences.push(`An arrow from the ellipsis leads to the last node, which contains "${current.value}"; its next pointer is null.`);
                        afterEllipsis = false;
                    } else {
                        sentences.push(`An arrow from the ellipsis leads to a node containing "${current.value}".`);
                        afterEllipsis = false;
                    }
                } else if (isEllipsis) {
                    sentences.push(`That node is followed by an ellipsis, indicating an unknown number of additional nodes (note that there may be zero additional nodes, one additional node, or many additional nodes).`);
                    usePositional = false;
                    afterEllipsis = true;
                    i++;
                } else if (nodeCount === 1) {
                    sentences.push(`The only node contains "${current.value}"; its next pointer is null.`);
                } else if (usePositional) {
                    if (isLast) {
                        sentences.push(`The ${ordinalWord(i)} (last) node contains "${current.value}"; its next pointer is null.`);
                    } else {
                        sentences.push(`The ${ordinalWord(i)} node contains "${current.value}".`);
                    }
                    i++;
                } else {
                    if (isLast) {
                        sentences.push(`The next (and last) node contains "${current.value}"; its next pointer is null.`);
                    } else {
                        sentences.push(`The next node contains "${current.value}".`);
                    }
                }

                current = current.next;
            }
        }

        sections.push(sentences.join(' '));
    }

    return sections.join('\n\n');
}

function updateAltText() {
    const panel = document.getElementById("altTextPanel");
    if (panel) {
        panel.innerText = generateAltText();
    }
}

function positionAltTextPanel() {
    const panel = document.getElementById("altTextPanel");
    if (!panel) return;
    const ctrlHeight = document.getElementById("controlMain").offsetHeight;
    panel.style.top = ctrlHeight + "px";
    panel.style.width = (pageCutX - 40) + "px";
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

    addVar("list")
    positionAltTextPanel()

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
    positionAltTextPanel()
}



