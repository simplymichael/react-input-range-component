export interface IClassNames {
  activeTrack: string,
  disabledInputRange: string,
  inputRange: string,
  labelContainer: string,
  maxLabel: string,
  minLabel: string,
  slider: string,
  sliderContainer: string,
  track: string,
  valueLabel: string
}

/**
 * Default CSS class names
 * @ignore
 * @type {InputRangeClassNames}
 */
const DEFAULT_CLASS_NAMES: IClassNames = {
  activeTrack: "input-range__track input-range__track--active",
  disabledInputRange: "input-range input-range--disabled",
  inputRange: "input-range",
  labelContainer: "input-range__label-container",
  maxLabel: "input-range__label input-range__label--max",
  minLabel: "input-range__label input-range__label--min",
  slider: "input-range__slider",
  sliderContainer: "input-range__slider-container",
  track: "input-range__track input-range__track--background",
  valueLabel: "input-range__label input-range__label--value",
};

export default DEFAULT_CLASS_NAMES;
