from rest_framework.routers import DefaultRouter
from apps.usuarios.rol.api.views import RolViewSet

routerRol=DefaultRouter()
routerRol.register(prefix='rol',viewset=RolViewSet)