import { ReactElement, useEffect, useState, useRef } from "react";
import DEFAULT_CLASS_NAMES from "./default-class-names";
import { DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from "./key-codes";
import Label from "./label";
import Slider from "./slider";
import Track from "./track";
import { captialize, distanceTo, isDefined, isObject, length } from "../utils";
import valuePropType from "./value-prop-type";
import * as valueTransformer from "./value-transformer";

import type { IClassNames } from "./default-class-names";
import type { FormatLabelFn } from "./label";

type OnChangeFn = (value: valuePropType) => void;

interface IInputRange {
  allowSameValues?: boolean,
  ariaLabelledby?: string,
  ariaControls?: string,
  classNames?: IClassNames,
  disabled?: boolean,
  draggableTrack?: boolean,
  formatLabel?: FormatLabelFn,
  maxValue?: number,
  minValue?: number,
  name?: string,
  onChangeStart?: OnChangeFn,
  onChange: OnChangeFn,
  onChangeComplete?: OnChangeFn,
  step?: number,
  value?: valuePropType,
}


/**
 * A React component that allows users to input numeric values within a range
 * by dragging its sliders.
 *
 * @return {JSX.Element}
 */
export default function InputRange(props: IInputRange) {
  let startValue: number = null;
  let isSliderDragging: boolean = false;
  let lastKeyMoved: string = null;
  const node = useRef<HTMLDivElement | null>(null);
  const trackNode = useRef<HTMLDivElement | null>(null);

  const {
    allowSameValues = false,
    classNames = DEFAULT_CLASS_NAMES,
    disabled = false,
    maxValue = 10,
    minValue = 0,
    step = 1,
    draggableTrack = true,
    ariaLabelledby,
    ariaControls,
    formatLabel,
    name,
    onChange,
    onChangeComplete,
    onChangeStart,
    value,
  } = props;


  useEffect(() => {
    return function cleanup() {
      removeDocumentMouseUpListener();
      removeDocumentTouchEndListener();
    }
  }, []);

  /**
   * Return the CSS class name of the component
   * @private
   * @return {string}
   */
  function getComponentClassName() {
    return (
      disabled
        ? classNames.disabledInputRange
        : classNames.inputRange
    );
  }

  /**
   * Return the bounding rect of the track
   * @private
   * @return {ClientRect}
   */
  function getTrackClientRect() {
    return trackNode.current.getBoundingClientRect();
  }

  /**
   * Return the slider key closest to a point
   * @private
   * @param {Point} position
   * @return {string}
   */
  function getKeyByPosition(position) {
    const values = valueTransformer.getValueFromProps(props, isMultiValue());
    const positions = valueTransformer.getPositionsFromValues(
      values,
      minValue,
      maxValue,
      getTrackClientRect()
    );

    if(isMultiValue()) {
      const distanceToMin = distanceTo(position, positions.min);
      const distanceToMax = distanceTo(position, positions.max);

      if(distanceToMin < distanceToMax) {
        return "min";
      }
    }

    return "max";
  }

  /**
   * Return all the slider keys
   * @private
   * @return {string[]}
   */
  function getKeys() {
    if(isMultiValue()) {
      return ["min", "max"];
    }

    return ["max"];
  }

  /**
   * Return true if the difference between the new and the current value is
   * greater or equal to the step amount of the component
   * @private
   * @param {Range} values
   * @return {boolean}
   */
  function hasStepDifference(values) {
    const currentValues = valueTransformer.getValueFromProps(props, isMultiValue());

    return (
      length(values.min, currentValues.min) >= step ||
      length(values.max, currentValues.max) >= step
    );
  }

  /**
   * Return true if the component accepts a min and max value
   * @private
   * @return {boolean}
   */
  function isMultiValue() {
    return isObject(value);
  }

  /**
   * Return true if the range is within the max and min value of the component
   * @private
   * @param {Range} values
   * @return {boolean}
   */
  function isWithinRange(values) {
    if(isMultiValue()) {
      return (
        values.min >= minValue &&
        values.max <= maxValue &&
        (
          allowSameValues
            ? values.min <= values.max
            : values.min < values.max
        )
      );
    }

    return (
      values.max >= minValue &&
      values.max <= maxValue
    );
  }

  /**
   * Return true if the new value should trigger a render
   * @private
   * @param {Range} values
   * @return {boolean}
   */
  function shouldUpdate(values) {
    return isWithinRange(values) && hasStepDifference(values);
  }

  /**
   * Update the position of a slider
   * @private
   * @param {string} key
   * @param {Point} position
   * @return {void}
   */
  function updatePosition(key, position) {
    const values = valueTransformer.getValueFromProps(props, isMultiValue());
    const positions = valueTransformer.getPositionsFromValues(
      values,
      minValue,
      maxValue,
      getTrackClientRect()
    );

    positions[key] = position;
    lastKeyMoved = key;

    updatePositions(positions);
  }

  /**
   * Update the positions of multiple sliders
   * @private
   * @param {Object} positions
   * @param {Point} positions.min
   * @param {Point} positions.max
   * @return {void}
   */
  function updatePositions(positions) {
    const values = {
      min: valueTransformer.getValueFromPosition(positions.min, minValue, maxValue, getTrackClientRect()),
      max: valueTransformer.getValueFromPosition(positions.max, minValue, maxValue, getTrackClientRect()),
    };

    const transformedValues = {
      min: valueTransformer.getStepValueFromValue(values.min, step),
      max: valueTransformer.getStepValueFromValue(values.max, step),
    };

    updateValues(transformedValues);
  }

  /**
   * Update the value of a slider
   * @private
   * @param {string} key
   * @param {number} value
   * @return {void}
   */
  function updateValue(key, value) {
    const values = valueTransformer.getValueFromProps(props, isMultiValue());

    values[key] = value;

    updateValues(values);
  }

  /**
   * Update the values of multiple sliders
   * @private
   * @param {Range|number} values
   * @return {void}
   */
  function updateValues(values) {
    if (!shouldUpdate(values)) {
      return;
    }

    props.onChange(isMultiValue() ? values : values.max);
  }

  /**
   * Increment the value of a slider by key name
   * @private
   * @param {string} key
   * @return {void}
   */
  function incrementValue(key) {
    const values = valueTransformer.getValueFromProps(props, isMultiValue());
    const value = values[key] + step;

    updateValue(key, value);
  }

  /**
   * Decrement the value of a slider by key name
   * @private
   * @param {string} key
   * @return {void}
   */
  function decrementValue(key) {
    const values = valueTransformer.getValueFromProps(props, isMultiValue());
    const value = values[key] - step;

    updateValue(key, value);
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
   * Listen to touchend event
   * @private
   * @return {void}
   */
  function addDocumentTouchEndListener() {
    removeDocumentTouchEndListener();
    node.current.ownerDocument.addEventListener("touchend", handleTouchEnd);
  }

  /**
   * Stop listening to mouseup event
   * @private
   * @return {void}
   */
  function removeDocumentMouseUpListener() {
    node.current.ownerDocument.removeEventListener("mouseup", handleMouseUp);
  }

  /**
   * Stop listening to touchend event
   * @private
   * @return {void}
   */
  function removeDocumentTouchEndListener() {
    node.current.ownerDocument.removeEventListener("touchend", handleTouchEnd);
  }

  /**
   * Handle any "mousemove" event received by the slider
   * @private
   * @param {SyntheticEvent} event
   * @param {string} key
   * @return {void}
   */
  function handleSliderDrag(event, key) {
    if(disabled) {
      return;
    }

    const position = valueTransformer.getPositionFromEvent(event, getTrackClientRect());
    isSliderDragging = true;
    requestAnimationFrame(() => updatePosition(key, position));
  }

  /**
   * Handle any "mousemove" event received by the track
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleTrackDrag(event, prevEvent) {
    if(disabled || !draggableTrack || isSliderDragging) {
      return;
    }

    const { max, min } = props.value;
    const position = valueTransformer.getPositionFromEvent(event, getTrackClientRect());
    const value = valueTransformer.getValueFromPosition(position, minValue, maxValue, getTrackClientRect());
    const stepValue = valueTransformer.getStepValueFromValue(value, step);

    const prevPosition = valueTransformer.getPositionFromEvent(prevEvent, getTrackClientRect());
    const prevValue = valueTransformer.getValueFromPosition(prevPosition, minValue, maxValue, getTrackClientRect());
    const prevStepValue = valueTransformer.getStepValueFromValue(prevValue, step);

    const offset = prevStepValue - stepValue;

    const transformedValues = {
      min: min - offset,
      max: max - offset,
    };

    updateValues(transformedValues);
  }

  /**
   * Handle any "keydown" event received by the slider
   * @private
   * @param {SyntheticEvent} event
   * @param {string} key
   * @return {void}
   */
  function handleSliderKeyDown(event, key) {
    if(disabled) {
      return;
    }

    switch(event.keyCode) {
    case LEFT_ARROW:
    case DOWN_ARROW:
      event.preventDefault();
      decrementValue(key);
      break;

    case RIGHT_ARROW:
    case UP_ARROW:
      event.preventDefault();
      incrementValue(key);
      break;

    default:
      break;
    }
  }

  /**
   * Handle any "mousedown" event received by the track
   * @private
   * @param {SyntheticEvent} event
   * @param {Point} position
   * @return {void}
   */
  function handleTrackMouseDown(event, position) {
    if(disabled) {
      return;
    }

    const { max, min } = props.value;

    event.preventDefault();

    const value = valueTransformer.getValueFromPosition(position, minValue, maxValue, getTrackClientRect());
    const stepValue = valueTransformer.getStepValueFromValue(value, step);

    if(!draggableTrack || stepValue > max || stepValue < min) {
      updatePosition(getKeyByPosition(position), position);
    }
  }

  /**
   * Handle the start of any mouse/touch event
   * @private
   * @return {void}
   */
  function handleInteractionStart() {
    if(onChangeStart) {
      onChangeStart(value);
    }

    if(onChangeComplete && !isDefined(startValue)) {
      startValue = value;
    }
  }

  /**
   * Handle the end of any mouse/touch event
   * @private
   * @return {void}
   */
  function handleInteractionEnd() {
    if(isSliderDragging) {
      isSliderDragging = false;
    }

    if(!onChangeComplete || !isDefined(startValue)) {
      return;
    }

    if(startValue !== value) {
      onChangeComplete(value);
    }

    startValue = null;
  }

  /**
   * Handle any "keydown" event received by the component
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleKeyDown(event) {
    handleInteractionStart(event);
  }

  /**
   * Handle any "keyup" event received by the component
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleKeyUp(event) {
    handleInteractionEnd(event);
  }

  /**
   * Handle any "mousedown" event received by the component
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleMouseDown(event) {
    handleInteractionStart(event);
    addDocumentMouseUpListener();
  }

  /**
   * Handle any "mouseup" event received by the component
   * @private
   * @param {SyntheticEvent} event
   */
  function handleMouseUp(event) {
    handleInteractionEnd(event);
    removeDocumentMouseUpListener();
  }

  /**
   * Handle any "touchstart" event received by the component
   * @private
   * @param {SyntheticEvent} event
   * @return {void}
   */
  function handleTouchStart(event) {
    handleInteractionStart(event);
    addDocumentTouchEndListener();
  }

  /**
   * Handle any "touchend" event received by the component
   * @private
   * @param {SyntheticEvent} event
   */
  function handleTouchEnd(event) {
    handleInteractionEnd(event);
    removeDocumentTouchEndListener();
  }

  /**
   * Return JSX of sliders
   * @private
   * @return {JSX.Element}
   */
  function renderSliders() {
    const values = valueTransformer.getValueFromProps(props, isMultiValue());
    const percentages = valueTransformer.getPercentagesFromValues(values, minValue, maxValue);
    const keys = allowSameValues &&
      lastKeyMoved === "min"
        ? getKeys().reverse()
        : getKeys();

    return keys.map((key) => {
      const value = values[key];
      const percentage = percentages[key];

      let { maxValue, minValue } = props;

      if(key === "min") {
        maxValue = values.max;
      } else {
        minValue = values.min;
      }

      const slider = (
        <Slider
          ariaLabelledby={ariaLabelledby}
          ariaControls={ariaControls}
          classNames={classNames}
          formatLabel={formatLabel}
          key={key}
          maxValue={maxValue}
          minValue={minValue}
          onSliderDrag={handleSliderDrag}
          onSliderKeyDown={handleSliderKeyDown}
          percentage={percentage}
          type={key}
          value={value} />
      );

      return slider;
    });
  }

  /**
   * Return JSX of hidden inputs
   * @private
   * @return {JSX.Element}
   */
  function renderHiddenInputs() {
    if(!name) {
      return [];
    }

    const isMultiValue = isMultiValue();
    const values = valueTransformer.getValueFromProps(props, isMultiValue);

    return getKeys().map((key) => {
      const value = values[key];
      const name = isMultiValue ? `${props.name}${captialize(key)}` : props.name;

      return (
        <input key={key} type="hidden" name={name} value={value} />
      );
    });
  }

   return (
     <div
       aria-disabled={disabled}
       ref={node}
       className={getComponentClassName()}
       onKeyDown={handleKeyDown}
       onKeyUp={handleKeyUp}
       onMouseDown={handleMouseDown}
       onTouchStart={handleTouchStart}>

       <Label classNames={classNames} formatLabel={formatLabel} type="min">
         {minValue}
       </Label>

       <Track
         classNames={classNames}
         draggableTrack={draggableTrack}
         ref={el => trackNode.current = el}
         onTrackDrag={handleTrackDrag}
         onTrackMouseDown={handleTrackMouseDown}
         percentages={
           valueTransformer.getPercentagesFromValues(
             valueTransformer.getValueFromProps(props, isMultiValue()),
             minValue,
             maxValue
           )
         }
       >

         {renderSliders()}
       </Track>

       <Label classNames={classNames} formatLabel={formatLabel} type="max">
         {maxValue}
       </Label>

       {renderHiddenInputs()}
     </div>
   );
}
