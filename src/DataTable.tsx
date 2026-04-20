import { useState } from "react";

interface ColumnaTabla<T> {
    clave: keyof T;
    etiqueta: string;
}

interface DataTableProps<T> {
    datos: T[];
    columnas: ColumnaTabla<T>[];
    onGuardar?: (datosActualizados: T[]) => void;
}

export default function DataTable<T extends { id: string }>({ datos, columnas, onGuardar }: DataTableProps<T>) {
    // Estado: copia local de los datos para poder modificarlos
    const [datosLocales, setDatosLocales] = useState<T[]>(datos);

    // Estado: fila en edición (Partial<T> porque el usuario puede estar a medio rellenar)
    const [editando, setEditando] = useState<Partial<T> | null>(null);
    const [idEditando, setIdEditando] = useState<string | null>(null);

    // Estado: ordenación
    const [columnaOrden, setColumnaOrden] = useState<keyof T | null>(null);
    const [ascendente, setAscendente] = useState<boolean>(true);

    const iniciarEdicion = (fila: T) => {
        setIdEditando(fila.id);
        setEditando({ ...fila });
    };

    const cancelarEdicion = () => {
        setIdEditando(null);
        setEditando(null);
    };

    // NUEVO: guarda los cambios editados en el array de datos local
    const guardarEdicion = () => {
        if (!editando || !idEditando) return;

        const nuevasDatos = datosLocales.map((fila) =>
            fila.id === idEditando ? { ...fila, ...editando } : fila
        );

        setDatosLocales(nuevasDatos);
        setIdEditando(null);
        setEditando(null);

        if (onGuardar) {
            onGuardar(nuevasDatos);
        }
    };

    // NUEVO: actualiza un campo concreto del objeto en edición
    const actualizarCampo = (clave: keyof T, valor: string) => {
        if (!editando) return;
        setEditando({ ...editando, [clave]: valor });
    };

    const manejarOrden = (clave: keyof T) => {
        if (columnaOrden === clave) {
            setAscendente(!ascendente);
        } else {
            setColumnaOrden(clave);
            setAscendente(true);
        }
    };

    const datosOrdenados = [...datosLocales].sort((a, b) => {
        if (columnaOrden === null) return 0;

        const valorA = String(a[columnaOrden]);
        const valorB = String(b[columnaOrden]);

        if (valorA < valorB) return ascendente ? -1 : 1;
        if (valorA > valorB) return ascendente ? 1 : -1;
        return 0;
    });

    return (
        <div>
            <h2>Tabla de Datos</h2>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        {columnas.map((col) => (
                            <th
                                key={String(col.clave)}
                                style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", cursor: "pointer" }}
                                onClick={() => manejarOrden(col.clave)}
                            >
                                {col.etiqueta} {columnaOrden === col.clave ? (ascendente ? "▲" : "▼") : ""}
                            </th>
                        ))}
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datosOrdenados.map((fila) => (
                        <tr key={fila.id}>
                            {columnas.map((col) => (
                                <td key={String(col.clave)} style={{ border: "1px solid #ccc", padding: "8px" }}>
                                    {idEditando === fila.id ? (
                                        <input
                                            type="text"
                                            value={String(editando?.[col.clave] ?? "")}
                                            onChange={(e) => actualizarCampo(col.clave, e.target.value)}
                                            style={{ width: "100%", padding: "4px", boxSizing: "border-box" }}
                                        />
                                    ) : (
                                        String(fila[col.clave])
                                    )}
                                </td>
                            ))}
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                {idEditando === fila.id ? (
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <button onClick={guardarEdicion}>Guardar</button>
                                        <button onClick={cancelarEdicion}>Cancelar</button>
                                    </div>
                                ) : (
                                    <button onClick={() => iniciarEdicion(fila)}>Editar</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
