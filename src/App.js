import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import photosAction from "./actions/photosAction";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [listPhotos, setListPhotos] = useState([]);
  const [indexPhoto, setindexPhoto] = useState(1);
  const [parentSize, setParentSize] = useState({
    width: 0,
    height: 0
  });
  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    const FILLS = ["contain", "cover", "fill", "none", "scale-down"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        imagen: listPhotos[indexPhoto].thumbnailUrl,
        fill: FILLS[Math.floor(Math.random() * FILLS.length)],
        updateEnd: true
      },
    ]);
    setindexPhoto(indexPhoto+1);
  };
  const removeMoveable = () => {
    //TODO Delete item in the array
    const auxList = moveableComponents.filter(item => item.id !== selected)
    setMoveableComponents(auxList)
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {

    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        const auxNewComponent = { ...newComponent };
        console.log(auxNewComponent)
        if (newComponent.left < 0)
          auxNewComponent.left = 0;

        else if ((newComponent.left + newComponent.width) >= parentSize.width)
          auxNewComponent.left = parentSize.width - auxNewComponent.width

        if (newComponent.top < 0)
          auxNewComponent.top = 0;
        else if ((newComponent.top + newComponent.height) >= parentSize.height)
          auxNewComponent.top = parentSize.height - auxNewComponent.height

        return { id, ...auxNewComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  useEffect(() => {
    resizeHandlerParent();
    window.addEventListener('resize', resizeHandlerParent);
    return () => window.removeEventListener('resize', resizeHandlerParent);
  }, []);

  const resizeHandlerParent = () => {
    const rect = document.getElementById("parent");
    //console.log(rect.clientWidth, "parents")
    setParentSize({
      width: rect.clientWidth,
      height: rect.clientHeight
    });
  }

  useEffect(() => {
    photosAction.get({}, (response) => {
      setListPhotos(response)
    })
  },[]);

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      {!listPhotos && <p>Loading...</p>}
      {listPhotos?.length > 0 && <button onClick={addMoveable}>Add Moveable1</button>}
      {moveableComponents.length > 0 && <button onClick={removeMoveable}>Remove Moveable Selection</button>}

      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  imagen,
  fill,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
    imagen,
    fill
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    //console.log(e, "resize bloque")
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      imagen,
      fill
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;
    console.log(e, "resize bloque end")
    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(
      id,
      {
        top,
        left,
        width: newWidth,
        height: newHeight,
        color,
        imagen,
        fill
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      >
        <img src={imagen} alt="img to async" style={{width: "100%", height: "100%", objectFit: fill}} />
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          console.log(e.left, "e.left al mover el div")
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            imagen,
            fill
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
