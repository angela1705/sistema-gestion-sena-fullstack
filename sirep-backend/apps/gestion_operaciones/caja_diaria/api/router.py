from rest_framework.routers import DefaultRouter
from .views import CajaDiariaViewSet

routerCajaDiaria = DefaultRouter()
routerCajaDiaria.register(prefix='cajaDiaria',viewset= CajaDiariaViewSet )

urlpatterns = routerCajaDiaria.urls