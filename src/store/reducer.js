// src/store/reducer.js
import { ADD_DRONE, SET_SELECTED_DRONE } from "./actions";

const initialState = {
  features: [],
  selectedDrone: "",
};

export const droneReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_DRONE:
      return {
        ...state,
        features: [...state.features, action.payload], // ✅ always append
      };
    case SET_SELECTED_DRONE:
      return {
        ...state,
        selectedDrone: action.payload,
      };

    default:
      return state;
  }
};
