from django.contrib import admin
from .models import Categoria, Solicitacao


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'criado_em')
    search_fields = ('nome',)


@admin.register(Solicitacao)
class SolicitacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'categoria', 'solicitante', 'status', 'prioridade', 'criado_em')
    list_filter = ('status', 'prioridade', 'categoria')
    search_fields = ('titulo', 'descricao', 'solicitante__username')