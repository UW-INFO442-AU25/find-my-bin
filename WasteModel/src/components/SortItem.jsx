export default function SortItem(item, cleanliness, shape) {

  if (item.skipConditions) {
    return item.defaultBin || "Landfill";
  }

  const rules = item.rules || [];

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const conditionType = Object.keys(rule.if)[0]; 
    const conditionValue = rule.if[conditionType]; 

    if (conditionType === "cleanliness" && cleanliness === conditionValue) {
      return rule.bin;
    }

    if (conditionType === "shape" && shape === conditionValue) {
      return rule.bin;
    }
  }

  return "Landfill";
}