import { ReactNode, useImperativeHandle, useRef } from "react";
import type { IClassNames } from "./default-class-names";

interface ITrack {
  children: ReactNode,
  classNames: IClassNames,
  draggableTrack: boolean,
  onTrackDrag: (event, trackDragEvent) => void,
  onTrackMouseDown: (event, position: { x: number, y: number }) => void,
  percentages: { min: number, max: number },
}

/**
 * @ignore
 * @param {Object} props
 * @param {InputRangeClassNames} props.classNames
 * @param {Boolean} props.draggableTrack
 * @param {Function} props.onTrackDrag
 * @param {Function} props.onTrackMouseDown
 * @param {number} props.percentages
 *
 * @return {JSX.Element}
 */
export default function Track(props: ITrack) {
  let trackDragEvent = null;
  const node = useRef<HTMLDivElement | null>(null);
  const {
    children,
    classNames,
    draggableTrack,
    onTrackDrag,
    onTrackMouseDown,
    percentages,
    ref
  } = props;

  /**
   * React refs refer to DOM elements not to custom compoents.
   * To pass a ref from a custom component to the DOM component of a child
   * (aka nested) component, we previously had to use React.forwardRef.
   *
   * However, React.forwardRef is soon to be deprecated,
   * and the React guys says we can now use a 'ref' prop directly just like other props.
   * @see: https://react.dev/reference/react/forwardRef
   * @see: https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
   *
   * Also, in addition to the ref passed from the parent component,
   * we are also using an inner ref which is also needed by this component.
   * To have both refs (passed and internal) refer to the same DOM element,
   * we use this useImperativeHandle trick.
   *
   * > Call the useImperativeHandle hook on the outer ref
   * > (which is being forwarded to the child component)
   * > and pass a function that returns the current property of the inner ref,
   * > which is the value that will be set to the current property of the outer ref.
   *
   * > Remember to list any dependencies of the function that returns the ref value,
   * > similar to useEffect.
   *
   * @see: https://stackoverflow.com/a/77055616/1743192
   */
  useImperativeHandle(ref, () => node.current!, []);

  /**
   * @private
   * @return {ClientRect}
   */
  function getClientRect() {
    return node.current.getBoundingClientRect();
  }

  /**
   * @private
   * @return {Object} CSS styles
   */
  function getActiveTrackStyle() {
    const width = `${(percentages.max - percentages.min) * 100}%`;
    const left = `${percentages.min * 100}%`;

    return { left, width };
  }

  /**
   * Listen to mousemove event
   * @private
   * @return {void}
   */
  function addDocumentMouseMoveListener() {
    removeDocumentMouseMoveListener();
    node.current.ownerDocument.addEventListener("mousemove", handleMouseMove);
  }

  /**
   * Listen to mouseup event
   * @private
   * @return {void}
   */
  function addDocumentMouseUpListener() {
    removeDocumentMouseUpListener();
    node.current.ownerDocument.addEventListener("mouseup", handleMouseUp);
  }

  /**
   * @private
   * @return {void}
   */
  function removeDocumentMouseMoveListener() {
    node.current.ownerDocument.removeEventListener("mousemove", handleMouseMove);
  }

  /**
   * @private
   * @return {void}
   */
  function removeDocumentMouseUpListener() {
    node.current.ownerDocument.removeEventListener("mouseup", handleMouseUp);
  }

  /**
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleMouseMove(event) {
    if(!draggableTrack) {
      return;
    }

    if(trackDragEvent !== null) {
      onTrackDrag(event, trackDragEvent);
    }

    trackDragEvent = event;
  }

  /**
   * @private
   * @return {void}
   */
  function handleMouseUp() {
    if(!draggableTrack) {
      return;
    }

    removeDocumentMouseMoveListener();
    removeDocumentMouseUpListener();
    trackDragEvent = null;
  }

  /**
   * @private
   * @param {SyntheticEvent} event - User event
   */
  function handleMouseDown(event) {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const trackClientRect = getClientRect();
    const position = {
      x: clientX - trackClientRect.left,
      y: 0,
    };

    onTrackMouseDown(event, position);

    if(draggableTrack) {
      addDocumentMouseMoveListener();
      addDocumentMouseUpListener();
    }
  }

  /**
   * @private
   * @param {SyntheticEvent} event - User event
   */
  function handleTouchStart(event) {
    event.preventDefault();

    handleMouseDown(event);
  }

  return (
    <div
      className={classNames.track}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      ref={node}>
      <div style={getActiveTrackStyle()} className={classNames.activeTrack} />
      {children}
    </div>
  );
}
