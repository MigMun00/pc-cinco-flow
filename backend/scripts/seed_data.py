"""Script para poblar datos de ejemplo en clientes, proyectos, gastos y servicios.

Uso:
    python -m scripts.seed_data --user-id user_demo_001

Por defecto elimina los datos previos del usuario para evitar duplicados.
"""

from __future__ import annotations

import argparse

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.client import Client
from app.models.product import Product
from app.models.project import Project
from app.models.project_expense import ProjectExpense
from app.models.service import Service


CLIENTES = [
    {
        "name": "Panaderia La Espiga",
        "email": "contacto@laespiga.com",
        "phone": "+593 99 120 3344",
    },
    {
        "name": "Hotel Mirador Andino",
        "email": "soporte@miradorandino.ec",
        "phone": "+593 98 210 7788",
    },
    {
        "name": "Clinica Santa Teresa",
        "email": "it@clinicasantateresa.ec",
        "phone": "+593 96 550 9922",
    },
    {
        "name": "Ferreteria El Tornillo",
        "email": "administracion@eltornillo.com",
        "phone": "+593 95 887 4411",
    },
    {
        "name": "Unidad Educativa Nuevo Horizonte",
        "email": "tecnologia@uenh.edu.ec",
        "phone": "+593 97 345 6001",
    },
]


PROYECTOS = [
    {
        "client_name": "Panaderia La Espiga",
        "name": "Migracion de antivirus corporativo",
        "description": "Reemplazo de solucion anterior por ESET Endpoint en 12 equipos.",
        "win_margin": 22.5,
        "custom_fee": 90.0,
        "invoiced": True,
    },
    {
        "client_name": "Hotel Mirador Andino",
        "name": "Instalacion de antena punto a punto",
        "description": "Enlace inalambrico para conectar recepcion y edificio administrativo.",
        "win_margin": 28.0,
        "custom_fee": 140.0,
        "invoiced": False,
    },
    {
        "client_name": "Clinica Santa Teresa",
        "name": "Mantenimiento y limpieza de computadoras",
        "description": "Limpieza interna, cambio de pasta termica y optimizacion de 18 estaciones.",
        "win_margin": 18.0,
        "custom_fee": 0.0,
        "invoiced": False,
    },
    {
        "client_name": "Ferreteria El Tornillo",
        "name": "Cableado estructurado de bodega",
        "description": "Tendido de cableado categoria 6 para nuevas cajas y puntos de red.",
        "win_margin": 25.0,
        "custom_fee": 75.0,
        "invoiced": True,
    },
    {
        "client_name": "Unidad Educativa Nuevo Horizonte",
        "name": "Soporte de telecomunicaciones",
        "description": "Diagnostico y correccion de latencia en red interna y salida a internet.",
        "win_margin": 20.0,
        "custom_fee": 120.0,
        "invoiced": False,
    },
]


GASTOS_PROYECTO = [
    {
        "project_name": "Migracion de antivirus corporativo",
        "name": "Licencias anuales de seguridad",
        "description": "Compra de 12 licencias ESET Endpoint por 1 ano.",
        "amount": 480.0,
    },
    {
        "project_name": "Migracion de antivirus corporativo",
        "name": "Transporte tecnico",
        "description": "Visitas tecnicas para despliegue y configuracion inicial.",
        "amount": 45.0,
    },
    {
        "project_name": "Instalacion de antena punto a punto",
        "name": "Antena Ubiquiti NanoBeam",
        "description": "Par de antenas para enlace de larga distancia.",
        "amount": 320.0,
    },
    {
        "project_name": "Instalacion de antena punto a punto",
        "name": "Mastil y herrajes",
        "description": "Estructura metalica para montaje seguro en azotea.",
        "amount": 110.0,
    },
    {
        "project_name": "Mantenimiento y limpieza de computadoras",
        "name": "Insumos de limpieza",
        "description": "Aire comprimido, alcohol isopropilico y brochas antiestaticas.",
        "amount": 58.0,
    },
    {
        "project_name": "Cableado estructurado de bodega",
        "name": "Cable UTP Cat6",
        "description": "Rollo de 305m para puntos de red y canalizacion.",
        "amount": 165.0,
    },
    {
        "project_name": "Cableado estructurado de bodega",
        "name": "Patch panel y conectores",
        "description": "Patch panel de 24 puertos, keystones y plugs RJ45.",
        "amount": 92.0,
    },
    {
        "project_name": "Soporte de telecomunicaciones",
        "name": "Analizador de red en alquiler",
        "description": "Alquiler diario para pruebas de rendimiento y perdida de paquetes.",
        "amount": 70.0,
    },
]


