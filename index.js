
// Function to create two perpendicular lines to the original line
function createPerpendicularLines(p1, p2) {
    // Calculate the direction vector of the original line
    const directionVector = { x: p2.x - p1.x, y: p2.y - p1.y };

    // Calculate the perpendicular vectors
    const perpendicularVector1 = { x: -directionVector.y, y: directionVector.x };
    const perpendicularVector2 = { x: directionVector.y, y: -directionVector.x };

    // Calculate the end points of the new lines
    const endPoint1 = { x: p1.x + perpendicularVector1.x, y: p1.y + perpendicularVector1.y };
    const endPoint2 = { x: p2.x + perpendicularVector2.x, y: p2.y + perpendicularVector2.y };

    return [endPoint1, endPoint2];
}

// Recursive function to subdivide a Bezier curve
function subdivideBezier(ctx, level, p0, p1, p2, p3, s) {
    if (level === 0) {
        s.push([p0, p3])
        return s
    } else {
        // Calculate midpoints
        const p01 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
        const p12 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const p23 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };

        const p012 = { x: (p01.x + p12.x) / 2, y: (p01.y + p12.y) / 2 };
        const p123 = { x: (p12.x + p23.x) / 2, y: (p12.y + p23.y) / 2 };

        const p0123 = { x: (p012.x + p123.x) / 2, y: (p012.y + p123.y) / 2 };

        // Recursive calls for the two halves
        s = subdivideBezier(ctx, level - 1, p0, p01, p012, p0123, s);
        s = subdivideBezier(ctx, level - 1, p0123, p123, p23, p3, s);
        return s
    }
}

const canvas = document.getElementById('bezierCanvas');
const ctx = canvas.getContext('2d');
const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

// Initial points and control points
let points = [
    { x: 50, y: 150 },     // Start point
    { x: 50, y: 50 },      // Control point 1
    { x: 200, y: 50 },     // Control point 2
    { x: 200, y: 150 }      // End point
];
const drawSegments = (segments) => {
    for (const s of segments) {
        ctx.beginPath();
        ctx.moveTo(s[0].x, s[0].y);
        ctx.lineTo(s[1].x, s[1].y);
        ctx.stroke();

        const ticks = createPerpendicularLines(s[0], s[1])
        ctx.beginPath();
        ctx.moveTo(s[0].x, s[0].y);
        ctx.lineTo(ticks[0].x, ticks[0].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s[1].x, s[1].y);
        ctx.lineTo(ticks[1].x, ticks[1].y);
        ctx.stroke();
    }
};
let recursivelevel = 4
const drawBezierCurve = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#666666'; // Gray color for the approximation
    const segments = subdivideBezier(ctx, recursivelevel, points[0], points[1], points[2], points[3], []);
    drawSegments(segments);

    // Draw the control points
    ctx.fillStyle = '#ff000044'; // Red color for control points
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, 50, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(points[1].x, points[1].y, 50, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(points[2].x, points[2].y, 50, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(points[3].x, points[3].y, 50, 0, 2 * Math.PI);
    ctx.fill();

    // // // Draw the Bezier curve 
    // // ctx.strokeStyle = '#000000'; // Black color for the curve
    // // ctx.beginPath();
    // // ctx.moveTo(points[0].x, points[0].y);
    // // ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
    // // ctx.stroke();

    // Draw lines to indicate the control point associations
    ctx.strokeStyle = '#66666644'; // Gray color for the approximation
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.moveTo(points[2].x, points[2].y);
    ctx.lineTo(points[3].x, points[3].y);
    ctx.stroke();
}
// Function to handle mouse drag on control points
function handleDrag(index, event, drag_offset) {
    // console.log(index, event.clientX, event.clientY)
    points[index].x = Math.max(0, Math.min(canvas.getBoundingClientRect().right - canvas.getBoundingClientRect().left, event.clientX - canvas.getBoundingClientRect().left - drag_offset[0]));
    points[index].y = Math.max(0, Math.min(canvas.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top, event.clientY - canvas.getBoundingClientRect().top - drag_offset[1]));
    drawBezierCurve();
}

function mouseDown(event) {
    for (let i = 0; i < 4; i++) {
        const point = points[i];
        const distance = Math.sqrt((event.clientX - canvas.getBoundingClientRect().left - point.x) ** 2 + (event.clientY - canvas.getBoundingClientRect().top - point.y) ** 2);
        if (distance < 50) { // Assuming a radius of 10 for the control points
            // Attach event listeners for drag and release
            const drag_offset = [event.clientX - canvas.getBoundingClientRect().left - point.x, event.clientY - canvas.getBoundingClientRect().top - point.y]
            function handleMouseMove(e) { handleDrag(i, e, drag_offset); }
            function handleMouseUp() {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            break
        }
    }
}
function touchDown(event) {
    for (let i = 0; i < 4; i++) {
        const point = points[i];
        const distance = Math.sqrt((event.clientX - canvas.getBoundingClientRect().left - point.x) ** 2 + (event.clientY - canvas.getBoundingClientRect().top - point.y) ** 2);
        if (distance < 50) { // Assuming a radius of 10 for the control points
            // Attach event listeners for drag and release
            const drag_offset = [event.clientX - canvas.getBoundingClientRect().left - point.x, event.clientY - canvas.getBoundingClientRect().top - point.y]
            function handleMouseMove(e) { handleDrag(i, e, drag_offset); }
            function handleMouseUp() {
                document.removeEventListener('touchmove', handleMouseMove);
                document.removeEventListener('touchend', handleMouseUp);
            }

            document.addEventListener('touchmove', handleMouseMove);
            document.addEventListener('touchend', handleMouseUp);
            break
        }
    }
}

// Event listener for mouse down on control points
canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('touchstart', touchDown);

// Function to handle resize events
function handleResize() {
    // Get the updated width and height of the viewport
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidthRatio = viewportWidth / 400;
    const viewportHeightRatio = viewportHeight / 600;
    
    if (viewportWidthRatio < 1.0 || viewportHeightRatio < 1.0) {
        if (viewportWidthRatio < viewportHeightRatio) {
            changeCanvasSize(viewportWidth, Math.floor(600.0*viewportWidthRatio));
        }
        else {
            changeCanvasSize(Math.floor(400*viewportHeightRatio), viewportHeight);
        }
        drawBezierCurve();
    }
}

function changeCanvasSize(newWidth, newHeight) {
    var canvas = document.getElementById("bezierCanvas");
    // Update canvas size
    canvas.width = newWidth;
    canvas.height = newHeight;
}

// Attach the event listener to the resize event
window.addEventListener('resize', handleResize);
const moreSudivs = (e) => {
    recursivelevel = Math.min(8, recursivelevel + 1);
    document.getElementById('recursivelevel').innerText = recursivelevel+'';
    drawBezierCurve();
}
const lessSudivs = (e) => {
    recursivelevel = Math.max(0, recursivelevel - 1);
    document.getElementById('recursivelevel').innerText = recursivelevel+'';
    drawBezierCurve();
}
document.getElementById('less').addEventListener('touchstart', lessSudivs)
document.getElementById('more').addEventListener('touchstart', moreSudivs)
document.getElementById('less').addEventListener('click', lessSudivs)
document.getElementById('more').addEventListener('click', moreSudivs)

handleResize()
// Initial draw
drawBezierCurve();