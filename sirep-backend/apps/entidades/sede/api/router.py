from rest_framework.routers import DefaultRouter
from .views import SedeViewSet

routerSede = DefaultRouter()
routerSede.register(prefix='sedes',viewset= SedeViewSet)

urlpatterns = routerSede.urls