# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Cajas(models.Model):
    id_caja = models.BigAutoField(primary_key=True)
    id_empleado = models.ForeignKey('Empleados', models.DO_NOTHING, db_column='id_empleado')
    fecha_hora_apertura = models.DateTimeField()
    monto_apertura = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_hora_cierre = models.DateTimeField(blank=True, null=True)
    monto_cierre = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    estado_caja = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cajas'


class CarasDiente(models.Model):
    id_cara = models.BigAutoField(primary_key=True)
    nombre_cara = models.CharField(max_length=30)
    abreviatura = models.CharField(max_length=5)

    class Meta:
        managed = False
        db_table = 'caras_diente'


class CoberturasOs(models.Model):
    id_cobertura = models.BigAutoField(primary_key=True)
    id_obra_social = models.ForeignKey('ObrasSociales', models.DO_NOTHING, db_column='id_obra_social')
    id_tratamiento = models.ForeignKey('Tratamientos', models.DO_NOTHING, db_column='id_tratamiento')
    porcentaje = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'coberturas_os'
        unique_together = (('id_obra_social', 'id_tratamiento'),)


class CobrosConsulta(models.Model):
    id_cobro_consulta = models.BigAutoField(primary_key=True)
    id_metodo_cobro = models.BigIntegerField()
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)
    id_estado_pago = models.ForeignKey('EstadosPago', models.DO_NOTHING, db_column='id_estado_pago')
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)
    monto_obra_social = models.DecimalField(max_digits=10, decimal_places=2)
    monto_paciente = models.DecimalField(max_digits=10, decimal_places=2)
    monto_pagado = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_hora_cobro = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cobros_consulta'


class DetallesConsulta(models.Model):
    id_detalle = models.BigAutoField(primary_key=True)
    id_tratamiento = models.ForeignKey('Tratamientos', models.DO_NOTHING, db_column='id_tratamiento')
    id_cobro_consulta = models.ForeignKey(CobrosConsulta, models.DO_NOTHING, db_column='id_cobro_consulta')
    id_ficha_medica = models.ForeignKey('FichasMedicas', models.DO_NOTHING, db_column='id_ficha_medica')
    id_diente = models.ForeignKey('Dientes', models.DO_NOTHING, db_column='id_diente')
    id_cara = models.BigIntegerField()
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'detalles_consulta'


class Dientes(models.Model):
    id_diente = models.IntegerField(primary_key=True)
    nombre_diente = models.CharField(max_length=60, blank=True, null=True)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dientes'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Egresos(models.Model):
    id_egreso = models.BigAutoField(primary_key=True)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')
    fecha_hora_egreso = models.DateTimeField(blank=True, null=True)
    descripcion_egreso = models.CharField(max_length=100, blank=True, null=True)
    monto_egreso = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'egresos'


class Empleados(models.Model):
    id_empleado = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(AuthUser, models.DO_NOTHING)
    rol = models.CharField(max_length=20)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'empleados'


class EstadosPago(models.Model):
    id_estado_pago = models.BigAutoField(primary_key=True)
    nombre_estado = models.CharField(unique=True, max_length=20)

    class Meta:
        managed = False
        db_table = 'estados_pago'


class EstadosTurno(models.Model):
    id_estado_turno = models.BigAutoField(primary_key=True)
    estado_turno = models.CharField(max_length=20)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminado = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'estados_turno'


class FichasMedicas(models.Model):
    id_ficha_medica = models.BigAutoField(primary_key=True)
    id_empleado = models.ForeignKey(Empleados, models.DO_NOTHING, db_column='id_empleado')
    id_paciente_os = models.ForeignKey('PacientesXOs', models.DO_NOTHING, db_column='id_paciente_os')
    id_ficha_patologica = models.ForeignKey('FichasPatologicas', models.DO_NOTHING, db_column='id_ficha_patologica')
    fecha_creacion = models.DateField()
    observaciones = models.CharField(max_length=150, blank=True, null=True)
    nro_autorizacion = models.BigIntegerField(blank=True, null=True)
    nro_coseguro = models.BigIntegerField(blank=True, null=True)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fichas_medicas'


