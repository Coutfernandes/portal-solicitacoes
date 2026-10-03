from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, SolicitacaoViewSet, me, register_user

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'solicitacoes', SolicitacaoViewSet, basename='solicitacao')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/me/', me, name='user_me'),
    path('auth/register/', register_user, name='user_register'),
]