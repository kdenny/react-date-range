// @flow

import moment from 'moment';

export default function parseInput(input: moment, format, timeOfDay) {
  let output = null;

  if (typeof input === 'undefined' || input === null || !input || input === '') {
    output = moment()[timeOfDay]('day');
  } else if (typeof input === 'string') {
    output = moment(input, format)[timeOfDay]('day');
  } else if (typeof input === 'function') {
    output = parseInput(input(moment()[timeOfDay]('day')), format, timeOfDay);
  } else if (input.isValid()) {
    output = input[timeOfDay]('day').clone();
  }

  return output;
}
