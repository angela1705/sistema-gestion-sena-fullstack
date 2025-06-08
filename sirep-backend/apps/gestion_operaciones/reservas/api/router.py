from rest_framework.routers import DefaultRouter
from .views import ReservaViewSet

routerReserva = DefaultRouter()
routerReserva.register(prefix='reserva',viewset= ReservaViewSet )

urlpatterns = routerReserva.urls