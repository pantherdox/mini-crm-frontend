export default function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-gray-200 text-gray-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-xs ${colors[color] || colors.gray}`}
    >
      {children}
    </span>
  );
}
