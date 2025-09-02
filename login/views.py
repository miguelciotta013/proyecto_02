# login/views.py
from django.contrib.auth import login
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.views.generic.edit import FormView

from .forms import LoginForm, RegisterForm

class CustomLoginView(LoginView):
    template_name = 'login.html'           # tú dijiste que existe login/templates/login.html
    authentication_form = LoginForm
    redirect_authenticated_user = True     # si ya está logueado, lo manda a LOGIN_REDIRECT_URL

class CustomLogoutView(LogoutView):
    # No hace falta nada más; usamos LOGOUT_REDIRECT_URL de settings.py
    pass

class RegisterView(FormView):
    template_name = 'register.html'        # lo creamos debajo
    form_class = RegisterForm
    success_url = '/'                      # manda a Home ("/")

    def form_valid(self, form):
        user = form.save()                 # crea en auth_user
        login(self.request, user)          # inicia sesión
        return super().form_valid(form)
