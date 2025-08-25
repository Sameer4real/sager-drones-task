// src/store/actions.js
export const ADD_DRONE = "ADD_DRONE";

export const addDrone = (feature) => ({
  type: ADD_DRONE,
  payload: feature,
});
