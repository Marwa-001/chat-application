import clsx from "clsx";

export default function Avatar({
  src,
  name = "",
  size = "md",
  status,
  className,
}) {
  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-400",
    offline: "bg-gray-300",
  };

  return (
    <div className={clsx("relative shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={clsx(
            "rounded-full object-cover",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={clsx(
            "flex items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600",
            sizeClasses[size]
          )}
        >
          {initials || "?"}
        </div>
      )}
      {status && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
            statusColors[status] || statusColors.offline
          )}
        />
      )}
    </div>
  );
}