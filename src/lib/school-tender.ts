export interface SchoolTenderBOMLineDraft {
  id: string;
  item: string;
  quantity: string;
  unit: string;
  unitCost: string;
}

export interface SchoolTenderBOMLine {
  item: string;
  quantity: number;
  unit: string;
  unitCostMinor: number;
}

export function parseKesMinorUnits(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const amount = Number(value);
  const minorUnits = amount * 100;
  return Number.isSafeInteger(minorUnits) && minorUnits >= 0 ? minorUnits : undefined;
}

export function compileSchoolTenderBOM(
  drafts: SchoolTenderBOMLineDraft[],
  assetBuildCostMinor: number,
): SchoolTenderBOMLine[] {
  if (!Number.isSafeInteger(assetBuildCostMinor) || assetBuildCostMinor <= 0) {
    throw new Error('The asset build cost must be a positive amount in KES.');
  }
  if (!Array.isArray(drafts) || drafts.length < 1 || drafts.length > 100) {
    throw new Error('Add between 1 and 100 itemized Blueprint lines.');
  }

  let totalMinor = 0;
  const lines = drafts.map((draft, index) => {
    const item = draft.item.trim();
    const unit = draft.unit.trim();
    const quantity = Number(draft.quantity);
    const unitCostMinor = parseKesMinorUnits(draft.unitCost);
    if (!item || item.length > 240 || !unit || unit.length > 40) {
      throw new Error(`Blueprint line ${index + 1} needs a valid item and unit.`);
    }
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      quantity > 999_999_999.999 ||
      !Number.isInteger(quantity * 1000)
    ) {
      throw new Error(`Blueprint line ${index + 1} quantity must be positive with at most three decimal places.`);
    }
    if (unitCostMinor === undefined) {
      throw new Error(`Blueprint line ${index + 1} needs a valid KES unit cost.`);
    }
    const lineTotal = quantity * unitCostMinor;
    if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(totalMinor + lineTotal)) {
      throw new Error(`Blueprint line ${index + 1} exceeds the supported currency precision.`);
    }
    totalMinor += lineTotal;
    return { item, quantity, unit, unitCostMinor };
  });

  if (totalMinor !== assetBuildCostMinor) {
    throw new Error('The itemized Blueprint total must exactly match the asset build cost.');
  }
  return lines;
}
