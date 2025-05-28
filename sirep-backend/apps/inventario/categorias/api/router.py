from rest_framework.routers import DefaultRouter
from .views import TipoCategoriaViewSet

routerCategoria= DefaultRouter()
routerCategoria.register(prefix='categoria',viewset= TipoCategoriaViewSet)

urlpatterns = routerCategoria.urls