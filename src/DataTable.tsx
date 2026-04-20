import { useState } from "react";

interface ColumnaTabla<T> {
    clave: keyof T;
    etiqueta: string;
}

interface DataTableProps<T> {
    datos: T[];
    columnas: ColumnaTabla<T>[];
}

export default function DataTable<T extends { id: string }>({ datos, columnas }: DataTableProps<T>) {
    const [editando, setEditando] = useState<Partial<T> | null>(null);
    const [idEditando, setIdEditando] = useState<string | null>(null);

    const iniciarEdicion = (fila: T) => {
        setIdEditando(fila.id);
        setEditando({ ...fila });
    };

    const cancelarEdicion = () => {
        setIdEditando(null);
        setEditando(null);
    };

    return (
        <div>
            <h2>Tabla de Datos</h2>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        {columnas.map((col) => (
                            <th key={String(col.clave)} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}>
                                {col.etiqueta}
                            </th>
                        ))}
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map((fila) => (
                        <tr key={(fila as { id: string }).id}>
                            {columnas.map((col) => (
                                <td key={String(col.clave)} style={{ border: "1px solid #ccc", padding: "8px" }}>
                                    {String(fila[col.clave])}
                                </td>
                            ))}
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                {idEditando === fila.id ? (
                                    <button onClick={cancelarEdicion}>Cancelar</button>
                                ) : (
                                    <button onClick={() => iniciarEdicion(fila)}>Editar</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {editando && (
                <div style={{ marginTop: "16px", padding: "12px", border: "1px solid #999" }}>
                    <h3>Editando registro</h3>
                    <pre>{JSON.stringify(editando, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}