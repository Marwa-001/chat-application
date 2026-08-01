import clsx from "clsx";

export default function Avatar({ src, name = "", size = "md", status, className, isGroup, members }) {
  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

    const INITIALS_PALETTE = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
];

function colorForName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return INITIALS_PALETTE[Math.abs(hash) % INITIALS_PALETTE.length];
}


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

  const { bg, text } = colorForName(name);

  if (isGroup && members?.length) {
    const sectorCount = Math.min(members.length, 4);
    return (
      <div className={clsx("relative shrink-0 overflow-hidden rounded-full grid",
        sectorCount === 2 && "grid-cols-2",
        sectorCount === 3 && "grid-cols-2 grid-rows-2",
        sectorCount === 4 && "grid-cols-2 grid-rows-2",
        sizeClasses[size], className)}>
        {members.slice(0, sectorCount).map((url, i) => (
          <div key={i} className={clsx("bg-gray-200", sectorCount === 3 && i === 0 && "row-span-2")}>
            {url && <img src={url} className="h-full w-full object-cover" />}
          </div>
        ))}
      </div>
    );
  }


  return (
    <>
    
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
        <div className={clsx("flex items-center justify-center rounded-full font-semibold", bg, text, sizeClasses[size])}>
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
    </>
  );
}