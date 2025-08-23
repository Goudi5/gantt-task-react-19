import addYears from "date-fns/addYears";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import addHours from "date-fns/addHours";
import subYears from "date-fns/subYears";
import subMonths from "date-fns/subMonths";
import subDays from "date-fns/subDays";
import subHours from "date-fns/subHours";
import subWeeks from "date-fns/subWeeks";
import startOfYear from "date-fns/startOfYear";
import startOfMonth from "date-fns/startOfMonth";
import startOfDay from "date-fns/startOfDay";
import startOfHour from "date-fns/startOfHour";
import startOfWeek from "date-fns/startOfWeek";
import startOfQuarter from "date-fns/startOfQuarter";

import { TaskOrEmpty, ViewMode } from "../types/public-types";
import { getDatesDiff } from "./get-dates-diff";

type DateHelperScales =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond";

const intlDTCache: { [key: string]: Intl.DateTimeFormat } = {};
export const getCachedDateTimeFormat = (
  locString: string | string[],
  opts: Intl.DateTimeFormatOptions = {}
): Intl.DateTimeFormat => {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }
  return dtf;
};

export const addToDate = (
  date: Date,
  quantity: number,
  scale: DateHelperScales
) => {
  const newDate = new Date(
    date.getFullYear() + (scale === "year" ? quantity : 0),
    date.getMonth() + (scale === "month" ? quantity : 0),
    date.getDate() + (scale === "day" ? quantity : 0),
    date.getHours() + (scale === "hour" ? quantity : 0),
    date.getMinutes() + (scale === "minute" ? quantity : 0),
    date.getSeconds() + (scale === "second" ? quantity : 0),
    date.getMilliseconds() + (scale === "millisecond" ? quantity : 0)
  );
  return newDate;
};

export const startOfDate = (date: Date, scale: DateHelperScales) => {
  const scores = [
    "millisecond",
    "second",
    "minute",
    "hour",
    "day",
    "month",
    "year",
  ];

  const shouldReset = (_scale: DateHelperScales) => {
    const maxScore = scores.indexOf(scale);
    return scores.indexOf(_scale) <= maxScore;
  };
  const newDate = new Date(
    date.getFullYear(),
    shouldReset("year") ? 0 : date.getMonth(),
    shouldReset("month") ? 1 : date.getDate(),
    shouldReset("day") ? 0 : date.getHours(),
    shouldReset("hour") ? 0 : date.getMinutes(),
    shouldReset("minute") ? 0 : date.getSeconds(),
    shouldReset("second") ? 0 : date.getMilliseconds()
  );
  return newDate;
};

export const ganttDateRange = (
  tasks: readonly TaskOrEmpty[],
  viewMode: ViewMode,
  preStepsCount: number
): [Date, Date, number] => {
  let minTaskDate: Date | null = null;
  let maxTaskDate: Date | null = null;
  for (const task of tasks) {
    if (task.type !== "empty") {
      if (!minTaskDate || task.start < minTaskDate) {
        minTaskDate = task.start;
      }

      if (!maxTaskDate || task.end > maxTaskDate) {
        maxTaskDate = task.end;
      }
    }
  }

  if (!minTaskDate || !maxTaskDate) {
    return [new Date(), new Date(), 2];
  }

  let newStartDate: Date | null = null;
  let newEndDate: Date | null = null;

  switch (viewMode) {
    case ViewMode.Year:
      newStartDate = subYears(minTaskDate, preStepsCount);
      newStartDate = startOfYear(newStartDate);
      newEndDate = addYears(maxTaskDate, 1);
      newEndDate = startOfYear(newEndDate);
      break;
    case ViewMode.QuarterYear:
      newStartDate = subMonths(minTaskDate, preStepsCount * 3);
      newStartDate = startOfQuarter(newStartDate);
      newEndDate = addMonths(maxTaskDate, 3);
      newEndDate = startOfQuarter(addMonths(newEndDate, 3));
      break;
    case ViewMode.Month:
      newStartDate = subMonths(minTaskDate, preStepsCount);
      newStartDate = startOfMonth(newStartDate);
      newEndDate = addYears(maxTaskDate, 1);
      newEndDate = startOfYear(newEndDate);
      break;
    case ViewMode.Week:
      newStartDate = startOfWeek(minTaskDate);
      newStartDate = subWeeks(newStartDate, preStepsCount);
      newEndDate = startOfDay(maxTaskDate);
      newEndDate = addMonths(newEndDate, 1.5);
      break;
    case ViewMode.TwoDays:
      newStartDate = startOfDay(minTaskDate);
      newStartDate = subDays(newStartDate, preStepsCount);
      newEndDate = startOfDay(maxTaskDate);
      newEndDate = addDays(newEndDate, 19);
      break;
    case ViewMode.Day:
      newStartDate = startOfDay(minTaskDate);
      newStartDate = subDays(newStartDate, preStepsCount);
      newEndDate = startOfDay(maxTaskDate);
      newEndDate = addDays(newEndDate, 30);
      break;
    case ViewMode.QuarterDay:
      newStartDate = startOfDay(minTaskDate);
      newStartDate = subHours(newStartDate, preStepsCount * 6);
      newEndDate = startOfDay(maxTaskDate);
      newEndDate = addHours(newEndDate, 66); // 24(1 day)*3 - 6
      break;
    case ViewMode.HalfDay:
      newStartDate = startOfDay(minTaskDate);
      newStartDate = subHours(newStartDate, preStepsCount * 12);
      newEndDate = startOfDay(maxTaskDate);
      newEndDate = addHours(newEndDate, 108); // 24(1 day)*5 - 12
      break;
    case ViewMode.Hour:
      newStartDate = startOfHour(minTaskDate);
      newStartDate = subHours(newStartDate, preStepsCount);
      newEndDate = startOfDay(maxTaskDate);
      newEndDate = addDays(newEndDate, 1);
      break;
  }

  return [
    newStartDate,
    minTaskDate,
    getDatesDiff(newEndDate, newStartDate, viewMode),
  ];
};

export const getWeekNumberISO8601 = (date: Date) => {
  const tmpDate = new Date(date.valueOf());
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);
  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + ((4 - tmpDate.getDay() + 7) % 7));
  }
  const weekNumber = (
    1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000)
  ).toString();

  if (weekNumber.length === 1) {
    return `0${weekNumber}`;
  } else {
    return weekNumber;
  }
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};
