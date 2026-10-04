from django.db import migrations


DEFAULT_CATEGORIES = (
    "TI",
    "RH",
    "Compras",
    "Financeiro",
    "Infraestrutura",
)


def create_default_categories(apps, schema_editor):
    Categoria = apps.get_model("solicitacoes", "Categoria")
    database = schema_editor.connection.alias

    for nome in DEFAULT_CATEGORIES:
        Categoria.objects.using(database).get_or_create(nome=nome)


class Migration(migrations.Migration):

    dependencies = [
        ("solicitacoes", "0002_alter_solicitacao_options_and_more"),
    ]

    operations = [
        migrations.RunPython(
            create_default_categories,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
