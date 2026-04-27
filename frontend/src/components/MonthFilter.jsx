import { FiCalendar } from 'react-icons/fi';

const MonthFilter = ({ selectedMonth, onMonthChange }) => {
  return (
    <div className="month-filter" id="month-filter">
      <FiCalendar className="filter-icon" />
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="month-input"
        id="month-input"
      />
    </div>
  );
};

export default MonthFilter;
