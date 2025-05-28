from django.contrib.auth.models import BaseUserManager

class PersonaManager(BaseUserManager):
    def create_user(self, identificacion, password=None, **extra_fields):
        if not identificacion:
            raise ValueError('El campo identificación es obligatorio')
        user = self.model(identificacion=identificacion, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, identificacion, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(identificacion, password, **extra_fields)
