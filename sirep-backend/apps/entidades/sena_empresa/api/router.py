from rest_framework.routers import DefaultRouter
from .views import SenaEmpresaViewSet

routerSena = DefaultRouter()
routerSena.register(prefix='empresas-sena',viewset= SenaEmpresaViewSet)

urlpatterns = routerSena.urls