import { useMemo, useReducer } from "react";

type MapInitialEntries<Key, Value> =
  | Iterable<readonly [Key, Value]>
  | (() => Iterable<readonly [Key, Value]>);

function useMap<Key, Value>(initialEntries?: MapInitialEntries<Key, Value>) {
  const [version, updateVersion] = useReducer((v) => v + 1, 0);
  const map = useMemo(() => {
    const entries =
      typeof initialEntries === "function" ? initialEntries() : initialEntries;
    return new Map(entries);
  }, []);

  const reactMap = useMemo(() => {
    const actualMap = {
      get(key: Key) {
        return map.get(key);
      },
      set(key: Key, value: Value) {
        updateVersion();
        map.set(key, value);
        return actualMap;
      },
      has(key: Key) {
        return map.has(key);
      },
      delete(key: Key) {
        updateVersion();
        return map.delete(key);
      },
      clear() {
        updateVersion();
        return map.clear();
      },
      get size() {
        return map.size;
      },
    };

    return actualMap;
  }, [map, version]);

  return reactMap;
}

function useSet<Value>(
  initialItems?: Iterable<Value> | (() => Iterable<Value>)
) {
  const [version, updateVersion] = useReducer((v) => v + 1, 0);
  const set = useMemo(() => {
    const entries =
      typeof initialItems === "function" ? initialItems() : initialItems;

    return new Set(entries);
  }, []);

  const reactSet = useMemo(() => {
    const actualSet = {
      has(value: Value) {
        return set.has(value);
      },
      add(value: Value) {
        set.add(value);
        updateVersion();
        return actualSet;
      },
      delete(value: Value) {
        updateVersion();
        return set.delete(value);
      },
      clear() {
        updateVersion();
        set.clear();
      },
      get size() {
        return set.size;
      },
    };

    return actualSet;
  }, [set, version]);

  return reactSet;
}

export function UseMapSetExample() {
  const set = useSet(() => [1, 2, 3]);
  const map = useMap(() => [
    [1, 2],
    [3, 4],
  ]);

  console.log(map, set);

  return (
    <div>
      <input type="text" />
    </div>
  );
}
