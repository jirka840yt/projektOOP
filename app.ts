/**
 * Soubor: app.ts
 * Obsahuje logiku tříd a spouštěcí kód aplikace s podrobným zobrazením specifikací.
 */

/// <reference path="data.ts" />

// --- 1. DEFINICE TŘÍD A VALIDACE ---

abstract class Vozidlo {
    protected spz: string;
    protected zakladniCenaZaDen: number;

    constructor(spz: string, zakladniCenaZaDen: number) {
        // 1. Očištění vstupu
        const cistaSpz = spz.toUpperCase().replace(/\s+/g, "");

        // 2. Kontrola správné délky
        if (cistaSpz.length !== 7 && cistaSpz.length !== 8) {
            throw new Error("SPZ musí obsahovat přesně 7 nebo 8 znaků (nepočítaje mezery).");
        }

        // 3. Kontrola povolených znaků (jen písmena a čísla)
        const spzRegex = /^[A-Z0-9]+$/;
        if (!spzRegex.test(cistaSpz)) {
            throw new Error("SPZ smí obsahovat pouze písmena a číslice.");
        }

        // 4. NOVÉ: Kontrola, zda poslední 4 znaky u 7místné SPZ jsou pouze číslice
        if (cistaSpz.length === 7) {
            // Vezmeme podřetězec od indexu 3 do konce (tedy poslední 4 znaky)
            const posledniCtyriZnaky = cistaSpz.substring(3);
            
            // Regulární výraz pro přesně 4 číslice
            const jenCislaRegex = /^[0-9]{4}$/; 
            
            if (!jenCislaRegex.test(posledniCtyriZnaky)) {
                throw new Error("U standardní 7místné SPZ musí být poslední 4 znaky výhradně číslice (např. 1A1 1234).");
            }
        }

        // 5. Zformátování s mezerou pro hezký výpis
        this.spz = cistaSpz.substring(0, 3) + " " + cistaSpz.substring(3);

        // Validace ceny
        if (zakladniCenaZaDen <= 0) {
            throw new Error("Základní cena za den musí být větší než 0.");
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

    // NOVÉ: Getter pro získání informace, zda je auto luxusní
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

    // NOVÉ: Getter pro získání nosnosti dodávky
    public getNosnostKg(): number {
        return this.nosnostKg;
    }

    public spocitejCenuPronajmu(pocetDni: number): number {
        const priplatekZaNosnost = Math.ceil(this.nosnostKg / 500) * 100;
        const cenaZaDenCelkem = this.zakladniCenaZaDen + priplatekZaNosnost;
        return cenaZaDenCelkem * pocetDni;
    }
}


// --- 2. OŽIVENÍ OBJEKTŮ A POLYMORFISMUS V KONZOLI ---

const vozovyPark: Vozidlo[] = [];

const htmlGrid = document.getElementById("vehicleGrid") as HTMLDivElement;
const inputPocetDni = document.getElementById("pocetDni") as HTMLInputElement;
const formAddVehicle = document.getElementById("addVehicleForm") as HTMLFormElement;

const selectTyp = document.getElementById("typVozidla") as HTMLSelectElement;
const boxLuxus = document.getElementById("boxLuxus") as HTMLDivElement;
const boxNosnost = document.getElementById("boxNosnost") as HTMLDivElement;

function nactiDataZDatabaze() {
    for (const data of surovaDataVozidel) {
        if (data.typ === "osobni") {
            vozovyPark.push(new OsobniAuto(data.spz, data.zakladniCena, data.jeLuxusni as boolean));
        } else if (data.typ === "dodavka") {
            vozovyPark.push(new Dodavka(data.spz, data.zakladniCena, data.nosnostKg as number));
        }
    }
}

// UPRAVENÁ FUNKCE: Nyní dynamicícky zjišťuje typ a vytahuje specifická data
function prekesliRozhrani() {
    htmlGrid.innerHTML = ""; 
    const pocetDni = parseInt(inputPocetDni.value) || 1; 

    for (const vozidlo of vozovyPark) {
        const cena = vozidlo.spocitejCenuPronajmu(pocetDni);
        let typText = "";
        let specifickyUdaj = "";

        // Pomocí instanceof zjistíme přesný typ potomka a bezpečně zavoláme jeho getter
        if (vozidlo instanceof OsobniAuto) {
            typText = "Osobní auto";
            specifickyUdaj = vozidlo.getJeLuxusni() ? "Třída: Luxusní VIP" : "Třída: Standardní";
        } else if (vozidlo instanceof Dodavka) {
            typText = "Nákladní dodávka";
            specifickyUdaj = `Nosnost: ${vozidlo.getNosnostKg()} kg`;
        }

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${typText}</h3>
            <p><strong>SPZ:</strong> ${vozidlo.getSpz()}</p>
            <p><strong>Specifikace:</strong> ${specifickyUdaj}</p>
            <div class="price">${cena.toLocaleString()} Kč</div>
            <p style="font-size: 0.8rem; color: #666; margin-top: 5px;">Cena za ${pocetDni} dny</p>
        `;
        htmlGrid.appendChild(card);
    }
}

inputPocetDni.addEventListener("input", () => {
    prekesliRozhrani(); 
});

selectTyp.addEventListener("change", () => {
    if (selectTyp.value === "osobni") {
        boxLuxus.classList.remove("hidden");
        boxNosnost.classList.add("hidden");
    } else {
        boxLuxus.classList.add("hidden");
        boxNosnost.classList.remove("hidden");
    }
});

formAddVehicle.addEventListener("submit", (udalost) => {
    udalost.preventDefault(); 

    const spz = (document.getElementById("spz") as HTMLInputElement).value;
    const cena = parseInt((document.getElementById("zakladniCena") as HTMLInputElement).value);
    
    try {
        if (selectTyp.value === "osobni") {
            const jeLuxusni = (document.getElementById("jeLuxusni") as HTMLInputElement).checked;
            vozovyPark.push(new OsobniAuto(spz, cena, jeLuxusni));
        } else {
            const nosnost = parseInt((document.getElementById("nosnost") as HTMLInputElement).value);
            vozovyPark.push(new Dodavka(spz, cena, nosnost));
        }
        
        prekesliRozhrani(); 
        formAddVehicle.reset(); 
    } catch (error) {
        alert("Chyba při vytváření vozidla: " + error.message);
    }
});

nactiDataZDatabaze();
prekesliRozhrani();