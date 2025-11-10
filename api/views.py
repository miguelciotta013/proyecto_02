# api/views.py - ARCHIVO COMPLETO
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from decimal import Decimal

# Importar tus modelos
from home.models import (
    Pacientes, Turnos, Tratamientos, CobrosConsulta, 
    Cajas, FichasMedicas, DetallesConsulta, EstadosTurno,
    Egresos, Ingresos
)


@api_view(['GET'])
def dashboard_stats(request):
    """
    Estadísticas generales para las cajas del dashboard
    """
    hoy = datetime.now().date()
    mes_actual = datetime.now().month
    anio_actual = datetime.now().year
    
    total_pacientes = Pacientes.objects.filter(
        Q(eliminado=0) | Q(eliminado__isnull=True)
    ).count()
    
    citas_hoy = Turnos.objects.filter(
        Q(eliminado=0) | Q(eliminado__isnull=True),
        fecha_turno=hoy
    ).count()
    
    ingresos_mes = CobrosConsulta.objects.filter(
        Q(eliminado=0) | Q(eliminado__isnull=True),
        fecha_hora_cobro__month=mes_actual,
        fecha_hora_cobro__year=anio_actual
    ).aggregate(total=Sum('monto_pagado'))['total'] or 0
    
    fecha_limite = hoy - timedelta(days=180)
    pacientes_activos = Pacientes.objects.filter(
        Q(eliminado=0) | Q(eliminado__isnull=True),
        turnos__fecha_turno__gte=fecha_limite
    ).distinct().count()
    
    stats = {
        'total_pacientes': total_pacientes,
        'citas_hoy': citas_hoy,
        'ingresos_mes': float(ingresos_mes) if ingresos_mes else 0,
        'pacientes_activos': pacientes_activos
    }
    
    return Response(stats)


@api_view(['GET'])
def citas_por_mes(request):
    """
    Datos para gráfico de líneas: evolución de citas en los últimos 6 meses
    """
    hoy = datetime.now().date()
    meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    data = []
    
    for i in range(6):
        fecha_mes = hoy - timedelta(days=30 * i)
        mes_num = fecha_mes.month
        anio = fecha_mes.year
        
        total_citas = Turnos.objects.filter(
            Q(eliminado=0) | Q(eliminado__isnull=True),
            fecha_turno__month=mes_num,
            fecha_turno__year=anio
        ).count()
        
        completadas = Turnos.objects.filter(
            Q(eliminado=0) | Q(eliminado__isnull=True),
            fecha_turno__month=mes_num,
            fecha_turno__year=anio,
            id_turno_estado__estado_turno='Completado'
        ).count()
        
        canceladas = Turnos.objects.filter(
            Q(eliminado=0) | Q(eliminado__isnull=True),
            fecha_turno__month=mes_num,
            fecha_turno__year=anio,
            id_turno_estado__estado_turno='Cancelado'
        ).count()
        
        data.insert(0, {
            'mes': meses[mes_num - 1],
            'citas': total_citas,
            'completadas': completadas,
            'canceladas': canceladas
        })
    
    return Response({'data': data})


