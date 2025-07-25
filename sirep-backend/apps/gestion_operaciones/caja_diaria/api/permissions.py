from rest_framework.permissions import BasePermission

class PuedeCrearCaja(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        rol = getattr(request.user, 'rol', None)
        return rol and rol.nombre in ['administrador', 'liderup', 'cajero']