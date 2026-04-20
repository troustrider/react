export type Estudiante = {
    readonly id: string;
    nombreCompleto: string;
    email: string;
    fechaIngreso: Date;
    carrera: string;
};

export type ColumnaTabla<T> = {
    clave: keyof T;
    etiqueta: string;
};