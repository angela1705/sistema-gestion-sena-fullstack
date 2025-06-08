from rest_framework.routers import DefaultRouter
from .views import TransaccionViewSet

routerTransaccion = DefaultRouter()
routerTransaccion.register(prefix='transaccion',viewset=TransaccionViewSet)

urlpatterns = routerTransaccion.urls