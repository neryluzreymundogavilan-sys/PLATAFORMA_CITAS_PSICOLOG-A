import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document_semana3(output_path):
    doc = docx.Document()
    
    # Margenes APA 7 (1 pulgada = 2.54 cm)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Estilos Base
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(0x33, 0x33, 0x33)

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=6, bold=False, italic=False, color=None, font_size=12):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if text:
            run = p.add_run(text)
            run.bold = bold
            run.italic = italic
            run.font.size = Pt(font_size)
            if color:
                run.font.color.rgb = color
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(12.5)
        run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
        return p

    def build_table(headers, rows):
        table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        hdr_cells = table.rows[0].cells
        for i, header in enumerate(headers):
            hdr_cells[i].text = header
            set_cell_background(hdr_cells[i], "1E3A8A")
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.size = Pt(10)
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)

        for r_idx, row in enumerate(rows):
            row_cells = table.rows[r_idx + 1].cells
            bg_color = "F3F4F6" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row):
                row_cells[c_idx].text = str(val)
                set_cell_background(row_cells[c_idx], bg_color)
                p = row_cells[c_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx > 0 else WD_ALIGN_PARAGRAPH.CENTER
                for run in p.runs:
                    run.font.size = Pt(9.5)
                set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=120, right=120)
        
        doc.add_paragraph().paragraph_format.space_after = Pt(8)
        return table

    # CARÁTULA
    add_p("INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14, space_before=12, color=RGBColor(0x1E, 0x3A, 0x8A))
    add_p("MANUEL SCORZA TORRE", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=16, space_after=18, color=RGBColor(0x1E, 0x3A, 0x8A))
    add_p("PROGRAMA DE ESTUDIOS DE ARQUITECTURA DE PLATAFORMAS Y SERVICIOS DE TI", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=11, space_after=30)
    add_p("INFORME DEL PROYECTO INTEGRADOR - AVANCE 3 (SEMANA 3)", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, font_size=13, space_after=6)
    add_p("PLATAFORMA WEB DE GESTIÓN DE CITAS Y ATENCIÓN AL ALUMNO PARA UN CONSULTORIO DE PSICOLOGÍA", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=15, space_after=40, color=RGBColor(0x25, 0x63, 0xEB))
    
    add_p("INTEGRANTES:", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, font_size=11, space_before=20)
    add_p("• Est. Huaman Acho, Katty Maribel", align=WD_ALIGN_PARAGRAPH.LEFT, font_size=11, space_after=2)
    add_p("• Est. Reymundo Gavilan, Nery Luz", align=WD_ALIGN_PARAGRAPH.LEFT, font_size=11, space_after=15)
    
    add_p("DOCENTE ASESOR:", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, font_size=11)
    add_p("• Ing. Quispe Anyaipoma, José Gabriel", align=WD_ALIGN_PARAGRAPH.LEFT, font_size=11, space_after=15)
    
    add_p("UNIDAD DIDÁCTICA:", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, font_size=11)
    add_p("• Análisis y Diseño de Sistemas", align=WD_ALIGN_PARAGRAPH.LEFT, font_size=11, space_after=40)
    
    add_p("ACOBAMBA – HUANCAVELICA (2026)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=12)
    doc.add_page_break()

    # CAPÍTULO IV. DESARROLLO E IMPLEMENTACIÓN DEL SOFTWARE
    add_h1("CAPÍTULO IV. DESARROLLO E IMPLEMENTACIÓN DEL SOFTWARE")
    
    add_h2("4.1 Entorno de Desarrollo e Infraestructura Tecnológica")
    add_p("El desarrollo del software se ejecutó seleccionando un conjunto de tecnologías modernas de código abierto:")
    add_p("• Infraestructura Cloud: Google Firebase Hosting con certificado SSL (HTTPS) y firebase.json.")
    add_p("• Backend: Node.js v18+ y Express.js v4.19 para la API REST asíncrona.")
    add_p("• Seguridad: bcrypt v5.1 (hashing de 10 rondas) y jsonwebtoken (JWT v9.0).")
    add_p("• Base de Datos: MySQL 8.0 / MariaDB accediendo mediante mysql2/promise.")
    add_p("• Frontend & UI/UX: HTML5 semántico, Tailwind CSS v3 y Prototipo Interactivo en Figma.")
    add_p("• Enlace Oficial del Prototipo en Figma: https://www.figma.com/proto/NSKwMRzg1s4eOr92bMDJf8/Figma-basics?node-id=0-920&p=f&t=gISHKhgYKWPvrYUX-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A286", italic=True, color=RGBColor(0x25, 0x63, 0xEB))

    add_h2("4.2 Módulo de Seguridad y Autenticación")
    add_p("El sistema implementa autenticación basada en correo institucional (@scorza.edu.pe) y contraseñas encriptadas con bcrypt. Tras la verificación exitosa, el servidor emite un Token JWT firmado de 8 horas de duración conteniendo el id_usuario y nombre_rol (Administrador, Psicólogo, Alumno).")
    add_p("Las rutas privadas del backend están protegidas mediante el middleware de autorización RBAC (authMiddleware.js), bloqueando accesos no autorizados con respuestas HTTP 403 Forbidden.")

    add_h2("4.3 Módulos y Funcionalidades del Sistema (CRUDs Core Principales)")
    add_p("1. CRUD 1 Core: Módulo de Gestión de Alumnos / Usuarios: Permite crear estudiantes con DNI de 8 dígitos, consultar el directorio con filtros dinámicos por carrera (APSTI, Enfermería, Mecánica), actualizar perfiles e inactivar registros.")
    add_p("2. CRUD 2 Core: Módulo de Gestión de Citas y Horarios: Asigna códigos de cita correlativos (CIT-2026-XXXX), valida la disponibilidad horaria del especialista, permite actualizar el estado (Pendiente, Confirmada, Atendida, Cancelada) y liberar turnos.")

    add_h2("4.4 Matriz de Pruebas Integradas")
    add_p("Se diseñaron y ejecutaron 6 casos de prueba unitarios e integrados obteniendo el 100% de aprobación:")
    
    build_table(
        ["ID", "Caso de Prueba", "Entradas", "Resultado Esperado", "Estado"],
        [
            ["CP-01", "Autenticación Exitosa", "admin.psicologia@scorza.edu.pe / Password123!", "Token JWT generado y redirección al Dashboard.", "PASA"],
            ["CP-02", "Login Contraseña Incorrecta", "jquispe@scorza.edu.pe / ClaveErronea", "HTTP 401 Unauthorized y rechazo de acceso.", "PASA"],
            ["CP-03", "Restricción por Rol (RBAC)", "Token Alumno en DELETE /api/alumnos/1", "HTTP 403 Forbidden con mensaje explicativo.", "PASA"],
            ["CP-04", "Registro DNI Duplicado", "DNI: 73456128 (DNI existente)", "HTTP 400 Bad Request indicando duplicidad.", "PASA"],
            ["CP-05", "Reserva de Cita Exitosa", "id_alumno: 1, fecha: 2026-10-15, hora: 09:00", "HTTP 201 Created con código CIT-2026-XXXX.", "PASA"],
            ["CP-06", "Prevención Cruce Horario", "Mismo especialista, misma fecha y hora.", "HTTP 400 informando horario no disponible.", "PASA"]
        ]
    )

    add_h2("4.5 Reporte de Avance del Proyecto en MS Project")
    add_p("El proyecto registra un avance físico acumulado del 75% en Microsoft Project al cierre del Sprint 3:")
    
    build_table(
        ["Fase / Sprint", "Duración Plan.", "% Completado", "Estado de Salud"],
        [
            ["Sprint 1: Análisis", "3.75 días", "100%", "En Fecha"],
            ["Sprint 2: Diseño", "6.00 días", "100%", "En Fecha"],
            ["Sprint 3: Desarrollo", "11.75 días", "100%", "En Fecha"],
            ["Sprint 4: Despliegue", "5.00 días", "0%", "Programado (Semana 4)"],
            ["TOTAL PROYECTO", "26.50 días", "75%", "Excelente"]
        ]
    )

    doc.save(output_path)
    print(f"[OK] Documento de Semana 3 creado exitosamente en: {output_path}")

if __name__ == "__main__":
    for name in ["Informe_Avance_3_Plataforma_Citas_Psicologicas", "Informe_Semana3_Consolidado"]:
        out_name = f"{name}.docx"
        try:
            create_document_semana3(out_name)
        except Exception as e:
            print(f"[AVISO] No se pudo escribir {out_name}: {e}. Guardando como {name}_FINAL.docx")
            create_document_semana3(f"{name}_FINAL.docx")
