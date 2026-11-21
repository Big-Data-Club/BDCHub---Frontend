import type { PageAnalytics } from "../../types";
export function PageViewsChart({ data }: { data: PageAnalytics }) {
  const width = 360,
    height = 185,
    left = 28,
    bottom = 25,
    top = 10,
    max = Math.max(
      4,
      2 * Math.ceil(Math.max(...data.daily.map((day) => day.views)) / 2),
    );
  const point = (index: number, value: number) =>
    `${left + (index * (width - left - 10)) / Math.max(1, data.daily.length - 1)},${height - bottom - (value * (height - top - bottom)) / max}`;
  const line = (key: "views" | "unique_viewers") =>
    data.daily
      .map((day, index) => `${index ? "L" : "M"}${point(index, day[key])}`)
      .join(" ");
  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${data.views} lượt xem, ${data.unique_viewers} người xem trong ${data.days} ngày`}
        className="mt-5 w-full overflow-visible text-slate-400"
      >
        <title>Lượt xem theo ngày UTC</title>
        {[0, max / 2, max].map((value) => {
          const y = height - bottom - (value * (height - top - bottom)) / max;
          return (
            <g key={value}>
              <line
                x1={left}
                x2={width - 10}
                y1={y}
                y2={y}
                stroke="currentColor"
                opacity=".2"
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                fill="currentColor"
                fontSize="10"
              >
                {Math.round(value)}
              </text>
            </g>
          );
        })}
        <path d={line("views")} fill="none" stroke="#268be7" strokeWidth="2" />
        <path
          d={line("unique_viewers")}
          fill="none"
          stroke="#bf9548"
          strokeWidth="2"
        />
        {data.daily.map((day, index) => (
          <circle
            key={day.day}
            cx={Number(point(index, day.views).split(",")[0])}
            cy={Number(point(index, day.views).split(",")[1])}
            r="2"
            fill="#268be7"
          >
            <title>
              {day.day}: {day.views} lượt xem · {day.unique_viewers} người
            </title>
          </circle>
        ))}
        <text x={left} y={height - 3} fill="currentColor" fontSize="10">
          {data.daily[0]?.day.slice(5)}
        </text>
        <text
          x={width - 10}
          y={height - 3}
          textAnchor="end"
          fill="currentColor"
          fontSize="10"
        >
          {data.daily.at(-1)?.day.slice(5)}
        </text>
      </svg>
      <div className="mt-2 flex gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <i className="size-2 rounded-full bg-[#268be7]" />
          Lượt xem
        </span>
        <span className="flex items-center gap-2">
          <i className="size-2 rounded-full bg-[#bf9548]" />
          Người xem: {data.unique_viewers}
        </span>
      </div>
      <details className="mt-5 text-xs">
        <summary className="cursor-pointer text-slate-500">
          Xem dữ liệu từng ngày
        </summary>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Ngày (UTC)</th>
              <th>Lượt xem</th>
              <th>Người xem</th>
            </tr>
          </thead>
          <tbody>
            {data.daily.map((day) => (
              <tr
                key={day.day}
                className="border-t border-slate-100 dark:border-lms-border"
              >
                <td className="py-2">{day.day}</td>
                <td>{day.views}</td>
                <td>{day.unique_viewers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}
