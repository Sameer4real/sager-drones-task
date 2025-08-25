// src/store/store.js
import { createStore } from "redux";
import { droneReducer } from "./reducer";

export const store = createStore(
  droneReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() // for devtools
);
