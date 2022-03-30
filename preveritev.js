const lokalno = require('passport-local').Strategy;
const kripto = require('bcrypt');

function inicializacija(gelso, getUporabnik, getUporabnikId) {
    
    const avtenticirajUporabnika = async (uporabnisko, geslo, done) => {
        let uporabnik = getUporabnik(uporabnisko);

        if(user == null) {
            return done(null, false, { sporocilo: 'Uporabnik z uporabniškim imenom ' + uporabnisko + ' ne obstaja!'});
        }

        try {
            if(await kripto.compare(geslo, uporabnik.geslo)) {
                return done(null, user);
            } else {
                return done(null, false, { sporocilo: 'Geslo je napačno. Prosimo, če se ponovno prijavite.'});
            }
        } catch(error) {
            return done(error);
        }
    }

    passport.use(new lokalno({ poljeUporabnisko: 'uporabnisko'}, avtenticirajUporabnika));
    passport.serializeUser((uporabnik, done) => done(null, uporabnik.id));
    passport.deserializeUser((uporabnik, done) => {
        return done(null, getUporabnikId(id));
    });
}

module.exports = inicializacija;