const express = require('express');
const app = express();
const kripto = require('bcrypt');
const mysql = require('mysql');
const { redirect } = require('express/lib/response');

const baza = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'oivvaje2'
});

baza.connect(error => {
    if(error) {
        throw error;
    }
    console.log('Povezan na podatkovno bazo!');

    /*
    let ukaz = "CREATE DATABASE oivvaje2";
    let tabela = "CREATE TABLE uporabniki(id int AUTO_INCREMENT, uporabnisko VARCHAR(45), geslo VARCHAR(45), sol VARCHAR(10), PRIMARY KEY(id))";
    baza.query(ukaz, (err) => {
        if(err) {
            throw err;
        }
    });
    baza.query(tabela, err => {
        if(err) {
            throw err;
        }
    });
    */
});

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', (request, response) => {
    response.render('index.ejs');
});

app.get('/registracija', (request, response) => {
    response.render('registracija.ejs');
});

app.get('/prijava', (request, response) => {
    response.render('prijava.ejs');
});

app.get('/prijavljen', (request, response) => {
    response.render('prijavljen.ejs');
});

app.post('/prijava', async (request, response) => {

    baza.on('error', function(error) {
        console.log(error);
    });

    try {

        let uporabniskoIme = await request.body.uporabnisko;
        let geslo = await request.body.geslo;

        let ukaz = "SELECT * FROM uporabniki WHERE uporabniskoIme IN('" + uporabniskoIme + "')";

        geslo = String(geslo);

        let izvrsitev = baza.query(ukaz, function(error, rezultat) {
            if(rezultat.length === 0) {
                console.log('Napacno uporabnisko ime.');
                response.redirect('/prijava');
            } else {
                if(error) {
                    throw error;
                } else {
                    if(rezultat != null) {
                        let razbitje = Object.values(JSON.parse(JSON.stringify(rezultat)));
                        let preveritevGesla = "";

                        if(razbitje != null) {
                            if(razbitje[0].uporabniskoIme == (uporabniskoIme)) {
                                geslo = kripto.hash(String(request.body.geslo + razbitje[0].sol), 10);
                                preveritevGesla += razbitje[0].geslo;
                                if(kripto.compareSync(request.body.geslo + razbitje[0].sol, razbitje[0].geslo)) {
                                    response.redirect('/prijavljen');
                                } else {
                                    console.log("Napačno geslo. Prosim, če vpišete še enkrat.");
                                    response.redirect('/prijava');
                                }
                            } else {
                                console.log("Napačno uporabniško ime. Prosim, če vpišete še enkrat.");
                                response.redirect('/prijava');
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
});

app.post('/registracija', async (request, response) => {
    try {

        function sol() {
            let rezultat = '';
            let znaki = 'ABCDEF1234567890abcdef'

            for(let i = 0; i < 10; i++) {
                rezultat += znaki.charAt(Math.floor(Math.random() * 22));
            }

            return rezultat;
        }

        let soljeno = sol();
        let novoGeslo = await request.body.geslo + soljeno;

        let kriptiranoGeslo = await kripto.hash(novoGeslo, 10);
        let ukaz = 'INSERT INTO uporabniki SET ?';

        let uporabnik = {uporabniskoIme: request.body.uporabnisko, geslo: kriptiranoGeslo, sol: soljeno};

        let izvrsitev = baza.query(ukaz, uporabnik, error => {
            if(error) {
                throw error;
            }
        });
        response.redirect('/');
    } catch (error2) {
        response.redirect('/registracija');
        console.log(error2);
    }
});

app.listen(8080);