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
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    fecha_apertura = models.DateField()
    hora_apertura = models.TimeField()
    monto_apertura = models.IntegerField()
    fecha_cierre = models.DateField(blank=True, null=True)
    hora_cierre = models.TimeField(blank=True, null=True)
    monto_cierre = models.IntegerField(blank=True, null=True)
    estado_caja = models.CharField(max_length=7)

    class Meta:
        managed = False
        db_table = 'cajas'


class DetalleTratamiento(models.Model):
    id_detalle = models.BigAutoField(primary_key=True)
    id_diente = models.ForeignKey('DientesOdontograma', models.DO_NOTHING, db_column='id_diente')
    id_tratamiento_cobrado = models.ForeignKey('TratamientosCobrados', models.DO_NOTHING, db_column='id_tratamiento_cobrado')
    codigo = models.BigIntegerField(blank=True, null=True)
    fecha_realizacion = models.DateField(blank=True, null=True)
    conformidad_paciente = models.CharField(max_length=50, blank=True, null=True)
    importe = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'detalle_tratamiento'


class DientesOdontograma(models.Model):
    id_diente = models.BigAutoField(primary_key=True)
    id_odontograma = models.ForeignKey('Odontogramas', models.DO_NOTHING, db_column='id_odontograma')
    nomenclatura_diente = models.IntegerField()
    cara_superior = models.CharField(max_length=50, blank=True, null=True)
    cara_inferior = models.CharField(max_length=50, blank=True, null=True)
    cara_izquierda = models.CharField(max_length=50, blank=True, null=True)
    cara_derecha = models.CharField(max_length=50, blank=True, null=True)
    cara_centro = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dientes_odontograma'


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
    id_ficha_medica = models.BigAutoField(primary_key=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente')
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    fecha_creacion = models.DateField()
    observaciones = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ficha_medica'


class FichasPatologicas(models.Model):
    id_ficha_patologica = models.BigAutoField(primary_key=True)
    id_ficha_medica = models.OneToOneField(FichaMedica, models.DO_NOTHING, db_column='id_ficha_medica', blank=True, null=True)
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
    hipotencion = models.IntegerField(blank=True, null=True)
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
    vih = models.IntegerField(blank=True, null=True)
    portador_protesis = models.IntegerField(blank=True, null=True)
    problema_periodontal = models.IntegerField(blank=True, null=True)
    ortodoncia = models.IntegerField(blank=True, null=True)
    mala_oclusion = models.IntegerField(blank=True, null=True)
    lesion_mucosa = models.IntegerField(blank=True, null=True)
    toma_medicacion = models.IntegerField(blank=True, null=True)
    otras = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fichas_patologicas'


class ObrasSociales(models.Model):
    id_obra_social = models.BigAutoField(primary_key=True)
    nombre_os = models.CharField(max_length=50)
    codigo_os = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'obras_sociales'


class Odontogramas(models.Model):
    id_odontograma = models.BigAutoField(primary_key=True)
    id_ficha_medica = models.OneToOneField(FichaMedica, models.DO_NOTHING, db_column='id_ficha_medica', blank=True, null=True)
    cantidad_dientes = models.IntegerField()
    observaciones = models.CharField(max_length=100, blank=True, null=True)
    protesis_removible = models.CharField(max_length=2, blank=True, null=True)
    protesis_fija = models.CharField(max_length=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'odontogramas'


class Pacientes(models.Model):
    id_paciente = models.BigAutoField(primary_key=True)
    dni_paciente = models.IntegerField(blank=True, null=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    domicilio = models.CharField(max_length=100, blank=True, null=True)
    localidad = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes'


class PacientesXOs(models.Model):
    pk = models.CompositePrimaryKey('id_paciente', 'id_obra_social')
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_obra_social = models.ForeignKey(ObrasSociales, models.DO_NOTHING, db_column='id_obra_social')
    nombre_titular = models.CharField(max_length=50, blank=True, null=True)
    parentezco_titular = models.CharField(max_length=50, blank=True, null=True)
    credencial = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes_x_os'


class Roles(models.Model):
    id_rol = models.BigAutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'roles'


class TratamientosCobrados(models.Model):
    id_tratamiento_cobrado = models.BigAutoField(primary_key=True)
    id_ficha_medica = models.OneToOneField(FichaMedica, models.DO_NOTHING, db_column='id_ficha_medica', blank=True, null=True)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')
    total_tratamiento = models.IntegerField()
    metodo_pago = models.CharField(max_length=13)
    estado_pago = models.CharField(max_length=9)

    class Meta:
        managed = False
        db_table = 'tratamientos_cobrados'


class Turnos(models.Model):
    id_turno = models.BigAutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    fecha_turno = models.DateField()
    hora_turno = models.TimeField()
    asunto = models.CharField(max_length=30, blank=True, null=True)
    comentario_turno = models.CharField(max_length=80, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'turnos'


class Usuarios(models.Model):
    id_usuario = models.BigAutoField(primary_key=True)
    nombre_usuario = models.CharField(max_length=50)
    apellido_usuario = models.CharField(max_length=50)
    correo_electronico = models.CharField(max_length=100)
    contrasena = models.CharField(max_length=100)
    fecha_alta = models.DateField()
    fecha_baja = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios'


class UsuariosXRoles(models.Model):
    pk = models.CompositePrimaryKey('id_usuario', 'id_rol')
    id_usuario = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usuario')
    id_rol = models.ForeignKey(Roles, models.DO_NOTHING, db_column='id_rol')
    matricula_profesional = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios_x_roles'
