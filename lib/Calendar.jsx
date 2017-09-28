/* eslint-disable react/no-array-index-key, react/jsx-no-bind */
// @flow

import React, { Component, PropTypes } from 'react';
import type {Moment} from 'moment';
import moment from 'moment';
import classNames from 'classnames';

import parseInput from './utils/parseInput';
import DayCell from './DayCell';
import LangDic from './LangDic';
import inputStyles from './react-date-range.scss';
import pffStyles from '../../../../../index.scss';

type Range = {
  range: {
    startDate: Moment,
    endDate: Moment,
    hoverDate: Moment,
  };
};

type Props = {
  showMonthArrow: boolean,
  showDoubleMonthArrow: boolean,
  disableDaysBeforeToday: boolean,
  lang: string,
  sets: string,
  range: Range,
  minDate: Moment | string,
  maxDate: Moment | string,
  date: Moment | string,
  format: string,
  firstDayOfWeek: number | string,
  oldRange: Range,
  onChange: () => void,
  onHover: () => void,
  onInit: () => void,
  link: {
    startDate: Moment,
    endDate: Moment,
  } | boolean,
  linkCB: () => void,
  onlyClasses: boolean,
  specialDays: [Moment],
  shownDate: Moment,
  locale: string,
  offset: number
};

type State = {
  date: Moment,
  shownDate: Moment,
  firstDayOfWeek: Moment,
};

// only for rendering inRange styles
function checkRange(dayMoment: Moment, range: Range) {
  if (range.endDate) {
    if (dayMoment.isBetween(range.startDate, range.endDate)) {
      return true;
    } else if (dayMoment.isBetween(range.endDate, range.startDate)) {
      return true;
    } else if (range.hoverDate && range.endDate.isSame(range.startDate, 'day')) {
      // case 1: start is before hover
      if (range.hoverDate.diff(dayMoment, 'days') > 0 &&
          dayMoment.diff(range.endDate, 'days') > 0) {
        return true;
      // case 2: hover is before start
      } else if (dayMoment.diff(range.hoverDate, 'days') > 0 &&
                range.endDate.diff(dayMoment, 'days') >= 0) {
        return true;
      }
    }
  }
  return false;
}

// something funky with isSame day calculations, so for now use hours diff - refactor later
function checkStartEdge(dayMoment: Moment, range: Range) {
  if (dayMoment.startOf('day').isSame(range.startDate.startOf('day'))) {
    // case: haven't officially selected end date
    if (range.hoverDate && (!range.endDate || range.endDate.isSame(range.startDate, 'day'))) {
      const hoursDiff = range.hoverDate.diff(dayMoment, 'hours');
      // case 1: start is to left of hover - render right border
      if (hoursDiff > 23) {
        return 1;
      // case 2: start is to right of hover
      } else if (hoursDiff < 23) {
        return -1;
      }
      return 0;
    }
    return 1;
  }
  return 0;
}

function checkEndEdge(dayMoment: Moment, range: Range) {
  if (dayMoment.endOf('day').isSame(range.endDate.endOf('day')) &&
    !(range.endDate.isSame(range.startDate, 'day'))) {
    return -1;
  }
  return 0;
}

function checkHoverEdge(dayMoment: Moment, range: Range) {
  if (range.hoverDate && dayMoment.endOf('day').isSame(range.hoverDate.endOf('day'))) {
    if (!range.endDate || range.endDate.isSame(range.startDate, 'day')) {
      const hoursDiff = range.hoverDate.diff(range.startDate, 'hours');
      // case 1: initial click / hover same as start
      if (range.hoverDate.isSame(range.startDate, 'day')) {
        return 0;
      }
       // case 2: hover is after start, should render right border
      if (hoursDiff > 23) {
        return -1;
      // case 3: hover is before start, should render left border
      } else if (hoursDiff < 23) {
        return 1;
      }
    }
  }
  return 0;
}

