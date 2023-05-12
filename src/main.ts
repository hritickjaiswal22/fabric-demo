import "./style.css";
import { fabric } from "fabric";
import { ACTIONS } from "./actions";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <article class="container">
      <canvas id="canvas"></canvas>

      <section class="btnContainer">
        <button id="addRect">Add Rect</button>
        <button id="addCircle">Add Circle</button>
        <button id="addText">Add Text</button>
        <input type="file" id="uploadImage" />
        <button id="toGreen">To Green</button>
        <button id="toBlue">To Blue</button>
        <button id="undo">Undo</button>
        <button id="showList">Show List</button>
      </section>
    </article>
  </div>
`;

const canvas = new fabric.Canvas("canvas", {
  width: 800,
  height: 600,
});
const stack: { type: string; obj: any }[] = [];
let oldStateObj = {};

interface RectType {
  object: fabric.Rect | null;
  origX: number | null;
  origY: number | null;
}

let drawRect: boolean = false;
const rect: RectType = {
  object: null,
  origX: null,
  origY: null,
};

canvas.on("mouse:down", startRect);
canvas.on("mouse:move", dragRect);
canvas.on("mouse:up", endRect);

canvas.on("object:modified", objectModifyHandler);
document.getElementById("addRect")?.addEventListener("click", addRect);
document.getElementById("addCircle")?.addEventListener("click", addCircle);
document.getElementById("addText")?.addEventListener("click", addText);
document.getElementById("uploadImage")?.addEventListener("change", uploadImage);
document.getElementById("toGreen")?.addEventListener("click", toGreen);
document.getElementById("toBlue")?.addEventListener("click", toBlue);
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

    switch (lastChange?.type) {
      case ACTIONS.colorChange:
        const targetObj = canvas._objects.find(
          (object) => object.id === lastChange.obj.id
        );
        targetObj?.set("fill", lastChange.obj.originalColor);
        canvas.renderAll();
        break;

      case ACTIONS.modification:
        const index = canvas._objects.findIndex(
          (object) => object.id === lastChange?.obj.id
        );
        lastChange?.obj.on("mousedown", mouseDownHandler);

        canvas._objects.splice(index, 1);
        canvas.add(lastChange?.obj);
        canvas.renderAll();
        break;

      default:
        break;
    }
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
  drawRect = true;
}

function startRect(o) {
  if (drawRect) {
    const pointer = canvas.getPointer(o.e);
    rect.origX = pointer.x;
    rect.origY = pointer.y;
    rect.object = new fabric.Rect({
      left: rect.origX,
      top: rect.origY,
      originX: "left",
      originY: "top",
      width: pointer.x - rect.origX,
      height: pointer.y - rect.origY,
      angle: 0,
      fill: "rgba(255,0,0,0.5)",
      transparentCorners: false,
    });
    canvas.add(rect.object);
  }
}

function dragRect(o) {
  if (drawRect && rect.object) {
    const pointer = canvas.getPointer(o.e);

    if (rect.origX > pointer.x) {
      rect.object.set({ left: Math.abs(pointer.x) });
    }
    if (rect.origY > pointer.y) {
      rect.object.set({ top: Math.abs(pointer.y) });
    }

    rect.object.set({ width: Math.abs(rect.origX - pointer.x) });
    rect.object.set({ height: Math.abs(rect.origY - pointer.y) });

    canvas.renderAll();
  }
}

function endRect() {
  if (drawRect) {
    drawRect = false;
    rect.object?.setCoords();
    rect.object = null;
    rect.origX = null;
    rect.origY = null;
  }
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

function addImage(url: string) {
  const canvasRef = canvas;

  fabric.Image.fromURL(url, function (myImg) {
    //i create an extra var for to change some image properties
    const img1 = myImg.set({
      top: canvasRef.height / 2,
      left: canvasRef.width / 2,
      originX: "center",
      originY: "center",
    });
    attachId(img1);
    img1.on("mousedown", mouseDownHandler);
    canvasRef.add(img1);
  });
}

function uploadImage(event: any) {
  if (event?.target?.files[0]) {
    const reader = new FileReader();
    reader.readAsDataURL(event?.target?.files[0]);
    reader.onload = (e) => {
      const imageUrl = e.target?.result || "";

      addImage(imageUrl);
    };
  }
}

function toBlue() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    stack.push({
      type: ACTIONS.colorChange,
      obj: {
        id: activeObject.id,
        originalColor: activeObject?.fill,
      },
    });
    activeObject?.set("fill", "blue");
    canvas.renderAll();
  }
}

function toGreen() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    stack.push({
      type: ACTIONS.colorChange,
      obj: {
        id: activeObject.id,
        originalColor: activeObject?.fill,
      },
    });
    activeObject?.set("fill", "green");
    canvas.renderAll();
  }
}
