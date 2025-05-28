from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

Persona = get_user_model()

class IdentificacionBackend(ModelBackend):
    def authenticate(self, request, identificacion=None, password=None, **kwargs):
        try:
            user = Persona.objects.get(identificacion=identificacion)
            if user.check_password(password):
                return user
        except Persona.DoesNotExist:
            return None