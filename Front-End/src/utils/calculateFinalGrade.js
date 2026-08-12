export function calculateFinalGrade(scores, components) {
  const incomplete = components.some((component) => {
    const value = scores?.[component.id];
    return (
      value === null ||
      value === undefined ||
      value === "" ||
      !Number.isFinite(Number(value)) ||
      Number(value) < 0 ||
      Number(value) > 100
    );
  });

  if (incomplete) return null;

  const result = components.reduce(
    (total, component) => total + Number(scores[component.id]) * (component.weight / 100),
    0,
  );

  return Number(result.toFixed(1));
}
