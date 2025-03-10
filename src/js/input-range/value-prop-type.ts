import { isNumber, isObject } from "../utils";

interface IValueRange {
  minValue: number,
  maxValue: number
}

/**
 * @ignore
 * @param {Object} props
 * @return {?Error} Return Error if validation fails
 */
export default function valuePropType(props: IValueRange, propName: string) {
  const { maxValue, minValue } = props;
  const value = props[propName];

  if(!isNumber(value) && (!isObject(value) || !isNumber(value.min) || !isNumber(value.max))) {
    return new Error(`"${propName}" must be a number or a range object`);
  }

  if(isNumber(value) && (value < minValue || value > maxValue)) {
    return new Error(`"${propName}" must be in between "minValue" and "maxValue"`);
  }

  if(isObject(value) && (value.min < minValue || value.min > maxValue || value.max < minValue || value.max > maxValue)) {
    return new Error(`"${propName}" must be in between "minValue" and "maxValue"`);
  }
}
