import "./style.css";
import { fabric } from "fabric";
import { ACTIONS } from "./actions";
import Cropper from "cropperjs";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <article class="container">
      <canvas id="canvas"></canvas>

      <div id="outer">
        <div id="inner">
        </div>
      </div>

      <section class="btnContainer">
        <button id="addRect">Add Rect</button>
        <button id="addCircle">Add Circle</button>
        <button id="addText">Add Text</button>
        <input type="file" id="uploadImage" />
        <button id="toGreen">To Green</button>
        <button id="toBlue">To Blue</button>
        <button id="undo">Undo</button>
        <button id="showList">Show List</button>
        <button id="startCrop">Start Crop</button>
        <button id="endCrop">End Crop</button>
      </section>
    </article>
    <main id="test"></main>
  </div>
`;

let canvas = new fabric.Canvas("canvas", {
  width: 800,
  height: 600,
});
const stack: { type: string; obj: any }[] = [];
let oldStateObj = {};

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
document.getElementById("startCrop")?.addEventListener("click", startCrop);
document.getElementById("endCrop")?.addEventListener("click", endCrop);

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

  // console.log(obj);

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

// let clipRect: any;
// let image: any;

// function startCrop() {
//   image = canvas.getActiveObject();
// }

// function clipRectModifyHandler(evt: any) {
//   console.log(evt);
// }

// function endCrop() {
//   const clipPath = clipRect;
//   const canvasRef = canvas;

//   fabric.Image.fromURL(image?._element.src, function (myImg) {
//     //i create an extra var for to change some image properties
//     const img1 = myImg.set({
//       top: canvasRef.height / 2,
//       left: canvasRef.width / 2,
//     });

//     img1.clipPath = new fabric.Rect({
//       width: 200,
//       height: 100,
//     });
//     canvasRef.remove(image);

//     canvasRef.add(img1);
//   });
// }

// let cropArea = fabric.Rect;

// function endCrop() {
//   const cropBounds = canvas.getActiveObject()?.getBoundingRect();
//   // Create a new canvas element with the same dimensions as the crop area
//   const croppedCanvas = document.createElement("canvas");
//   croppedCanvas.width = cropBounds?.width || 0;
//   croppedCanvas.height = cropBounds?.height || 0;

//   const imageData = canvas
//     .getContext()
//     .getImageData(
//       cropBounds.left,
//       cropBounds.top,
//       cropBounds.width,
//       cropBounds.height
//     );

//   // Draw the image data onto the new canvas

//   const ctx = croppedCanvas.getContext("2d");
//   ctx.putImageData(imageData, 0, 0);

//   canvas.getElement().replaceWith(croppedCanvas);
//   canvas = new fabric.Canvas(croppedCanvas);
// }

// function startCrop() {
//   fabric.Image.fromURL(canvas.toDataURL("png"), function (img) {
//     img.set({
//       scaleX: 1,
//       scaleY: 1,
//       width: canvas.width,
//       height: canvas.height,
//     });

//     const canvasSrc = img?._element.src;
//     const imgElement = document.createElement("img");
//     imgElement.src = canvasSrc;

//     imgElement.onload = () => {
//       document.getElementById("test")?.appendChild(imgElement);
//     };
//   });
// }

function startCrop() {
  if (canvas.getActiveObject()?.type === "image") {
    const image = canvas.getActiveObject();
    const rect = new fabric.Rect({
      top: canvas.height / 2,
      left: canvas.width / 2,
      width: 100,
      height: 100,
      fill: "red",
      originX: "center",
      originY: "center",
      opacity: 0.3,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);

    canvas.renderAll();
  }
}

function endCrop() {
  const rect = canvas?.getActiveObject();
  const bounds = rect?.getBoundingRect();
  const canvasRef = canvas;

  fabric.Image.fromURL(canvas.toDataURL("png"), function (img) {
    img.set({
      scaleX: 1,
      scaleY: 1,
      width: canvas.width,
      height: canvas.height,
    });

    const canvasSrc = img?._element.src;
    const imgElement = document.createElement("img");
    imgElement.src = canvasSrc;

    imgElement.onload = () => {
      document.getElementById("inner")?.appendChild(imgElement);
      const cropper = new Cropper(
        document.getElementById("inner")?.querySelector("img"),
        {
          ready: () => {
            cropper.setCropBoxData({
              left: bounds?.left,
              top: bounds?.top + 50,
              width: bounds?.width,
              height: bounds?.height + 50,
            });
            const croppedCanvasUrl = cropper.getCroppedCanvas().toDataURL();
            fabric.Image.fromURL(croppedCanvasUrl, function (myImg) {
              //i create an extra var for to change some image properties
              const img1 = myImg.set({
                top: canvasRef.height / 2,
                left: canvasRef.width / 2,
                originX: "center",
                originY: "center",
              });

              canvasRef.add(img1);
            });
          },
        }
      );
    };
  });
}
