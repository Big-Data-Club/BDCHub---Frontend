// frontend/src/services/chemistryEngine.ts

import type {
  ChemistryLabSpec,
  EquipmentItem,
  IndicatorRange,
  ReactionRule,
  Substance,
  VesselState,
} from "@/types/chemistry";

/**
 * ChemistryEngine - Rigorous physical chemistry calculation core.
 *
 * Implements stoichiometry, acid-base equilibrium, pH calculations,
 * thermochemistry, precipitation, gas stoichiometry, and color blending.
 */
export class ChemistryEngine {
  private substances: Map<string, Substance> = new Map();
  private reactions: ReactionRule[] = [];
  private vesselStates: Map<string, VesselState> = new Map();

  constructor(spec?: ChemistryLabSpec) {
    if (spec) {
      this.initFromSpec(spec);
    }
  }

  public initFromSpec(spec: ChemistryLabSpec): void {
    this.substances.clear();
    this.reactions = spec.reactions || [];
    this.vesselStates.clear();

    for (const sub of spec.substances) {
      this.substances.set(sub.id, sub);
    }

    for (const eq of spec.equipments) {
      this.initVessel(eq);
    }
  }

  public initVessel(eq: EquipmentItem): void {
    const molesBySubstance: Record<string, number> = {};
    let totalVolMl = eq.initialVolumeMl || 0;
    let initialPh = 7.0;

    if (eq.filledSubstanceId && totalVolMl > 0) {
      const sub = this.substances.get(eq.filledSubstanceId);
      if (sub) {
        const conc = sub.concentrationM || 0.1;
        molesBySubstance[sub.id] = (conc * totalVolMl) / 1000.0;
        if (sub.initialPh !== undefined) {
          initialPh = sub.initialPh;
        }
      }
    }

    const state: VesselState = {
      equipmentId: eq.id,
      totalVolumeMl: totalVolMl,
      temperatureC: 25.0,
      ph: initialPh,
      molesBySubstance,
      precipitateMassG: 0,
      gasVolumeL: 0,
      effervescenceRate: 0,
      colorRgba: this.calculateVesselColor(molesBySubstance, initialPh, totalVolMl),
    };

    this.vesselStates.set(eq.id, state);
  }

  public getVesselState(equipmentId: string): VesselState | undefined {
    return this.vesselStates.get(equipmentId);
  }

  /**
   * Pour/drip liquid from source vessel or reagent into target vessel.
   */
  public addLiquidToVessel(
    targetEquipmentId: string,
    substanceId: string,
    volumeMl: number
  ): VesselState {
    let target = this.vesselStates.get(targetEquipmentId);
    if (!target) {
      target = {
        equipmentId: targetEquipmentId,
        totalVolumeMl: 0,
        temperatureC: 25.0,
        ph: 7.0,
        molesBySubstance: {},
        precipitateMassG: 0,
        gasVolumeL: 0,
        effervescenceRate: 0,
        colorRgba: "rgba(255, 255, 255, 0.0)",
      };
      this.vesselStates.set(targetEquipmentId, target);
    }

    const sub = this.substances.get(substanceId);
    if (!sub || volumeMl <= 0) return target;

    const conc = sub.concentrationM || 0.1;
    const addedMoles = (conc * volumeMl) / 1000.0;

    target.molesBySubstance[substanceId] =
      (target.molesBySubstance[substanceId] || 0) + addedMoles;
    target.totalVolumeMl += volumeMl;

    // Trigger stoichiometric chemical reactions
    this.evaluateReactions(target);

    // Calculate updated pH
    target.ph = this.calculatePh(target);

    // Calculate updated color
    target.colorRgba = this.calculateVesselColor(
      target.molesBySubstance,
      target.ph,
      target.totalVolumeMl
    );

    return target;
  }

