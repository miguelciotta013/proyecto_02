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


class ObrasSociales(models.Model):
    id_obra_social = models.BigIntegerField(primary_key=True)
    os_codigo = models.IntegerField(blank=True, null=True)
    os_nombre = models.CharField(max_length=45, blank=True, null=True)
    activo = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'obras_sociales'


class Odontogramas(models.Model):
    id_odontograma = models.IntegerField(primary_key=True)
    fecha_creacion = models.DateField(blank=True, null=True)
    cant_dientes = models.IntegerField(blank=True, null=True)
    observaciones = models.CharField(max_length=45, blank=True, null=True)
    es_particular = models.IntegerField(blank=True, null=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'odontogramas'


class PacienteXOs(models.Model):
    id_paciente_x_os = models.BigIntegerField(primary_key=True)
    id_obra_social = models.ForeignKey(ObrasSociales, models.DO_NOTHING, db_column='id_obra_social', blank=True, null=True)
    nro_afiliado = models.CharField(max_length=45, blank=True, null=True)
    es_titular = models.IntegerField(db_column='es-titular', blank=True, null=True)  # Field renamed to remove unsuitable characters.
    parentezco = models.CharField(max_length=45, blank=True, null=True)
    activo = models.IntegerField(blank=True, null=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'paciente_x_os'


class Pacientes(models.Model):
    id_paciente = models.BigAutoField(primary_key=True)
    dni = models.CharField(max_length=45, blank=True, null=True)
    apellido = models.CharField(max_length=45, blank=True, null=True)
    nombre = models.CharField(max_length=45, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    localidad = models.CharField(max_length=45, blank=True, null=True)
    telefono = models.CharField(max_length=45, blank=True, null=True)
    activo = models.IntegerField(blank=True, null=True)
 
    class Meta:
        managed = False
        db_table = 'pacientes'
    def __str__(self):
        # Mostrar "Nombre Apellido (DNI)" o sólo "Nombre Apellido" si no hay DNI
        if self.dni:
            return f"{self.nombre} {self.apellido} (DNI: {self.dni})"
        else:
            return f"{self.nombre} {self.apellido}"





class Turnos(models.Model):
    id_turnos = models.BigAutoField(primary_key=True)
    fecha_turno = models.DateField(blank=True, null=True)
    hora_turno = models.TimeField(blank=True, null=True)
    estado_turno = models.CharField(max_length=45, blank=True, null=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'turnos'