SERVICIOS = [
    {
        "client_name": "Panaderia La Espiga",
        "name": "Limpieza mensual de equipos",
        "product_name": "Mantenimiento Preventivo",
        "description": "Limpieza preventiva de 6 computadoras de caja y administracion.",
        "invoiced": True,
    },
    {
        "client_name": "Hotel Mirador Andino",
        "name": "Soporte remoto de conectividad",
        "product_name": "Soporte Remoto",
        "description": "Monitoreo y soporte remoto para incidencias de internet y red wifi.",
        "invoiced": False,
    },
    {
        "client_name": "Clinica Santa Teresa",
        "name": "Instalacion de antivirus en recepcion",
        "product_name": "Instalacion de Antivirus",
        "description": "Instalacion y configuracion de politicas de escaneo en 4 equipos.",
        "invoiced": True,
    },
    {
        "client_name": "Ferreteria El Tornillo",
        "name": "Reparacion de computadora de inventario",
        "product_name": "Reparacion de PC",
        "description": "Cambio de fuente de poder, limpieza y recuperacion de sistema.",
        "invoiced": False,
    },
    {
        "client_name": "Unidad Educativa Nuevo Horizonte",
        "name": "Configuracion de router y VLAN",
        "product_name": "Configuracion de Red",
        "description": "Segmentacion de trafico para docentes, administrativos y estudiantes.",
        "invoiced": False,
    },
]


PRODUCTOS = [
    {"name": "Mantenimiento Preventivo", "price": 95.0},
    {"name": "Soporte Remoto", "price": 120.0},
    {"name": "Instalacion de Antivirus", "price": 140.0},
    {"name": "Reparacion de PC", "price": 180.0},
    {"name": "Configuracion de Red", "price": 260.0},
]


def purge_user_data(db: Session, user_id: str) -> None:
    """Elimina datos del usuario respetando dependencias de llaves foraneas."""
    db.query(ProjectExpense).filter(ProjectExpense.user_id == user_id).delete(
        synchronize_session=False
    )
    db.query(Project).filter(Project.user_id == user_id).delete(
        synchronize_session=False
    )
    db.query(Service).filter(Service.user_id == user_id).delete(
        synchronize_session=False
    )
    db.query(Product).filter(Product.user_id == user_id).delete(
        synchronize_session=False
    )
    db.query(Client).filter(Client.user_id == user_id).delete(synchronize_session=False)


def seed(db: Session, user_id: str, clear_existing: bool) -> dict[str, int]:
    if clear_existing:
        purge_user_data(db, user_id)

    client_records: list[Client] = []
    for item in CLIENTES:
        client = Client(user_id=user_id, **item)
        client_records.append(client)

    db.add_all(client_records)
    db.flush()
    client_ids = {client.name: client.id for client in client_records}

    product_records: list[Product] = []
    for item in PRODUCTOS:
        product = Product(user_id=user_id, **item)
        product_records.append(product)

    db.add_all(product_records)
    db.flush()
    product_map = {product.name: product for product in product_records}

    project_records: list[Project] = []
    for item in PROYECTOS:
        payload = item.copy()
        client_name = payload.pop("client_name")
        project = Project(user_id=user_id, client_id=client_ids[client_name], **payload)
        project_records.append(project)

    db.add_all(project_records)
    db.flush()
    project_ids = {project.name: project.id for project in project_records}

    expense_records: list[ProjectExpense] = []
    for item in GASTOS_PROYECTO:
        payload = item.copy()
        project_name = payload.pop("project_name")
        expense = ProjectExpense(
            user_id=user_id, project_id=project_ids[project_name], **payload
        )
        expense_records.append(expense)

    service_records: list[Service] = []
    for item in SERVICIOS:
        payload = item.copy()
        client_name = payload.pop("client_name")
        product_name = payload.pop("product_name")
        product = product_map[product_name]
        payload["amount"] = product.price
        service = Service(user_id=user_id, client_id=client_ids[client_name], **payload)
        service.product_id = product.id
        service_records.append(service)

    db.add_all(expense_records)
    db.add_all(service_records)
    db.commit()

    return {
        "clients": len(client_records),
        "products": len(product_records),
        "projects": len(project_records),
        "project_expenses": len(expense_records),
        "services": len(service_records),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Poblar la base de datos con datos demo en espanol"
    )
    parser.add_argument(
        "--user-id",
        default="user_demo_pc_cinco",
        help="ID de usuario al que se asignaran los registros (default: user_demo_pc_cinco)",
    )
    parser.add_argument(
        "--keep-existing",
        action="store_true",
        help="No elimina registros existentes del usuario antes de insertar",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    db = SessionLocal()
    try:
        summary = seed(
            db=db, user_id=args.user_id, clear_existing=not args.keep_existing
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("Seed completado correctamente.")
    print(f"Usuario: {args.user_id}")
    print(f"Clientes: {summary['clients']}")
    print(f"Productos: {summary['products']}")
    print(f"Proyectos: {summary['projects']}")
    print(f"Gastos de proyecto: {summary['project_expenses']}")
    print(f"Servicios: {summary['services']}")


if __name__ == "__main__":
    main()
