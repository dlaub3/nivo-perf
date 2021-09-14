import "./styles.css";
import React from "react";
import * as NivoSun from "@nivo/sunburst";
import * as faker from "faker";

interface Data {
  id: string;
  name: string;
}

interface NodeVal<T> {
  backgroundColor: string;
  textColor: string;
  id: string;
  label: string;
  data: T;
  size: number;
}

interface SunburstTree<T> {
  value: NodeVal<T>;
  children: Array<SunburstTree<T>>;
}

const makeNodeVal = <T extends Data>(x: T): NodeVal<T> => ({
  backgroundColor: "red",
  textColor: "white",
  id: x.id,
  label: x.name,
  data: x,
  size: 1
});

const getFakerData = () => ({
  id: faker.datatype.uuid(),
  name: faker.name.firstName()
});

const makeTree = <T extends Data>(
  value: NodeVal<T>,
  children: Array<SunburstTree<T>>
): SunburstTree<T> => ({
  value: { ...value, size: children.length > 1 ? 0 : 1 },
  children
});

const getChartData = <T extends Data>(
  value: T,
  depth: number,
  length: number
): SunburstTree<T> => {
  const data = Array(length).fill(null).map(getFakerData) as Array<T>;

  return makeTree(
    makeNodeVal(value),
    depth <= 0
      ? []
      : data.map((d, i) => getChartData(d, depth - 1, i % 3 === 0 ? 2 : 2))
  );
};

//const data = getChartData(getFakerData(), 3, 300);
//const data = getChartData(getFakerData(), 4, 8);
const data = getChartData(getFakerData(), 2, 5);

const NivoChart = () => {
  const [selected, setSelected] = React.useState<{
    node: NivoSun.ComputedDatum<SunburstTree<Data>> | undefined;
    parent: NivoSun.ComputedDatum<SunburstTree<Data>> | undefined;
  }>({
    node: undefined,
    parent: undefined
  });

  return (
    <NivoSun.Sunburst<SunburstTree<Data>>
      {...NivoSun.defaultProps}
      height={512}
      width={512}
      data={selected.node?.data || data}
      valueFormat={(n) => `${n}`}
      id={(node) => node.value.id}
      isInteractive={true}
      value={(node) => node.value.size}
      enableArcLabels={true}
      arcLabelsSkipAngle={10}
      cornerRadius={2}
      transitionMode={"endAngle"}
      animate={false}
      onClick={(node, e) => {
        if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
          setSelected((sel) => ({
            node: sel.parent,
            parent: sel.parent?.parent
          }));
        } else {
          if (node.data.children.length >= 1) {
            setSelected((sel) => {
              const parent = sel.node
                ? { ...sel.node, parent: sel.parent }
                : undefined;

              const data2 = {
                node: node,
                parent
              };

              return data2;
            });
          }
        }
      }}
    />
  );
};

export default function App() {
  return (
    <div className="App">
      <h1>Use SHIFT + Click to move up a level.</h1>

      <NivoChart />
    </div>
  );
}
