import "./style.css";
import { fabric } from "fabric";
import { ACTIONS } from "./actions";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <article class="container">
      <canvas id="canvas"></canvas>

      <button id="addRect">Add Rect</button>
      <button id="addCircle">Add Circle</button>
      <button id="addText">Add Text</button>
      <button id="undo">Undo</button>
      <button id="showList">Show List</button>
    </article>
  </div>
`;

const canvas = new fabric.Canvas("canvas", {
  width: 800,
  height: 600,
});
const stack: { type: string; obj: any }[] = [];
let oldStateObj = {};

canvas.on("object:modified", objectModifyHandler);
document.getElementById("addRect")?.addEventListener("click", addRect);
document.getElementById("addCircle")?.addEventListener("click", addCircle);
document.getElementById("addText")?.addEventListener("click", addText);
document.getElementById("undo")?.addEventListener("click", undo);
document.getElementById("showList")?.addEventListener("click", () => {
  console.log(stack);
});

function attachId(obj: any) {
  const id = crypto.randomUUID();
  const newObj = Object.assign(obj, { id });

  return newObj;
}

function undo() {
  if (stack.length) {
    const lastChange = stack.pop();
    const index = canvas._objects.findIndex(
      (object) => object.id === lastChange?.obj.id
    );
    lastChange?.obj.on("mousedown", mouseDownHandler);

    canvas._objects.splice(index, 1);
    canvas.add(lastChange?.obj);
    canvas.renderAll();
  }
}

function mouseDownHandler(evt: any) {
  const obj = evt.target;
  const id = obj.id;

  console.log(obj);

  obj.clone(function (cloned: any) {
    oldStateObj = Object.assign(cloned, { id });
  });
}

function objectModifyHandler(evt: any) {
  if (evt.target.id === oldStateObj.id) {
    stack.push({
      type: ACTIONS.modification,
      obj: oldStateObj,
    });
  }
}

function addRect() {
  const rect = new fabric.Rect({
    top: canvas.height / 2,
    left: canvas.width / 2,
    width: 100,
    height: 100,
    fill: "red",
    originX: "center",
    originY: "center",
  });

  attachId(rect);
  rect.on("mousedown", mouseDownHandler);

  canvas.add(rect);
  canvas.renderAll();
}

function addCircle() {
  const circle = new fabric.Circle({
    top: canvas.height / 2,
    left: canvas.width / 2,
    radius: 50,
    fill: "red",
    originX: "center",
    originY: "center",
  });

  attachId(circle);
  circle.on("mousedown", mouseDownHandler);

  canvas.add(circle);
  canvas.renderAll();
}

function addText() {
  const textbox = new fabric.Textbox("Lorum ipsum dolor sit amet", {
    top: canvas.height / 2,
    left: canvas.width / 2,
    width: 150,
    fontSize: 20,
    originX: "center",
    originY: "center",
  });

  attachId(textbox);
  textbox.on("mousedown", mouseDownHandler);

  canvas.add(textbox);
}
