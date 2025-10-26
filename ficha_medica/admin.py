from django.contrib import admin
from home.models import *
# Register your models here.

class ListaPacientesAdmin(admin.ModelAdmin):
    list_display = ('dni_paciente','nombre_paciente','apellido_paciente', 'fecha_nacimiento')
    search_fields = ('nombre_paciente','apellido_paciente')

admin.site.register(Pacientes, ListaPacientesAdmin)


class EmpleadosAdmin(admin.ModelAdmin):
    list_display = ('id_empleado', 'get_username', 'rol', 'fecha_creacion')
    list_filter = ('rol',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Usuario'
admin.site.register(Empleados, EmpleadosAdmin)

class ListaTratamientosAdmin(admin.ModelAdmin):
    list_display = ('nombre_tratamiento','codigo', 'importe')
    search_fields = ('nombre_tratamiento','codigo', 'importe')

admin.site.register(Tratamientos, ListaTratamientosAdmin)

class ListaFichasPatologicasAdmin(admin.ModelAdmin):
    list_display = ('id_ficha_patologica', 'id_paciente_os', 'otra')
    search_fields = ('id_ficha_patologica', 'id_paciente_os', 'otra')

admin.site.register(FichasPatologicas,  ListaFichasPatologicasAdmin)


class ListaObrasSocialesAdmin(admin.ModelAdmin):
    list_display = ('id_obra_social','nombre_os')
    search_fields = ('id_obra_social','nombre_os')
admin.site.register(ObrasSociales, ListaObrasSocialesAdmin)

class ListaCoberturasAdmin(admin.ModelAdmin):
    list_display = ('id_obra_social','id_tratamiento', 'porcentaje')
    search_fields = ('id_obra_social','id_tratamiento', 'porcentaje')
admin.site.register(CoberturasOs, ListaCoberturasAdmin)


class ListaPacXOsAdmin(admin.ModelAdmin):
    list_display = ('id_paciente','id_obra_social', 'id_parentesco','titular', 'credencial_paciente')
    search_fields = ('id_paciente','id_obra_social', 'id_parentesco','titular', 'credencial_paciente')

admin.site.register(PacientesXOs, ListaPacXOsAdmin)

class ListaCajasAdmin(admin.ModelAdmin):
    list_display = ('id_caja', 'fecha_hora_apertura','monto_apertura', 'fecha_hora_cierre', 'monto_cierre', 'estado_caja')
    search_fields = ('id_caja', 'fecha_papertura','monto_apertura', 'fecha_cierre', 'monto_cierre', 'estado_caja')
admin.site.register(Cajas, ListaCajasAdmin)
