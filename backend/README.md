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
scrii comanda

```sh
source ./venv/bin/activate
```