  /**
   * Evaluates stoichiometric reactions & stoichiometry balancing.
   */
  private evaluateReactions(vessel: VesselState): void {
    for (const rxn of this.reactions) {
      let maxExtent = Infinity;

      for (const reactant of rxn.reactants) {
        const availableMoles = vessel.molesBySubstance[reactant.substanceId] || 0;
        if (availableMoles <= 0) {
          maxExtent = 0;
          break;
        }
        const extent = availableMoles / reactant.coeff;
        if (extent < maxExtent) {
          maxExtent = extent;
        }
      }

      if (maxExtent > 0 && maxExtent !== Infinity) {
        // Consume reactants
        for (const reactant of rxn.reactants) {
          vessel.molesBySubstance[reactant.substanceId] -= reactant.coeff * maxExtent;
        }
        // Produce products
        for (const prod of rxn.products) {
          vessel.molesBySubstance[prod.substanceId] =
            (vessel.molesBySubstance[prod.substanceId] || 0) + prod.coeff * maxExtent;
        }

        // Thermochemistry delta T
        if (rxn.heatOfReactionKjPerMol && vessel.totalVolumeMl > 0) {
          const qJoules = -rxn.heatOfReactionKjPerMol * 1000.0 * maxExtent;
          const massGrams = vessel.totalVolumeMl * 1.0; // Assume density = 1 g/mL
          const deltaT = qJoules / (massGrams * 4.184);
          vessel.temperatureC = Math.max(0, vessel.temperatureC + deltaT);
        }

        // Precipitation
        if (rxn.precipitateSubstanceId) {
          const precipSub = this.substances.get(rxn.precipitateSubstanceId);
          const molarMass = precipSub?.molarMass || 100.0;
          const newPrecipitateMoles = maxExtent;
          vessel.precipitateMassG += newPrecipitateMoles * molarMass;
        }

        // Gas evolution
        if (rxn.gasSubstanceId) {
          const gasMoles = maxExtent;
          vessel.gasVolumeL += gasMoles * 24.79;
          vessel.effervescenceRate = Math.min(20, maxExtent * 500);
        }
      }
    }
  }

  /**
   * Calculates pH based on acid-base concentrations.
   */
  private calculatePh(vessel: VesselState): number {
    if (vessel.totalVolumeMl <= 0) return 7.0;

    let hPlusMoles = 0;
    let ohMinusMoles = 0;

    for (const [subId, moles] of Object.entries(vessel.molesBySubstance)) {
      if (moles <= 0) continue;
      const sub = this.substances.get(subId);
      if (!sub) continue;

      if (sub.formula.includes("HCl") || sub.formula.includes("HNO3") || sub.formula.includes("H2SO4")) {
        const factor = sub.formula.includes("H2SO4") ? 2 : 1;
        hPlusMoles += moles * factor;
      } else if (sub.formula.includes("NaOH") || sub.formula.includes("KOH") || sub.formula.includes("Ca(OH)2")) {
        const factor = sub.formula.includes("Ca(OH)2") ? 2 : 1;
        ohMinusMoles += moles * factor;
      }
    }

    const volL = vessel.totalVolumeMl / 1000.0;
    const deltaH = hPlusMoles - ohMinusMoles;

    if (Math.abs(deltaH) < 1e-8) {
      return 7.0; // Equivalence point
    } else if (deltaH > 0) {
      const concH = deltaH / volL;
      return Math.max(0, -Math.log10(concH));
    } else {
      const concOH = -deltaH / volL;
      const pOH = -Math.log10(concOH);
      return Math.min(14, 14.0 - pOH);
    }
  }

  /**
   * Calculates dynamic solution color considering indicators & solute concentrations.
   */
  private calculateVesselColor(
    molesMap: Record<string, number>,
    ph: number,
    totalVolMl: number
  ): string {
    if (totalVolMl <= 0) return "rgba(255, 255, 255, 0.0)";

    let activeIndicatorColor: string | null = null;

    for (const [subId, moles] of Object.entries(molesMap)) {
      if (moles <= 0) continue;
      const sub = this.substances.get(subId);
      if (!sub || !sub.indicatorRanges) continue;

      for (const range of sub.indicatorRanges) {
        if (ph >= range.minPh && ph <= range.maxPh) {
          activeIndicatorColor = range.color;
          break;
        }
      }
    }

    if (activeIndicatorColor) {
      return activeIndicatorColor;
    }

    // Default solution color blending
    for (const [subId, moles] of Object.entries(molesMap)) {
      if (moles <= 0) continue;
      const sub = this.substances.get(subId);
      if (sub && sub.color && sub.color !== "rgba(255, 255, 255, 0.0)") {
        return sub.color;
      }
    }

    return "rgba(225, 245, 255, 0.35)"; // Default clear water tint
  }
}
