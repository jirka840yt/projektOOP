/**
 * Soubor: app.ts
 * Obsahuje logiku tříd a spouštěcí kód aplikace.
 */

// --- 1. DEFINICE TŘÍD A VALIDACE ---

abstract class Vozidlo {
    protected spz: string;
    protected zakladniCenaZaDen: number;

    constructor(spz: string, zakladniCenaZaDen: number) {
        if (!spz || spz.trim() === "") {
            throw new Error("SPZ nesmí být prázdná.");
        }
        if (zakladniCenaZaDen <= 0) {
            throw new Error("Základní cena za den musí být větší než 0.");
        }

        this.spz = spz;
        this.zakladniCenaZaDen = zakladniCenaZaDen;
    }

    public getSpz(): string {
        return this.spz;
    }

    public abstract spocitejCenuPronajmu(pocetDni: number): number;
}

class OsobniAuto extends Vozidlo {
    private jeLuxusni: boolean;

    constructor(spz: string, zakladniCenaZaDen: number, jeLuxusni: boolean) {
        super(spz, zakladniCenaZaDen);
        this.jeLuxusni = jeLuxusni;
    }

    public spocitejCenuPronajmu(pocetDni: number): number {
        let celkovaCena = this.zakladniCenaZaDen * pocetDni;
        if (this.jeLuxusni) {
            celkovaCena *= 1.25; 
        }
        return celkovaCena;
    }
}

class Dodavka extends Vozidlo {
    private nosnostKg: number;

    constructor(spz: string, zakladniCenaZaDen: number, nosnostKg: number) {
        super(spz, zakladniCenaZaDen);
        
        if (nosnostKg <= 0) {
            throw new Error("Nosnost dodávky musí být větší než 0.");
        }
        this.nosnostKg = nosnostKg;
    }

    public spocitejCenuPronajmu(pocetDni: number): number {
        const priplatekZaNosnost = Math.ceil(this.nosnostKg / 500) * 100;
        const cenaZaDenCelkem = this.zakladniCenaZaDen + priplatekZaNosnost;
        return cenaZaDenCelkem * pocetDni;
    }
}


// --- 2. OŽIVENÍ OBJEKTŮ A POLYMORFISMUS V KONZOLI ---

const vozovyPark: Vozidlo[] = [];

// Proměnná surovaDataVozidel je dostupná z data.ts
for (const data of surovaDataVozidel) {
    try {
        if (data.typ === "osobni") {
            vozovyPark.push(new OsobniAuto(data.spz, data.zakladniCena, data.jeLuxusni as boolean));
        } else if (data.typ === "dodavka") {
            vozovyPark.push(new Dodavka(data.spz, data.zakladniCena, data.nosnostKg as number));
        }
    } catch (error) {
        console.error(`Chyba při vytváření vozidla se SPZ ${data.spz}:`, error);
    }
}

const pocetDniPronajmu = 3;

console.log(`--- KALKULACE PRONÁJMU NA ${pocetDniPronajmu} DNY ---`);

for (const vozidlo of vozovyPark) {
    const cena = vozidlo.spocitejCenuPronajmu(pocetDniPronajmu);
    console.log(`Vozidlo [${vozidlo.getSpz()}]: Celková cena = ${cena} Kč`);
}