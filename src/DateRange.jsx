/* eslint-disable react/jsx-no-bind */
// @flow

import React, { Component, PropTypes } from 'react';
// import type Moment from 'moment';
import moment from 'moment-timezone';

import parseInput from './utils/parseInput';
import Calendar from './Calendar';
import PredefinedRanges from './PredefinedRanges';
import inputStyles from './react-date-range.scss';

// prelim work for Flow-approved typing
// type Props = {
//   format          : string,
//   firstDayOfWeek  : number,
//   calendars       : string | number,
//   startDate       : Moment,
//   endDate         : Moment,
//   hoverDate       : Moment,
//   minDate         : Moment,
//   maxDate         : Moment,
//   dateLimit       : PropTypes.func,
//   ranges          : PropTypes.object,
//   linkedCalendars : boolean,
//   twoStepChange   : boolean,
//   onInit          : PropTypes.func,
//   onChange        : PropTypes.func,
//   onHover         : PropTypes.func,
//   onlyClasses     : boolean,
//   specialDays     : PropTypes.array,
//   offsetPositive  : boolean,
//   rangedCalendars : boolean,
// };

// type State = {
//   range: {
//     startDate: Moment,
//     endDate: Moment,
//     hoverDate: Moment
//   },
//   link: boolean
// };

class DateRange extends Component {

  static orderRange(range) {
    const swapSelected = range.startDate.isAfter(range.endDate);

    if (!swapSelected) return range;

    return {
      startDate: range.endDate,
      endDate: range.startDate,
      hoverDate: range.hoverDate
    };
  }

  constructor(props, context) {
    super(props, context);

    const { format, linkedCalendars } = props;

    const startDate = parseInput(props.startDate, format, 'startOf');
    const endDate = parseInput(props.endDate, format, 'endOf');
    const hoverDate = parseInput(props.hoverDate, format, 'endOf');

    this.state = {
      range: { startDate, endDate, hoverDate },
      link: linkedCalendars && endDate,
    };

    this.step = 0;
  }

  componentDidMount() {
    const { onInit } = this.props;
    if (onInit) {
      onInit(this.state.range);
    }
  }

  componentWillReceiveProps(newProps) {
    // Whenever date props changes, update state with parsed variant
    if (newProps.startDate || newProps.endDate) {
      const format = newProps.format || this.props.format;
      const startDate = newProps.startDate && parseInput(newProps.startDate, format, 'startOf');
      const endDate = newProps.endDate && parseInput(newProps.endDate, format, 'endOf');
      const oldStartDate = this.props.startDate && parseInput(this.props.startDate, format, 'startOf');
      const oldEndDate = this.props.endDate && parseInput(this.props.endDate, format, 'endOf');

      if (!startDate.isSame(oldStartDate) || !endDate.isSame(oldEndDate)) {
        this.setRange({
          startDate: startDate || oldStartDate,
          endDate: endDate || oldEndDate
        });
      }
    }
  }

  setRange(range, source, triggerChange) {
    const { onChange } = this.props;
    const orderedRange = DateRange.orderRange(range);

    this.setState({ range: orderedRange });

    if (triggerChange && onChange) {
      onChange(range, source);
    }
  }

  handleSelect(date, source) {
    if (date.startDate && date.endDate) {
      this.step = 0;
      this.setRange(date, source, true);
    }

    const { startDate, endDate, hoverDate } = this.state.range;

    const range = {
      startDate,
      endDate,
      hoverDate
    };

    switch (this.step) {
      case 0:
        range.startDate = date;
        range.endDate = date;
        this.step = 1;
        break;

      case 1:
        range.endDate = date;
        this.step = 0;
        break;

      default:
        break;
    }

    const triggerChange = !this.props.twoStepChange || (this.step === 0 && this.props.twoStepChange);

    this.setRange(range, source, triggerChange);
  }

  handleHover(date, source) {
    const { startDate, endDate, hoverDate } = this.state.range;
    const range = {
      startDate,
      endDate,
      hoverDate
    };
    range.hoverDate = date;
    this.setRange(range, source, false);
  }

