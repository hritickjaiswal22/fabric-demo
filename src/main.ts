import "./style.css";
import { fabric } from "fabric";

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
const objectList: any = {};
const stack: { type: string; oldObj: any }[] = [];

canvas.on("object:modified", objectModifyHandler);
document.getElementById("addRect")?.addEventListener("click", addRect);
document.getElementById("addCircle")?.addEventListener("click", addCircle);
document.getElementById("addText")?.addEventListener("click", addText);
document.getElementById("undo")?.addEventListener("click", undo);
document.getElementById("showList")?.addEventListener("click", () => {
  console.log(objectList);
});

function objectModifyHandler(evt: any) {
  const newObj = evt.target;
  const id = newObj.id;
  const oldObj = objectList[id];

  stack.push({
    type: "modification",
    oldObj: oldObj,
  });

  newObj.clone(function (cloned: any) {
    objectList[id] = Object.assign(cloned, { id });
  });
}

function attachId(obj: any) {
  const id = crypto.randomUUID();
  const newObj = Object.assign(obj, { id });

  newObj.clone(function (cloned: any) {
    objectList[id] = Object.assign(cloned, { id });
  });

  return newObj;
}

function undo() {
  if (stack.length) {
    const lastChange = stack.pop();
    const index = canvas._objects.findIndex(
      (object) => object.id === lastChange?.oldObj.id
    );

    canvas._objects.splice(index, 1);
    canvas.add(lastChange?.oldObj);
    canvas.renderAll();
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

  canvas.add(textbox);
}
