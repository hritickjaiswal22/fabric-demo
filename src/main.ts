import "./style.css";
import { fabric } from "fabric";
import demo from "../public/demo.jpg";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <article class="container">
      <canvas id="canvas"></canvas>

      <button id="color">Click</button>
      <button id="active">Current Active</button>
      <button id="bold">Bold</button>
    </article>
  </div>
`;

function changeColor(event: Event) {
  canvas.getActiveObject()?.set("fill", "green");
  canvas.renderAll();
}

function addImage(params: Event) {
  fabric.Image.fromURL(demo, function (myImg) {
    //i create an extra var for to change some image properties
    var img1 = myImg.set({ left: 0, top: 0, width: 400, height: 250 });
    canvas.add(img1);
  });
}

function starPolygonPoints(
  spikeCount: number,
  outerRadius: number,
  innerRadius: number
) {
  var rot = (Math.PI / 2) * 3;
  var cx = outerRadius;
  var cy = outerRadius;
  var sweep = Math.PI / spikeCount;
  var points = [];
  var angle = 0;

  for (var i = 0; i < spikeCount; i++) {
    var x = cx + Math.cos(angle) * outerRadius;
    var y = cy + Math.sin(angle) * outerRadius;
    points.push({ x: x, y: y });
    angle += sweep;

    x = cx + Math.cos(angle) * innerRadius;
    y = cy + Math.sin(angle) * innerRadius;
    points.push({ x: x, y: y });
    angle += sweep;
  }
  return points;
}

function addStar(params: Event) {
  var points = starPolygonPoints(5, 50, 25);

  var myStar = new fabric.Polygon(points, {
    stroke: "red",
    left: 100,
    top: 10,
    strokeWidth: 2,
    strokeLineJoin: "bevil",
  });
  canvas.add(myStar);
}

function addText(params: Event) {
  var textbox = new fabric.Textbox("Lorum ipsum dolor sit amet", {
    left: 50,
    top: 50,
    width: 150,
    fontSize: 20,
  });
  canvas.add(textbox);
}

function boldText(params: Event) {
  canvas.getActiveObject()?.set("fontWeight", "bold");
  canvas.renderAll();
}

function printActive(params: Event) {
  console.log(canvas.getActiveObject());
}

const canvas = new fabric.Canvas("canvas", {
  width: 800,
  height: 600,
});
const btn = document.querySelector("#color");
const currentActive = document.querySelector("#active");
const boldBtn = document.querySelector("#bold");
const rect = new fabric.Rect({
  width: 200,
  height: 200,
  fill: "red",
});

console.log(canvas);

canvas.add(rect);
btn?.addEventListener("click", addStar);
currentActive?.addEventListener("click", printActive);
boldBtn?.addEventListener("click", boldText);
