from rest_framework.routers import DefaultRouter
from .views import UnidadProductivaViewSet

routerUnidadP= DefaultRouter()
routerUnidadP.register(prefix='unidad-productiva',viewset= UnidadProductivaViewSet)

urlpatterns = routerUnidadP.urls