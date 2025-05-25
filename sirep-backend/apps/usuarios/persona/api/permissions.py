from rest_framework.permissions import BasePermission

class IsUsuarioReadOnly(BasePermission):
    def has_permission(self, request, view):
        user_role = getattr(request.Persona.rol, 'rol', None) 
        
        permisos_por_rol = {
            "Administrador": ["GET", "POST", "PUT", "DELETE"],
            "Instructor": ["GET", "POST", "PUT", "DELETE"],
            "Pasante": ["GET", "POST", "PUT"],
            "Aprendiz": ["GET", "POST", "PUT"]
        }

        return request.method in permisos_por_rol.get(user_role, [])
