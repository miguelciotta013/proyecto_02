from django import forms
from django.contrib.auth.forms import AuthenticationForm #UserCreationForm
#from django.contrib.auth.models import User

class LoginForm(AuthenticationForm):
    # Aqui puede ser opcional estilo de Boostrap va si quieren xd
    username = forms.CharField(
        label='Usuario',
        widget=forms.TextInput(attrs={'class': 'form-control', 'autofocus': True})
    )
    password = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )

'''
class RegisterForm(UserCreationForm):
    email = forms.EmailField(label='Email', required=False,
                             widget=forms.EmailInput(attrs={'class': 'form-control'}))

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Aqui puede ser opcional estilo de Boostrap va si quieren xd
        self.fields['username'].widget.attrs.update({'class': 'form-control'})
        self.fields['password1'].widget.attrs.update({'class': 'form-control'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control'})
'''