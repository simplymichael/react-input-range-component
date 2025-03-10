import { ReactNode, useRef } from "react";
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
  const node = useRef(null);
  const trackDragEvent = null;

  const {
    children,
    classNames,
    draggableTrack,
    onTrackDrag,
    onTrackMouseDown,
    percentages
  } = props;

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
      ref={(thisDiv) => { node.current = thisDiv; }}>
      <div style={getActiveTrackStyle()} className={classNames.activeTrack} />
      {children}
    </div>
  );
}
