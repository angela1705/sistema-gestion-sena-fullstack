from rest_framework.routers import DefaultRouter
from .views import DetalleCajaViewSet

routerDetalleCaja = DefaultRouter()
routerDetalleCaja.register(prefix='detalleCaja',viewset= DetalleCajaViewSet )

urlpatterns = routerDetalleCaja.urls