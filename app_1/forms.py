from django import forms
from app_1.models import *
class ProductForm(forms.ModelForm):
    class Meta:
        model = Odontogramas
        fields = ["cant_dientes", "observaciones", "es_particular"]