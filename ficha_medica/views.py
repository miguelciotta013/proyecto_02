from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.forms import formset_factory
from home.models import Pacientes, FichaMedica, DetalleConsulta, Consultas, AuthUser
from .forms import FormularioFichaMedica, FormularioDetalleConsulta, FormularioConsulta
from django.utils import timezone

# Create your views here.

def mostrar_pacientes(request):
    paciente = Pacientes.objects.all()
    return render(request,"historial/lista_pacientes.html", {"pacientes":paciente})

@login_required  # Asegurar que el usuario esté autenticado
def crear_ficha(request, pk):
    paciente = get_object_or_404(Pacientes, pk=pk)
    
    # SOLUCIÓN: Obtener el AuthUser usando el mismo ID del usuario autenticado
    try:
        auth_user = AuthUser.objects.get(id=request.user.id)
    except AuthUser.DoesNotExist:
        messages.error(request, 'Tu usuario no está registrado en el sistema médico.')
        return redirect('lista_pacientes')
    
    if request.method == "POST":
        form = FormularioFichaMedica(request.POST)
        if form.is_valid():
            ficha = form.save(commit=False)
            ficha.id_paciente = paciente  # Asignar el paciente
            ficha.id_usuario = auth_user  # Usar AuthUser (no request.user)
            ficha.save()
            
            messages.success(
                request, 
                f'Ficha médica creada exitosamente para {paciente.nombre} {paciente.apellido} '
                f'por Dr. {auth_user.first_name} {auth_user.last_name}'
            )
            return redirect('historial_paciente', pk=paciente.pk)
        else:
            messages.error(request, 'Por favor corrija los errores en el formulario')
    else:
        # Pre-llenar fecha actual
        form = FormularioFichaMedica(initial={
            'fecha_creacion': timezone.now().date()
        })
    
    return render(request, "historial/crear_ficha.html", {
        "form": form,
        "paciente": paciente,
        "usuario_actual": auth_user  # Usar AuthUser para mostrar datos
    })

def historial_paciente(request, pk):
    paciente = get_object_or_404(Pacientes, pk=pk)
    
    # Buscar si tiene ficha médica
    try:
        ficha_medica = FichaMedica.objects.select_related('id_usuario').get(id_paciente=paciente)
        tiene_ficha = True
    except FichaMedica.DoesNotExist:
        ficha_medica = None
        tiene_ficha = False
    
    # Obtener todas las consultas del paciente (a través de la ficha médica)
    consultas = []
    if tiene_ficha:
        consultas = Consultas.objects.filter(
            detalleconsulta__id_ficha_medica=ficha_medica
        ).distinct().order_by('-fecha_consulta')
    
    return render(request, "historial/historial_paciente.html", {
        "paciente": paciente,
        "ficha_medica": ficha_medica,
        "tiene_ficha": tiene_ficha,
        "consultas": consultas
    })

@login_required
def nueva_consulta(request, pk):
    paciente = get_object_or_404(Pacientes, pk=pk)
    ficha_medica = get_object_or_404(FichaMedica, id_paciente=paciente)
    
    # Obtener el AuthUser usando el mismo ID del usuario autenticado
    try:
        auth_user = AuthUser.objects.get(id=request.user.id)
    except AuthUser.DoesNotExist:
        messages.error(request, 'Tu usuario no está registrado en el sistema médico.')
        return redirect('historial_paciente', pk=paciente.pk)
    
    # Formset para múltiples tratamientos - MEJORADO
    DetalleTratamientoFormSet = formset_factory(
        FormularioDetalleConsulta,   
        can_delete=True,
        max_num=10  # Máximo 10 tratamientos por consulta
    )
    
    if request.method == "POST":
        form_consulta = FormularioConsulta(request.POST)
        formset_detalles = DetalleTratamientoFormSet(request.POST)
        
        if form_consulta.is_valid() and formset_detalles.is_valid():
            # Crear la consulta
            consulta = form_consulta.save()
            
            # Validar que hay al menos un tratamiento
            tratamientos_validos = 0
            
            # Crear los detalles de tratamiento
            for form_detalle in formset_detalles:
                if form_detalle.is_valid() and form_detalle.cleaned_data:
                    # Solo procesar formularios que tienen datos y no están marcados para eliminar
                    if (not form_detalle.cleaned_data.get('DELETE', False) and 
                        form_detalle.cleaned_data.get('nro_diente') and 
                        form_detalle.cleaned_data.get('importe')):
                        
                        detalle = form_detalle.save(commit=False)
                        detalle.id_consulta = consulta
                        detalle.id_ficha_medica = ficha_medica
                        detalle.save()
                        tratamientos_validos += 1
            
            # Validar que se guardó al menos un tratamiento
            if tratamientos_validos == 0:
                messages.warning(request, 'Debe agregar al menos un tratamiento para guardar la consulta.')
                # No redirigir, mostrar el formulario nuevamente
            else:
                messages.success(
                    request, 
                    f'Consulta guardada exitosamente con {tratamientos_validos} tratamiento(s) '
                    f'para {paciente.nombre} {paciente.apellido}'
                )
                return redirect('historial_paciente', pk=paciente.pk)
        else:
            # Mostrar errores específicos
            if not form_consulta.is_valid():
                messages.error(request, 'Por favor corrija los errores en los datos de la consulta.')
            if not formset_detalles.is_valid():
                messages.error(request, 'Por favor revise los datos de los tratamientos.')
    else:
        # Pre-llenar fecha actual en nueva consulta
        form_consulta = FormularioConsulta(initial={
            'fecha_consulta': timezone.now().date(),
            'total_consulta': 0
        })
        formset_detalles = DetalleTratamientoFormSet()
    
    return render(request, "historial/nueva_consulta.html", {
        "paciente": paciente,
        "ficha_medica": ficha_medica,
        "form_consulta": form_consulta,
        "formset_detalles": formset_detalles,
        "usuario_actual": auth_user
})