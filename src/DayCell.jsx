/* eslint-disable react/jsx-no-bind, jsx-a11y/no-static-element-interactions */
// @flow

import React, { Component, PropTypes } from 'react';
import moment from 'moment';

import inputStyles from './react-date-range.scss';

class DayCell extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      hover: false,
      active: false
    };
  }

  handleMouseEvent(event) {
    event.preventDefault();

    if (!this.props.isPassive) {
      const newState = {};

      switch (event.type) {
        case 'mouseenter':
          newState.hover = true;
          break;

        case 'mouseup':
        case 'mouseleave':
          newState.hover = false;
          newState.active = false;
          break;

        case 'mousedown':
          newState.active = true;
          break;

        default:
          break;
      }

      this.setState(newState);
    }
  }

  handleSelect(event) {
    event.preventDefault();

    if (!this.props.isPassive) {
      this.props.onSelect(this.props.dayMoment);
    }
  }

  handleHover() {
    this.props.onHover(this.props.dayMoment);
  }

  // there is probably a better way to do this using classNames, will table for now until code cleanup time since it's functional
  getClassNames() {
    const { isSelected, isInRange, isPassive, startEdge, endEdge, hoverEdge, isToday } = this.props;

    const selected = isSelected ? inputStyles['is-selected'] : '';
    const range = isInRange ? inputStyles['is-inRange'] : '';
    const passive = isPassive ? inputStyles['is-passive'] : '';
    let start;
    switch (startEdge) {
      case -1:
        start = inputStyles['day-start-edge-left'];
        break;
      case 1:
        start = inputStyles['day-start-edge-right'];
        break;
      default:
        start = '';
        break;
    }
    const end = endEdge === -1 ? inputStyles['day-end-edge'] : '';
    let hover;
    switch (hoverEdge) {
      case -1:
        hover = inputStyles['day-hover-border-left'];
        break;
      case 1:
        hover = inputStyles['day-hover-border-right'];
        break;
      default:
        hover = '';
        break;
    }
    const today = isToday ? inputStyles['is-today'] : '';
    return `${selected} ${range} ${passive} ${start} ${end} ${hover} ${today}`;
  }

  render() {
    const { dayMoment, startEdge, endEdge, hoverEdge, isInRange, removeLeftBorder } = this.props;
    const classes = this.getClassNames();

    let wrapperClasses;
    const dayStyle = inputStyles['rdr-Day'];
    const removeLeftBorderStyle = inputStyles['remove-left-border'];
    if (startEdge !== 0) {
      if (startEdge === -1) {
        wrapperClasses = `${dayStyle} ${inputStyles['day-start-edge-left']}`;
      } else if (startEdge === 1) {
        wrapperClasses = `${dayStyle} ${inputStyles['day-start-edge-right']}`;
      }
    } else if (endEdge === -1) {
      wrapperClasses = `${dayStyle} ${inputStyles['day-end-edge']}`;
    } else {
      switch (hoverEdge) {
        case -1:
          wrapperClasses = `${dayStyle} ${inputStyles['day-hover-border-left']}`;
          break;
        case 1:
          wrapperClasses = `${dayStyle} ${inputStyles['day-hover-border-right']}`;
          break;
        default:
          wrapperClasses = dayStyle;
          break;
      }
    }

    if (isInRange) {
      wrapperClasses = `${wrapperClasses} ${inputStyles['is-inRange']}`;
    }
    if (removeLeftBorder) {
      wrapperClasses = `${wrapperClasses} ${removeLeftBorderStyle}`;
    }

    return (
      <span
        className={wrapperClasses}
        onClick={this.handleSelect.bind(this)}
        onMouseEnter={this.handleHover.bind(this)}
      >
        <span
          onMouseEnter={this.handleMouseEvent.bind(this)}
          onMouseLeave={this.handleMouseEvent.bind(this)}
          onMouseDown={this.handleMouseEvent.bind(this)}
          onMouseUp={this.handleMouseEvent.bind(this)}
          className={classes}
        >
          { dayMoment.date() }
        </span>
      </span>
    );
  }
}

DayCell.defaultProps = {
  onlyClasses: false
};

DayCell.propTypes = {
  dayMoment: PropTypes.instanceOf(moment).isRequired,
  onSelect: PropTypes.func,
  onHover: PropTypes.func,
  isSelected: PropTypes.bool,
  isInRange: PropTypes.bool,
  isPassive: PropTypes.bool,
  startEdge: PropTypes.number,
  endEdge: PropTypes.number,
  hoverEdge: PropTypes.number,
  isToday: PropTypes.bool,
  removeLeftBorder: PropTypes.bool
};

export default DayCell;
