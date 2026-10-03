from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Categoria, Solicitacao


class SolicitacaoDashboardTests(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username='solicitante', password='senha-segura')
        self.categoria = Categoria.objects.create(nome='Tecnologia')
        self.outra_categoria = Categoria.objects.create(nome='Recursos Humanos')
        self.client.force_authenticate(user=self.usuario)

        self.solicitacao_aberta = Solicitacao.objects.create(
            titulo='Acesso ao sistema',
            descricao='Solicitação de acesso',
            categoria=self.categoria,
            solicitante=self.usuario,
            status='PENDENTE',
        )
        Solicitacao.objects.create(
            titulo='Atualização de cadastro',
            descricao='Atualizar os dados',
            categoria=self.outra_categoria,
            solicitante=self.usuario,
            status='EM_ANDAMENTO',
        )

    def test_list_filters_by_title_status_and_category(self):
        response = self.client.get('/api/solicitacoes/', {
            'search': 'Acesso',
            'status': 'PENDENTE',
            'categoria': self.categoria.id,
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item['id'] for item in response.data['results']],
            [self.solicitacao_aberta.id],
        )

    def test_list_searches_by_numeric_code(self):
        response = self.client.get('/api/solicitacoes/', {'search': f'#{self.solicitacao_aberta.id}'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item['id'] for item in response.data['results']],
            [self.solicitacao_aberta.id],
        )

    def test_kpis_use_backend_statuses_and_names(self):
        response = self.client.get('/api/solicitacoes/kpis/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {
            'total': 2,
            'pendentes': 1,
            'em_andamento': 1,
            'concluidos': 0,
        })

    def test_alterar_status_updates_solicitacao(self):
        response = self.client.patch(
            f'/api/solicitacoes/{self.solicitacao_aberta.id}/alterar_status/',
            {'status': 'EM_ANDAMENTO'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.solicitacao_aberta.refresh_from_db()
        self.assertEqual(self.solicitacao_aberta.status, 'EM_ANDAMENTO')
