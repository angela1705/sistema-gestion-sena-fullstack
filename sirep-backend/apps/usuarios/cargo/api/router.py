from rest_framework.routers import DefaultRouter
from .views import CargoViewSet

routerCargo= DefaultRouter()
routerCargo.register(prefix='cargo',viewset= CargoViewSet)

urlpatterns = routerCargo.urls