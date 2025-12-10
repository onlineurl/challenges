import type { NewChallenge } from '../types';

type TemplateCategory = 'baby_shower' | 'wedding' | 'birthday_15' | 'birthday_18' | 'casual' | 'bachelor';

interface TemplateCollection {
    label: string;
    challenges: NewChallenge[];
}

const createChallenge = (title: string, desc: string, optional: string, difficulty: 'easy' | 'medium' | 'hard', points: number, time: number): NewChallenge => ({
    title,
    description: `${desc}\n\n(Opción B: ${optional})`,
    difficulty,
    points,
    time_limit: time,
    is_special: false
});

export const CHALLENGE_TEMPLATES: Record<TemplateCategory, TemplateCollection> = {
    baby_shower: {
        label: "👶 Baby Shower",
        challenges: [
            // FÁCILES
            createChallenge("Selfie con la Mamá", "Tómate una selfie con la futura mamá sonriendo", "Si no está disponible, con alguien vestido de rosa/azul", 'easy', 15, 450),
            createChallenge("Color del Bebé", "Sácate una foto señalando algo del color del bebé (azul/rosa/amarillo)", "Si no hay ese color, con algo blanco", 'easy', 15, 450),
            createChallenge("Abuelo/a Contento", "Sácate foto con un abuelo/a haciendo cara de felicidad", "Si no hay abuelos, con la persona mayor del evento", 'easy', 15, 450),
            createChallenge("Pulsera de la Suerte", "Ponte algo azul en la muñeca y sácale foto", "Si no tienes azul, usa una cinta o hilo", 'easy', 15, 450),
            createChallenge("Gestito de Bebé", "Haz el gesto de 'tan chiquito' con tus dedos y captura", "Haz la seña de silencio (shhh) como a un bebé", 'easy', 15, 450),
            // MEDIOS
            createChallenge("Papá Emocionado", "Sácate una selfie con el futuro papá mostrando emoción", "Si no está, con un familiar masculino cercano", 'medium', 25, 500),
            createChallenge("Invitado Más Joven", "Encuentra al invitado más joven y tómate una selfie con él/ella", "Si no hay niños, con alguien que parezca más joven", 'medium', 25, 500),
            createChallenge("Madrina/Padrino", "Sácate foto con la madrina o padrino del bebé", "Si no están, con alguien que será importante en la vida del bebé", 'medium', 25, 500),
            createChallenge("Letra del Nombre", "Forma la primera letra del nombre del bebé con tus manos", "Si no se sabe el nombre, forma la letra de tu inicial", 'medium', 25, 500),
            createChallenge("Mesa de Dulces", "Toma una foto creativa de los dulces de la mesa", "Si no hay dulces, de la comida más colorida", 'medium', 25, 500),
            // DIFÍCILES
            createChallenge("Foto con los 4 Abuelos", "Reúne a abuelos maternos y paternos para una foto histórica", "Si no están todos, con los abuelos que sí están", 'hard', 35, 600),
            createChallenge("Selfie Generacional", "Foto con tres generaciones: abuelo, padre/madre y tú", "Si falta una generación, con dos generaciones diferentes", 'hard', 35, 600),
            createChallenge("Foto Grupal Grande", "Toma una foto con al menos 10 invitados organizados", "Si no hay 10, con el mayor grupo posible", 'hard', 35, 600),
            createChallenge("Invitado de Otra Ciudad", "Encuentra a quien vino desde más lejos y sáquense una selfie", "Si todos son locales, con quien vino desde más lejos dentro de la ciudad", 'hard', 35, 600),
            createChallenge("Foto con la Partera/Doctor", "Si está, sácate una foto con el profesional médico", "Si no está, con alguien del área de salud presente", 'hard', 35, 600),
        ]
    },
    wedding: {
        label: "💒 Casamiento / Boda",
        challenges: [
            // FÁCILES
            createChallenge("Selfie con los Novios", "Tómate una selfie rápida con los recién casados", "Si están ocupados, sácales foto de lejos sonriendo", 'easy', 15, 450),
            createChallenge("Algo Viejo, Algo Nuevo", "Encuentra algo viejo y algo nuevo en la decoración", "Señala tu ropa vieja y algo nuevo del salón", 'easy', 15, 450),
            createChallenge("Suegro/a Sonriente", "Sácate foto con un suegro/a sonriendo ampliamente", "Si no están, con un familiar cercano de los novios", 'easy', 15, 450),
            createChallenge("Zapatos Elegantes", "Sácale foto a los zapatos más lindos que veas", "Pueden ser tus propios zapatos", 'easy', 15, 450),
            createChallenge("Brindis Reflejado", "Brinda frente a un espejo/ventana y captura el reflejo", "Brinda contra la cámara como si fuera espejo", 'easy', 15, 450),
            // MEDIOS
            createChallenge("Los Padrinos", "Sácate una foto con los padrinos de la boda", "Si no sabes quiénes son, con la pareja mejor vestida", 'medium', 25, 500),
            createChallenge("Pastel Nupcial", "Toma una foto del pastel antes de cortarlo", "Si ya lo cortaron, del pedazo más grande", 'medium', 25, 500),
            createChallenge("Familiares Reunidos", "Sácate foto con familiares que no ves hace años", "Con alguien que acabas de conocer hoy", 'medium', 25, 500),
            createChallenge("Anillos Brillantes", "Pídele a los novios que muestren sus anillos y captura", "Si no puedes, muestra tu propio anillo/dedo", 'medium', 25, 500),
            createChallenge("Invitado Mejor Vestido", "Sácate una selfie con la persona mejor vestida", "Con quien tenga el accesorio más llamativo", 'medium', 25, 500),
            // DIFÍCILES
            createChallenge("Foto con Todos", "Organiza y toma una foto con la mayor cantidad de gente posible", "Al menos 15 personas si no están todos", 'hard', 35, 600),
            createChallenge("Selfie con los 4 Padres", "Reúne a ambos padres de los novios", "Con los padres que estén disponibles", 'hard', 35, 600),
            createChallenge("Primer Baile", "Captura a los novios en su primer baile como esposos", "Si ya pasó, de ellos bailando en otro momento", 'hard', 35, 600),
            createChallenge("Foto desde las Alturas", "Encuentra un lugar alto para foto panorámica del salón", "Sube una silla (con cuidado) para mejor ángulo", 'hard', 35, 600),
            createChallenge("Selfie con el Fotógrafo", "Encuentra al fotógrafo profesional y sáquense una selfie", "Con alguien que esté tomando muchas fotos", 'hard', 35, 600),
        ]
    },
    birthday_15: {
        label: "🎂 Cumpleaños de 15",
        challenges: [
             // FÁCILES
            createChallenge("Selfie con la Quinceañera", "Tómate una selfie rápida con la cumpleañera", "Si está ocupada, sácale foto de lejos en su vestido", 'easy', 15, 450),
            createChallenge("Color del Vestido", "Encuentra a alguien con el mismo color que el vestido de la quinceañera", "Algo decorativo de ese color", 'easy', 15, 450),
            createChallenge("Damas de Honor", "Sácate foto con una dama de honor", "Con una amiga cercana de la cumpleañera", 'easy', 15, 450),
            createChallenge("Tacones Altos", "Sácale foto a los tacones más altos de la fiesta", "Los zapatos más incómodos que veas", 'easy', 15, 450),
            createChallenge("Detalle Decorativo", "Captura el detalle decorativo más bonito", "La decoración más original", 'easy', 15, 450),
            // MEDIOS
            createChallenge("Mejores Amigas", "Sácate una foto con el grupo de amigas más cercanas", "Con al menos 3 amigas de la quinceañera", 'medium', 25, 500),
            createChallenge("Pastel de 15", "Toma una foto del pastel con sus velas", "Si ya lo cortaron, de los pedazos servidos", 'medium', 25, 500),
            createChallenge("Padres Orgullosos", "Sácate foto con los padres de la quinceañera", "Con un familiar adulto responsable", 'medium', 25, 500),
            createChallenge("Última Muñeca", "Sácale foto a la última muñeca que recibe", "Si no hay muñeca, al regalo más tierno", 'medium', 25, 500),
            createChallenge("Invitado Más Pequeño", "Encuentra al invitado más joven y tómate una selfie", "Con alguien que actúe como niño", 'medium', 25, 500),
            // DIFÍCILES
            createChallenge("Foto con el Curso", "Reúne a compañeros del colegio para foto grupal", "Al menos 5 amigos del colegio", 'hard', 35, 600),
            createChallenge("Tres Generaciones", "Foto con abuela, mamá y quinceañera", "Con dos generaciones femeninas", 'hard', 35, 600),
            createChallenge("Vals con Papá", "Captura el vals de la quinceañera con su padre", "Si ya pasó, de ellos bailando en otro momento", 'hard', 35, 600),
            createChallenge("Foto Aérea", "Toma foto del salón desde un balcón o altura", "Desde una silla si no hay balcón", 'hard', 35, 600),
            createChallenge("Selfie con Músicos", "Sácate una foto con la banda o DJ", "Con quien controle la música", 'hard', 35, 600),
        ]
    },
    birthday_18: {
        label: "🍻 Cumpleaños de 18",
        challenges: [
            // FÁCILES
            createChallenge("Selfie con el Adulto", "Tómate una selfie con el nuevo adulto de 18", "Con su mejor amigo si está ocupado", 'easy', 15, 450),
            createChallenge("Color de la Fiesta", "Señala el color principal de la decoración", "Tu ropa de ese color", 'easy', 15, 450),
            createChallenge("Padres Felices", "Sácate foto con los padres del cumpleañero", "Con un familiar adulto presente", 'easy', 15, 450),
            createChallenge("Primera Bebida Legal", "Captura al cumpleañero con su primera copa como adulto", "Con su bebida favorita", 'easy', 15, 450),
            createChallenge("Número 18", "Encuentra el número 18 en la decoración", "Forma 18 con tus dedos", 'easy', 15, 450),
            // MEDIOS
            createChallenge("Amigos del Colegio", "Reúne a amigos del secundario para una foto", "Al menos 3 amigos cercanos", 'medium', 25, 500),
            createChallenge("Pastel de 18", "Toma una foto creativa del pastel", "Si es helado, antes de que se derrita", 'medium', 25, 500),
            createChallenge("Hermanos Unidos", "Sácate una foto con los hermanos del cumpleañero", "Con primos cercanos si no hay hermanos", 'medium', 25, 500),
            createChallenge("Invitado de Otra Ciudad", "Encuentra a quien viajó más para estar hoy", "Quien vino desde otro barrio lejano", 'medium', 25, 500),
            createChallenge("Foto de Bebé vs Adulto", "Trae una foto del cumpleañero de niño y compárala", "Describe cómo era de niño", 'medium', 25, 500),
            // DIFÍCILES
            createChallenge("Foto con Todos los Amigos", "Reúne a TODOS los amigos para foto grupal", "Al menos 10 amigos", 'hard', 35, 600),
            createChallenge("Abuelos Presentes", "Foto con los abuelos del cumpleañero", "Con los abuelos que estén", 'hard', 35, 600),
            createChallenge("Brindis Masivo", "Organiza un brindis con mínimo 10 personas", "Con 5 personas si no hay más", 'hard', 35, 600),
            createChallenge("Vista Panorámica", "Toma foto de la fiesta desde un lugar alto", "Sube a algo seguro para mejor ángulo", 'hard', 35, 600),
            createChallenge("Selfie con el Chef", "Sácate foto con quien preparó la comida", "Con quien trajo la comida más rica", 'hard', 35, 600),
        ]
    },
    casual: {
        label: "🎉 Juntada / Casual",
        challenges: [
            // FÁCILES
            createChallenge("Selfie con el Anfitrión", "Tómate una selfie con quien organizó la juntada", "Con quien vive en la casa", 'easy', 15, 450),
            createChallenge("Color Grupal", "Encuentra a 2 personas con el mismo color de ropa", "Tu ropa con ese color", 'easy', 15, 450),
            createChallenge("Amigo de Siempre", "Sácate foto con alguien que conozcas hace años", "Con quien no veías hace mucho", 'easy', 15, 450),
            createChallenge("Comida Tentadora", "Sácale foto al plato que se ve más delicioso", "La comida que más te gusta", 'easy', 15, 450),
            createChallenge("Selfie en el Sofá", "Toma una selfie grupal en el sofá principal", "En las sillas/cojines disponibles", 'easy', 15, 450),
            // MEDIOS
            createChallenge("Amigos de la Infancia", "Reúne a amigos que se conozcan desde niños", "Con quienes se conozcan hace más de 5 años", 'medium', 25, 500),
            createChallenge("Mesa de Picada", "Captura la mesa de comida antes de comer", "Después de comer, lo que quedó", 'medium', 25, 500),
            createChallenge("Parejas Felices", "Sácate foto con al menos dos parejas", "Con personas que parezcan pareja", 'medium', 25, 500),
            createChallenge("Juego en Acción", "Captura un momento intenso del juego que jueguen", "Gente jugando al teléfono despreocupado", 'medium', 25, 500),
            createChallenge("Invitado Nuevo", "Sácate una selfie con alguien que conociste hoy", "Con quien menos conoces del grupo", 'medium', 25, 500),
            // DIFÍCILES
            createChallenge("Foto con Todos", "Reúne a TODOS los presentes para foto grupal", "Con la mayor cantidad posible", 'hard', 35, 600),
            createChallenge("Selfie desde el Balcón", "Si hay balcón, toma foto del grupo desde arriba", "Desde una silla alta", 'hard', 35, 600),
            createChallenge("Cadena de Selfies", "Haz que 5 personas se tomen selfies en cadena", "3 personas mínimo", 'hard', 35, 600),
            createChallenge("Foto Nocturna", "Toma una foto del grupo afuera de noche", "En la puerta de la casa", 'hard', 35, 600),
            createChallenge("Mascota de la Casa", "Si hay mascota, sácate una foto con ella", "Si no hay, junto a la foto de una mascota", 'hard', 35, 600),
        ]
    },
    bachelor: {
        label: "🍾 Despedida de Soltero/a (+18)",
        challenges: [
             // FÁCILES
            createChallenge("Selfie con el/la Soltero/a", "Tómate una selfie picante con la persona que se casa", "Si está muy ocupado/a, sácale foto haciendo algo gracioso", 'easy', 15, 450),
            createChallenge("Accesorio Prohibido", "Ponte algo de lencería sobre la ropa y sácate foto", "Un accesorio sugerente visible", 'easy', 15, 450),
            createChallenge("Amigo/a Íntimo", "Sácate foto en pose cómplice con el mejor amigo/a del/la soltero/a", "Abrazados de manera exagerada", 'easy', 15, 450),
            createChallenge("Corona Picante", "Sácale foto al/la soltero/a con su corona y algo sugerente", "La corona en lugar inusual", 'easy', 15, 450),
            createChallenge("Selfie en el Baño", "Toma una selfie en el baño con pose de modelo", "En el espejo del baño", 'easy', 15, 450),
            // MEDIOS
            createChallenge("Amigos de la Universidad", "Reúne a amigos con anécdotas picantes del/la soltero/a", "Amigos que tengan historias comprometedoras", 'medium', 25, 500),
            createChallenge("Mesa de Tragos Fuertes", "Captura los tragos más coloridos/sugerentes", "El trago con nombre más picante", 'medium', 25, 500),
            createChallenge("Hermanos con Secretos", "Sácate foto con hermanos del/la soltero/a (si los hay)", "Familiares que sepan secretos", 'medium', 25, 500),
            createChallenge("Invitado con Historias", "Encuentra a quien tenga las mejores historias del/la soltero/a", "Quien lo/la conoce en situaciones comprometedoras", 'medium', 25, 500),
            createChallenge("Foto Comprometedora", "Recrea una foto vieja y graciosa del/la soltero/a", "Imita una pose ridícula suya", 'medium', 25, 500),
            // DIFÍCILES
            createChallenge("Foto con Todos los Cómplices", "Reúne a TODOS los que tienen historias picantes", "Al menos 5 personas con sonrisas pícaras", 'hard', 35, 600),
            createChallenge("Selfie desde el Aire", "Toma una foto del grupo desde altura mostrando algo picante", "Desde una silla mostrando lencería sobre ropa", 'hard', 35, 600),
            createChallenge("Brindis con Doble Sentido", "Organiza un brindis con frases de doble sentido", "Todos con sonrisa pícara brindando", 'hard', 35, 600),
            createChallenge("Selfie con Personal Sugerente", "Sácate foto con el/la moza/barman más atractivo", "Con quien sirva los tragos más fuertes", 'hard', 35, 600),
            createChallenge("Foto del Amanecer Comprometedor", "Si dura hasta el amanecer, captura al grupo desordenado", "Las caras de cansancio/satisfacción", 'hard', 35, 600),
        ]
    }
};