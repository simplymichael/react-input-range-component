interface IPoint {
  x: number,
  y: number
}

/**
 * Calculate the distance between pointA and pointB
 * @ignore
 * @param {Point} pointA
 * @param {Point} pointB
 * @return {number} Distance
 */
export default function distanceTo(pointA: IPoint, pointB: IPoint) {
  const xDiff = (pointB.x - pointA.x) ** 2;
  const yDiff = (pointB.y - pointA.y) ** 2;

  return Math.sqrt(xDiff + yDiff);
}
