// src/components/Calendar.js
export default function Calendar({ events }) {
    const today = new Date();
    const days = [];
  
    const monthDays = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
  
    for (let i = 1; i <= monthDays; i++) {
      days.push(i);
    }
  
    return (
      <div className="cal-grid">
        {days.map((d) => (
          <div
            key={d}
            className={`cal-day ${d === today.getDate() ? "today" : ""}`}
          >
            {d}
          </div>
        ))}
      </div>
    );
  }