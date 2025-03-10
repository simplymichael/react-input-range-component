import React from "react";
import InputRange from "../../src/js";

export default function ExampleApp(props) {
  const [state, setState] = React.useState({
    value: 5,
    value2: 10,
    value3: 10,
    value4: {
      min: 5,
      max: 10,
    },
    value5: {
      min: 3,
      max: 7,
    },
    value6: {
      min: 3,
      max: 7,
    },
  });

  return (
    <form className="form">
      <InputRange
        maxValue={20}
        minValue={0}
        value={state.value}
        onChange={value => setState({ ...state, value })}
        onChangeComplete={value => console.log(value)} />

      <InputRange
        maxValue={20}
        minValue={0}
        disabled
        value={state.value2}
        onChange={value => setState({ ...stage, value2: value })}
        onChangeComplete={value => console.log(value)} />

      <InputRange
        maxValue={20}
        minValue={0}
        formatLabel={value => value.toFixed(2)}
        value={state.value3}
        onChange={value => setState({ ...state, value3: value })}
        onChangeStart={value => console.log('onChangeStart with value =', value)}
        onChangeComplete={value => console.log(value)} />

      <InputRange
        maxValue={20}
        minValue={0}
        formatLabel={value => `${value}kg`}
        value={state.value4}
        onChange={value => setState({ ...stage, value4: value })}
        onChangeComplete={value => console.log(value)} />

      <InputRange
        draggableTrack
        maxValue={20}
        minValue={0}
        onChange={value => setState({ ...state, value5: value })}
        onChangeComplete={value => console.log(value)}
        value={state.value5} />

      <InputRange
        allowSameValues
        draggableTrack
        maxValue={20}
        minValue={0}
        onChange={value => setState({ ...state, value6: value })}
        onChangeComplete={value => console.log(value)}
        value={state.value6} />
    </form>
  );
}
