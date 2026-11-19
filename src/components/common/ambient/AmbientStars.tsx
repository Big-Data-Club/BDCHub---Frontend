import styles from "./ambient.module.css";

const positions = [
  [7, 14],
  [18, 65],
  [28, 28],
  [36, 83],
  [45, 12],
  [57, 44],
  [69, 18],
  [80, 70],
  [92, 32],
  [12, 88],
  [52, 91],
  [89, 9],
  [4, 47],
  [33, 53],
  [63, 75],
  [76, 42],
  [95, 89],
  [48, 62],
];

export function AmbientStars() {
  return (
    <div className={styles.stars} data-starfield aria-hidden="true">
      {positions.map(([left, top], index) => (
        <i
          key={index}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${(index % 6) * -1.3}s`,
            animationDuration: `${6 + (index % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}
