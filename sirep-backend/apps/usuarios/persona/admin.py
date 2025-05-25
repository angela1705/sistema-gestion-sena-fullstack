from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Persona

@admin.register(Persona)
class PersonaAdmin(UserAdmin):
    # Campos mostrados en la lista
    list_display = ('username', 'email', 'identificacion', 'first_name','last_name', 'rol', 'cargo', 'sede', 'is_staff')
    
    # Campos de búsqueda
    search_fields = ('username', 'email', 'identificacion', 'first_name', 'last_name')
    
    # Filtros
    list_filter = ('rol', 'cargo', 'sede', 'is_staff', 'is_active')
    
    # Organización del formulario de edición
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información personal', {
            'fields': ('first_name', 'last_name', 'email', 'identificacion','telefono', 'numFicha', 'foto')}),
            
        ('Información institucional', {
            'fields': ('rol', 'cargo', 'sede')
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser','groups', 'user_permissions')
        }),
        ('Fechas importantes', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    # Formulario de creación
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2',
                      'first_name', 'last_name', 'identificacion',
                      'rol', 'cargo', 'sede'),
        }),
    )
    
    # Ordenamiento
    ordering = ('username',)