from rest_framework.viewsets import ModelViewSet
from apps.usuarios.rol.models import Rol
from apps.usuarios.rol.api.serializer import RolSerializer
from rest_framework.permissions import IsAuthenticated

class RolViewSet(ModelViewSet):
    queryset= Rol.objects.all()
    serializer_class=RolSerializer
    permission_classes=[IsAuthenticated]