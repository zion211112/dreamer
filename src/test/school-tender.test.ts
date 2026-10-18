import { compileSchoolTenderBOM, parseKesMinorUnits, type SchoolTenderBOMLineDraft } from '@/lib/school-tender';

const line = (overrides: Partial<SchoolTenderBOMLineDraft> = {}): SchoolTenderBOMLineDraft => ({
  id: 'line-1',
  item: 'Repairable classroom desk',
  quantity: '10',
  unit: 'each',
  unitCost: '500',
  ...overrides,
});

describe('school Tender Blueprint validation', () => {
  it('converts KES to safe integer minor units', () => {
    expect(parseKesMinorUnits('12.50')).toBe(1250);
    expect(parseKesMinorUnits('0.001')).toBeUndefined();
    expect(parseKesMinorUnits('')).toBeUndefined();
    expect(parseKesMinorUnits('Infinity')).toBeUndefined();
  });

  it('requires itemized quantities and costs to total exactly to the local quote', () => {
    expect(compileSchoolTenderBOM([line(), line({
      id: 'line-2',
      item: 'Fasteners',
      quantity: '1',
      unit: 'lot',
      unitCost: '0',
    })], 500000)).toEqual([
      { item: 'Repairable classroom desk', quantity: 10, unit: 'each', unitCostMinor: 50000 },
      { item: 'Fasteners', quantity: 1, unit: 'lot', unitCostMinor: 0 },
    ]);
    expect(() => compileSchoolTenderBOM([line()], 500001)).toThrow('must exactly match');
    expect(() => compileSchoolTenderBOM([], 500000)).toThrow('Add between 1 and 100');
  });

  it('rejects quantities outside the database precision', () => {
    expect(() => compileSchoolTenderBOM([line({ quantity: '0.0001' })], 5)).toThrow('at most three decimal places');
  });
});
