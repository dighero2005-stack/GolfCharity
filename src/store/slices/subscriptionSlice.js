import { createSlice } from '@reduxjs/toolkit';

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: { status: 'inactive', plan: '' },
  reducers: {
    setSubscription(state, action) {
      state.status = action.payload.status ?? 'inactive';
      state.plan = action.payload.plan ?? '';
    },
    clearSubscription(state) {
      state.status = 'inactive';
      state.plan = '';
    },
  },
});

export const { setSubscription, clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

