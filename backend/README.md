# Setup

Pe **windows**, trebuie sa folosesti git bash. Ca sa intri in git bash, faci
`click dreapta` > `Open Git Bash here`.

Afla versiunea lui python ruland urmatoarea comanda:

```sh
python --version
```

Trebuie sa fie cel putin `Python 3.11`.

Apoi ruleaza urmatoarele comenzi:

```sh
python -m venv ./venv
source ./venv/bin/activate
pip install -r ./requirements.txt
```

De acum inainte, mereu cand ai de gand sa lucrezi la proiect, **nu uita** sa
activezi venv-ul, scriind comanda:

```sh
source ./venv/bin/activate
```

# Running

Asigura-te mai intai ca ai rulat comanda care activeaza venv-ul, apoi ruleaza:

```sh
python main.py
```

# Conventii

Daca vrei sa fii cool 😎, atunci respecta urmatoarele conventii:

- nume de variabile, functii in `snake_case`
- nume de clase in `PascalCase`
