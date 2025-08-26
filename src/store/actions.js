// src/store/actions.js
export const ADD_DRONE = "ADD_DRONE";
export const SET_SELECTED_DRONE = "SET_SELECTED_DRONE";

export const addDrone = (feature) => ({
  type: ADD_DRONE,
  payload: feature,
});

export const setSelectedDrone = (serial) => ({
  type: SET_SELECTED_DRONE,
  payload: serial,
});