  handleLinkChange(direction) {
    const { link } = this.state;

    this.setState({
      link: link.clone().add(direction, 'months')
    });
  }

  render() {
    const { ranges, format, linkedCalendars, calendars, firstDayOfWeek, minDate, maxDate, onlyClasses, specialDays, lang, disableDaysBeforeToday, offsetPositive, shownDate, showMonthArrow, rangedCalendars } = this.props;
    const { range, link } = this.state;

    const yearsDiff = range.endDate.year() - range.startDate.year();
    const monthsDiff = range.endDate.month() - range.startDate.month();
    const diff = (yearsDiff * 12) + monthsDiff;
    const calendarsCount = Number(calendars) - 1;

    return (
      <div className={inputStyles['rdr-DateRange']}>
        { ranges && (
          <PredefinedRanges
            format={format}
            ranges={ranges}
            range={range}
            onSelect={this.handleSelect.bind(this)}
            onlyClasses={onlyClasses}
          />
        )}

        {(() => {
          const renderedCalendars = [];
          const method = offsetPositive ? 'unshift' : 'push';
          for (let i = calendarsCount; i >= 0; i -= 1) {
            const offset = offsetPositive ? i : -i;
            const realDiff = offsetPositive ? diff : -diff;
            const realOffset = (rangedCalendars && i === calendarsCount && diff !== 0) ? realDiff : offset;

            const styles = [];
            if (i === calendarsCount) {
              styles.push('first');
            } if (i === 0) {
              styles.push('last');
            } if (i < calendarsCount && calendarsCount > 0) {
              styles.push('remove-left-border');
            }
            renderedCalendars[method](
              <Calendar
                showMonthArrow={showMonthArrow}
                shownDate={shownDate}
                disableDaysBeforeToday={disableDaysBeforeToday}
                lang={lang}
                key={i}
                offset={realOffset}
                link={linkedCalendars && link}
                linkCB={this.handleLinkChange.bind(this)}
                range={range}
                format={format}
                firstDayOfWeek={firstDayOfWeek}
                minDate={minDate}
                maxDate={maxDate}
                onlyClasses={onlyClasses}
                specialDays={specialDays}
                styles={styles}
                onChange={this.handleSelect.bind(this)}
                onHover={this.handleHover.bind(this)}
              />
            );
          }
          return renderedCalendars;
        })()}
      </div>
    );
  }
}

DateRange.defaultProps = {
  linkedCalendars: false,
  format: 'DD/MM/YYYY',
  calendars: 2,
  onlyClasses: false,
  offsetPositive: false,
  specialDays: [],
  rangedCalendars: false,
  twoStepChange: false,
};

DateRange.propTypes = {
  format: PropTypes.string,
  firstDayOfWeek: PropTypes.number,
  calendars: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startDate: PropTypes.instanceOf(moment),
  endDate: PropTypes.instanceOf(moment),
  hoverDate: PropTypes.instanceOf(moment),
  minDate: PropTypes.instanceOf(moment),
  maxDate: PropTypes.instanceOf(moment),
  ranges: PropTypes.shape({
    name: PropTypes.objectOf(PropTypes.shape({
      range: PropTypes.shape({
        startDate: PropTypes.instanceOf(moment),
        endDate: PropTypes.instanceOf(moment)
      })
    }))
  }),
  linkedCalendars: PropTypes.bool,
  twoStepChange: PropTypes.bool,
  onInit: PropTypes.func,
  onChange: PropTypes.func,
  onlyClasses: PropTypes.bool,
  specialDays: PropTypes.arrayOf(PropTypes.instanceOf(moment)),
  offsetPositive: PropTypes.bool,
  rangedCalendars: PropTypes.bool,
  showMonthArrow: PropTypes.bool,
  shownDate: PropTypes.instanceOf(moment),
  lang: PropTypes.string,
  disableDaysBeforeToday: PropTypes.bool
};

export default DateRange;
