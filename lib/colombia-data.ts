export interface ColombiaDepartment {
  name: string
  capital: string
  municipalities: string[]
}

export const COLOMBIA_DEPARTMENTS: Record<string, string[]> = {
  'Amazonas': ['Leticia', 'Puerto Nariño'],
  'Antioquia': [
    'Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Rionegro', 'Turbo', 'Caucasia', 'Chigorodó', 'Sabaneta', 'Caldas', 'Copacabana', 'La Ceja', 'Marinilla', 'Santa Rosa de Osos', 'Yarumal'
  ],
  'Arauca': ['Arauca', 'Arauquita', 'Saravena', 'Tame', 'Fortul'],
  'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Baranoa', 'Puerto Colombia', 'Galapa'],
  'Bogotá D.C.': [
    'Bogotá D.C.', 'Usaquén', 'Chapinero', 'Santa Fe', 'San Cristóbal', 'Usme', 'Tunjuelito', 'Bosa', 'Kennedy', 'Fontibón', 'Engativá', 'Suba', 'Barrios Unidos', 'Teusaquillo', 'Los Mártires', 'Antonio Nariño', 'Puente Aranda', 'La Candelaria', 'Rafael Uribe Uribe', 'Ciudad Bolívar', 'Sumapaz'
  ],
  'Bolívar': ['Cartagena', 'Magangué', 'El Carmen de Bolívar', 'Turbaco', 'Arjona', 'Mompox'],
  'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Puerto Boyacá', 'Paipa', 'Moniquirá'],
  'Caldas': ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Anserma', 'Riosucio'],
  'Caquetá': ['Florencia', 'San Vicente del Caguán', 'Cartagena del Chairá', 'Puerto Rico'],
  'Casanare': ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo'],
  'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía', 'Bolívar', 'Piendamó'],
  'Cesar': ['Valledupar', 'Aguachica', 'Agustín Codazzi', 'Bosconia', 'Curumaní'],
  'Chocó': ['Quibdó', 'Istmina', 'Condoto', 'Tadó', 'Acandí', 'Bahía Solano'],
  'Córdoba': ['Montería', 'Lorica', 'Cereté', 'Sahagún', 'Montelíbano', 'Tierralta', 'Ciénaga de Oro'],
  'Cundinamarca': [
    'Soacha', 'Facatativá', 'Girardot', 'Zipaquirá', 'Chía', 'Mosquera', 'Madrid', 'Funza', 'Fusagasugá', 'Cajicá', 'Cota', 'Ubaté', 'Sopó', 'Tocancipá'
  ],
  'Guainía': ['Inírida', 'Barranco Minas'],
  'Guaviare': ['San José del Guaviare', 'Calamar', 'El Retorno'],
  'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre'],
  'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'Fonseca', 'San Juan del Cesar'],
  'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación', 'Plato', 'El Banco', 'Aracataca'],
  'Meta': ['Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín'],
  'Nariño': ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'Samaniego', 'La Unión'],
  'Norte de Santander': ['Cúcuta', 'Ocaña', 'Villa del Rosario', 'Los Patios', 'Pamplona', 'Tibú'],
  'Putumayo': ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'Villagarzón'],
  'Quindío': ['Armenia', 'Calarca', 'Montenegro', 'Quimbaya', 'La Tebaida', 'Circasia'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Belén de Umbría'],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Socorro', 'Barbosa'],
  'Sucre': ['Sincelejo', 'Corozal', 'San Marcos', 'San Onofre', 'Tolú', 'Sampués'],
  'Tolima': ['Ibagué', 'Espinal', 'Melgar', 'Chaparral', 'Líbano', 'Mariquita', 'Honda'],
  'Valle del Cauca': [
    'Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Cartago', 'Buga', 'Jamundí', 'Yumbo', 'Candelaria', 'Pradera', 'Florida', 'Sevilla', 'Zarzal'
  ],
  'Vaupés': ['Mitú', 'Carurú', 'Taraira'],
  'Vichada': ['Puerto Carreño', 'La Primavera', 'Santa Rosalía', 'Cumaribo'],
}

export const COMMON_ACADEMIC_TITLES = [
  'Licenciatura en Educación Infantil / Preescolar',
  'Licenciatura en Educación Básica Primaria',
  'Licenciatura en Matemáticas',
  'Licenciatura en Ciencias Naturales y Educación Ambiental',
  'Licenciatura en Física',
  'Licenciatura en Química',
  'Licenciatura en Biología',
  'Licenciatura en Ciencias Sociales',
  'Licenciatura en Historia',
  'Licenciatura en Filosofía',
  'Licenciatura en Humanidades y Lengua Castellana',
  'Licenciatura en Lenguas Extranjeras (Inglés - Francés)',
  'Licenciatura en Educación Física, Recreación y Deporte',
  'Licenciatura en Educación Artística / Artes Plásticas / Música',
  'Licenciatura en Tecnología e Informática',
  'Licenciatura en Pedagogía / Psicopedagogía',
  'Normalista Superior',
  'Ingeniería de Sistemas / Computación',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Ingeniería Electrónica',
  'Ingeniería Química',
  'Ingeniería Ambiental',
  'Psicología',
  'Trabajo Social',
  'Sociología',
  'Filosofía',
  'Historia',
  'Economía',
  'Administración de Empresas',
  'Contaduría Pública',
  'Derecho',
  'Comunicación Social y Periodismo',
  'Matemáticas Puras',
  'Física',
  'Química',
  'Biología',
  'Medicina Veterinaria / Zootecnia',
  'Arquitectura',
]
