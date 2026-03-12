import Link from "next/link";

type Props = {
  name: string;
  slug: string;
  color?: string | null;
  /** Si es true, no renderiza como link */
  static?: boolean;
};

export function CategoryBadge({ name, slug, color, static: isStatic }: Props) {
  const style = color ? { backgroundColor: `${color}18`, color } : undefined;

  const className =
    "inline-block rounded-full px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80";

  const defaultClass = `${className} bg-orange-50 text-[#E86C2C] dark:bg-orange-900/20`;

  if (isStatic) {
    return (
      <span className={defaultClass} style={style}>
        {name}
      </span>
    );
  }

  return (
    <Link
      href={`/categoria/${slug}`}
      className={defaultClass}
      style={style}
    >
      {name}
    </Link>
  );
}
