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
