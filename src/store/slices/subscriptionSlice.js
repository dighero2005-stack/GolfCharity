import { createSlice } from '@reduxjs/toolkit';

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: { status: 'inactive', plan: '', renewal_date: null },
  reducers: {
    setSubscription(state, action) {
      state.status = action.payload.status ?? 'inactive';
      state.plan = action.payload.plan ?? '';
      state.renewal_date = action.payload.renewal_date ?? null;
    },
    clearSubscription(state) {
      state.status = 'inactive';
      state.plan = '';
      state.renewal_date = null;
    },
  },
});

export const { setSubscription, clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

