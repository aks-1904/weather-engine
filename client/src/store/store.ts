import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

import authReducer from "./slices/authSlice";
import vesselsReducer from "./slices/vesselsSlice";
import voyagesReducer from "./slices/voyagesSlice";
import weatherReducer from "./slices/weatherSlice";
import alertsReducer from "./slices/alertSlice";
import costsReducer from "./slices/costsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  vessel: vesselsReducer,
  voyage: voyagesReducer,
  weather: weatherReducer,
  alerts: alertsReducer,
  costs: costsReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "vessels", "voyages", "alerts", "costs"], // weather can be temporary
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
