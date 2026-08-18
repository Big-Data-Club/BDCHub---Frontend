export type ChemicalState = "liquid" | "solid" | "gas" | "aqueous" | "indicator";

export interface IndicatorRange {
  minPh: number;
  maxPh: number;
  color: string; // RGBA color string
}

export interface Substance {
  id: string;
  name: string;
  formula: string;
  state: ChemicalState;
  concentrationM?: number; // Molarity (mol/L)
  densityGPerMl?: number;
  initialPh?: number;
  ka?: number; // Acid dissociation constant for weak acids
  kb?: number; // Base dissociation constant for weak bases
  ksp?: number; // Solubility product constant for precipitates
  molarMass?: number; // g/mol
  color: string; // Default RGBA solution color
  indicatorRanges?: IndicatorRange[];
}

export type ApparatusType =
  | "burette"
  | "erlenmeyer_flask"
  | "beaker"
  | "test_tube"
  | "dropper"
  | "graduated_cylinder"
  | "bunsen_burner"
  | "ph_meter"
  | "thermometer"
  | "electronic_balance";

export interface EquipmentItem {
  id: string;
  type: ApparatusType;
  label?: string;
  capacityMl?: number;
  initialVolumeMl?: number;
  filledSubstanceId?: string;
  x: number; // 2.5D Bench Coordinate X
  y: number; // 2.5D Bench Coordinate Y
  dripRateDropsPerSec?: number;
  isHeating?: boolean;
}

export interface ReactionReactant {
  substanceId: string;
  coeff: number;
}

export interface ReactionProduct {
  substanceId: string;
  coeff: number;
}

export type ReactionType =
  | "acid_base"
  | "precipitation"
  | "gas_evolution"
  | "redox"
  | "complexation";

export interface ReactionRule {
  id: string;
  equation: string;
  type: ReactionType;
  reactants: ReactionReactant[];
  products: ReactionProduct[];
  heatOfReactionKjPerMol?: number; // Negative = Exothermic, Positive = Endothermic
  precipitateSubstanceId?: string;
  gasSubstanceId?: string;
}

export interface EvaluationStep {
  id: string;
  stepName: string;
  targetEquipmentId: string;
  requiredSubstanceId?: string;
  minDrops?: number;
  targetPhMin?: number;
  targetPhMax?: number;
  targetVolumeDispensedMl?: number;
  toleranceMl?: number;
}

export interface ChemistryLabSpec {
  labType: "CHEMISTRY";
  title: string;
  description?: string;
  workspace: {
    viewMode: "2D" | "2.5D";
    benchWidth: number;
    benchHeight: number;
  };
  substances: Substance[];
  equipments: EquipmentItem[];
  reactions: ReactionRule[];
  evaluationCriteria: EvaluationStep[];
}

export interface VesselState {
  equipmentId: string;
  totalVolumeMl: number;
  temperatureC: number;
  ph: number;
  molesBySubstance: Record<string, number>;
  precipitateMassG: number;
  gasVolumeL: number;
  effervescenceRate: number; // Bubbles per second
  colorRgba: string;
}

export interface TitrationDataPoint {
  volumeAddedMl: number;
  ph: number;
  temperatureC: number;
  colorRgba: string;
}