@api_view(['GET'])
def movimientos_caja(request):
    """
    Datos para gráfico de caja: ingresos y egresos
    """
    periodo = request.GET.get('periodo', 'mes')
    
    hoy = datetime.now().date()
    data = []
    meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
             'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    try:
        # MODO DEBUG
        total_cobros = CobrosConsulta.objects.filter(
            Q(eliminado=0) | Q(eliminado__isnull=True)
        ).count()
        
        total_egresos = Egresos.objects.count()
        
        print(f"🔍 DEBUG - Total cobros en BD: {total_cobros}")
        print(f"🔍 DEBUG - Total egresos en BD: {total_egresos}")
        
        # Si no hay datos, devolver ejemplo
        if total_cobros == 0 and total_egresos == 0:
            print("⚠️ No hay datos en la base de datos - Devolviendo datos de ejemplo")
            for i, mes in enumerate(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']):
                data.append({
                    'periodo': mes,
                    'ingresos': float((i + 1) * 5000 + (i % 3) * 2000),
                    'egresos': float((i + 1) * 3000 + (i % 2) * 1000),
                    'balance': float((i + 1) * 2000)
                })
            return Response({'data': data})
        
        if periodo == 'mes':
            for i in range(12):
                fecha_mes = hoy - timedelta(days=30 * i)
                mes_num = fecha_mes.month
                anio = fecha_mes.year
                
                print(f"📅 Buscando datos para: {meses[mes_num-1]} {anio}")
                
                ingresos = CobrosConsulta.objects.filter(
                    Q(eliminado=0) | Q(eliminado__isnull=True),
                    fecha_hora_cobro__month=mes_num,
                    fecha_hora_cobro__year=anio
                ).aggregate(total=Sum('monto_pagado'))['total'] or 0
                
                egresos = Egresos.objects.filter(
                    fecha_hora_egreso__month=mes_num,
                    fecha_hora_egreso__year=anio
                ).aggregate(total=Sum('monto_egreso'))['total'] or 0
                
                print(f"💰 Ingresos: ${ingresos}, Egresos: ${egresos}")
                
                data.insert(0, {
                    'periodo': f"{meses[mes_num - 1]}",
                    'ingresos': float(ingresos),
                    'egresos': float(egresos),
                    'balance': float(ingresos - egresos)
                })
        
        elif periodo == 'semana':
            for i in range(8):
                fecha_inicio = hoy - timedelta(days=7 * (i + 1))
                fecha_fin = hoy - timedelta(days=7 * i)
                
                ingresos = CobrosConsulta.objects.filter(
                    Q(eliminado=0) | Q(eliminado__isnull=True),
                    fecha_hora_cobro__date__gte=fecha_inicio,
                    fecha_hora_cobro__date__lte=fecha_fin
                ).aggregate(total=Sum('monto_pagado'))['total'] or 0
                
                egresos = Egresos.objects.filter(
                    fecha_hora_egreso__date__gte=fecha_inicio,
                    fecha_hora_egreso__date__lte=fecha_fin
                ).aggregate(total=Sum('monto_egreso'))['total'] or 0
                
                data.insert(0, {
                    'periodo': f"Sem {8-i}",
                    'ingresos': float(ingresos),
                    'egresos': float(egresos),
                    'balance': float(ingresos - egresos)
                })
        
        elif periodo == 'dia':
            for i in range(7):
                fecha = hoy - timedelta(days=6 - i)
                
                ingresos = CobrosConsulta.objects.filter(
                    Q(eliminado=0) | Q(eliminado__isnull=True),
                    fecha_hora_cobro__date=fecha
                ).aggregate(total=Sum('monto_pagado'))['total'] or 0
                
                egresos = Egresos.objects.filter(
                    fecha_hora_egreso__date=fecha
                ).aggregate(total=Sum('monto_egreso'))['total'] or 0
                
                data.append({
                    'periodo': fecha.strftime('%d/%m'),
                    'ingresos': float(ingresos),
                    'egresos': float(egresos),
                    'balance': float(ingresos - egresos)
                })
        
        elif periodo == 'año':
            anio_actual = hoy.year
            for i in range(3):
                anio = anio_actual - (2 - i)
                
                ingresos = CobrosConsulta.objects.filter(
                    Q(eliminado=0) | Q(eliminado__isnull=True),
                    fecha_hora_cobro__year=anio
                ).aggregate(total=Sum('monto_pagado'))['total'] or 0
                
                egresos = Egresos.objects.filter(
                    fecha_hora_egreso__year=anio
                ).aggregate(total=Sum('monto_egreso'))['total'] or 0
                
                data.append({
                    'periodo': str(anio),
                    'ingresos': float(ingresos),
                    'egresos': float(egresos),
                    'balance': float(ingresos - egresos)
                })
    
    except Exception as e:
        print(f"❌ Error en movimientos_caja: {e}")
        import traceback
        traceback.print_exc()
        data = []
    
    return Response({'data': data})


@api_view(['GET'])
def citas_filtradas(request):
    """
    Citas con filtros dinámicos por periodo
    """
    periodo = request.GET.get('periodo', 'mes')
    hoy = datetime.now().date()
    data = []
    
    if periodo == 'mes':
        meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        
        for i in range(6):
            fecha_mes = hoy - timedelta(days=30 * i)
            mes_num = fecha_mes.month
            anio = fecha_mes.year
            
            total_citas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno__month=mes_num,
                fecha_turno__year=anio
            ).count()
            
            completadas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno__month=mes_num,
                fecha_turno__year=anio,
                id_turno_estado__estado_turno='Completado'
            ).count()
            
            canceladas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno__month=mes_num,
                fecha_turno__year=anio,
                id_turno_estado__estado_turno='Cancelado'
            ).count()
            
            data.insert(0, {
                'periodo': meses[mes_num - 1],
                'citas': total_citas,
                'completadas': completadas,
                'canceladas': canceladas
            })
    
    elif periodo == 'semana':
        for i in range(4):
            fecha_inicio = hoy - timedelta(days=7 * (i + 1))
            fecha_fin = hoy - timedelta(days=7 * i)
            
            total_citas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno__gte=fecha_inicio,
                fecha_turno__lte=fecha_fin
            ).count()
            
            completadas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno__gte=fecha_inicio,
                fecha_turno__lte=fecha_fin,
                id_turno_estado__estado_turno='Completado'
            ).count()
            
            canceladas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno__gte=fecha_inicio,
                fecha_turno__lte=fecha_fin,
                id_turno_estado__estado_turno='Cancelado'
            ).count()
            
            data.insert(0, {
                'periodo': f"Sem {4-i}",
                'citas': total_citas,
                'completadas': completadas,
                'canceladas': canceladas
            })
    
    elif periodo == 'dia':
        for i in range(7):
            fecha = hoy - timedelta(days=6 - i)
            
            total_citas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno=fecha
            ).count()
            
            completadas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno=fecha,
                id_turno_estado__estado_turno='Completado'
            ).count()
            
            canceladas = Turnos.objects.filter(
                Q(eliminado=0) | Q(eliminado__isnull=True),
                fecha_turno=fecha,
                id_turno_estado__estado_turno='Cancelado'
            ).count()
            
            data.append({
                'periodo': fecha.strftime('%d/%m'),
                'citas': total_citas,
                'completadas': completadas,
                'canceladas': canceladas
            })
    
    return Response({'data': data})


