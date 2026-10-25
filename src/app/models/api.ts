export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';
export type EstadoPrestamo = 'ACTIVO' | 'DEVUELTO' | 'ATRASADO' | 'CANCELADO';
export type EstadoDetallePrestamo = 'PRESTADO' | 'DEVUELTO' | 'PERDIDO';
export type EstadoReserva = 'PENDIENTE' | 'ATENDIDA' | 'CANCELADA' | 'EXPIRADA';
export type EstadoMulta = 'PENDIENTE' | 'PAGADA' | 'CANCELADA';

export interface Pagina<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  codigo: string;
  mensaje: string;
  campo?: string | null;
  path?: string | null;
}

export interface UsuarioSolicitud {
  nombre: string;
  apellido: string;
  cedula?: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}

export interface Usuario extends Required<Pick<UsuarioSolicitud, 'nombre' | 'apellido'>> {
  id: number;
  cedula: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  fechaRegistro: string;
  estado: EstadoUsuario;
}

export interface AutorSolicitud {
  nombre: string;
  apellido: string;
  nacionalidad: string | null;
}
export interface Autor extends AutorSolicitud {
  id: number;
}

export interface CategoriaSolicitud {
  nombre: string;
  descripcion: string | null;
}
export interface Categoria extends CategoriaSolicitud {
  id: number;
}
export interface EditorialSolicitud {
  nombre: string;
  pais: string | null;
}
export interface Editorial extends EditorialSolicitud {
  id: number;
}

export interface LibroResumen {
  id: number;
  titulo: string;
  isbn?: string | null;
}
export interface Libro extends LibroResumen {
  isbn: string | null;
  anioPublicacion: number | null;
  numeroPaginas: number | null;
  cantidadTotal: number;
  cantidadDisponible: number;
  editorial?: Editorial | null;
  autores: Autor[];
  categorias: Categoria[];
}
export interface LibroSolicitud {
  titulo: string;
  isbn: string | null;
  anioPublicacion: number | null;
  numeroPaginas: number | null;
  editorialId: number | null;
  autoresIds: number[];
  categoriasIds: number[];
  cantidadTotal?: number;
}

export interface DetallePrestamo {
  id: number;
  libro: LibroResumen;
  fechaDevolucion?: string | null;
  estado: EstadoDetallePrestamo;
}
export interface PrestamoResumen {
  id: number;
  usuarioId: number;
  fechaPrestamo: string;
  fechaVencimiento: string;
  estado: EstadoPrestamo;
  diasAtraso?: number;
}
export interface Prestamo extends PrestamoResumen {
  detalles: DetallePrestamo[];
  multas: Multa[];
}
export interface CrearPrestamoSolicitud {
  usuarioId: number;
  fechaVencimiento: string;
  librosIds: number[];
}

export interface Reserva {
  id: number;
  usuarioId: number;
  libro: LibroResumen;
  fechaReserva: string;
  fechaExpiracion?: string | null;
  estado: EstadoReserva;
}
export interface CrearReservaSolicitud {
  usuarioId: number;
  libroId: number;
}

export interface Multa {
  id: number;
  prestamoId: number;
  monto: number;
  motivo: string;
  fechaMulta: string;
  estado: EstadoMulta;
}
export interface CrearMultaSolicitud {
  prestamoId: number;
  monto: number;
  motivo: string;
}

export interface HistorialUsuario {
  prestamos: Prestamo[];
  reservas: Reserva[];
  multas: Multa[];
}
export interface UsuarioDetalle extends Usuario, HistorialUsuario {}
export interface LibroDetalle extends Libro {
  prestamosActivos: PrestamoResumen[];
  reservasPendientes: Reserva[];
}
export interface ResumenDashboard {
  libros: number;
  ejemplaresDisponibles: number;
  prestamosActivos: number;
  prestamosAtrasados: number;
  reservasPendientes: number;
  usuariosActivos: number;
  multasPendientes: number;
}