class FichasPatologicas(models.Model):
    id_ficha_patologica = models.BigAutoField(primary_key=True)
    id_paciente_os = models.OneToOneField('PacientesXOs', models.DO_NOTHING, db_column='id_paciente_os')
    alergias = models.IntegerField(blank=True, null=True)
    anemia = models.IntegerField(blank=True, null=True)
    artritis = models.IntegerField(blank=True, null=True)
    asma = models.IntegerField(blank=True, null=True)
    desnutricion = models.IntegerField(blank=True, null=True)
    diabetes = models.IntegerField(blank=True, null=True)
    epilepsia = models.IntegerField(blank=True, null=True)
    embarazo_sospecha = models.IntegerField(blank=True, null=True)
    fiebre_reumatica = models.IntegerField(blank=True, null=True)
    glaucoma = models.IntegerField(blank=True, null=True)
    hemorragias = models.IntegerField(blank=True, null=True)
    hepatitis = models.IntegerField(blank=True, null=True)
    herpes = models.IntegerField(blank=True, null=True)
    hipertension = models.IntegerField(blank=True, null=True)
    hipotension = models.IntegerField(blank=True, null=True)
    jaquecas = models.IntegerField(blank=True, null=True)
    lesiones_cabeza = models.IntegerField(blank=True, null=True)
    problemas_hepaticos = models.IntegerField(blank=True, null=True)
    problemas_mentales = models.IntegerField(blank=True, null=True)
    problemas_cardiacos = models.IntegerField(blank=True, null=True)
    problemas_renales = models.IntegerField(blank=True, null=True)
    problemas_tiroides = models.IntegerField(blank=True, null=True)
    problemas_respiratorios = models.IntegerField(blank=True, null=True)
    sinusitis = models.IntegerField(blank=True, null=True)
    tuberculosis = models.IntegerField(blank=True, null=True)
    tumores = models.IntegerField(blank=True, null=True)
    ulceras = models.IntegerField(blank=True, null=True)
    venereas = models.IntegerField(blank=True, null=True)
    vih = models.IntegerField(db_column='VIH', blank=True, null=True)  # Field name made lowercase.
    portador_protesis = models.IntegerField(blank=True, null=True)
    problema_periodontal = models.IntegerField(blank=True, null=True)
    ortodoncia = models.IntegerField(blank=True, null=True)
    mala_oclusion = models.IntegerField(blank=True, null=True)
    lesion_mucosa = models.IntegerField(blank=True, null=True)
    toma_medicacion = models.IntegerField(blank=True, null=True)
    otra = models.CharField(max_length=60, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fichas_patologicas'


class Ingresos(models.Model):
    id_ingreso = models.BigAutoField(primary_key=True)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')
    fecha_hora_ingreso = models.DateTimeField(blank=True, null=True)
    descripcion_ingreso = models.CharField(max_length=100, blank=True, null=True)
    monto_ingreso = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'ingresos'


class MetodosCobro(models.Model):
    id_metodo_cobro = models.BigAutoField(primary_key=True)
    tipo_cobro = models.CharField(max_length=30)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'metodos_cobro'


class ObrasSociales(models.Model):
    id_obra_social = models.BigAutoField(primary_key=True)
    nombre_os = models.CharField(max_length=40)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'obras_sociales'
    def __str__(self):
        return self.nombre_os


class Pacientes(models.Model):
    id_paciente = models.BigAutoField(primary_key=True)
    dni_paciente = models.BigIntegerField()
    nombre_paciente = models.CharField(max_length=40)
    apellido_paciente = models.CharField(max_length=40)
    fecha_nacimiento = models.DateField()
    domicilio = models.CharField(max_length=50, blank=True, null=True)
    localidad = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    correo = models.CharField(max_length=50, blank=True, null=True)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes'
    def __str__(self):
        return self.nombre_paciente and self.apellido_paciente


class PacientesXOs(models.Model):
    id_paciente_os = models.BigAutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_obra_social = models.ForeignKey(ObrasSociales, models.DO_NOTHING, db_column='id_obra_social')
    id_parentesco = models.ForeignKey('Parentesco', models.DO_NOTHING, db_column='id_parentesco')
    credencial_paciente = models.BigIntegerField(blank=True, null=True)
    titular = models.CharField(max_length=30, blank=True, null=True)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes_x_os'


class Parentesco(models.Model):
    id_parentesco = models.BigAutoField(primary_key=True)
    tipo_parentesco = models.CharField(max_length=30)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'parentesco'
    def __str__(self):
        return self.tipo_parentesco


class Tratamientos(models.Model):
    id_tratamiento = models.BigAutoField(primary_key=True)
    nombre_tratamiento = models.CharField(max_length=30)
    codigo = models.CharField(max_length=20)
    importe = models.DecimalField(max_digits=10, decimal_places=2)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tratamientos'
    def __str__(self):
        return self.nombre_tratamiento


class Turnos(models.Model):
    id_turno = models.BigAutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_turno_estado = models.ForeignKey(EstadosTurno, models.DO_NOTHING, db_column='id_turno_estado')
    asunto = models.CharField(max_length=40, blank=True, null=True)
    fecha_turno = models.DateField()
    hora_turno = models.TimeField()
    comentario_turno = models.CharField(max_length=60, blank=True, null=True)
    eliminado = models.IntegerField(blank=True, null=True)
    fecha_eliminacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'turnos'