@api_view(['GET'])
def pacientes_por_edad(request):
    """
    Datos para gráfico de barras: distribución de pacientes por rango de edad
    """
    hoy = datetime.now().date()
    
    pacientes = Pacientes.objects.filter(
        Q(eliminado=0) | Q(eliminado__isnull=True)
    ).values('fecha_nacimiento')
    
    rangos = {
        '0-18': 0,
        '19-30': 0,
        '31-50': 0,
        '51-70': 0,
        '70+': 0
    }
    
    for p in pacientes:
        if p['fecha_nacimiento']:
            edad = (hoy - p['fecha_nacimiento']).days // 365
            
            if edad <= 18:
                rangos['0-18'] += 1
            elif edad <= 30:
                rangos['19-30'] += 1
            elif edad <= 50:
                rangos['31-50'] += 1
            elif edad <= 70:
                rangos['51-70'] += 1
            else:
                rangos['70+'] += 1
    
    data = [
        {'rango': rango, 'cantidad': cantidad}
        for rango, cantidad in rangos.items()
    ]
    
    return Response({'data': data})


@api_view(['GET'])
def tratamientos_populares(request):
    """
    Datos para gráfico de pastel: top 5 tratamientos más realizados
    """
    tratamientos_top = DetallesConsulta.objects.filter(
        Q(eliminado=0) | Q(eliminado__isnull=True)
    ).values(
        'id_tratamiento__nombre_tratamiento'
    ).annotate(
        total=Count('id_tratamiento')
    ).order_by('-total')[:5]
    
    data = [
        {
            'nombre': item['id_tratamiento__nombre_tratamiento'] or 'Sin nombre',
            'cantidad': item['total']
        }
        for item in tratamientos_top
    ]
    
    if not data:
        data = [
            {'nombre': 'Sin datos', 'cantidad': 1}
        ]
    
    return Response({'data': data})