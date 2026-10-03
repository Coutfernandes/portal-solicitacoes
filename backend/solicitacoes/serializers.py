from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Categoria, Solicitacao


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class SolicitacaoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.ReadOnlyField(source='categoria.nome')
    solicitante_nome = serializers.ReadOnlyField(source='solicitante.username')

    class Meta:
        model = Solicitacao
        fields = '__all__'
        read_only_fields = ['solicitante', 'criado_em', 'atualizado_em']