/**
 * Skeleton — loading placeholder rendered as a solid block.
 * Matches the surface background color to blend seamlessly with content areas.
 *
 * @param width - Width of the placeholder (CSS value or pixel number)
 * @param height - Height of the placeholder (CSS value or pixel number)
 */
export default function Skeleton({
  width,
  height,
}: {
  width: string | number;
  height: string | number;
}) {
  return (
    <div
      style={{
        width,
        height,
        background: "var(--surface)",
      }}
    />
  );
}
