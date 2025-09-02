from django.contrib.auth import login
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
#from django.views.generic.edit import FormView
from .forms import LoginForm #RegisterForm

class CustomLoginView(LoginView):
    template_name = 'login.html'           # Este es el html login.html que se encuentra en la app home :v
    authentication_form = LoginForm
    redirect_authenticated_user = True     # Mira si te logeas, te manda  a  LOGIN_REDIRECT_URL

class CustomLogoutView(LogoutView):
    # No hace falta nada más; usamos LOGOUT_REDIRECT_URL de settings.py
    pass

'''
class RegisterView(FormView):
    template_name = 'register.html'        # Y aqui el register.html de la app login
    form_class = RegisterForm
    success_url = '/'                      # Te manda a Home ("/")

    def form_valid(self, form):
        user = form.save()                 # crea en auth_user 
        login(self.request, user)          # Esto inicia sesión automáticamente
        return super().form_valid(form)
'''