function isOusideMinMax(dayMoment: Moment, minDate, maxDate, format: string) {
  return (
    (minDate && dayMoment.isBefore(parseInput(minDate, format, 'startOf'))) ||
    (maxDate && dayMoment.isAfter(parseInput(maxDate, format, 'endOf')))
  );
}

class Calendar extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);

    const { format, range, offset, firstDayOfWeek, locale, shownDate } = props;

    if (locale) {
      moment.locale(locale);
    }

    const date = parseInput(props.date, props.format, 'startOf');
    this.state = {
      date: parseInput(props.date, props.format, 'startOf'),
      shownDate: props.shownDate ? props.shownDate : ((props.shownDate || props.range) && (props.range.endDate || props.date)).clone().add(props.offset, 'months'),
      firstDayOfWeek: (props.firstDayOfWeek || moment.localeData().firstDayOfWeek()),
    };
  }

  componentDidMount() {
    const { onInit } = this.props;
    if (onInit) {
      onInit(this.state.date);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { range, offset } = nextProps;
    const oldRange = this.props.range;

    if (!oldRange.startDate.isSame(range.startDate, 'month') && range.startDate.isSame(this.state.shownDate, 'month')) {
      this.setState({ shownDate: range.startDate });
    } else if (!oldRange.startDate.isSame(range.startDate, 'month') && range.endDate.isSame(this.state.shownDate, 'month')) {
      this.setState({ shownDate: range.endDate });
    }
  }

  getShownDate() {
    const { link, offset } = this.props;

    const shownDate = (link) ? link.clone().add(offset, 'months') : this.state.shownDate;

    return shownDate;
  }

  handleSelect(newDate) {
    const { link, onChange } = this.props;

    if (onChange) {
      onChange(newDate, Calendar);
    }

    if (!link) {
      this.setState({ date: newDate });
    }
  }

  handleHover(newDate) {
    const { link, onHover } = this.props;

    if (onHover) {
      onHover(newDate, Calendar);
    }

    if (!link) {
      this.setState({ date: newDate });
    }
  }

  changeMonth(direction, event) {
    event.preventDefault();
    const { link, linkCB } = this.props;

    if (link && linkCB) {
      linkCB(direction);
    }

    const newMonth = this.state.shownDate.clone().add(direction, 'months');

    this.setState({
      shownDate: newMonth
    });
  }

  renderMonthAndYear() {
    const shownDate = this.getShownDate();
    let month = moment.months(shownDate.month());
    const year = shownDate.year();
    const { lang, showMonthArrow, showDoubleMonthArrow, styles } = this.props;

    const monthLower = month.toLowerCase();
    month = (lang && LangDic[lang] && LangDic[lang][monthLower]) ? LangDic[lang][monthLower] : month;

    let wrapperClasses = inputStyles['rdr-MonthAndYear-innerWrapper'];
    if (styles.includes('first')) {
      wrapperClasses = `${wrapperClasses} ${inputStyles.first}`;
    }
    if (styles.includes('last')) {
      wrapperClasses = `${wrapperClasses} ${inputStyles.right}`;
    }
    if (styles.includes('remove-left-border')) {
      wrapperClasses = `${wrapperClasses} ${inputStyles['remove-left-border']}`;
    }

    const prevButtonClassNames = classNames(
      pffStyles['pn-icon'],
      pffStyles['pn-icon--white-left'],
      inputStyles['rdr-MonthAndYear-button'],
      inputStyles.prev
    );
    const prevDoubleButtonClassNames = classNames(
      pffStyles['pn-icon'],
      pffStyles['pn-icon--white-double-arrow-left'],
      inputStyles['rdr-MonthAndYear-button'],
      inputStyles.prev
    );
    const nextButtonClassNames = classNames(
      pffStyles['pn-icon'],
      pffStyles['pn-icon--white-right'],
      inputStyles['rdr-MonthAndYear-button'],
      inputStyles.next
    );
    const nextDoubleButtonClassNames = classNames(
      pffStyles['pn-icon'],
      pffStyles['pn-icon--white-double-arrow-right'],
      inputStyles['rdr-MonthAndYear-button'],
      inputStyles.next
    );

    return (
      <div className={wrapperClasses}>
        {
          showDoubleMonthArrow ?
            <button
              type="button"
              className={prevDoubleButtonClassNames}
              onClick={this.changeMonth.bind(this, -2)}
            /> : null
        }
        {
          showMonthArrow ?
            <button
              type="button"
              className={prevButtonClassNames}
              onClick={this.changeMonth.bind(this, -1)}
            /> : null
        }
        <span>
          <span className={inputStyles['rdr-MonthAndYear']}>{month} {year}</span>
        </span>
        {
          showDoubleMonthArrow ?
            <button
              type="button"
              className={nextDoubleButtonClassNames}
              onClick={this.changeMonth.bind(this, +2)}
            /> : null
        }
        {
          showMonthArrow ?
            <button
              type="button"
              className={nextButtonClassNames}
              onClick={this.changeMonth.bind(this, +1)}
            /> : null
        }
      </div>
    );
  }

  renderWeekdays() {
    const dow = this.state.firstDayOfWeek;
    const weekdays = [];
    const { lang, styles } = this.props;

    let weekdayClassName = inputStyles['rdr-WeekDay'];
    if (styles.includes('remove-left-border')) {
      weekdayClassName = `${weekdayClassName} ${inputStyles['remove-left-border']}`;
    }

    for (let i = dow; i < 7 + dow; i += 1) {
      let day = moment.weekdaysMin(i);
      const dayLower = day.toLowerCase().substring(0, 2);
      day = (lang && LangDic[lang] && LangDic[lang][dayLower]) ? LangDic[lang][dayLower] : day.substring(0, 1);
      weekdays.push(
        <span className={weekdayClassName} key={i + day}>{day}</span>
      );
    }

    return weekdays;
  }

  renderDays() {
    // TODO: Split this logic into smaller chunks

    const { range, minDate, maxDate, format, onlyClasses, disableDaysBeforeToday, specialDays, styles } = this.props;

    const shownDate = this.getShownDate();
    const { date, firstDayOfWeek } = this.state;
    const dateUnix = date.unix();

    const monthNumber = shownDate.month();
    const dayCount = shownDate.daysInMonth();
    const startOfMonth = shownDate.clone().startOf('month').isoWeekday();

    const lastMonth = shownDate.clone().month(monthNumber - 1);
    const lastMonthDayCount = lastMonth.daysInMonth();

    const nextMonth = shownDate.clone().month(monthNumber + 1);

    const days = [];

    // Previous month's days
    const diff = (Math.abs(firstDayOfWeek - (startOfMonth + 7)) % 7);
    for (let i = diff - 1; i >= 0; i -= 1) {
      const dayMoment = lastMonth.clone().date(lastMonthDayCount - i);
      days.push({ dayMoment, isPassive: true });
    }

    // Current month's days
    for (let i = 1; i <= dayCount; i += 1) {
      const dayMoment = shownDate.clone().date(i);
      // set days before today to isPassive
      const today = moment();
      if (disableDaysBeforeToday && Number(dayMoment.diff(today, 'days')) <= -1) {
        days.push({ dayMoment, isPassive: true });
      } else {
        days.push({ dayMoment });
      }
    }

    // Next month's days
    const remainingCells = 42 - days.length; // 42cells = 7days * 6rows
    for (let i = 1; i <= remainingCells; i += 1) {
      const dayMoment = nextMonth.clone().date(i);
      days.push({ dayMoment, isPassive: true });
    }

    // isToday calculation is a little wonky - technically yesterday registers as "today" so need to offset
    // possibly fix later if causes errors down the line

    const today = moment().startOf('day');
    return days.map((data, index) => {
      const { dayMoment, isPassive } = data;
      const isSelected = !range && (dayMoment.unix() === dateUnix);
      const isInRange = range && checkRange(dayMoment, range);
      const startEdge = range ? checkStartEdge(dayMoment, range) : 0;
      const endEdge = range ? checkEndEdge(dayMoment, range) : 0;
      const hoverEdge = range ? checkHoverEdge(dayMoment, range) : 0;
      const isEdge = startEdge !== 0 || endEdge !== 0;
      const isToday = today.diff(dayMoment, 'hours') > -47 && today.diff(dayMoment, 'hours') < 0;
      const isSunday = dayMoment.day() === 0;
      const isSpecialDay = specialDays && specialDays.some(specialDay => dayMoment.endOf('day').isSame(specialDay.date.endOf('day')));
      const isOutsideMinMax = isOusideMinMax(dayMoment, minDate, maxDate, format);

      return (
        <DayCell
          onSelect={this.handleSelect.bind(this)}
          onHover={this.handleHover.bind(this)}
          {...data}
          removeLeftBorder={styles.includes('remove-left-border')}
          startEdge={startEdge}
          endEdge={endEdge}
          hoverEdge={hoverEdge}
          isSelected={isSelected || isEdge}
          isInRange={isInRange}
          isSunday={isSunday}
          isSpecialDay={isSpecialDay}
          isToday={isToday}
          key={index}
          isPassive={isPassive || isOutsideMinMax}
          onlyClasses={onlyClasses}
        />
      );
    });
  }

  render() {
    const { styles } = this.props;

    let weekDaysClassNames = inputStyles['rdr-WeekDays'];
    let daysClassNames = inputStyles['rdr-Days'];
    if (styles.includes('first')) {
      weekDaysClassNames = `${weekDaysClassNames} ${inputStyles.first}`;
      daysClassNames = `${daysClassNames} ${inputStyles.first}`;
    }
    if (styles.includes('last')) {
      weekDaysClassNames = `${weekDaysClassNames} ${inputStyles.last}`;
      daysClassNames = `${daysClassNames} ${inputStyles.last}`;
    }
    if (styles.includes('remove-left-border')) {
      weekDaysClassNames = `${weekDaysClassNames} ${inputStyles['remove-left-border']}`;
      daysClassNames = `${daysClassNames} ${inputStyles['remove-left-border']}`;
    }

    return (
      <div className={inputStyles['rdr-Calendar']}>
        <div className={inputStyles['rdr-MonthAndYear']}>{ this.renderMonthAndYear() }</div>
        <div className={weekDaysClassNames}>{ this.renderWeekdays() }</div>
        <div className={daysClassNames}>{ this.renderDays() }</div>
      </div>
    );
  }
}

