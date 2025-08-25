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


class Caja(models.Model):
    id_caja = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(AuthUser, models.DO_NOTHING, db_column='id_usuario')
    fecha_apertura = models.DateField()
    hora_apertura = models.TimeField()
    fecha_cierre = models.DateField(blank=True, null=True)
    hora_cierre = models.TimeField(blank=True, null=True)
    estado_cierre = models.CharField(max_length=7)
    monto_apertura = models.IntegerField()
    monto_cierre = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'caja'


class Consultas(models.Model):
    id_consulta = models.BigAutoField(primary_key=True)
    fecha_consulta = models.DateField()
    total_consulta = models.IntegerField()
    observaciones = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'consultas'


class DetalleConsulta(models.Model):
    id_detalle_consulta = models.AutoField(primary_key=True)  # Nueva PK individual
    id_consulta = models.ForeignKey(Consultas, models.DO_NOTHING, db_column='id_consulta')
    id_ficha_medica = models.ForeignKey('FichaMedica', models.DO_NOTHING, db_column='id_ficha_medica')
    nro_diente = models.IntegerField(blank=True, null=True)
    cara_diente = models.CharField(max_length=13, blank=True, null=True)
    codigo = models.IntegerField(blank=True, null=True)
    importe = models.IntegerField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'detalle_consulta'
        unique_together = (('id_consulta', 'id_ficha_medica'),)

class DetalleServicio(models.Model):
    id_detalle_servicio = models.AutoField(primary_key=True)
    id_servicio = models.ForeignKey('ServiciosParticulares', models.DO_NOTHING, db_column='id_servicio')
    nro_diente = models.IntegerField(blank=True, null=True)
    tratamiento = models.CharField(max_length=50)
    importe = models.IntegerField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'detalle_servicio'


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


class FichaMedica(models.Model):
    id_ficha_medica = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente')
    id_usuario = models.ForeignKey(AuthUser, models.DO_NOTHING, db_column='id_usuario')
    fecha_creacion = models.DateField()
    observaciones = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ficha_medica'


class ObraSocial(models.Model):
    id_obra_social = models.AutoField(primary_key=True)
    nombre_os = models.CharField(max_length=50)
    codigo_os = models.BigIntegerField(unique=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'obra_social'


class Pacientes(models.Model):
    id_paciente = models.AutoField(primary_key=True)
    dni_paciente = models.IntegerField(unique=True)
    fecha_nacimiento = models.DateField()
    apellido = models.CharField(max_length=50)
    nombre = models.CharField(max_length=50)
    domicilio = models.CharField(max_length=50, blank=True, null=True)
    localidad = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes'


class PacientesXOs(models.Model):
    id_paciente_os = models.AutoField(primary_key=True)  # Nueva PK individual
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_obra_social = models.ForeignKey(ObraSocial, models.DO_NOTHING, db_column='id_obra_social')
    nombre_titular = models.CharField(max_length=50)
    parentezco = models.CharField(max_length=50)
    credencial = models.BigIntegerField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes_x_os'
        unique_together = (('id_paciente', 'id_obra_social'),)


class ServiciosParticulares(models.Model):
    id_servicio = models.AutoField(primary_key=True)
    id_caja = models.ForeignKey(Caja, models.DO_NOTHING, db_column='id_caja')
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    fecha_realizacion = models.DateField()
    total = models.IntegerField()
    estado_pago = models.CharField(max_length=9)
    metodo_pago = models.CharField(max_length=13)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'servicios_particulares'


class Turnos(models.Model):
    id_turno = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    fecha_turno = models.DateField()
    hora_turno = models.TimeField()
    asunto = models.CharField(max_length=50, blank=True, null=True)
    comentario_turno = models.CharField(max_length=60, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'turnos'
