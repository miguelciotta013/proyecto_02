from rest_framework import serializers
from home.models import (
    Pacientes, FichasMedicas, PacientesXOs, FichasPatologicas,
    Dientes, CarasDiente, Parentesco, Tratamientos, 
    DetallesConsulta, CoberturasOs, CobrosConsulta, EstadosPago, 
    Cajas, MetodosCobro, ObrasSociales
)

class PacienteFichaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pacientes
        fields = ['id_paciente', 'dni_paciente', 'nombre_paciente', 'apellido_paciente', 'fecha_nacimiento']

class DientesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dientes
        fields = ['id_diente', 'nombre_diente']

class CarasDienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarasDiente
        fields = ['id_cara', 'nombre_cara', 'abreviatura']

class ParentescoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parentesco
        fields = ['id_parentesco', 'tipo_parentesco']

class TratamientosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamientos
        fields = ['id_tratamiento', 'nombre_tratamiento', 'codigo', 'importe']

class TratamientosConCoberturaSerializer(serializers.Serializer):
    id_tratamiento = serializers.IntegerField()
    nombre_tratamiento = serializers.CharField()
    codigo = serializers.CharField()
    importe_base = serializers.DecimalField(max_digits=10, decimal_places=2)
    porcentaje_cobertura = serializers.IntegerField()
    importe_paciente = serializers.DecimalField(max_digits=10, decimal_places=2)

class MetodosCobroSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodosCobro
        fields = ['id_metodo_cobro', 'tipo_cobro']

class EstadosPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosPago
        fields = ['id_estado_pago', 'nombre_estado']

class ObraSocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObrasSociales
        fields = ['id_obra_social', 'nombre_os']

class DetalleConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallesConsulta
        fields = [
            'id_tratamiento',
            'id_diente',
            'id_cara'
        ]

class FichaMedicaCreateSerializer(serializers.ModelSerializer):
    detalles_consulta = DetalleConsultaSerializer(many=True, write_only=True)
    fecha_creacion = serializers.DateField(required=False)
    id_caja = serializers.IntegerField(write_only=True)

    class Meta:
        model = FichasMedicas
        fields = [
            'id_paciente_os', 
            'id_empleado',
            'id_ficha_patologica',
            'fecha_creacion',
            'observaciones',
            'nro_autorizacion',
            'nro_coseguro',
            'id_caja',
            'detalles_consulta'
        ]
    
    def create(self, validated_data):
        from django.utils import timezone
        
        detalles_data = validated_data.pop('detalles_consulta')
        id_caja = validated_data.pop('id_caja')
        
        if 'fecha_creacion' not in validated_data:
            validated_data['fecha_creacion'] = timezone.now().date()
        
        ficha_medica = FichasMedicas.objects.create(**validated_data)
        print(f"✓ Ficha médica creada: {ficha_medica.id_ficha_medica}")
        
        monto_total = 0
        obra_social = ficha_medica.id_paciente_os.id_obra_social
        monto_obra_social = 0
        
        try:
            estado_pendiente = EstadosPago.objects.get(nombre_estado='pendiente')
        except EstadosPago.DoesNotExist:
            estado_pendiente = EstadosPago.objects.create(nombre_estado='pendiente')
        
        caja = Cajas.objects.get(id_caja=id_caja)

        print(f"✓ Estado pendiente obtenido: {estado_pendiente.id_estado_pago}")
        
        cobro = CobrosConsulta.objects.create(
            monto_total=0,
            monto_obra_social=0,
            monto_paciente=0,
            monto_pagado=0.00,
            id_estado_pago=estado_pendiente,
            id_caja=caja,
            id_metodo_cobro=1,
        )
        
        print(f"✓ Cobro creado: ID={cobro.id_cobro_consulta}")
        
        for i, detalle_data in enumerate(detalles_data):
            print(f"→ Creando detalle {i+1}...")
            
            detalle = DetallesConsulta.objects.create(
                id_ficha_medica=ficha_medica,
                id_cobro_consulta=cobro,
                **detalle_data
            )
            
            print(f"✓ Detalle creado: {detalle.id_detalle}")
            
            tratamiento = detalle.id_tratamiento
            monto_total += tratamiento.importe
            
            try:
                cobertura = CoberturasOs.objects.get(
                    id_obra_social=obra_social,
                    id_tratamiento=tratamiento
                )
                monto_obra_social += (tratamiento.importe * cobertura.porcentaje / 100)
            except CoberturasOs.DoesNotExist:
                pass
        
        monto_paciente = monto_total - monto_obra_social
        cobro.monto_total = monto_total
        cobro.monto_obra_social = monto_obra_social
        cobro.monto_paciente = monto_paciente
        cobro.save()
        
        print(f"✓ Cobro actualizado con montos")
        
        return ficha_medica

class FichaMedicaDetailSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='id_paciente_os.id_paciente.nombre_paciente', read_only=True)
    paciente_apellido = serializers.CharField(source='id_paciente_os.id_paciente.apellido_paciente', read_only=True)
    detalles = serializers.SerializerMethodField()
    
    class Meta:
        model = FichasMedicas
        fields = '__all__'
    
    def get_detalles(self, obj):
        detalles = DetallesConsulta.objects.filter(
        id_ficha_medica=obj, 
        eliminado__isnull=True
        )
        data = []
        for d in detalles:
            try:
                cara = CarasDiente.objects.get(id_cara=d.id_cara)
                cara_abreviatura = cara.abreviatura
            except CarasDiente.DoesNotExist:
                cara_abreviatura = "?"
            
            data.append({
                'id_detalle': d.id_detalle,
                'tratamiento': d.id_tratamiento.nombre_tratamiento,  # ← AGREGADO
                'codigo': d.id_tratamiento.codigo,
                'importe': str(d.id_tratamiento.importe),
                'id_diente': d.id_diente.id_diente if d.id_diente else None,
                'diente': d.id_diente.nombre_diente if d.id_diente else None,  # ← AGREGADO (opcional)
                'cara': cara_abreviatura,
                'conformidad_paciente': getattr(d, 'conformidad_paciente', False)
            })
        return data

class FichaPatologicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichasPatologicas
        fields = '__all__'

class FichaPatologicaCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichasPatologicas
        exclude = ['id_ficha_patologica']

class CobroDetailSerializer(serializers.ModelSerializer):
    metodo_cobro = serializers.SerializerMethodField()
    estado_pago = serializers.CharField(source='id_estado_pago.nombre_estado', read_only=True)
    # Campos calculados para mostrar en GET
    monto_pagado_paciente = serializers.SerializerMethodField()
    monto_pagado_obra_social = serializers.SerializerMethodField()
    
    class Meta:
        model = CobrosConsulta
        fields = [
            'id_cobro_consulta',
            'monto_total',
            'monto_obra_social',
            'monto_paciente',
            'monto_pagado',
            'monto_pagado_paciente',
            'monto_pagado_obra_social',
            'fecha_hora_cobro',
            'metodo_cobro',
            'estado_pago'
        ]
    
    def get_metodo_cobro(self, obj):
        if obj.id_metodo_cobro:
            try:
                metodo = MetodosCobro.objects.get(id_metodo_cobro=obj.id_metodo_cobro)
                return metodo.tipo_cobro
            except MetodosCobro.DoesNotExist:
                return None
        return None
    
    def get_monto_pagado_paciente(self, obj):
        # Primero se paga lo que debe el paciente
        return min(float(obj.monto_pagado), float(obj.monto_paciente))
    
    def get_monto_pagado_obra_social(self, obj):
        # Lo que sobra después de pagar al paciente va a obra social
        pagado_paciente = min(float(obj.monto_pagado), float(obj.monto_paciente))
        return max(0, float(obj.monto_pagado) - pagado_paciente)

