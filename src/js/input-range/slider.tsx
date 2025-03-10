import { useEffect, useRef, useState } from "react";
import Label from "./label";
import type { FormatLabelFn } from "./label";
import type { IClassNames } from "./default-class-names";

interface ISlider {
  ariaLabelledby?: string,
  ariaControls?: string,
  classNames: IClassNames,
  formatLabel?: FormatLabelFn,
  maxValue?: number,
  minValue?: number,
  onSliderDrag: (event, type: string) => void,
  onSliderKeyDown: (event, type: string) => void,
  percentage: number,
  type: string,
  value: number,
}

/**
 * @ignore
 * @return {JSX.Element}
 */
export default function Slider(props: ISlider) {
  const node = useRef<HTMLSpanElement | null>(null);
  const {
    ariaLabelledby,
    ariaControls,
    classNames,
    formatLabel,
    maxValue,
    minValue,
    onSliderKeyDown,
    onSliderDrag,
    percentage,
    type,
    value
  } = props;

  useEffect(() => {
    return function cleanup() {
      removeDocumentMouseMoveListener();
      removeDocumentMouseUpListener();
      removeDocumentTouchEndListener();
      removeDocumentTouchMoveListener();
    }
  }, []);

  /**
   * @private
   * @return {Object}
   */
  function getStyle() {
    const perc = (percentage || 0) * 100;
    const style = { position: "absolute", left: `${perc}%` };

    return style;
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
   * Listen to touchmove event
   * @private
   * @return {void}
   */
  function addDocumentTouchMoveListener() {
    removeDocumentTouchMoveListener();
    node.current.ownerDocument.addEventListener("touchmove", handleTouchMove);
  }

  /**
   * Listen to touchend event
   * @private
   * @return {void}
   */
  function addDocumentTouchEndListener() {
    removeDocumentTouchEndListener();
    node.current.ownerDocument.addEventListener("touchend", handleTouchEnd);
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
   * @return {void}
   */
  function removeDocumentTouchMoveListener() {
    node.current.ownerDocument.removeEventListener("touchmove", handleTouchMove);
  }

  /**
   * @private
   * @return {void}
   */
  function removeDocumentTouchEndListener() {
    node.current.ownerDocument.removeEventListener("touchend", handleTouchEnd);
  }

  /**
   * @private
   * @return {void}
   */
  function handleMouseDown() {
    addDocumentMouseMoveListener();
    addDocumentMouseUpListener();
  }

  /**
   * @private
   * @return {void}
   */
  function handleMouseUp() {
    removeDocumentMouseMoveListener();
    removeDocumentMouseUpListener();
  }

  /**
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleMouseMove(event) {
    onSliderDrag(event, type);
  }

  /**
   * @private
   * @return {void}
   */
  function handleTouchStart() {
    addDocumentTouchEndListener();
    addDocumentTouchMoveListener();
  }

  /**
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleTouchMove(event) {
    onSliderDrag(event, type);
  }

  /**
   * @private
   * @return {void}
   */
  function handleTouchEnd() {
    removeDocumentTouchMoveListener();
    removeDocumentTouchEndListener();
  }

  /**
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleKeyDown(event) {
    onSliderKeyDown(event, type);
  }

  return (
    <span
      className={classNames.sliderContainer}
      ref={node}
      style={getStyle()}>

      <Label classNames={classNames} formatLabel={formatLabel} type="value">
        {value}
      </Label>

      <div
        aria-labelledby={ariaLabelledby}
        aria-controls={ariaControls}
        aria-valuemax={maxValue}
        aria-valuemin={minValue}
        aria-valuenow={value}
        className={classNames.slider}
        draggable="false"
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        tabIndex="0" />
    </span>
  );
}