Calendar.defaultProps = {
  format: 'DD/MM/YYYY',
  showMonthArrow: true,
  showDoubleMonthArrow: true,
  disableDaysBeforeToday: false,
  onlyClasses: false,
  specialDays: [],
};

Calendar.propTypes = {
  showMonthArrow: PropTypes.bool,
  showDoubleMonthArrow: PropTypes.bool,
  disableDaysBeforeToday: PropTypes.bool,
  lang: PropTypes.string,
  sets: PropTypes.string,
  range: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    hoverDate: PropTypes.object
  }),
  minDate: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  maxDate: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  date: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.func]),
  format: PropTypes.string.isRequired,
  firstDayOfWeek: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  oldRange: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    hoverDate: PropTypes.object
  }),
  onChange: PropTypes.func,
  onHover: PropTypes.func,
  onInit: PropTypes.func,
  link: PropTypes.oneOfType([PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
  }), PropTypes.bool]),
  linkCB: PropTypes.func,
  onlyClasses: PropTypes.bool,
  specialDays: PropTypes.arrayOf(PropTypes.instanceOf(moment)),
  locale: PropTypes.string,
  shownDate: PropTypes.instanceOf(moment),
  styles: PropTypes.arrayOf(PropTypes.string),
  offset: PropTypes.number
};

export default Calendar;
