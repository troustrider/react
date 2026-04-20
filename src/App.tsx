import DataTable from "./DataTable";
import type { Estudiante } from "./models";
import { calcularDiferenciaDias } from "./utils/fecha-utils";

const estudiantes: Estudiante[] = [
  { id: "EST-001", nombreCompleto: "María García", email: "maria@uni.es", fechaIngreso: new Date("2024-09-01"), carrera: "Informática" },
  { id: "EST-002", nombreCompleto: "Carlos López", email: "carlos@uni.es", fechaIngreso: new Date("2023-09-01"), carrera: "Matemáticas" },
  { id: "EST-003", nombreCompleto: "Ana Martín", email: "ana@uni.es", fechaIngreso: new Date("2025-01-15"), carrera: "Física" },
];

const columnas = [
  { clave: "id" as const, etiqueta: "ID" },
  { clave: "nombreCompleto" as const, etiqueta: "Nombre" },
  { clave: "email" as const, etiqueta: "Email" },
  { clave: "carrera" as const, etiqueta: "Carrera" },
];

function App() {
  const diasDesdeIngreso = calcularDiferenciaDias(estudiantes[0].fechaIngreso, new Date());

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h1>Sistema de Gestión Universitaria</h1>
      <p>Días desde el ingreso de {estudiantes[0].nombreCompleto}: {diasDesdeIngreso}</p>
      <DataTable<Estudiante> datos={estudiantes} columnas={columnas} />
    </div>
  );
}

export default App;