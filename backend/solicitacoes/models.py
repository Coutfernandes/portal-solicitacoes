from django.db import models
from django.contrib.auth.models import User

class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Solicitacao(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('EM_ANDAMENTO', 'Em Andamento'),
        ('CONCLUIDO', 'Concluído'),
        ('CANCELADO', 'Cancelado'),
    ]

    PRIORIDADE_CHOICES = [
        ('BAIXA', 'Baixa'),
        ('MEDIA', 'Média'),
        ('ALTA', 'Alta'),
        ('URGENTE', 'Urgente'),
    ]

    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.PROTECT, 
        related_name='solicitacoes'
    )
    solicitante = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='minhas_solicitacoes'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='PENDENTE'
    )
    prioridade = models.CharField(
        max_length=10, 
        choices=PRIORIDADE_CHOICES, 
        default='MEDIA'
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Solicitação"
        verbose_name_plural = "Solicitações"
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.titulo} - {self.get_status_display()}"