class FichaMedicaConCobroSerializer(serializers.ModelSerializer):
    # Datos del paciente
    paciente_nombre = serializers.CharField(source='id_paciente_os.id_paciente.nombre_paciente', read_only=True)
    paciente_apellido = serializers.CharField(source='id_paciente_os.id_paciente.apellido_paciente', read_only=True)
    paciente_dni = serializers.IntegerField(source='id_paciente_os.id_paciente.dni_paciente', read_only=True)
    paciente_fecha_nacimiento = serializers.DateField(source='id_paciente_os.id_paciente.fecha_nacimiento', read_only=True)
    paciente_telefono = serializers.CharField(source='id_paciente_os.id_paciente.telefono', read_only=True)
    paciente_domicilio = serializers.CharField(source='id_paciente_os.id_paciente.domicilio', read_only=True)
    paciente_localidad = serializers.CharField(source='id_paciente_os.id_paciente.localidad', read_only=True)
    
    # Datos del empleado
    empleado_nombre = serializers.SerializerMethodField()
    
    # Datos de obra social
    obra_social = serializers.CharField(source='id_paciente_os.id_obra_social.nombre_os', read_only=True)
    obra_social_credencial = serializers.IntegerField(source='id_paciente_os.credencial_paciente', read_only=True)
    obra_social_titular = serializers.CharField(source='id_paciente_os.titular', read_only=True)
    parentesco = serializers.CharField(source='id_paciente_os.id_parentesco.tipo_parentesco', read_only=True)
    
    # Detalles y cobro
    detalles = serializers.SerializerMethodField()
    cobro = serializers.SerializerMethodField()
    
    class Meta:
        model = FichasMedicas
        fields = [
            'id_ficha_medica',
            # Paciente
            'paciente_nombre',
            'paciente_apellido',
            'paciente_dni',
            'paciente_fecha_nacimiento',
            'paciente_telefono',
            'paciente_domicilio',
            'paciente_localidad',
            # Empleado
            'empleado_nombre',
            # Obra Social
            'obra_social',
            'obra_social_credencial',
            'obra_social_titular',
            'parentesco',
            # Ficha
            'fecha_creacion',
            'observaciones',
            'nro_autorizacion',
            'nro_coseguro',
            # Detalles y cobro
            'detalles',
            'cobro'
        ]
    
    def get_empleado_nombre(self, obj):
        user = obj.id_empleado.user
        return f"{user.first_name} {user.last_name}"
    
    def get_detalles(self, obj):
        detalles = DetallesConsulta.objects.filter(
        id_ficha_medica=obj, 
        eliminado__isnull=True
        )
        data = []
        for d in detalles:
            try:
                cara = CarasDiente.objects.get(id_cara=d.id_cara)
                cara_abreviatura = cara.abreviatura
            except CarasDiente.DoesNotExist:
                cara_abreviatura = "?"
            
            data.append({
                'id_detalle': d.id_detalle,
                'codigo': d.id_tratamiento.codigo,
                'tratamiento': d.id_tratamiento.nombre_tratamiento,  # ✅ Importante
                'importe': str(d.id_tratamiento.importe),
                'id_diente': d.id_diente.id_diente if d.id_diente else None,
                'diente': d.id_diente.nombre_diente if d.id_diente else None,
                'cara': cara_abreviatura,
                'conformidad_paciente': getattr(d, 'conformidad_paciente', False)
            })
        return data
    
    def get_cobro(self, obj):
        try:
            detalle = DetallesConsulta.objects.filter(
                id_ficha_medica=obj
            ).first()
            
            if detalle and detalle.id_cobro_consulta:
                return CobroDetailSerializer(detalle.id_cobro_consulta).data
            return None
        except:
            return None

class OdontogramaSerializer(serializers.Serializer):
    dientes_tratados = serializers.ListField()
    ficha_patologica = FichaPatologicaSerializer()

class PacienteObraSocialSerializer(serializers.Serializer):
    id_paciente_os = serializers.IntegerField()
    id_obra_social = serializers.IntegerField()
    nombre_os = serializers.CharField()
    credencial = serializers.IntegerField()