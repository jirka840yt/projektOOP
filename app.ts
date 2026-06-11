/// <reference path="data.ts" />

// --- 1. DEFINICE TRID A VALIDACE ---

abstract class Vozidlo {
    protected spz: string;
    protected zakladniCenaZaDen: number;

    constructor(spz: string, zakladniCenaZaDen: number) {
        // Ocisteni vstupu
        const cistaSpz = spz.toUpperCase().replace(/\s+/g, "");

        // Kontrola delky
        if (cistaSpz.length !== 7 && cistaSpz.length !== 8) {
            throw new Error("SPZ musí obsahovat přesně 7 nebo 8 znaků.");
        }

        // Kontrola povolenych znaku
        const spzRegex = /^[A-Z0-9]+$/;
        if (!spzRegex.test(cistaSpz)) {
            throw new Error("SPZ smí obsahovat pouze písmena a číslice.");
        }

        // Specificka pravidla pro 7mistnou SPZ
        if (cistaSpz.length === 7) {
            const posledniCtyriZnaky = cistaSpz.substring(3);
            const jenCislaRegex = /^[0-9]{4}$/; 
            
            if (!jenCislaRegex.test(posledniCtyriZnaky)) {
                throw new Error("U standardní 7 místne SPZ musí být poslední 4 znaky výhradně číslice.");
            }
        }

        // Specificka pravidla pro 8mistnou SPZ
        if (cistaSpz.length === 8) {
            // Regularni vyraz, ktery kontroluje, zda retezec obsahuje alespoj jedno cislo (0-9)
            const obsahujeCisloRegex = /[0-9]/;
            
            if (!obsahujeCisloRegex.test(cistaSpz)) {
                throw new Error("Vlastní 8 místná SPZ musí obsahovat alespoň jedno číslo.");
            }
        }

        // Zformatovani pro vypis
        this.spz = cistaSpz.substring(0, 3) + " " + cistaSpz.substring(3);

        // Validace ceny
        if (zakladniCenaZaDen <= 0) {
            throw new Error("Zakladní cena za den musí být větší než 0.");
        }

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

    public getJeLuxusni(): boolean {
        return this.jeLuxusni;
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

    public getNosnostKg(): number {
        return this.nosnostKg;
    }

    public spocitejCenuPronajmu(pocetDni: number): number {
        const priplatekZaNosnost = Math.ceil(this.nosnostKg / 500) * 100;
        const cenaZaDenCelkem = this.zakladniCenaZaDen + priplatekZaNosnost;
        return cenaZaDenCelkem * pocetDni;
    }
}

// --- 2. PROPOJENI S DOM A DYNAMIKA ---

const vozovyPark: Vozidlo[] = [];

const htmlGrid = document.getElementById("vehicleGrid") as HTMLDivElement;
const inputPocetDni = document.getElementById("pocetDni") as HTMLInputElement;
const formAddVehicle = document.getElementById("addVehicleForm") as HTMLFormElement;

const selectTyp = document.getElementById("typVozidla") as HTMLSelectElement;
const inputZakladniCena = document.getElementById("zakladniCena") as HTMLInputElement;
const boxLuxus = document.getElementById("boxLuxus") as HTMLDivElement;
const inputJeLuxusni = document.getElementById("jeLuxusni") as HTMLInputElement;
const boxNosnost = document.getElementById("boxNosnost") as HTMLDivElement;
const inputNosnost = document.getElementById("nosnost") as HTMLInputElement;
const nahledCenyElement = document.getElementById("cenaNahled") as HTMLDivElement;

function nactiDataZDatabaze() {
    for (const data of surovaDataVozidel) {
        if (data.typ === "osobni") {
            vozovyPark.push(new OsobniAuto(data.spz, data.zakladniCena, data.jeLuxusni as boolean));
        } else if (data.typ === "dodavka") {
            vozovyPark.push(new Dodavka(data.spz, data.zakladniCena, data.nosnostKg as number));
        }
    }
}

function prekesliRozhrani() {
    htmlGrid.innerHTML = ""; 
    const pocetDni = parseInt(inputPocetDni.value) || 1; 

    for (const vozidlo of vozovyPark) {
        const cena = vozidlo.spocitejCenuPronajmu(pocetDni);
        let typText = "";
        let specifickyUdaj = "";

        if (vozidlo instanceof OsobniAuto) {
            typText = "Osobní auto";
            specifickyUdaj = vozidlo.getJeLuxusni() ? "Třída: Luxusní VIP" : "Třída: Standardní";
        } else if (vozidlo instanceof Dodavka) {
            typText = "Nakladní dodavka";
            specifickyUdaj = `Nosnost: ${vozidlo.getNosnostKg()} kg`;
        }

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${typText}</h3>
            <p><strong>SPZ:</strong> ${vozidlo.getSpz()}</p>
            <p><strong>Specifikace:</strong> ${specifickyUdaj}</p>
            <div class="price">${cena.toLocaleString()} Kc</div>
            <p style="font-size: 0.8rem; color: #666; margin-top: 5px;">Cena za ${pocetDni} dny</p>
        `;
        htmlGrid.appendChild(card);
    }
}

// Funkce pro okamzity vypocet nahledu ve formulari
function aktualizujNahledCeny() {
    const cenaInput = parseInt(inputZakladniCena.value) || 0;
    const pocetDni = parseInt(inputPocetDni.value) || 1;

    if (cenaInput <= 0) {
        nahledCenyElement.innerText = "0 Kč";
        return;
    }

    try {
        let docasneVozidlo: Vozidlo;
        const fiktivniSpz = "AAA 1111"; 

        if (selectTyp.value === "osobni") {
            docasneVozidlo = new OsobniAuto(fiktivniSpz, cenaInput, inputJeLuxusni.checked);
        } else {
            const nosnost = parseInt(inputNosnost.value) || 1;
            docasneVozidlo = new Dodavka(fiktivniSpz, cenaInput, nosnost > 0 ? nosnost : 1);
        }

        const vyslednaCena = docasneVozidlo.spocitejCenuPronajmu(pocetDni);
        nahledCenyElement.innerText = vyslednaCena.toLocaleString() + " Kč";
    } catch (error) {
        nahledCenyElement.innerText = "-";
    }
}

// Udalosti pro aktualizaci nahledu
inputZakladniCena.addEventListener("input", aktualizujNahledCeny);
inputJeLuxusni.addEventListener("change", aktualizujNahledCeny);
inputNosnost.addEventListener("input", aktualizujNahledCeny);

inputPocetDni.addEventListener("input", () => {
    prekesliRozhrani(); 
    aktualizujNahledCeny();
});

selectTyp.addEventListener("change", () => {
    if (selectTyp.value === "osobni") {
        boxLuxus.classList.remove("hidden");
        boxNosnost.classList.add("hidden");
    } else {
        boxLuxus.classList.add("hidden");
        boxNosnost.classList.remove("hidden");
    }
    aktualizujNahledCeny();
});

formAddVehicle.addEventListener("submit", (udalost) => {
    udalost.preventDefault(); 

    const spz = (document.getElementById("spz") as HTMLInputElement).value;
    const cena = parseInt(inputZakladniCena.value);
    
    try {
        if (selectTyp.value === "osobni") {
            vozovyPark.push(new OsobniAuto(spz, cena, inputJeLuxusni.checked));
        } else {
            const nosnost = parseInt(inputNosnost.value);
            vozovyPark.push(new Dodavka(spz, cena, nosnost));
        }
        
        prekesliRozhrani(); 
        formAddVehicle.reset();
        aktualizujNahledCeny(); 
    } catch (error) {
        alert("Chyba při vytváření vozidla: " + error.message);
    }
});

nactiDataZDatabaze();
prekesliRozhrani();
aktualizujNahledCeny();