// src/store/reducer.js
import { ADD_DRONE } from "./actions";

const initialState = {
  features: [],
};

export const droneReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_DRONE:
      return {
        ...state,
        features: [...state.features, action.payload], // ✅ always append
      };

    default:
      return state;
  }
};
