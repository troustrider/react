import { differenceInDays } from "date-fns";

export function calcularDiferenciaDias(fechaInicio: Date, fechaFin: Date): number {
    return Math.abs(differenceInDays(fechaFin, fechaInicio));
}
