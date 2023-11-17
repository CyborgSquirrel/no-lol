# Setup

Afla versiunea lui python ruland urmatoarea comanda:

```sh
python --version
```

Trebuie sa fie cel putin `Python 3.11`.

Apoi ruleaza urmatoarele comenzi:

**Windows**

```batch
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Linux**

```sh
python -m venv ./venv
source ./venv/bin/activate
pip install -r ./requirements.txt
```

De acum inainte, mereu cand ai de gand sa lucrezi la proiect, **nu uita** sa
activezi venv-ul, scriind comanda:

**Windows**

```batch
venv\Scripts\activate
```

**Linux**

```sh
source ./venv/bin/activate
```

# Configuration

**Trebuie toti sa folosim API key-uri generate de acelasi cont.**

<details>

<summary>De ce?</summary>

Pentru ca id-urile pe care le primesti de la API-ul lol pentru un anumit
summoner (puuid, summoner id, etc.) sunt diferite de la un cont la altul. Este o
masura de securitate de la Riot games.

</details

Intra pe [site-ul de developer de la riot](https://developer.riotgames.com/).
Logheaza-te cu contul de riot games din `resurse > cont api` pe discord. Daca
atunci cand te loghezi iti cere sa intri un cod, scrie-i lui Andrei (Jardan).

De acolo ar trebui sa poti sa copiezi/actualizezi API key-ul.

# Running

Asigura-te mai intai ca ai rulat comanda care activeaza venv-ul, apoi ruleaza:

```sh
python main.py
```

# Conventii

Daca vrei sa fii cool 😎, atunci respecta urmatoarele conventii:

- nume de variabile, functii in `snake_case`
- nume de clase in `PascalCase`
