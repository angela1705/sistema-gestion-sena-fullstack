from rest_framework.permissions import BasePermission

class IsLiderUpOrAdministrador(BasePermission):
    """
    Permite acceso completo solo a usuarios con rol 'administrador' o 'liderup'.
    Otros usuarios pueden acceder solo a métodos de lectura seguros (GET, HEAD, OPTIONS).
    """

    def has_permission(self, request, view):
        # Verifica si el usuario está autenticado
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Obtiene el nombre del rol del usuario
        rol_obj = getattr(user, 'rol', None)
        rol_nombre = getattr(rol_obj, 'nombre', '').lower() if rol_obj else ''

        # Roles autorizados para acceso completo
        if rol_nombre in ['administrador', 'liderup']:
            return True

        # Otros roles solo pueden leer
        return request.method in ['GET', 'HEAD', 'OPTIONS']
