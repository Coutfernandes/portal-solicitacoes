from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, SolicitacaoViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'solicitacoes', SolicitacaoViewSet, basename='solicitacao')

urlpatterns = [
    path('', include(router.urls)),
]