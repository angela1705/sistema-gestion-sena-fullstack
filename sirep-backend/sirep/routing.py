from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.notificaciones.consumers import NotificacionConsumer
#from apps.gestion_operaciones.reservas.consumers import ReservaEstadoConsumer
# Agrega otros consumers aquí según tu arquitectura

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/notificaciones/", NotificacionConsumer.as_asgi()),
            #path("ws/reservas/estado/", ReservaEstadoConsumer.as_asgi()),
            # Agrega tus otros endpoints aquí
        ])
    )
})
