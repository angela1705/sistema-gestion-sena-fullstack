from rest_framework.permissions import BasePermission

class EsLiderOAdministrador(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        rol = getattr(user, 'rol', None)
        if rol and rol.nombre in ['administrador', 'liderup']:
            return True
        return False
