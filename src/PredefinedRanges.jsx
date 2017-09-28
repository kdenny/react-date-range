// @flow
/* eslint-disable react/jsx-no-bind, jsx-a11y/no-static-element-interactions */

import React, { Component, PropTypes } from 'react';
import moment from 'moment';

import parseInput from './utils/parseInput';
import inputStyles from './react-date-range.scss';

class PredefinedRanges extends Component {

  handleSelect(name, event) {
    event.preventDefault();

    const range = this.props.ranges[name];

    this.props.onSelect({
      startDate: parseInput(range.startDate, null, 'startOf'),
      endDate: parseInput(range.endDate, null, 'endOf'),
    }, PredefinedRanges);
  }

  renderRangeList() {
    return Object.keys(this.props.ranges).map((name) => {
      const range = this.props.ranges[name];
      const active = (
        parseInput(this.props.ranges[name].startDate, null, 'startOf').isSame(range.startDate) &&
        parseInput(this.props.ranges[name].endDate, null, 'endOf').isSame(range.endDate)
      );

      const item = inputStyles['rdr-PredefinedRangesItem'];
      const itemActive = inputStyles['rdr-PredefinedRangesItemActive'];
      let predefinedRangeClass = inputStyles['rdr-PredefinedRangesItem'];
      predefinedRangeClass = active ? `${item} ${itemActive}` : item;

      return (
        <a
          key={`range-${name}`}
          className={predefinedRangeClass}
          onClick={this.handleSelect.bind(this, name)}
        >
          {name}
        </a>
      );
    }).bind(this);
  }

  render() {
    return (
      <div className={inputStyles['rdr-PredefinedRanges']} >
        { this.renderRangeList() }
      </div>
    );
  }
}

PredefinedRanges.defaultProps = {
  onlyClasses: false
};

PredefinedRanges.propTypes = {
  ranges: PropTypes.shape({
    name: PropTypes.objectOf(PropTypes.shape({
      range: PropTypes.shape({
        startDate: PropTypes.instanceOf(moment),
        endDate: PropTypes.instanceOf(moment)
      })
    }))
  }).isRequired,
  onSelect: PropTypes.func
};

export default PredefinedRanges;
