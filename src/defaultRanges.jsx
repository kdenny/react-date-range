// @flow

export default {
  Today: {
    startDate: now => now,
    endDate: now => now
  },

  Yesterday: {
    startDate: now => now.add(-1, 'days'),
    endDate: now => now.add(-1, 'days')
  },

  'Last 7 Days': {
    startDate: now => now.add(-7, 'days'),
    endDate: now => now
  },

  'Last 30 Days': {
    startDate: now => now.add(-30, 'days'),
    endDate: now => now
  }
};
