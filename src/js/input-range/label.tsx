import { ReactNode } from "react";
import type { IClassNames } from "./default-class-names";

export type FormatLabelFn = (children: ReactNode, type: string) => string;

interface ILabel {
  children: ReactNode,
  classNames: IClassNames,
  formatLabel: FormatLabelFn,
  type: string,
};

/**
 * @ignore
 * @param {Object} props
 * @param {InputRangeClassNames} props.classNames
 * @param {Function} props.formatLabel
 * @param {string} props.type
 */
export default function Label(props: ILabel) {
  const { type, formatLabel, classNames, children } = props;

  const labelValue = formatLabel ? formatLabel(children, type) : children;

  return (
    <span className={classNames[`${type}Label`]}>
      <span className={classNames.labelContainer}>
        {labelValue}
      </span>
    </span>
  );
}
