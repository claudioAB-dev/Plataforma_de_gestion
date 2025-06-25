from flask import jsonify
from . import api_bp
from ..models import ReporteProduccion

@api_bp.route('/lineas/<int:linea_id>/estado', methods=['GET'])
def get_linea_estado(linea_id):
    """
    Devuelve el reporte activo para una línea de producción específica.
    Ideal para dashboards de monitoreo en tiempo real.
    """
    reporte_activo = ReporteProduccion.query.filter_by(
        linea_produccion=linea_id, 
        estado='En Proceso'
    ).first()

    if reporte_activo:
        return jsonify(reporte_activo.to_dict())
    else:
        return jsonify({
            'estado': 'Inactiva',
            'message': f'No hay producción activa en la línea {linea_id}'
        }), 200 # Devolvemos 200 para que el frontend lo maneje como un estado, no un error